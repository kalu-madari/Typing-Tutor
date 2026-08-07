const fs = require('fs');
const data = JSON.parse(fs.readFileSync('src/data/chapters/chapter5.json'));

data.lessons[3].title = 'Fra (Alt+0221)';
data.lessons[3].description = 'Learn to type Fra (फ्र) using Alt + 0221';
data.lessons[3].text = "Ýh Ýkal vÝhdk A Ýkal ,d ns'k gS A lc Ýh jguk ilan djrs gSa A";

data.lessons[4].title = 'Oo / Bada U (Alt+0197)';
data.lessons[4].description = 'Learn to type Oo (ऊ) using Alt + 0197';
data.lessons[4].text = "Åu Åij ÅtkZ A Åu cgqr xje gS A gedks dk;Z ds fy, ÅtkZ pkfg, A";

fs.writeFileSync('src/data/chapters/chapter5.json', JSON.stringify(data, null, 2));
