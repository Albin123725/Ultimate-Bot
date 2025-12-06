#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');

async function setup() {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║   🚀 REAL Minecraft Bot System v5.0                      ║
║   ⚡ Auto-Setup & Configuration                          ║
╚══════════════════════════════════════════════════════════╝
`);
  
  try {
    // Create directories
    await createDirectories();
    
    // Generate configuration
    await generateConfig();
    
    // Generate initial data
    await generateInitialData();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ SETUP COMPLETE!');
    console.log('='.repeat(60));
    console.log('🎮 NEXT STEPS:');
    console.log('   1. Install dependencies: npm install');
    console.log('   2. Start system: npm start');
    console.log('   3. Open dashboard: http://localhost:10000');
    console.log('\n⚡ IMPORTANT:');
    console.log('   • Make sure your Aternos server is ONLINE');
    console.log('   • Check server version matches (default: 1.21.10)');
    console.log('   • Whitelist should be OFF on your server');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

async function createDirectories() {
  const dirs = ['logs', 'config', 'data'];
  
  for (const dir of dirs) {
    await fs.ensureDir(path.join(__dirname, dir));
    console.log(`✓ Created directory: ${dir}`);
  }
}

async function generateConfig() {
  const configPath = path.join(__dirname, '.env');
  
  if (await fs.pathExists(configPath)) {
    console.log('📁 Using existing configuration');
    return;
  }
  
  const configContent = `
# REAL Minecraft Bot System v5.0
# Auto-generated configuration
# Generated: ${new Date().toISOString()}

# ===== SERVER CONFIGURATION =====
MINECRAFT_HOST=gameplannet.aternos.me
MINECRAFT_PORT=34286
MINECRAFT_VERSION=1.21.10

# ===== BOT CONFIGURATION =====
MAX_BOTS=4

# ===== SYSTEM CONFIGURATION =====
PORT=10000
`.trim();
  
  await fs.writeFile(configPath, configContent);
  console.log('✓ Generated configuration file');
}

async function generateInitialData() {
  console.log('📊 Generating initial data...');
  
  // Generate sample accounts
  const accounts = [];
  const names = [
    'MinecraftBot1', 'MinecraftBot2', 'MinecraftBot3', 'MinecraftBot4',
    'MinecraftBot5', 'MinecraftBot6', 'MinecraftBot7', 'MinecraftBot8',
    'MinecraftBot9', 'MinecraftBot10'
  ];
  
  for (let i = 0; i < names.length; i++) {
    accounts.push({
      id: crypto.randomBytes(12).toString('hex'),
      username: names[i],
      created: new Date().toISOString(),
      status: 'active',
      lastUsed: null
    });
  }
  
  const accountsFile = path.join(__dirname, 'config', 'accounts.json');
  await fs.writeJson(accountsFile, accounts, { spaces: 2 });
  console.log(`✓ Generated ${accounts.length} accounts`);
}

// Export setup function
module.exports = { setup };

// Run setup if called directly
if (require.main === module) {
  setup().catch(console.error);
}
