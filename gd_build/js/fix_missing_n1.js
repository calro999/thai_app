const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;

// Wait, do we have the scripts that generated N1 listening files? I noticed a generate_n2_study.py earlier.
// If I search the directory for generation scripts:
const dirFiles = fs.readdirSync('/Users/calro/Desktop/タイ語学習アプリ');
console.log(dirFiles.filter(f => f.includes('generate') || f.includes('n1')));

// Actually I can just check git directly if we have git repo.
try {
    const gitStatus = execSync('git status', { cwd: '/Users/calro/Desktop/タイ語学習アプリ' }).toString();
    console.log("Git status:", gitStatus.substring(0, 100));
} catch (e) {
    console.log("Not a git repo or git error.");
}

