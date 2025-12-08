const mineflayer = require('mineflayer');
const readline = require('readline');

console.log(`
╔══════════════════════════════════════════════════════════╗
║   🤖 Ultimate Bot System - Connection Test              ║
║   ⚡ Testing connection to Aternos server                ║
╚══════════════════════════════════════════════════════════╝
`);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function testBot() {
  console.log('🎮 Testing connection to: gameplannet.aternos.me:43658');
  console.log('🤖 Using bot: TestBot');
  
  const bot = mineflayer.createBot({
    host: 'gameplannet.aternos.me',
    port: 43658,
    username: 'TestBot',
    version: '1.21.10',
    auth: 'offline'
  });
  
  bot.on('login', () => {
    console.log('✅ Bot logged in successfully');
  });
  
  bot.on('spawn', () => {
    console.log('📍 Bot spawned in world');
    console.log(`   Position: ${bot.entity.position.x.toFixed(1)}, ${bot.entity.position.y.toFixed(1)}, ${bot.entity.position.z.toFixed(1)}`);
    console.log('💬 Saying hello...');
    bot.chat('Hello from test bot!');
    
    setTimeout(() => {
      console.log('✅ Test completed successfully!');
      bot.quit();
      rl.close();
      process.exit(0);
    }, 5000);
  });
  
  bot.on('error', (err) => {
    console.log('❌ Error:', err.message);
    console.log('💡 Make sure the Aternos server is ONLINE');
    rl.close();
    process.exit(1);
  });
  
  bot.on('kicked', (reason) => {
    console.log('🚫 Kicked from server:', JSON.stringify(reason));
    rl.close();
    process.exit(1);
  });
  
  bot.on('end', () => {
    console.log('🔌 Bot disconnected');
    rl.close();
    process.exit(0);
  });
}

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n👋 Exiting...');
  rl.close();
  process.exit(0);
});

testBot().catch(error => {
  console.error('❌ Test failed:', error.message);
  rl.close();
  process.exit(1);
});
