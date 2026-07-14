const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  try {
    const file = path.join(__dirname, '..', '..', 'about.html');
    const html = fs.readFileSync(file, 'utf8');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);
  } catch (err) {
    res.status(500).send('Failed to load page');
  }
};
