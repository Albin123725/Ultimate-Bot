#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const os = require('os');
const { execSync } = require('child_process');

class AutoSetup {
  constructor() {
    this.configPath = path.join(__dirname, '.env');
    this.packagePath = path.join(__dirname, 'package.json');
    this.setupLog = path.join(__dirname, 'setup.log');
  }
  
  async setup() {
    console.log('⚙️ Ultimate Bot System Auto-Setup v10.0');
    console.log('='.repeat(60));
    
    try {
      // Check Node.js version
      this.checkNodeVersion();
      
      // Create directories
      await this.createDirectories();
      
      // Generate configuration
      await this.generateConfig();
      
      // Create package.json if missing
      await this.createPackageJson();
      
      // Install dependencies
      await this.installDependencies();
      
      // Generate initial data
      await this.generateInitialData();
      
      // Create startup script
      await this.createStartupScript();
      
      console.log('\n✅ SETUP COMPLETE!');
      console.log('='.repeat(60));
      console.log('🚀 To start the system:');
      console.log('   1. npm start');
      console.log('   2. Open browser to: http://localhost:10000');
      console.log('\n⚙️  Configuration:');
      console.log(`   - Bots: ${process.env.BOT_COUNT || 2} (${process.env.BOT_TYPES || 'builder,explorer'})`);
      console.log(`   - Server: ${process.env.MINECRAFT_HOST || 'gameplannet.aternos.me'}:${process.env.MINECRAFT_PORT || 34286}`);
      console.log(`   - Proxies: ${process.env.USE_PROXIES === 'true' ? 'Enabled' : 'Disabled'}`);
      console.log(`   - AI: ${process.env.NEURAL_NETWORKS === 'true' ? 'Enabled' : 'Disabled'}`);
      console.log(`   - Security: ${process.env.ANTI_DETECTION === 'true' ? 'Enabled' : 'Disabled'}`);
      console.log('='.repeat(60));
      
      await this.logSetup('Setup completed successfully');
      
    } catch (error) {
      console.error('❌ Setup failed:', error.message);
      await this.logSetup(`Setup failed: ${error.message}`);
      process.exit(1);
    }
  }
  
  checkNodeVersion() {
    const nodeVersion = parseFloat(process.version.replace('v', ''));
    if (nodeVersion < 16) {
      throw new Error(`Node.js 16+ required (current: ${process.version})`);
    }
    console.log(`✓ Node.js ${process.version}`);
  }
  
  async createDirectories() {
    const dirs = [
      'logs', 'logs/bots', 'logs/sessions',
      'config', 'config/accounts', 'config/proxies', 'config/sessions',
      'data', 'data/learning', 'data/patterns', 'data/neural',
      'public'
    ];
    
    for (const dir of dirs) {
      await fs.ensureDir(path.join(__dirname, dir));
      console.log(`✓ Created directory: ${dir}`);
    }
  }
  
  async generateConfig() {
    const config = {
      // Server Configuration
      MINECRAFT_HOST: 'gameplannet.aternos.me',
      MINECRAFT_PORT: '34286',
      MINECRAFT_VERSION: '1.21.10',
      MINECRAFT_AUTH: 'offline',
      
      // Bot Configuration
      BOT_COUNT: '2',
      MIN_BOTS: '1',
      MAX_BOTS: '10',
      BOT_TYPES: 'builder,explorer,miner,socializer',
      AUTO_START: 'true',
      AUTO_JOIN: 'true',
      
      // Network Configuration
      USE_PROXIES: 'true',
      MIN_PROXIES: '50',
      MAX_PROXIES: '150',
      PROXY_ROTATION: 'dynamic',
      RECONNECT_ATTEMPTS: '3',
      MIN_SESSION: '1200',
      MAX_SESSION: '21600',
      
      // Security Configuration
      ANTI_DETECTION: 'true',
      PATTERN_BREAKING: 'true',
      FAILURE_INJECTION: '0.05',
      BEHAVIOR_RANDOMIZATION: 'true',
      ACCOUNT_ROTATION: 'true',
      IP_ROTATION: 'true',
      
      // AI Configuration
      NEURAL_NETWORKS: 'true',
      BEHAVIOR_LEARNING: 'true',
      SOCIAL_SIMULATION: 'true',
      DECISION_MAKING: 'neural',
      
      // System Configuration
      WEB_PORT: '10000',
      LOG_LEVEL: 'info',
      MONITORING: 'true'
    };
    
    // Check for existing config
    if (await fs.pathExists(this.configPath)) {
      console.log('📁 Using existing .env configuration');
      return;
    }
    
    // Generate config content
    let content = `# Ultimate Minecraft Bot System v10.0\n`;
    content += `# Generated: ${new Date().toISOString()}\n`;
    content += `# Platform: ${os.platform()} ${os.arch()}\n\n`;
    
    // Add sections
    const sections = {
      'SERVER CONFIGURATION': [
        'MINECRAFT_HOST', 'MINECRAFT_PORT', 'MINECRAFT_VERSION', 'MINECRAFT_AUTH'
      ],
      'BOT CONFIGURATION': [
        'BOT_COUNT', 'MIN_BOTS', 'MAX_BOTS', 'BOT_TYPES', 
        'AUTO_START', 'AUTO_JOIN'
      ],
      'NETWORK CONFIGURATION': [
        'USE_PROXIES', 'MIN_PROXIES', 'MAX_PROXIES', 'PROXY_ROTATION',
        'RECONNECT_ATTEMPTS', 'MIN_SESSION', 'MAX_SESSION'
      ],
      'SECURITY CONFIGURATION': [
        'ANTI_DETECTION', 'PATTERN_BREAKING', 'FAILURE_INJECTION',
        'BEHAVIOR_RANDOMIZATION', 'ACCOUNT_ROTATION', 'IP_ROTATION'
      ],
      'AI CONFIGURATION': [
        'NEURAL_NETWORKS', 'BEHAVIOR_LEARNING', 'SOCIAL_SIMULATION',
        'DECISION_MAKING'
      ],
      'SYSTEM CONFIGURATION': [
        'WEB_PORT', 'LOG_LEVEL', 'MONITORING'
      ]
    };
    
    for (const [section, keys] of Object.entries(sections)) {
      content += `\n# ${section}\n`;
      for (const key of keys) {
        content += `${key}=${config[key]}\n`;
      }
    }
    
    await fs.writeFile(this.configPath, content);
    
    // Set environment variables
    for (const [key, value] of Object.entries(config)) {
      process.env[key] = value;
    }
    
    console.log('✓ Generated configuration file: .env');
    await this.logSetup('Generated configuration');
  }
  
