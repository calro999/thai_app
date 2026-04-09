const fs = require('fs');
let html = fs.readFileSync('lp.html', 'utf8');
html = html.replace('images/yukata/yukata_0000_normal.webp', 'images/yukata/yukata-nikkori.webp');
fs.writeFileSync('lp.html', html);
console.log('Fixed Yukata image path');
