const fs = require('fs-extra');
const path = require('path');

async function setup() {
  console.log('⚙️ Setting up Minecraft Bot System...');
  
  try {
    // Create directories
    await fs.ensureDir('logs');
    await fs.ensureDir('config');
    
    // Create .env file
    const envContent = `MINECRAFT_HOST=gameplannet.aternos.me
MINECRAFT_PORT=43658
MINECRAFT_VERSION=1.21.10
PORT=10000`;
    
    await fs.writeFile('.env', envContent);
    console.log('✅ Setup complete!');
    console.log('🚀 Run: npm start');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

if (require.main === module) {
  setup();
}

module.exports = { setup };
