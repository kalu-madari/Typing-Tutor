const fs = require('fs');
const data = JSON.parse(fs.readFileSync('src/data/chapters/chapter5.json'));

data.lessons[1].title = 'Half-Ha (Alt+0226)';
data.lessons[1].description = 'Learn to type Half-Ha (ह्) using Alt + 0226';
data.lessons[1].text = 'â â â A og câek gS A ftàk ,d ' + "'kCn" + ' gS A';

fs.writeFileSync('src/data/chapters/chapter5.json', JSON.stringify(data, null, 2));
