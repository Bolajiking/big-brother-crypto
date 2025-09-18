const fs = require('fs');
const path = require('path');

async function testLiveStream(playbackId, cameraName) {
  try {
    const streamUrl = `http://livepeercdn.studio/hls/${playbackId}/index.m3u8`;
    console.log(`🔍 Testing live stream for ${cameraName}...`);
    console.log(`   URL: ${streamUrl}`);
    
    // Test manifest accessibility
    const manifestResponse = await fetch(streamUrl, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Big-Brother-Crypto/1.0',
        'Accept': 'application/vnd.apple.mpegurl, application/x-mpegurl, application/octet-stream'
      }
    });
    
    if (!manifestResponse.ok) {
      console.log(`   ❌ Manifest not accessible: ${manifestResponse.status}`);
      return { success: false, error: `Manifest HTTP ${manifestResponse.status}` };
    }
    
    console.log(`   ✅ Manifest accessible: ${manifestResponse.status}`);
    
    // Get the manifest content
    const manifestText = await fetch(streamUrl).then(r => r.text());
    console.log(`   📋 Manifest size: ${manifestText.length} bytes`);
    
    // Check if it's a valid HLS manifest
    if (!manifestText.includes('#EXTM3U')) {
      console.log(`   ❌ Invalid HLS manifest format`);
      return { success: false, error: 'Invalid HLS manifest' };
    }
    
    console.log(`   ✅ Valid HLS manifest format`);
    
    // Check for segments
    const segmentLines = manifestText.split('\n').filter(line => 
      line.includes('#EXTINF') || line.includes('.ts')
    );
    
    console.log(`   📊 Segments found: ${segmentLines.length}`);
    
    if (segmentLines.length === 0) {
      console.log(`   ⚠️  No segments found - stream may not be live yet`);
      return { success: true, warning: 'No segments found - stream not live' };
    }
    
    // Check for live stream indicators
    const isLive = manifestText.includes('#EXT-X-ENDLIST') === false;
    console.log(`   ${isLive ? '🟢' : '🔴'} Stream status: ${isLive ? 'LIVE' : 'VOD'}`);
    
    // Check for quality variants
    const hasVariants = manifestText.includes('#EXT-X-STREAM-INF');
    console.log(`   📺 Quality variants: ${hasVariants ? 'Yes' : 'No'}`);
    
    return { 
      success: true, 
      isLive, 
      segmentCount: segmentLines.length,
      hasVariants,
      manifestSize: manifestText.length
    };
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testAllLiveStreams() {
  try {
    // Read database
    const dbPath = path.join(process.cwd(), 'db.json');
    const dbData = fs.readFileSync(dbPath, 'utf8');
    const db = JSON.parse(dbData);

    console.log('🚀 Testing Live Streams for BigBrotherCrypto\n');
    console.log('=' .repeat(70));
    
    let totalTests = 0;
    let successfulTests = 0;
    let liveStreams = 0;
    const results = [];
    
    for (const camera of db.cameras) {
      console.log(`\n📹 Camera: ${camera.name} (${camera.id})`);
      console.log(`   Playback ID: ${camera.playbackId}`);
      console.log(`   Stream ID: ${camera.streamId}`);
      console.log(`   Active: ${camera.isActive ? '✅ Yes' : '❌ No'}`);
      
      if (!camera.isActive) {
        console.log(`   ⏭️  Skipping inactive camera`);
        continue;
      }
      
      totalTests++;
      const result = await testLiveStream(camera.playbackId, camera.name);
      
      if (result.success) {
        successfulTests++;
        if (result.isLive) {
          liveStreams++;
        }
        console.log(`   🎉 Stream test passed for ${camera.name}`);
      } else {
        console.log(`   ❌ Stream test failed for ${camera.name}: ${result.error}`);
      }
      
      results.push({
        camera: camera.name,
        playbackId: camera.playbackId,
        success: result.success,
        isLive: result.isLive || false,
        segmentCount: result.segmentCount || 0,
        error: result.error || null
      });
      
      // Add delay between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('\n' + '=' .repeat(70));
    console.log('📊 LIVE STREAM TEST SUMMARY');
    console.log('=' .repeat(70));
    console.log(`Total cameras tested: ${totalTests}`);
    console.log(`Successful connections: ${successfulTests}`);
    console.log(`Live streams detected: ${liveStreams}`);
    console.log(`Success rate: ${((successfulTests / totalTests) * 100).toFixed(1)}%`);
    console.log(`Live stream rate: ${((liveStreams / totalTests) * 100).toFixed(1)}%`);
    
    console.log('\n📋 DETAILED RESULTS:');
    results.forEach(result => {
      const status = result.success ? (result.isLive ? '🟢 LIVE' : '🟡 READY') : '❌ ERROR';
      console.log(`   ${status} ${result.camera}: ${result.playbackId}`);
      if (result.error) {
        console.log(`      Error: ${result.error}`);
      }
      if (result.segmentCount > 0) {
        console.log(`      Segments: ${result.segmentCount}`);
      }
    });
    
    if (liveStreams > 0) {
      console.log('\n🎉 Live streams detected! Your surveillance platform is working!');
    } else if (successfulTests === totalTests) {
      console.log('\n✅ All streams are accessible but not live yet.');
      console.log('💡 Start streaming to the RTMP endpoints to see live video feeds.');
    } else {
      console.log('\n⚠️  Some streams have connection issues. Check the errors above.');
    }
    
    console.log('\n🔧 RTMP Streaming Instructions:');
    console.log('1. Use OBS Studio or similar streaming software');
    console.log('2. Set Server to: rtmp://rtmp.livepeer.com/live/');
    console.log('3. Use the Stream Key from the table above');
    console.log('4. Start streaming and refresh the web app');
    
  } catch (error) {
    console.error('❌ Error testing live streams:', error);
  }
}

// Run the test
testAllLiveStreams();
