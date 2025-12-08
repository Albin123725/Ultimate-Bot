const fs = require('fs-extra');
const path = require('path');

async function backup() {
  console.log('💾 Creating system backup...');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, 'backups', `backup-${timestamp}`);
  
  try {
    await fs.ensureDir(backupDir);
    
    // Backup configuration
    const configFiles = [
      '.env',
      'config/proxies.json',
      'config/identities.json',
      'config/behavior_profiles.json',
      'config/ecosystem.json'
    ];
    
    for (const file of configFiles) {
      const source = path.join(__dirname, file);
      const target = path.join(backupDir, file);
      
      if (await fs.pathExists(source)) {
        await fs.copy(source, target);
        console.log(`✓ Backed up ${file}`);
      }
    }
    
    // Create backup manifest
    const manifest = {
      timestamp: new Date().toISOString(),
      systemVersion: '6.0.0',
      server: 'gameplannet.aternos.me:43658',
      bots: ['Agent', 'Cropton'],
      features: [
        'Neural Network AI',
        'Proxy Rotation',
        'Behavior Engine',
        'Temporal Patterns',
        'Identity Management',
        'Ecosystem Simulation',
        'Detection Evasion'
      ]
    };
    
    await fs.writeJson(path.join(backupDir, 'manifest.json'), manifest, { spaces: 2 });
    
    console.log(`✅ Backup created: ${backupDir}`);
    
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
  }
}

module.exports = { backup };

if (require.main === module) {
  backup().catch(console.error);
}
