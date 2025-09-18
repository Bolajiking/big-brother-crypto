const fs = require('fs');
const path = require('path');

async function testStreamEndpoint(playbackId, cameraName) {
  try {
    const streamUrl = `https://livepeercdn.com/hls/${playbackId}/index.m3u8`;
    console.log(`🔍 Testing ${cameraName} stream endpoint...`);
    console.log(`   URL: ${streamUrl}`);
    
    const response = await fetch(streamUrl, { 
      method: 'HEAD',
      headers: {
        'User-Agent': 'Big-Brother-Crypto/1.0'
      }
    });
    
    if (response.ok) {
      console.log(`   ✅ Status: ${response.status} - Stream accessible`);
      console.log(`   📊 Content-Type: ${response.headers.get('content-type') || 'N/A'}`);
      console.log(`   📏 Content-Length: ${response.headers.get('content-length') || 'N/A'}`);
      return { success: true, status: response.status, headers: response.headers };
    } else {
      console.log(`   ❌ Status: ${response.status} - Stream not accessible`);
      return { success: false, status: response.status, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testHLSManifest(playbackId, cameraName) {
  try {
    const manifestUrl = `https://livepeercdn.com/hls/${playbackId}/index.m3u8`;
    console.log(`📋 Testing HLS manifest for ${cameraName}...`);
    
    const response = await fetch(manifestUrl);
    
    if (response.ok) {
      const manifest = await response.text();
      console.log(`   ✅ Manifest retrieved (${manifest.length} bytes)`);
      
      // Check if it's a valid HLS manifest
      if (manifest.includes('#EXTM3U')) {
        console.log(`   ✅ Valid HLS manifest format`);
        
        // Count segments
        const segmentCount = (manifest.match(/#EXTINF/g) || []).length;
        console.log(`   📊 Segments found: ${segmentCount}`);
        
        return { success: true, segmentCount, manifestLength: manifest.length };
      } else {
        console.log(`   ⚠️  Manifest doesn't appear to be HLS format`);
        return { success: false, error: 'Invalid HLS manifest format' };
      }
    } else {
      console.log(`   ❌ Failed to retrieve manifest: ${response.status}`);
      return { success: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    console.log(`   ❌ Error retrieving manifest: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function verifyAllStreamEndpoints() {
  try {
    // Read database
    const dbPath = path.join(process.cwd(), 'db.json');
    const dbData = fs.readFileSync(dbPath, 'utf8');
    const db = JSON.parse(dbData);

    console.log('🚀 Verifying Big Brother Crypto Stream Endpoints\n');
    console.log('=' .repeat(60));
    
    let totalTests = 0;
    let successfulTests = 0;
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
      
      // Test stream endpoint
      totalTests++;
      const endpointResult = await testStreamEndpoint(camera.playbackId, camera.name);
      
      if (endpointResult.success) {
        // Test HLS manifest
        const manifestResult = await testHLSManifest(camera.playbackId, camera.name);
        
        if (manifestResult.success) {
          successfulTests++;
          console.log(`   🎉 All tests passed for ${camera.name}`);
        } else {
          console.log(`   ⚠️  Endpoint accessible but manifest issues: ${manifestResult.error}`);
        }
      } else {
        console.log(`   ❌ Endpoint test failed: ${endpointResult.error}`);
      }
      
      results.push({
        camera: camera.name,
        playbackId: camera.playbackId,
        endpointSuccess: endpointResult.success,
        manifestSuccess: endpointResult.success ? (await testHLSManifest(camera.playbackId, camera.name)).success : false
      });
      
      // Add delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n' + '=' .repeat(60));
    console.log('📊 VERIFICATION SUMMARY');
    console.log('=' .repeat(60));
    console.log(`Total cameras tested: ${totalTests}`);
    console.log(`Successful endpoints: ${successfulTests}`);
    console.log(`Success rate: ${((successfulTests / totalTests) * 100).toFixed(1)}%`);
    
    console.log('\n📋 DETAILED RESULTS:');
    results.forEach(result => {
      const status = result.endpointSuccess && result.manifestSuccess ? '✅' : '❌';
      console.log(`   ${status} ${result.camera}: ${result.playbackId}`);
    });
    
    if (successfulTests === totalTests) {
      console.log('\n🎉 All stream endpoints are properly configured and accessible!');
      console.log('🚀 Your Big Brother Crypto surveillance platform is ready for streaming!');
    } else {
      console.log('\n⚠️  Some stream endpoints have issues. Check the details above.');
      console.log('💡 Note: Streams may not be accessible until you start streaming to them.');
      console.log('   Use OBS Studio or similar software to start streaming to the RTMP endpoints.');
    }
    
  } catch (error) {
    console.error('❌ Error verifying stream endpoints:', error);
  }
}

// Run the verification
verifyAllStreamEndpoints();
