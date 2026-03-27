const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * BarberLink Project Auditor Agent 🤖🛡️
 * An automated agent to ensure project stability, security, and quality.
 */
class ProjectAuditor {
  constructor() {
    this.report = {
      timestamp: new Date().toISOString(),
      issues: [],
      security: { score: 100, warnings: [] },
      stability: { score: 100, warnings: [] },
      architecture: { score: 100, warnings: [] }
    };
  }

  async runAudit() {
    console.log("🚀 Starting BarberLink Radical Audit...");

    // 1. Lint Audit (ESLint)
    this.runLintAudit();

    // 2. Type Audit (TSC)
    this.runTypeAudit();

    // 3. Security Audit (Secret Scanning)
    this.runSecurityAudit();

    // 4. Configuration Audit (Env/Firebase)
    this.runConfigAudit();

    // 5. Infrastructure Audit (Docker/VPS)
    this.runInfraAudit();

    this.finalizeReport();
  }

  runLintAudit() {
    console.log("🔍 Running Lint Audit...");
    try {
      const output = execSync('npm run lint', { encoding: 'utf8' });
      console.log("✅ Lint passed.");
    } catch (error) {
      const issuesCount = (error.stdout.match(/error/g) || []).length;
      this.report.issues.push(`Lint Audit: Found ${issuesCount} ESLint errors.`);
      this.report.stability.score -= Math.min(20, issuesCount);
      console.warn(`⚠️ Lint issues found: ${issuesCount}`);
    }
  }

  runTypeAudit() {
    console.log("🔷 Running Type Audit...");
    try {
      execSync('npx tsc --noEmit', { encoding: 'utf8' });
      console.log("✅ Type check passed.");
    } catch (error) {
      this.report.issues.push("Type Audit: Found TypeScript interface mismatches.");
      this.report.stability.score -= 15;
      console.warn("⚠️ Type mismatches found.");
    }
  }

  runSecurityAudit() {
    console.log("🔒 Running Security Scan...");
    const rootFiles = fs.readdirSync('.');
    const sensitiveFolders = ['src', 'public'];
    
    // Check for accidental .env or service account inclusion
    if (fs.existsSync('.env') && !fs.readFileSync('.gitignore', 'utf8').includes('.env')) {
      this.report.security.warnings.push("CRITICAL: .env file is NOT gitignored.");
      this.report.security.score -= 50;
    }

    // Scan for hardcoded Firebase keys (simplified)
    this.auditHardcodedKeys();
  }

  auditHardcodedKeys() {
    try {
      const content = execSync('findstr /S /I "apiKey" src\\*.tsx', { encoding: 'utf8' });
      if (content.split('\n').filter(l => l.includes(': "AIza')).length > 2) {
        this.report.security.warnings.push("WARNING: Possible hardcoded API Keys in source code.");
        this.report.security.score -= 10;
      }
    } catch (e) {
      // No matches found, which is good
    }
  }

  runConfigAudit() {
    console.log("⚙️ Checking Platform Config...");
    if (!fs.existsSync('deploy.sh')) {
      this.report.architecture.warnings.push("Infrastructure script (deploy.sh) missing.");
      this.report.architecture.score -= 20;
    }
    if (!fs.existsSync('docker-compose.yml')) {
      this.report.architecture.warnings.push("Containerization (docker-compose) missing.");
      this.report.architecture.score -= 20;
    }
  }

  runInfraAudit() {
    console.log("🐳 Verifying Deployment Stack...");
    // Check if BillionMail and Redis are present in docker-compose
    const compose = fs.readFileSync('docker-compose.yml', 'utf8');
    if (!compose.includes('redis')) {
      this.report.architecture.warnings.push("Redis service missing in level 3 stack.");
    }
  }

  finalizeReport() {
    const reportPath = path.join(__dirname, '../AUDIT_REPORT.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.report, null, 2));
    console.log(`\n📊 Audit Complete! Report saved to ${reportPath}`);
    console.log(`Stability: ${this.report.stability.score}% | Security: ${this.report.security.score}%`);
  }
}

const auditor = new ProjectAuditor();
auditor.runAudit();
