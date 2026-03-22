const path = require('path');
const ejs = require('ejs');

// Helper to render EJS templates
const renderTemplate = async (templateName, data) => {
  const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.ejs`);
  return ejs.renderFile(templatePath, data);
};

module.exports = { renderTemplate };