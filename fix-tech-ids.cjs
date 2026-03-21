const fs = require('fs');
const path = require('path');

const technicalFixes = [
  { from: /barberlink\.firebaseapp\.com/g, to: 'barberlinkshop.firebaseapp.com' },
  { from: /"project_id": "barberlink"/g, to: '"project_id": "barberlinkshop"' },
  { from: /projectId: "barberlink"/g, to: 'projectId: "barberlinkshop"' },
  { from: /barberlink\.firebasestorage\.app/g, to: 'barberlinkshop.firebasestorage.app' },
  { from: /firebase-adminsdk-fbsvc@barberlink\.iam\.gserviceaccount\.com/g, to: 'firebase-adminsdk-fbsvc@barberlinkshop.iam.gserviceaccount.com' },
  { from: /firebase-adminsdk-fbsvc%40barberlink\.iam\.gserviceaccount\.com/g, to: 'firebase-adminsdk-fbsvc%40barberlinkshop.iam.gserviceaccount.com' }
];

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fullPath.includes('node_modules') || fullPath.includes('.git')) continue;
    
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.json')) {
        let content = fs.readFileSync(fullPath, 'utf8');
        let changed = false;
        for (const r of technicalFixes) {
          if (r.from.test(content)) {
            content = content.replace(r.from, r.to);
            changed = true;
          }
        }
        if (changed) {
          fs.writeFileSync(fullPath, content);
          console.log(`Fixed technical ID in: ${fullPath}`);
        }
      }
    }
  }
}

walk('.');
console.log('✅ Technical ID recovery complete.');
