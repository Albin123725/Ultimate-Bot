const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function setup() {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║   🚀 Minecraft Bot System Setup                          ║
║   ⚡ Simple Configuration                                ║
╚══════════════════════════════════════════════════════════╝
`);
  
  console.log('\n📝 Configuration:');
  console.log('Default: gameplannet.aternos.me:34286 (1.21.10)');
  
  const useDefault = await ask('Use default settings? (y/n): ');
  
  let config = '';
  
  if (useDefault.toLowerCase() === 'y') {
    config = `PORT=10000
MINECRAFT_HOST=gameplannet.aternos.me
MINECRAFT_PORT=34286
MINECRAFT_VERSION=1.21.10`;
  } else {
    const host = await ask('Minecraft server host: ');
    const port = await ask('Minecraft server port: ');
    const version = await ask('Minecraft version: ');
    const appPort = await ask('Web dashboard port (default: 10000): ') || '10000';
    
    config = `PORT=${appPort}
MINECRAFT_HOST=${host}
MINECRAFT_PORT=${port}
MINECRAFT_VERSION=${version}`;
  }
  
  // Write .env file
  fs.writeFileSync('.env', config);
  
  console.log('\n✅ Configuration saved to .env');
  console.log('\n🎮 Next steps:');
  console.log('   1. Install dependencies: npm install');
  console.log('   2. Start the system: npm start');
  console.log('   3. Open dashboard: http://localhost:10000');
  console.log('\n🤖 Available bot types:');
  console.log('   • Agent - Stealth operative');
  console.log('   • Cropton - Master miner');
  console.log('   • CraftMan - Expert builder');
  console.log('   • HeroBrine - Mysterious entity');
  
  rl.close();
}

function ask(question) {
  return new Promise(resolve => {
    rl.question(question, answer => {
      resolve(answer.trim());
    });
  });
}

if (require.main === module) {
  setup().catch(console.error);
}

module.exports = { setup };
