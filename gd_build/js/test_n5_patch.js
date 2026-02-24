// Test script to modify app.js
const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf8');

// Update courseConfig
if (!code.includes("listening_n5: {")) {
    code = code.replace(
        "n5: { name: 'JLPT N5', price: 'Free', points: 0 },",
        "n5: { name: 'JLPT N5', price: 'Free', points: 0 },\n    listening_n5: { name: 'JLPT N5 Listening', price: 'Free', points: 0 },"
    );
}

// Write it back
fs.writeFileSync('app.js', code);
