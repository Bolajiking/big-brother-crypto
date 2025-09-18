const fs = require('fs');
const path = require('path');

// Livepeer API configuration
const LIVEPEER_API_KEY = process.env.LIVEPEER_API_KEY || '8e63fa2a-1b34-477b-b252-ad2c646e7605';
const LIVEPEER_API_URL = 'https://livepeer.com/api/stream';

// Camera configurations
const cameras = [
  {
    id: 'cam1',
    name: 'Kitchen',
    description: 'Kitchen area camera',
    streamName: 'kitchen-camera'
  },
  {
    id: 'cam2', 
    name: 'Garden',
    description: 'Garden area camera',
    streamName: 'garden-camera'
  },
  {
    id: 'cam3',
    name: 'Lounge', 
    description: 'Lounge area camera',
    streamName: 'lounge-camera'
  },
  {
    id: 'cam4',
    name: 'Pool',
    description: 'Pool area camera',
    streamName: 'pool-camera'
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

async function updateDatabase() {
  try {
    console.log('🚀 Setting up Livepeer streams...\n');
    
    const updatedCameras = [];
    
    for (const camera of cameras) {
      const streamData = await createLivepeerStream(camera);
      if (streamData) {
        updatedCameras.push(streamData);
      }
      
      // Add delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Read current database
    const dbPath = path.join(process.cwd(), 'db.json');
    const dbData = fs.readFileSync(dbPath, 'utf8');
    const db = JSON.parse(dbData);

    // Update cameras with new stream data
    db.cameras = updatedCameras;

    // Write updated database
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    
    console.log('\n✅ Database updated successfully!');
    console.log('\n📋 Stream Information:');
    updatedCameras.forEach(camera => {
      console.log(`  ${camera.name}:`);
      console.log(`    Stream ID: ${camera.streamId}`);
      console.log(`    Playback ID: ${camera.playbackId}`);
      console.log(`    RTMP URL: rtmp://rtmp.livepeer.com/live/${camera.streamId}`);
      console.log('');
    });

    console.log('🎥 To start streaming to each camera:');
    console.log('1. Use OBS Studio or similar streaming software');
    console.log('2. Set the RTMP URL for each camera as shown above');
    console.log('3. Use the Stream Key: (same as Stream ID)');
    console.log('4. Start streaming and the feeds will appear in your app!');

  } catch (error) {
    console.error('❌ Error updating database:', error);
  }
}

// Run the setup
updateDatabase();
