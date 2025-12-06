#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');

async function setup() {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║   🚀 ULTIMATE MINECRAFT BOT SYSTEM v4.0                  ║
║   ⚡ Complete Auto-Setup & Configuration                  ║
╚══════════════════════════════════════════════════════════╝
`);
  
  try {
    // Create directories
    await createDirectories();
    
    // Generate configuration
    await generateConfig();
    
    // Generate initial data
    await generateInitialData();
    
    // Create backup script
    await createBackupScript();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ SETUP COMPLETE!');
    console.log('='.repeat(60));
    console.log('🎮 NEXT STEPS:');
    console.log('   1. Install dependencies: npm install');
    console.log('   2. Start system: npm start');
    console.log('   3. Open dashboard: http://localhost:10000');
    console.log('\n⚡ QUICK COMMANDS:');
    console.log('   • npm start      - Start the system');
    console.log('   • npm run dev    - Start with hot reload');
    console.log('   • npm run setup  - Re-run setup');
    console.log('   • npm run backup - Backup system data');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

async function createDirectories() {
  const dirs = [
    'logs', 'logs/connections', 'logs/errors',
    'config', 'config/accounts', 'config/proxies',
    'data', 'sessions', 'backups', 'public'
  ];
  
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
# Ultimate Minecraft Bot System v4.0
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
AUTO_START=true
USE_PROXIES=false

# ===== FEATURE CONFIGURATION =====
ENABLE_AI=true
ANTI_DETECTION=true
`.trim();
  
  await fs.writeFile(configPath, configContent);
  console.log('✓ Generated configuration file');
}

async function generateInitialData() {
  console.log('📊 Generating initial data...');
  
  // Generate sample accounts
  const accounts = [];
  const names = [
    'MinecraftMaster', 'BlockExpert', 'RedstonePro', 'DiamondHunter',
    'NetherTraveler', 'EnderExplorer', 'BuilderKing', 'FarmMaster',
    'GuardianElite', 'SocialExpert', 'CaveExplorer', 'OceanHunter',
    'ForestGuardian', 'MountainKing', 'SkyBuilder', 'DeepMiner'
  ];
  
  for (let i = 0; i < names.length; i++) {
    accounts.push({
      id: crypto.randomBytes(12).toString('hex'),
      username: names[i],
      email: `bot${i}@ultimatebot.com`,
      created: new Date().toISOString(),
      status: 'active',
      stats: {
        totalPlaytime: Math.floor(Math.random() * 10000),
        sessions: Math.floor(Math.random() * 50),
        successRate: 0.95 + Math.random() * 0.04
      },
      lastUsed: null
    });
  }
  
  const accountsFile = path.join(__dirname, 'config', 'accounts.json');
  await fs.writeJson(accountsFile, accounts, { spaces: 2 });
  console.log(`✓ Generated ${accounts.length} accounts`);
  
  // Generate sample proxies
  const proxies = [];
  const countries = ['US', 'UK', 'DE', 'FR', 'CA', 'AU', 'JP', 'NL'];
  
  for (let i = 0; i < 100; i++) {
    const country = countries[Math.floor(Math.random() * countries.length)];
    const type = ['residential', 'datacenter', 'mobile'][Math.floor(Math.random() * 3)];
    
    proxies.push({
      id: crypto.randomBytes(16).toString('hex'),
      type: type,
      country: country,
      ip: generateIP(country),
      port: [8080, 8888, 3128, 1080][Math.floor(Math.random() * 4)],
      protocol: Math.random() > 0.5 ? 'http' : 'socks5',
      speed: 20 + Math.random() * 80,
      latency: 10 + Math.random() * 100,
      successRate: 0.85 + Math.random() * 0.14,
      lastUsed: null,
      status: 'active'
    });
  }
  
  const proxiesFile = path.join(__dirname, 'config', 'proxies.json');
  await fs.writeJson(proxiesFile, proxies, { spaces: 2 });
  console.log(`✓ Generated ${proxies.length} proxies`);
}

