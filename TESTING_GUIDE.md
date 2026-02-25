# 🧪 Video Feature - Testing Guide

## Quick Start Testing (Expo Go)

### Step 1: Start Frontend
```bash
cd frontend
npm start
```

### Step 2: Test as Pro Partner
1. Open Expo Go app
2. Scan QR code
3. Login: `9054187387`, OTP: `1111`
4. Go to "Post Property"
5. Fill details
6. Upload images (required)
7. Upload video (optional) - max 50MB
8. Submit property
9. Check if property created successfully

### Step 3: Test as Elite Member
1. Logout
2. Login: `7435956074`, OTP: `1111`
3. Go to Home screen
4. Look for properties with "VIDEO" badge
5. Click on property
6. Video should auto-play (muted)
7. Test controls:
   - Tap center to play/pause
   - Tap speaker icon to unmute
8. Verify smooth playback

---

## Backend Testing (EC2)

### Step 1: Install FFmpeg
```bash
ssh ubuntu@13.126.96.223
cd /home/ubuntu/propbay/scripts
chmod +x install-ffmpeg-ec2.sh
./install-ffmpeg-ec2.sh
```

### Step 2: Pull Latest Code
```bash
cd /home/ubuntu/propbay
git pull origin main
```

### Step 3: Restart Backend
```bash
cd backend
pm2 restart propbay-backend
pm2 logs propbay-backend --lines 50
```

### Step 4: Watch Logs
```bash
pm2 logs propbay-backend
```

Look for:
- `🎬 Video uploaded, starting background compression...`
- `✅ Video compression completed: /path/to/video`
- `Original size: XX MB`
- `Compressed size: XX MB`
- `Compression: XX% reduction`

---

## Expected Results

### ✅ Success Indicators:
- [ ] expo-av installed (check package.json)
- [ ] Video player visible in property detail
- [ ] Video badge shows on property cards
- [ ] Video auto-plays when property opened
- [ ] Play/Pause button works
- [ ] Mute/Unmute button works
- [ ] Backend logs show compression started
- [ ] Compressed video size is 5-10MB
- [ ] Trust Score increases by +10 points
- [ ] No errors in Expo Go console
- [ ] No errors in backend logs

### ❌ Common Issues:

**Issue 1: Video not playing**
- Check if video URL is correct
- Verify file exists in `backend/uploads/`
- Check Expo Go console for errors

**Issue 2: Compression not working**
- Verify FFmpeg installed: `ffmpeg -version`
- Check backend logs for errors
- Verify disk space: `df -h`

**Issue 3: App crashes**
- Clear Expo Go cache
- Restart Expo Go app
- Check for TypeScript errors

---

## Performance Testing

### Video Upload:
- Upload 50MB video
- Should complete in 30-60 seconds on 4G
- Backend should start compression immediately
- Property should be live before compression completes

### Video Playback:
- 5-8MB compressed video
- Should load in 2-5 seconds on 4G
- Smooth playback, no buffering
- Controls should be responsive

### Trust Score:
- Check Pro Partner dashboard
- Trust Score should increase by +10 after video upload
- Verify in backend: `User.findById(userId).select('trustScore')`

---

## Rollback Plan (If Issues)

### Option 1: Disable Video Feature
```bash
# Comment out video compression in property.js
# Lines 75-84 and 180-189
```

### Option 2: Revert Commit
```bash
git revert HEAD
git push origin main
```

### Option 3: Use Previous Version
```bash
git checkout d794961
git push origin main --force
```

---

## Contact

If issues persist:
1. Check `VIDEO_FEATURE_IMPLEMENTATION.md`
2. Review backend logs
3. Test locally in Expo Go
4. Verify FFmpeg installation

---

**Testing Checklist:**
- [ ] Frontend builds successfully
- [ ] Backend starts without errors
- [ ] FFmpeg installed on EC2
- [ ] Video upload works
- [ ] Video compression works
- [ ] Video playback works
- [ ] Trust Score updates
- [ ] No breaking changes
- [ ] All existing features work

**Status:** Ready for testing ✅
