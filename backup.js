#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');

async function backup() {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║   💾 ULTIMATE BOT SYSTEM BACKUP v4.0                     ║
║   ⚡ Complete System Backup & Restore                    ║
╚══════════════════════════════════════════════════════════╝
`);
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, 'backups', `backup-${timestamp}`);
  
  try {
    await fs.ensureDir(backupDir);
    
    // Files and directories to backup
    const backupItems = [
      { source: '.env', type: 'file' },
      { source: 'config', type: 'dir' },
      { source: 'logs', type: 'dir' },
      { source: 'data', type: 'dir' },
      { source: 'sessions', type: 'dir' }
    ];
    
    console.log('📦 Collecting backup data...');
    
    let totalFiles = 0;
    let totalSize = 0;
    
    for (const item of backupItems) {
      const sourcePath = path.join(__dirname, item.source);
      const targetPath = path.join(backupDir, item.source);
      
      if (await fs.pathExists(sourcePath)) {
        if (item.type === 'dir') {
          await fs.copy(sourcePath, targetPath);
          const stats = await getDirectoryStats(sourcePath);
          totalFiles += stats.files;
          totalSize += stats.size;
          console.log(`✓ ${item.source}: ${stats.files} files (${formatBytes(stats.size)})`);
        } else {
          await fs.copy(sourcePath, targetPath);
          const stat = await fs.stat(sourcePath);
          totalFiles++;
          totalSize += stat.size;
          console.log(`✓ ${item.source}: 1 file (${formatBytes(stat.size)})`);
        }
      }
    }
    
    // Create backup manifest
    const manifest = {
      version: '4.0.0',
      timestamp: new Date().toISOString(),
      system: 'Ultimate Minecraft Bot System',
      items: backupItems.map(item => item.source),
      statistics: {
        totalFiles: totalFiles,
        totalSize: totalSize,
        formattedSize: formatBytes(totalSize)
      },
      systemInfo: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      }
    };
    
    await fs.writeJson(path.join(backupDir, 'manifest.json'), manifest, { spaces: 2 });
    
    // Create restore script
    const restoreScript = `
#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

async function restore() {
  console.log('🔄 Starting system restore...');
  
  const backupPath = path.dirname(__dirname);
  const restorePath = path.join(__dirname, '..');
  
  try {
    // Read manifest
    const manifestPath = path.join(backupPath, 'manifest.json');
    if (!await fs.pathExists(manifestPath)) {
      console.error('❌ Manifest not found');
      return;
    }
    
    const manifest = await fs.readJson(manifestPath);
    console.log(\`📋 Restoring backup from: \${manifest.timestamp}\`);
    
    // Restore items
    for (const item of manifest.items) {
      const source = path.join(backupPath, item);
      const target = path.join(restorePath, item);
      
      if (await fs.pathExists(source)) {
        await fs.copy(source, target, { overwrite: true });
        console.log(\`✓ Restored: \${item}\`);
      }
    }
    
    console.log('✅ Restore completed successfully!');
    console.log('🎮 Restart the system: npm start');
    
  } catch (error) {
    console.error('❌ Restore failed:', error.message);
  }
}

// Run restore
restore().catch(console.error);
`;
    
    await fs.writeFile(path.join(backupDir, 'restore.js'), restoreScript);
    await fs.chmod(path.join(backupDir, 'restore.js'), '755');
    
    // Create quick restore command
    const quickRestore = `cd "${path.dirname(backupDir)}" && node "${backupDir}/restore.js"`;
    await fs.writeFile(path.join(backupDir, 'RESTORE.txt'), quickRestore);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ BACKUP COMPLETE!');
    console.log('='.repeat(60));
    console.log(`📁 Backup location: ${backupDir}`);
    console.log(`📦 Total size: ${formatBytes(totalSize)}`);
    console.log(`📄 Files backed up: ${totalFiles}`);
    console.log('\n⚡ RESTORE COMMAND:');
    console.log(`   node "${backupDir}/restore.js"`);
    console.log('='.repeat(60));
    
    // Clean old backups
    await cleanOldBackups();
    
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    process.exit(1);
  }
}

async function getDirectoryStats(dir) {
  let files = 0;
  let size = 0;
  
  const processDir = async (currentDir) => {
    const items = await fs.readdir(currentDir);
    
    for (const item of items) {
      const itemPath = path.join(currentDir, item);
      const stat = await fs.stat(itemPath);
      
      if (stat.isDirectory()) {
        await processDir(itemPath);
      } else {
        files++;
        size += stat.size;
      }
    }
  };
  
  await processDir(dir);
  return { files, size };
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
      console.log(`🗑️ Removed old backup: ${backup.name}`);
    }
  }
}

// Export for use in package.json
module.exports = { backup };

// Run backup if called directly
if (require.main === module) {
  backup().catch(console.error);
}