function generateIP(country) {
  const ranges = {
    US: ['192.168.', '10.0.', '172.16.'],
    UK: ['81.0.', '86.0.', '94.0.'],
    DE: ['78.0.', '79.0.', '84.0.'],
    FR: ['81.0.', '90.0.', '92.0.'],
    CA: ['24.0.', '70.0.', '99.0.'],
    AU: ['1.0.', '14.0.', '27.0.'],
    JP: ['110.0.', '111.0.', '112.0.'],
    NL: ['84.0.', '85.0.', '86.0.']
  };
  
  const countryRanges = ranges[country] || ranges.US;
  const range = countryRanges[Math.floor(Math.random() * countryRanges.length)];
  
  return `${range}${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

async function createBackupScript() {
  const backupScript = `
#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const crypto = require('crypto');

async function backup() {
  console.log('💾 Starting system backup...');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, 'backups', \`backup-\${timestamp}\`);
  
  try {
    await fs.ensureDir(backupDir);
    
    // Backup important directories
    const dirsToBackup = [
      'config',
      'logs',
      'data'
    ];
    
    for (const dir of dirsToBackup) {
      const source = path.join(__dirname, dir);
      const target = path.join(backupDir, dir);
      
      if (await fs.pathExists(source)) {
        await fs.copy(source, target);
        console.log(\`✓ Backed up \${dir}\`);
      }
    }
    
    // Backup .env file
    const envSource = path.join(__dirname, '.env');
    if (await fs.pathExists(envSource)) {
      await fs.copy(envSource, path.join(backupDir, '.env'));
      console.log('✓ Backed up .env');
    }
    
    // Create backup info
    const backupInfo = {
      timestamp: new Date().toISOString(),
      version: '4.0.0',
      files: dirsToBackup,
      size: await getDirSize(backupDir)
    };
    
    await fs.writeJson(path.join(backupDir, 'backup-info.json'), backupInfo, { spaces: 2 });
    
    console.log(\`✅ Backup completed: \${backupDir}\`);
    console.log(\`📦 Backup size: \${formatBytes(backupInfo.size)}\`);
    
    // Clean old backups (keep last 5)
    await cleanOldBackups();
    
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
  }
}

async function getDirSize(dir) {
  let size = 0;
  
  const getSize = async (dirPath) => {
    const items = await fs.readdir(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stat = await fs.stat(itemPath);
      
      if (stat.isDirectory()) {
        await getSize(itemPath);
      } else {
        size += stat.size;
      }
    }
  };
  
  await getSize(dir);
  return size;
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

async function cleanOldBackups() {
  const backupsDir = path.join(__dirname, 'backups');
  
  if (!await fs.pathExists(backupsDir)) {
    return;
  }
  
  const items = await fs.readdir(backupsDir);
  const backupDirs = [];
  
  for (const item of items) {
    const itemPath = path.join(backupsDir, item);
    const stat = await fs.stat(itemPath);
    
    if (stat.isDirectory() && item.startsWith('backup-')) {
      backupDirs.push({
        name: item,
        path: itemPath,
        created: stat.birthtime
      });
    }
  }
  
  // Sort by creation date (oldest first)
  backupDirs.sort((a, b) => a.created - b.created);
  
  // Remove old backups (keep last 5)
  if (backupDirs.length > 5) {
    const toRemove = backupDirs.slice(0, backupDirs.length - 5);
    
    for (const backup of toRemove) {
      await fs.remove(backup.path);
      console.log(\`🗑️ Removed old backup: \${backup.name}\`);
    }
  }
}

// Run backup if called directly
if (require.main === module) {
  backup().catch(console.error);
}

module.exports = { backup };
`;
  
  await fs.writeFile(path.join(__dirname, 'backup.js'), backupScript);
  await fs.chmod(path.join(__dirname, 'backup.js'), '755');
  console.log('✓ Created backup script');
}

// Export setup function
module.exports = { setup };

// Run setup if called directly
if (require.main === module) {
  setup().catch(console.error);
}
