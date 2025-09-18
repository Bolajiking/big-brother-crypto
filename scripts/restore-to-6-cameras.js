const fs = require('fs');
const path = require('path');

async function restoreTo6Cameras() {
  try {
    console.log('🔄 Restoring to 6 cameras (removing Office and Balcony)...\n');
    
    // Read current database
    const dbPath = path.join(process.cwd(), 'db.json');
    const dbData = fs.readFileSync(dbPath, 'utf8');
    const db = JSON.parse(dbData);

    console.log(`Current cameras: ${db.cameras.length}`);
    
    // Keep only the first 6 cameras (original 4 + Garage + Bedroom)
    const camerasToKeep = db.cameras.slice(0, 6);
    
    console.log('Cameras to keep:');
    camerasToKeep.forEach((camera, index) => {
      console.log(`  ${index + 1}. ${camera.name} - ${camera.description}`);
    });
    
    // Remove Office (cam7) and Balcony (cam8)
    const camerasToRemove = db.cameras.slice(6);
    console.log('\nCameras to remove:');
    camerasToRemove.forEach((camera, index) => {
      console.log(`  ${index + 1}. ${camera.name} - ${camera.description}`);
    });

    // Update database with only 6 cameras
    db.cameras = camerasToKeep;

    // Write updated database
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    
    console.log(`\n✅ Database restored successfully!`);
    console.log(`Total cameras: ${db.cameras.length}`);
    
    console.log('\n📋 Final Camera List:');
    db.cameras.forEach((camera, index) => {
      console.log(`  ${index + 1}. ${camera.name} - ${camera.description}`);
      console.log(`     Stream ID: ${camera.streamId}`);
      console.log(`     Playback ID: ${camera.playbackId}`);
      console.log('');
    });

    console.log('🎥 6 cameras are now active!');
    console.log('   • Kitchen, Garden, Lounge, Pool (original)');
    console.log('   • Garage, Bedroom (additional)');
    console.log('\n🌐 View them at: http://localhost:3000');

  } catch (error) {
    console.error('❌ Error restoring cameras:', error);
  }
}

// Run the restoration
restoreTo6Cameras();
