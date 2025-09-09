const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../../deployed.json');

function save(obj) {
  fs.writeFileSync(file, JSON.stringify(obj, null, 2));
}

function load() {
  if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file));
  return null;
}

module.exports = { save, load, file };