  async createPackageJson() {
    if (await fs.pathExists(this.packagePath)) {
      console.log('📁 Using existing package.json');
      return;
    }
    
    const packageJson = {
      name: "ultimate-minecraft-bot-system",
      version: "10.0.0",
      description: "Ultimate Minecraft Bot System with Complete Feature Integration",
      main: "server.js",
      scripts: {
        "start": "node server.js",
        "dev": "nodemon server.js",
        "setup": "node auto-setup.js",
        "deploy": "npm run setup && npm start",
        "clean": "rm -rf node_modules logs/*",
        "update": "git pull && npm install && npm run setup"
      },
      keywords: [
        "minecraft",
        "bot",
        "aternos",
        "automation",
        "ai",
        "neural",
        "proxy",
        "security",
        "dashboard",
        "websocket"
      ],
      author: "Ultimate Bot System",
      license: "MIT",
      dependencies: {
        "express": "^4.18.2",
        "ws": "^8.14.2",
        "mineflayer": "^4.12.0",
        "mineflayer-pathfinder": "^2.4.4",
        "vec3": "^0.1.8",
        "fs-extra": "^11.1.1",
        "dotenv": "^16.3.1",
        "crypto-js": "^4.1.1"
      },
      engines: {
        "node": ">=16.0.0"
      }
    };
    
    await fs.writeJson(this.packagePath, packageJson, { spaces: 2 });
    console.log('✓ Created package.json');
    await this.logSetup('Created package.json');
  }
  
  async installDependencies() {
    console.log('📦 Installing dependencies...');
    
    try {
      // Check if node_modules exists
      const nodeModulesPath = path.join(__dirname, 'node_modules');
      if (await fs.pathExists(nodeModulesPath)) {
        console.log('✓ Dependencies already installed');
        return;
      }
      
      // Install dependencies
      execSync('npm install', { stdio: 'inherit', cwd: __dirname });
      console.log('✓ Dependencies installed');
      await this.logSetup('Installed dependencies');
      
    } catch (error) {
      console.warn('⚠️ Could not install dependencies automatically');
      console.warn('   Please run "npm install" manually');
      await this.logSetup('Dependency installation failed');
    }
  }
  
  async generateInitialData() {
    console.log('📊 Generating initial data...');
    
    // Generate accounts
    await this.generateAccounts();
    
    // Generate proxies
    await this.generateProxies();
    
    console.log('✓ Initial data generated');
    await this.logSetup('Generated initial data');
  }
  
