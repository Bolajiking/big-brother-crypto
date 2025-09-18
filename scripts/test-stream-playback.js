const fs = require('fs');
const path = require('path');

async function testStreamPlayback(playbackId, cameraName) {
  try {
    const urls = [
      `https://livepeercdn.studio/hls/${playbackId}/index.m3u8`,
      `https://livepeercdn.com/hls/${playbackId}/index.m3u8`,
      `https://playback.livepeer.studio/hls/${playbackId}/index.m3u8`
    ];

    console.log(`Testing ${cameraName} stream...`);
    
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      console.log(`  Trying URL ${i + 1}: ${url}`);
      
      try {
        const response = await fetch(url, { method: 'HEAD' });
        
        if (response.ok) {
          console.log(`  ✅ ${cameraName}: Stream accessible at ${url}`);
          return true;
        } else {
          console.log(`  ❌ ${cameraName}: HTTP ${response.status} at ${url}`);
        }
      } catch (error) {
        console.log(`  ❌ ${cameraName}: Error - ${error.message}`);
      }
      
      // Add delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`  ❌ ${cameraName}: All URLs failed`);
    return false;
  } catch (error) {
    console.error(`❌ Error testing ${cameraName}:`, error);
    return false;
  }
}

async function testAllStreams() {
  try {
    // Read database
    const dbPath = path.join(process.cwd(), 'db.json');
    const dbData = fs.readFileSync(dbPath, 'utf8');
    const db = JSON.parse(dbData);

    console.log('🧪 Testing Livepeer stream playback...\n');
    
    let successCount = 0;
    for (const camera of db.cameras) {
      const success = await testStreamPlayback(camera.playbackId, camera.name);
      if (success) successCount++;
      console.log(''); // Add spacing
    }

    console.log(`📊 Results: ${successCount}/${db.cameras.length} streams accessible`);
    
    if (successCount === 0) {
      console.log('\n💡 Note: Streams may not be accessible until you start streaming to them.');
      console.log('   Use the RTMP URLs provided earlier to start streaming with OBS or similar software.');
    } else {
      console.log('\n✅ Streams are ready! You can now view them in your application at http://localhost:3000');
    }
    
  } catch (error) {
    console.error('❌ Error testing streams:', error);
  }
}

testAllStreams();
