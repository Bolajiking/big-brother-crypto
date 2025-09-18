const fs = require('fs');
const path = require('path');

async function testStream(playbackId, cameraName) {
  try {
    const streamUrl = `http://livepeercdn.studio/hls/${playbackId}/index.m3u8`;
    console.log(`Testing ${cameraName} stream: ${streamUrl}`);
    
    const response = await fetch(streamUrl, { method: 'HEAD' });
    
    if (response.ok) {
      console.log(`✅ ${cameraName}: Stream is accessible`);
      return true;
    } else {
      console.log(`❌ ${cameraName}: Stream not accessible (${response.status})`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${cameraName}: Error - ${error.message}`);
    return false;
  }
}

async function testAllStreams() {
  try {
    // Read database
    const dbPath = path.join(process.cwd(), 'db.json');
    const dbData = fs.readFileSync(dbPath, 'utf8');
    const db = JSON.parse(dbData);

    console.log('🧪 Testing Livepeer streams...\n');
    
    let successCount = 0;
    for (const camera of db.cameras) {
      const success = await testStream(camera.playbackId, camera.name);
      if (success) successCount++;
      
      // Add delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\n📊 Results: ${successCount}/${db.cameras.length} streams accessible`);
    
    if (successCount === 0) {
      console.log('\n💡 Note: Streams may not be accessible until you start streaming to them.');
      console.log('   Use the RTMP URLs provided earlier to start streaming with OBS or similar software.');
    }
    
  } catch (error) {
    console.error('❌ Error testing streams:', error);
  }
}

testAllStreams();
