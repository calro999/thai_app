const fs = require('fs');
let html = fs.readFileSync('lp.html', 'utf8');

html = html.replace('images/maid/normal.png', 'images/maid/maid_0000_normal.png');
html = html.replace('images/miko/normal.png', 'images/miko/miko_0000_normal.png');
html = html.replace('images/yukata/normal.png', 'images/yukata/yukata_0000_normal.png');
html = html.replace('images/gos/normal.png', 'images/gos/gos_0000_normal.png');

fs.writeFileSync('lp.html', html);
console.log('Fixed LP images');
