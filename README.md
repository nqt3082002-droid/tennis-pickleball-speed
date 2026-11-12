# Ball Speed Tracker (PWA prototype)

## What this prototype does
- Runs in a mobile browser on Android and iPhone.
- Requests the rear camera.
- Attempts to detect yellow/green pixels and follow the centroid.
- Converts image-plane displacement to an estimated speed using a user-entered metres-per-pixel calibration.
- Keeps a simple local session history.

## Important accuracy limitation
This is an experimental prototype, not a validated sports radar. A single camera measures 2D image motion. Perspective, ball depth, flight height, motion blur, rolling shutter, frame-rate variability, missed detections and lighting can cause large errors. It cannot honestly promise high accuracy or measure the true 3D speed in all court positions. Use a tripod and validate against a radar gun before relying on readings.

## Run locally
1. Unzip this folder.
2. Serve it from an HTTPS host (or localhost). Camera access is blocked on ordinary HTTP pages.
3. For a quick computer test, install Node.js and run:
   `npx serve .`
   Then open the HTTPS URL on the phone, or use a secure static host such as GitHub Pages / Netlify.
4. Grant camera permission.
5. Choose Tennis or Pickleball, tap **Bật camera**.
6. Place two visible marks in the ball's travel plane at a known distance. Enter that distance in metres and the pixel distance between the marks, then save calibration.
7. Tap **Bắt đầu đo** and hit the ball across the calibrated plane.

## Install on phone
### Android
1. Open the hosted HTTPS URL in Chrome.
2. Allow camera access.
3. Chrome menu (⋮) -> **Install app** or **Add to Home screen**.
4. Open the installed app from the home screen.

### iPhone
1. Open the hosted HTTPS URL in Safari.
2. Allow camera access.
3. Share -> **Add to Home Screen** -> Add.
4. Launch from the home screen.

## Notes
- Browser camera frame rate may be much lower than the camera's advertised slow-motion FPS. Check the camera settings reported by the browser.
- The current prototype uses a simple color threshold, not a trained AI model. It may fail on some ball/surface combinations.
- Production-quality automatic tracking should use high-frame-rate native camera capture, calibrated lens/intrinsics, court-plane homography or stereo/depth, a trained detector, timestamped frames, and validation against radar measurements.
