const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '..', 'src', 'core', 'achievements.js');
let content = fs.readFileSync(filePath, 'utf-8');
content = content.replace(/\\n/g, '\n');
fs.writeFileSync(filePath, content, 'utf-8');
console.log('Fixed literal newlines in achievements.js');
