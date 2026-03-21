const fs = require('fs');
const path = require('path');

const replacements = [
  { from: /BarberLink/g, to: 'BarberLink' },
  { from: /barberlinkshop/g, to: 'barberlink' },
  { from: /admin@gmail\.com/g, to: 'admin@barberlink.cloud' },
  { from: /barberlinkshop\.firebaseapp\.com/g, to: 'barberlink.cloud' }
];

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fullPath.includes('node_modules') || fullPath.includes('.git') || fullPath.includes('.next')) continue;
    
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.json') || file.endsWith('.html') || file.endsWith('.md') || file.endsWith('.yml')) {
        let content = fs.readFileSync(fullPath, 'utf8');
        let changed = false;
        for (const r of replacements) {
          if (r.from.test(content)) {
            content = content.replace(r.from, r.to);
            changed = true;
          }
        }
        if (changed) {
          fs.writeFileSync(fullPath, content);
          console.log(`Updated: ${fullPath}`);
        }
      }
    }
  }
}

walk('.');
console.log('✅ Branding rename complete.');
