const fs = require('fs');
const path = require('path');

async function test6Cameras() {
  try {
    // Read database
    const dbPath = path.join(process.cwd(), 'db.json');
    const dbData = fs.readFileSync(dbPath, 'utf8');
    const db = JSON.parse(dbData);

    console.log('🧪 Testing 6 cameras...\n');
    
    let successCount = 0;
    for (const camera of db.cameras) {
      try {
        const streamUrl = `https://livepeercdn.studio/hls/${camera.playbackId}/index.m3u8`;
        console.log(`Testing ${camera.name} stream...`);
        
        const response = await fetch(streamUrl, { method: 'HEAD' });
        
        if (response.ok) {
          console.log(`  ✅ ${camera.name}: Stream accessible`);
          successCount++;
        } else {
          console.log(`  ❌ ${camera.name}: HTTP ${response.status}`);
        }
      } catch (error) {
        console.log(`  ❌ ${camera.name}: Error - ${error.message}`);
      }
      
      // Add delay between requests
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log(`\n📊 Results: ${successCount}/${db.cameras.length} streams accessible`);
    
    if (successCount === db.cameras.length) {
      console.log('\n🎉 All 6 cameras are ready!');
      console.log('\n📋 Camera Locations:');
      db.cameras.forEach((camera, index) => {
        console.log(`  ${index + 1}. ${camera.name} - ${camera.description}`);
      });
    } else {
      console.log('\n💡 Some streams may not be accessible until you start streaming to them.');
    }
    
  } catch (error) {
    console.error('❌ Error testing cameras:', error);
  }
}

test6Cameras();
