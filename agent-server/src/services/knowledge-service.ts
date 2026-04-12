import * as fs from 'fs';
import * as path from 'path';

/**
 * KnowledgeService: Codebase Intelligence Engine.
 * Periodically scans the project to build a manifest of capabilities.
 */
export class KnowledgeService {
  private static instance: KnowledgeService;
  private projectRoot: string;
  private manifest: any = {};

  private constructor() {
    this.projectRoot = path.resolve(__dirname, '../../../');
  }

  public static getInstance(): KnowledgeService {
    if (!KnowledgeService.instance) {
      KnowledgeService.instance = new KnowledgeService();
    }
    return KnowledgeService.instance;
  }

  /**
   * Scan the project and store knowledge in memory/filesystem.
   */
  public async buildKnowledgeMap() {
    console.log('[Knowledge] Indexing codebase structure...');
    
    // 1. Detect Technologies (AutoSkills logic)
    const pkgPath = path.join(this.projectRoot, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    const dependencies = { ...pkg.dependencies, ...pkg.devDependencies };
    
    const techStack = [];
    if (dependencies['react']) techStack.push('React (Frontend)');
    if (dependencies['firebase']) techStack.push('Firebase (Database/Auth)');
    if (dependencies['express']) techStack.push('Express (Backend)');
    if (dependencies['typescript']) techStack.push('TypeScript');
    if (dependencies['tailwindcss']) techStack.push('TailwindCSS (Aesthetics)');

    // 2. Map Core Modules
    const modules: any = {};
    const srcPath = path.join(this.projectRoot, 'src');
    if (fs.existsSync(srcPath)) {
      modules['frontend_pages'] = fs.readdirSync(path.join(srcPath, 'pages')).filter(f => f.endsWith('.tsx'));
      modules['frontend_components'] = fs.readdirSync(path.join(srcPath, 'components')).filter(f => f.endsWith('.tsx'));
    }

    const agentPath = path.join(this.projectRoot, 'agent-server', 'src');
    if (fs.existsSync(agentPath)) {
      modules['backend_services'] = fs.readdirSync(path.join(agentPath, 'services')).filter(f => f.endsWith('.ts'));
    }

    this.manifest = {
      techStack,
      modules,
      last_indexed: new Date().toISOString(),
      governance: 'Autonomous AI Core v2.0'
    };

    // Save manifest for persistence
    fs.writeFileSync(path.join(__dirname, '../../knowledge_map.json'), JSON.stringify(this.manifest, null, 2));
    
    console.log('[Knowledge] Manifest Ready. Agents are now self-aware of the architecture.');
    return this.manifest;
  }

  public getManifest() {
    return this.manifest;
  }
}
