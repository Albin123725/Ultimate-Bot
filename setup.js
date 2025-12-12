const fs = require('fs-extra');
const path = require('path');

console.log(`
╔══════════════════════════════════════════════════════════╗
║   🛠️  Creative Bot System Setup                         ║
║   🎮 Auto-Sleep • Bed Management • Creative Mode        ║
╚══════════════════════════════════════════════════════════╝
`);

async function setup() {
  try {
    // Create directories
    const dirs = ['logs', 'data', 'backups'];
    
    for (const dir of dirs) {
      await fs.ensureDir(path.join(__dirname, dir));
      console.log(`✓ Created directory: ${dir}`);
    }
    
    // Create README
    const readme = `
# 🎮 Creative Mode Bot System

## Features:
- 🤖 4 Bots with different personalities
- 🎮 Always Creative Mode
- 😴 Auto-Sleep at night
- 🛏️ Automatic Bed Management
- ⏰ Day/Night cycle awareness
- 🔄 Auto-reconnect on disconnect

## Bot Personalities:
1. **CreativeBob** - Builder, focuses on structures
2. **CreativeEve** - Explorer, loves mapping areas
3. **CreativeMike** - Miner, always digging
4. **CreativeSally** - Socializer, chats with players

## Sleep System:
- Bots sleep IMMEDIATELY when night comes
- If no bed nearby, they place one from creative inventory
- In morning, they break the bed
- Cycle repeats every night

## Server Configuration:
- Server: gameplannet.aternos.me:43658
- Mode: Creative
- Version: 1.21.10

## Commands:
- npm start - Start the system
- Check http://localhost:10000 for status

## Notes:
- Make sure server is in creative mode
- Bots need OP to use /give and /gamemode
- Server must be online before starting
    `;
    
    await fs.writeFile(path.join(__dirname, 'README.md'), readme);
    console.log('✓ Created README.md');
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ SETUP COMPLETE!');
    console.log('='.repeat(60));
    console.log('🚀 To start: npm start');
    console.log('🌐 Status: http://localhost:10000');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error(`❌ Setup failed: ${error.message}`);
    process.exit(1);
  }
}

setup();
