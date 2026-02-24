const fs = require('fs');
let html = fs.readFileSync('lp.html', 'utf8');
html = html.replace('images/yukata/yukata_0000_normal.png', 'images/yukata/yukata-nikkori.png');
fs.writeFileSync('lp.html', html);
console.log('Fixed Yukata image path');