  async generateAccounts() {
    const accountsFile = path.join(__dirname, 'config', 'accounts', 'accounts.json');
    
    if (await fs.pathExists(accountsFile)) {
      console.log('📁 Using existing accounts');
      return;
    }
    
    const accounts = [];
    for (let i = 0; i < 20; i++) {
      accounts.push({
        id: crypto.randomBytes(12).toString('hex'),
        username: this.generateUsername(),
        email: this.generateEmail(),
        registrationDate: new Date(Date.now() - (30 + Math.random() * 335) * 24 * 60 * 60 * 1000).toISOString(),
        ageDays: 30 + Math.floor(Math.random() * 335),
        status: 'active',
        type: Math.random() > 0.7 ? 'premium' : 'free',
        servers: this.generateServerList(),
        activity: {
          totalPlaytime: Math.floor(Math.random() * 1000) * 60,
          sessions: Math.floor(Math.random() * 100),
          lastLogin: null,
          streak: Math.floor(Math.random() * 30)
        }
      });
    }
    
    await fs.writeJson(accountsFile, accounts, { spaces: 2 });
    console.log(`✓ Generated ${accounts.length} accounts`);
  }
  
  generateUsername() {
    const patterns = [
      () => {
        const adjectives = ['Happy', 'Clever', 'Swift', 'Brave', 'Wise'];
        const nouns = ['Fox', 'Wolf', 'Bear', 'Eagle', 'Dragon'];
        return `${adjectives[Math.floor(Math.random() * adjectives.length)]}${
          nouns[Math.floor(Math.random() * nouns.length)]}${
          Math.floor(Math.random() * 9999)}`;
      },
      () => {
        const names = ['Alex', 'Chris', 'Jordan', 'Taylor', 'Morgan'];
        const surnames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'];
        return `${names[Math.floor(Math.random() * names.length)]}${
          surnames[Math.floor(Math.random() * surnames.length)]}${
          2000 + Math.floor(Math.random() * 24)}`;
      }
    ];
    
    return patterns[Math.floor(Math.random() * patterns.length)]();
  }
  
  generateEmail() {
    const providers = ['gmail.com', 'outlook.com', 'yahoo.com', 'protonmail.com'];
    const provider = providers[Math.floor(Math.random() * providers.length)];
    const username = crypto.randomBytes(8).toString('hex').toLowerCase();
    return `${username}@${provider}`;
  }
  
  generateServerList() {
    return [{
      name: 'Aternos Server',
      host: process.env.MINECRAFT_HOST || 'gameplannet.aternos.me',
      port: parseInt(process.env.MINECRAFT_PORT) || 34286,
      version: process.env.MINECRAFT_VERSION || '1.21.10',
      playtime: Math.floor(Math.random() * 5000) * 60
    }];
  }
  
  async generateProxies() {
    const proxiesFile = path.join(__dirname, 'config', 'proxies', 'proxies.json');
    
    if (await fs.pathExists(proxiesFile)) {
      console.log('📁 Using existing proxies');
      return;
    }
    
    const proxies = [];
    const countries = ['US', 'CA', 'UK', 'DE', 'FR', 'AU', 'JP'];
    
    for (let i = 0; i < 100; i++) {
      const country = countries[Math.floor(Math.random() * countries.length)];
      proxies.push({
        id: crypto.randomBytes(16).toString('hex'),
        ip: this.generateIP(country),
        port: [8080, 8888, 3128][Math.floor(Math.random() * 3)],
        protocol: 'http',
        type: ['residential', 'mobile', 'datacenter'][Math.floor(Math.random() * 3)],
        country: country,
        latency: 50 + Math.random() * 200,
        successRate: 0.8 + Math.random() * 0.19,
        lastTested: new Date().toISOString(),
        status: 'active'
      });
    }
    
    await fs.writeJson(proxiesFile, proxies, { spaces: 2 });
    console.log(`✓ Generated ${proxies.length} proxies`);
  }
  
  generateIP(country) {
    const countryRanges = {
      US: ['192.168.', '10.0.', '172.16.'],
      UK: ['81.0.', '86.0.', '94.0.'],
      DE: ['78.0.', '79.0.', '84.0.'],
      CA: ['24.0.', '70.0.', '99.0.'],
      FR: ['81.0.', '90.0.', '92.0.'],
      AU: ['1.0.', '14.0.', '27.0.'],
      JP: ['110.0.', '111.0.', '112.0.']
    };
    
    const ranges = countryRanges[country] || countryRanges.US;
    const range = ranges[Math.floor(Math.random() * ranges.length)];
    
    return `${range}${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  }
  
  async createStartupScript() {
    // Create a simple start script for convenience
    const startScript = path.join(__dirname, 'start.sh');
    
    if (await fs.pathExists(startScript)) {
      return;
    }
    
    const script = `#!/bin/bash
echo "🎮 Ultimate Minecraft Bot System v10.0"
echo "========================================"
echo "Starting system..."
npm start
`;
    
    await fs.writeFile(startScript, script);
    await fs.chmod(startScript, '755');
    
    console.log('✓ Created startup script');
  }
  
  async logSetup(message) {
    const logEntry = `[${new Date().toISOString()}] ${message}\n`;
    await fs.appendFile(this.setupLog, logEntry);
  }
}

// Run setup if called directly
if (require.main === module) {
  const setup = new AutoSetup();
  setup.setup().catch(console.error);
}

module.exports = AutoSetup;
