const fs = require("fs");
const path = require("path");

// ====== CONFIGURATION ======

const PROJECT_ROOT = __dirname;

// Only include these folders
const INCLUDE_FOLDERS = new Set([
  // "server",
  // "musetalk_lab",
  // "avatar_microservice",
  "client",
  // "SadTalker",
  // "nginx"
]);

// File extensions to include
const INCLUDE_EXTENSIONS = new Set([
  ".py", ".js", ".ts", ".tsx",
  ".html", ".css",
  ".json", ".yaml", ".yml",
  ".md", ".sh", ".conf", "",
  "Dockerfile"
]);

// Folders to ignore globally
const IGNORE_FOLDERS = new Set([
  "__pycache__",
  ".git",
  ".idea",
  ".next",
  "node_modules",
  "venv",
  ".venv",
  "env",
  ".env",
  "dist",
  "build",
  ".cache",
  "musetalk_env_linux"
]);

// Keywords to ignore
const IGNORE_KEYWORDS = new Set([
  "model",
  "models",
  "weights",
  "checkpoints",
  "ckpt",
  "pth",
  "bin"
]);

const OUTPUT_FILE = "SELECTIVE_CODE_DUMP.txt";

// ============================

function getExtension(fileName) {
  if (fileName === "Dockerfile") return "Dockerfile";
  return path.extname(fileName);
}

function shouldIncludeFile(fileName) {
  const ext = getExtension(fileName);
  return INCLUDE_EXTENSIONS.has(ext);
}

function shouldIgnorePath(filePath) {
  const parts = filePath.toLowerCase().split(path.sep);

  // Ignore folders
  for (const part of parts) {
    if (IGNORE_FOLDERS.has(part)) return true;
  }

  // Ignore keywords
  const lowerPath = filePath.toLowerCase();
  for (const keyword of IGNORE_KEYWORDS) {
    if (lowerPath.includes(keyword)) return true;
  }

  return false;
}

function collectFiles() {
  const files = [];

  // ===== 1. Scan PROJECT ROOT =====
  const rootItems = fs.readdirSync(PROJECT_ROOT);

  for (const item of rootItems) {
    const fullPath = path.join(PROJECT_ROOT, item);

    if (fs.statSync(fullPath).isFile()) {
      if (shouldIncludeFile(item) && !shouldIgnorePath(fullPath)) {
        files.push(fullPath);
      }
    }
  }

  // ===== 2. Scan INCLUDED FOLDERS =====
  for (const folder of INCLUDE_FOLDERS) {
    const folderPath = path.join(PROJECT_ROOT, folder);

    if (!fs.existsSync(folderPath)) {
      console.log(`⚠️ Skipping missing folder: ${folder}`);
      continue;
    }

    walkDir(folderPath, files);
  }

  return files.sort();
}

function walkDir(dir, files) {
  if (shouldIgnorePath(dir)) return;

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!IGNORE_FOLDERS.has(item)) {
        walkDir(fullPath, files);
      }
    } else if (stat.isFile()) {
      if (shouldIncludeFile(item)) {
        files.push(fullPath);
      }
    }
  }
}

function writeCodeDump(files) {
  const output = fs.createWriteStream(OUTPUT_FILE, {
    encoding: "utf-8"
  });

  output.write("===== SELECTIVE PROJECT CODE DUMP =====\n\n");

  for (const filePath of files) {
    const relativePath = path.relative(PROJECT_ROOT, filePath);

    output.write(`\n\n===== FILE: ${relativePath} =====\n\n`);

    try {
      const code = fs.readFileSync(filePath, "utf-8");
      output.write(code);
    } catch (err) {
      output.write(`[Error reading file: ${err.message}]`);
    }

    output.write("\n\n" + "-".repeat(80) + "\n");
  }

  output.end();
}

function main() {
  console.log("🔍 Collecting selected project code...");

  const files = collectFiles();

  console.log(`📁 Total files collected: ${files.length}`);

  writeCodeDump(files);

  console.log(`✅ Code dump saved to: ${OUTPUT_FILE}`);
}

main();