const fs = require('fs');
const path = require('path');

const rootDir = process.argv[2] || '.';
const oldDomain = 'barberlink.cloud';
const newDomain = 'barberlink.cloud';

function replaceInFile(filePath) {
    if (filePath.includes('node_modules') || filePath.includes('.git')) return;
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.includes(oldDomain)) {
            console.log(`Updating ${filePath}`);
            const newContent = content.split(oldDomain).join(newDomain);
            fs.writeFileSync(filePath, newContent, 'utf8');
        }
    } catch (e) {
        // Skip binary or unreadable files
    }
}

function traverse(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverse(fullPath);
        } else {
            replaceInFile(fullPath);
        }
    }
}

traverse(rootDir);
