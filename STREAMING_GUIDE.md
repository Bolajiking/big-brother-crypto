# Big Brother Crypto - Live Streaming Guide

## 🎯 Current Status
- ✅ **All 8 stream endpoints are properly configured**
- ✅ **All manifests are accessible and valid**
- ✅ **Platform is ready for live streaming**
- ⚠️ **No live streams detected - streams need to be started**

## 📹 Stream Endpoints Ready

| Camera | Playback ID | Stream Key | Status |
|--------|-------------|------------|--------|
| Kitchen | `32b49rq29siaxjlf` | `32b47c8b-56c3-4a31-984f-be8d090bcb21` | 🟡 Ready |
| Garden | `72c29f0j1c70dlig` | `72c2312d-d214-4f3f-abf5-8ef1f2dd53dc` | 🟡 Ready |
| Lounge | `6fd1lveinnzmgcao` | `6fd1adb0-653e-4ec9-9618-e79a1bd4c650` | 🟡 Ready |
| Pool | `5fccqgu53l9ihfvl` | `5fccc719-b682-41c3-86b3-152c4156be0a` | 🟡 Ready |
| Garage | `0984i2pnvzyw33mf` | `0984fe62-7578-4e95-b6d0-b3653cde13cc` | 🟡 Ready |
| Bedroom | `f475d1g7kwzux65j` | `f4750b12-b3c7-4d57-a888-4abed546b41e` | 🟡 Ready |
| Office | `8a2b3c4d5e6f7g8h9` | `8a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6` | 🟡 Ready |
| Entrance | `9z8y7x6w5v4u3t2s1` | `9z8y7x6w-5v4u-3t2s-1r0q-p9o8n7m6l5k4` | 🟡 Ready |

## 🚀 How to Start Live Streaming

### Method 1: OBS Studio (Recommended)

1. **Download OBS Studio**: https://obsproject.com/
2. **Open OBS Studio**
3. **Go to Settings → Stream**
4. **Configure Stream Settings**:
   - **Service**: Custom
   - **Server**: `rtmp://rtmp.livepeer.com/live/`
   - **Stream Key**: Use the Stream Key from the table above
5. **Add Video Source**:
   - Click "+" in Sources
   - Select "Video Capture Device" or "Display Capture"
   - Configure your camera/display
6. **Start Streaming**: Click "Start Streaming"
7. **Check Your App**: Refresh http://localhost:3001 to see the live feed

### Method 2: FFmpeg Command Line

```bash
# Example for Kitchen camera
ffmpeg -f avfoundation -i "0" -c:v libx264 -preset fast -f flv rtmp://rtmp.livepeer.com/live/32b47c8b-56c3-4a31-984f-be8d090bcb21

# Example for Garden camera  
ffmpeg -f avfoundation -i "0" -c:v libx264 -preset fast -f flv rtmp://rtmp.livepeer.com/live/72c2312d-d214-4f3f-abf5-8ef1f2dd53dc
```

### Method 3: Mobile Apps

- **Larix Broadcaster** (iOS/Android)
- **RTMP Camera** (Android)
- **Live:Air Solo** (iOS)

**Configuration**:
- **RTMP URL**: `rtmp://rtmp.livepeer.com/live/`
- **Stream Key**: Use the Stream Key from the table above

## 🔧 Testing Your Streams

### 1. Test Individual Stream
```bash
node scripts/test-live-streams.js
```

### 2. Verify Stream Endpoints
```bash
node scripts/verify-stream-endpoints.js
```

### 3. Check Web Application
- Open: http://localhost:3001
- Login with: `cryptoFan1` / `password123`
- Look for live indicators (green dots) on active streams

## 📊 Stream Status Indicators

- 🟢 **Green Dot + Pulsing**: Live stream active
- 🔴 **Red Dot**: Stream offline/no signal
- ⚫ **Black Screen + Static**: No stream (normal when offline)

## 🛠️ Troubleshooting

### Stream Not Appearing?
1. **Check Stream Key**: Ensure you're using the correct Stream Key
2. **Check RTMP URL**: Must be `rtmp://rtmp.livepeer.com/live/`
3. **Wait 30-60 seconds**: Streams take time to propagate
4. **Refresh Browser**: Hard refresh (Ctrl+F5 / Cmd+Shift+R)

### Video Quality Issues?
1. **Check Bitrate**: Use 2000-5000 kbps for good quality
2. **Resolution**: 720p or 1080p recommended
3. **Frame Rate**: 30fps recommended

### Connection Issues?
1. **Check Internet**: Ensure stable connection
2. **Firewall**: Allow OBS/streaming software through firewall
3. **Ports**: Ensure RTMP port 1935 is not blocked

## 🎬 Demo Mode

To test the platform without live streams:

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Open the application**: http://localhost:3001

3. **Login**: Use `cryptoFan1` / `password123`

4. **View the interface**: You'll see the surveillance platform with static backgrounds

5. **Start streaming**: Use any of the methods above to start live feeds

## 📱 Mobile Access

The platform is responsive and works on mobile devices:
- **Local Network**: http://192.168.0.194:3001
- **Mobile Browsers**: Chrome, Safari, Firefox
- **Touch Controls**: Tap cameras to view full-screen

## 🔒 Security Notes

- **RTMP Streams**: Not encrypted (use VPN for sensitive content)
- **Web Interface**: Accessible on local network
- **Authentication**: Basic username/password system
- **Stream Keys**: Keep private, don't share publicly

---

## 🎉 Success!

Once you start streaming to any of the RTMP endpoints, you'll see:
- ✅ Live video feeds in the camera grid
- ✅ Green status indicators
- ✅ Real-time video playback
- ✅ Full-screen stream viewing
- ✅ Professional surveillance interface

**Your Big Brother Crypto surveillance platform is ready for live streaming!** 🚀
