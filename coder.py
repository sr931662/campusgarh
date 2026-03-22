import os

# ====== CONFIGURATION ======

# Project root directory
PROJECT_ROOT = r"D:\Shivam folder\Mavicode\Projects\CampusGarh"

# Folders to include (relative to project root)
INCLUDE_FOLDERS = [
    "client",
    "server"
]

# File extensions to include
INCLUDE_EXTENSIONS = {
    ".py",
    ".js",
    ".ts",
    ".tsx",
    ".html",
    ".css",
    ".json",
    ".yaml",
    ".yml",
}

# Specific files to ignore
IGNORE_FILES = {
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
}

# Folders to ignore
IGNORE_FOLDERS = {
    "__pycache__",
    ".git",
    ".idea",
    ".next",
    "node_modules",
    "venv",
    "env",
    ".env",
    ".env.local",
    ".env.example",
    ".venv",
}

# Output file
OUTPUT_FILE = "campus_garh_code_dump.txt"

# ============================


def should_include_file(file_name):

    # ignore specific filenames
    if file_name in IGNORE_FILES:
        return False

    # include only allowed extensions
    return os.path.splitext(file_name)[1] in INCLUDE_EXTENSIONS


def collect_files():
    files = []

    for folder in INCLUDE_FOLDERS:
        folder_path = os.path.join(PROJECT_ROOT, folder)

        for root, dirs, filenames in os.walk(folder_path):

            # remove ignored folders
            dirs[:] = [d for d in dirs if d not in IGNORE_FOLDERS]

            for file in filenames:
                if should_include_file(file):
                    full_path = os.path.join(root, file)
                    files.append(full_path)

    return files


def write_code_dump(files):

    with open(OUTPUT_FILE, "w", encoding="utf-8") as out:

        for file_path in files:

            relative_path = os.path.relpath(file_path, PROJECT_ROOT)

            out.write(f"{relative_path}:\n")

            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    code = f.read()

                out.write(code)

            except Exception as e:
                out.write(f"[Error reading file: {e}]")

            out.write("\n\n----------------------------------------\n\n")


def main():

    print("Scanning project...")

    files = collect_files()

    print(f"{len(files)} files found.")

    write_code_dump(files)

    print(f"Code dump saved to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()