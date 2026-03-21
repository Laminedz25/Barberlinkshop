const admin = require('firebase-admin');
const fs = require('fs');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const rulesContent = fs.readFileSync('./firestore.rules', 'utf8');

async function deployRules() {
  console.log('🚀 Deploying Security Rules to barberlinkshop...');
  try {
    const source = {
      files: [{
        content: rulesContent,
        name: 'firestore.rules',
      }],
    };
    
    // Create new ruleset
    const ruleset = await admin.securityRules().createRuleset(source);
    
    // Release (activate) it for firestore
    await admin.securityRules().releaseFirestoreRuleset(ruleset.name);
    
    console.log('✅ Security Rules deployed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Rules Deployment Failed:', err);
    process.exit(1);
  }
}

deployRules();
