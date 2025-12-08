const mineflayer = require('mineflayer');

console.log('🤖 Testing connection to Aternos server...');

const bot = mineflayer.createBot({
  host: 'gameplannet.aternos.me',
  port: 43658,
  username: 'TestBot',
  version: '1.21.10'
});

bot.on('login', () => {
  console.log('✅ Bot logged in');
});

bot.on('spawn', () => {
  console.log('📍 Bot spawned');
  console.log('✅ Test successful! Server is accessible.');
  bot.quit();
  process.exit(0);
});

bot.on('error', (err) => {
  console.log('❌ Error:', err.message);
  process.exit(1);
});

bot.on('kicked', (reason) => {
  console.log('🚫 Kicked:', reason);
  process.exit(1);
});

setTimeout(() => {
  console.log('⏱️ Timeout - server might be offline');
  process.exit(1);
}, 10000);
