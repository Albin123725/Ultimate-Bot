const fs = require('fs-extra');
const path = require('path');

console.log(`
╔══════════════════════════════════════════════════════════╗
║   🛠️  Ultimate 2-Bot System Setup                       ║
║   🎮 100+ Features • Creative Mode • Auto-Sleep         ║
╚══════════════════════════════════════════════════════════╝
`);

async function setup() {
  try {
    // Create directories
    const dirs = [
      'data',
      'logs',
      'config',
      'proxies',
      'accounts',
      'models',
      'backups'
    ];
    
    for (const dir of dirs) {
      await fs.ensureDir(path.join(__dirname, dir));
      console.log(`✓ Created directory: ${dir}`);
    }
    
    // Create proxy list
    const proxyList = [
      {
        type: 'residential',
        ip: '192.168.1.100',
        port: 8080,
        country: 'US',
        isp: 'Comcast',
        successRate: 0.95
      }
    ];
    
    await fs.writeJson(
      path.join(__dirname, 'proxies', 'proxies.json'),
      proxyList,
      { spaces: 2 }
    );
    console.log('✓ Created proxy list template');
    
    // Create account list
    const accountList = [
      {
        username: 'CreativeBuilder',
        email: 'builder@example.com',
        registrationDate: '2023-06-15T00:00:00.000Z',
        priorityStatus: 'free'
      }
    ];
    
    await fs.writeJson(
      path.join(__dirname, 'accounts', 'accounts.json'),
      accountList,
      { spaces: 2 }
    );
    console.log('✓ Created account list template');
    
    // Create README
    const readme = `
# 🚀 Ultimate 2-Bot Creative System

## Features:
- 🤖 **2 Bots Only** (CreativeMaster & CreativeExplorer)
- 🎮 **Always Creative Mode**
- 😴 **Perfect Auto-Sleep System**
  - Sleeps IMMEDIATELY when night comes
  - Places bed if none nearby
  - Breaks bed in morning
  - Repeats cycle every night
- ⚡ **100+ Advanced Features**
  - Neural Network decision making
  - Advanced proxy rotation
  - Multi-account system
  - Client diversity
  - Anti-detection systems
  - Temporal patterns
  - Social ecosystem
  - Comprehensive monitoring

## Bot Personalities:
1. **CreativeMaster** - Builder personality
   - Focuses on building structures
   - Uses modded client profile
   - Chat style: Friendly builder

2. **CreativeExplorer** - Explorer personality  
   - Focuses on exploration
   - Uses official client profile
   - Chat style: Enthusiastic explorer

## Sleep System:
- **Night (13000-23000)**: Bots sleep immediately
- **No bed nearby**: Bot places bed from creative inventory
- **Morning**: Bot breaks bed, prepares for day
- **Cycle repeats** every day/night

## Server Requirements:
- Aternos server with creative mode enabled
- OP permissions for /give and /gamemode commands
- Server must be online before starting bots

## Commands:
\`\`\`bash
npm install     # Install dependencies
npm start       # Start the system
\`\`\`

## Monitoring:
- Web Interface: http://localhost:10000
- Console logs show real-time activity
- Status updates every 30 seconds
- System reports every hour

## Configuration:
Edit \`main.js\` to modify:
- Server connection details
- Bot personalities
- Feature toggles
- Timing settings

## Notes:
- System includes auto-reconnect on disconnect
- All features are production-ready
- Optimized for Aternos creative servers
- Includes anti-throttling measures

Enjoy your ultimate creative bot system! 🎮
    `;
    
    await fs.writeFile(path.join(__dirname, 'README.md'), readme);
    console.log('✓ Created README.md');
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ SETUP COMPLETE!');
    console.log('='.repeat(60));
    console.log('🚀 To start: npm start');
    console.log('🌐 Status: http://localhost:10000');
    console.log('📖 Read README.md for full documentation');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error(`❌ Setup failed: ${error.message}`);
    process.exit(1);
  }
}

setup();
