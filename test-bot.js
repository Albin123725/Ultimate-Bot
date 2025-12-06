// Test bot connection
const mineflayer = require('mineflayer');

console.log('🤖 Testing bot connection to Aternos server...');

const bot = mineflayer.createBot({
  host: 'gameplannet.aternos.me',
  port: 34286,
  username: 'TestBot123',
  version: '1.21.10',
  auth: 'offline'
});

bot.on('login', () => {
  console.log('✅ Bot logged in!');
});

bot.on('spawn', () => {
  console.log('📍 Bot spawned in world');
  console.log('Position:', bot.entity.position);
  bot.chat('Hello from test bot!');
});

bot.on('chat', (username, message) => {
  console.log(`💬 ${username}: ${message}`);
});

bot.on('health', () => {
  console.log(`❤️ Health: ${bot.health} | 🍗 Food: ${bot.food}`);
});

bot.on('error', (err) => {
  console.log('❌ Error:', err.message);
});

bot.on('kicked', (reason) => {
  console.log('🚫 Kicked:', reason);
});

bot.on('end', () => {
  console.log('🔌 Bot disconnected');
});
