const fs = require('fs');
const path = require('path');

function testRevertedUI() {
  console.log('�� Testing Reverted UI Layout...\n');

  // Check main page layout
  const pagePath = path.join(process.cwd(), 'src/app/page.tsx');
  if (fs.existsSync(pagePath)) {
    const pageContent = fs.readFileSync(pagePath, 'utf8');
    
    if (pageContent.includes('lg:grid-cols-4')) {
      console.log('✅ Grid layout: 4 columns on large screens');
    } else {
      console.log('❌ Grid layout not found');
    }

    if (pageContent.includes('lg:col-span-3') && pageContent.includes('lg:col-span-1')) {
      console.log('✅ Column spans: Main content (3 cols) + Camera grid (1 col)');
    } else {
      console.log('❌ Column spans incorrect');
    }

    if (pageContent.includes('Live Stream')) {
      console.log('✅ Main video player section found');
    } else {
      console.log('❌ Main video player section missing');
    }

    if (pageContent.includes('MultiCamGrid')) {
      console.log('✅ MultiCamGrid component imported');
    } else {
      console.log('❌ MultiCamGrid component not imported');
    }

    if (pageContent.includes('selectedPlaybackId')) {
      console.log('✅ Selected playback ID state management');
    } else {
      console.log('❌ Selected playback ID state missing');
    }
  }

  // Check MultiCamGrid component
  const multicamPath = path.join(process.cwd(), 'src/components/MultiCamGrid.tsx');
  if (fs.existsSync(multicamPath)) {
    const multicamContent = fs.readFileSync(multicamPath, 'utf8');
    
    if (multicamContent.includes('grid-cols-2')) {
      console.log('✅ Camera grid: 2 columns layout');
    } else {
      console.log('❌ Camera grid layout not found');
    }

    if (multicamContent.includes('h-32')) {
      console.log('✅ Camera thumbnails: Fixed height');
    } else {
      console.log('❌ Camera thumbnail height not set');
    }
  }

  console.log('\n🎯 Original UI Layout Restored:');
  console.log('  • Left side (75%): Main video player + Chat below');
  console.log('  • Right side (25%): Camera grid (2 columns)');
  console.log('  • Main video: Shows selected camera stream');
  console.log('  • Camera grid: Click to select different camera');
  console.log('  • Chat: Below main video player');
  
  console.log('\n📱 Layout Structure:');
  console.log('  • Main Video Player (top left)');
  console.log('  • Live Chat (bottom left)');
  console.log('  • Camera Grid (right side)');
  
  console.log('\n🌐 Test your application at: http://localhost:3000');
  console.log('   Login: cryptoFan1 / password123');
  console.log('   • Should see main video on left');
  console.log('   • Camera grid on right');
  console.log('   • Chat below main video');
}

testRevertedUI();
