const fs = require('fs');
const path = require('path');

// Livepeer API configuration
const LIVEPEER_API_KEY = process.env.LIVEPEER_API_KEY || '8e63fa2a-1b34-477b-b252-ad2c646e7605';
const LIVEPEER_API_URL = 'https://livepeer.com/api/stream';

// Additional camera configurations
const newCameras = [
  {
    id: 'cam5',
    name: 'Garage',
    description: 'Garage area camera',
    streamName: 'garage-camera'
  },
  {
    id: 'cam6', 
    name: 'Bedroom',
    description: 'Bedroom area camera',
    streamName: 'bedroom-camera'
  },
  {
    id: 'cam7',
    name: 'Office', 
    description: 'Office area camera',
    streamName: 'office-camera'
  },
  {
    id: 'cam8',
    name: 'Balcony',
    description: 'Balcony area camera',
    streamName: 'balcony-camera'
  }
];

async function createLivepeerStream(camera) {
  try {
    console.log(`Creating Livepeer stream for ${camera.name}...`);
    
    const response = await fetch(LIVEPEER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LIVEPEER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: camera.streamName,
        record: true,
        multistream: {
          targets: []
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const streamData = await response.json();
    console.log(`✅ Stream created for ${camera.name}:`, streamData.id);
    
    return {
      id: camera.id,
      name: camera.name,
      playbackId: streamData.playbackId,
      streamId: streamData.id,
      isActive: true,
      description: camera.description
    };
  } catch (error) {
    console.error(`❌ Error creating stream for ${camera.name}:`, error.message);
    return null;
  }
}

async function addNewCameras() {
  try {
    console.log('🚀 Adding 4 new cameras...\n');
    
    // Read current database
    const dbPath = path.join(process.cwd(), 'db.json');
    const dbData = fs.readFileSync(dbPath, 'utf8');
    const db = JSON.parse(dbData);

    console.log(`Current cameras: ${db.cameras.length}`);
    
    const newCameraData = [];
    
    for (const camera of newCameras) {
      const streamData = await createLivepeerStream(camera);
      if (streamData) {
        newCameraData.push(streamData);
      }
      
      // Add delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Add new cameras to existing ones
    db.cameras = [...db.cameras, ...newCameraData];

    // Write updated database
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    
    console.log(`\n✅ Database updated successfully!`);
    console.log(`Total cameras: ${db.cameras.length}`);
    
    console.log('\n📋 New Camera Information:');
    newCameraData.forEach(camera => {
      console.log(`  ${camera.name}:`);
      console.log(`    Stream ID: ${camera.streamId}`);
      console.log(`    Playback ID: ${camera.playbackId}`);
      console.log(`    RTMP URL: rtmp://rtmp.livepeer.com/live/${camera.streamId}`);
      console.log('');
    });

    console.log('🎥 All 8 cameras are now ready!');
    console.log('   • Kitchen, Garden, Lounge, Pool (original)');
    console.log('   • Garage, Bedroom, Office, Balcony (new)');
    console.log('\n🌐 View them at: http://localhost:3000');

  } catch (error) {
    console.error('❌ Error adding cameras:', error);
  }
}

// Run the setup
addNewCameras();
