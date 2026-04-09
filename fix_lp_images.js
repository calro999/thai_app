const fs = require('fs');
let html = fs.readFileSync('lp.html', 'utf8');

html = html.replace('images/maid/normal.webp', 'images/maid/maid_0000_normal.webp');
html = html.replace('images/miko/normal.webp', 'images/miko/miko_0000_normal.webp');
html = html.replace('images/yukata/normal.webp', 'images/yukata/yukata_0000_normal.webp');
html = html.replace('images/gos/normal.webp', 'images/gos/gos_0000_normal.webp');

fs.writeFileSync('lp.html', html);
console.log('Fixed LP images');
