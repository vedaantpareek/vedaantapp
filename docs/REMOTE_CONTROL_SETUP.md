# ConnectFBLA Remote Control — Setup Guide

Live phone mirror for the FBLA State Conference presentation (April 3, 2026).

---

## How it works

```
Phone (Expo app)  ←──WebSocket──→  server.js (laptop)  ←──WebSocket──→  Browser (remote-control.html)
      │                                                                         │
  screenshots ──────────────────────────────────────────────────────────────►  │  displayed in phone frame
      │                                                                         │
  tap/nav cmds ◄────────────────────────────────────────────────────────────  │  mouse clicks in frame
```

Both devices must be on the **same WiFi network**. No internet required.

---

## Step 1 — Install dependencies (one time only)

In the project root:

```bash
npm install
npx expo install react-native-view-shot
```

---

## Step 2 — Find your laptop's local IP

### Windows
```
ipconfig
```
Look for the `IPv4 Address` under your WiFi adapter (e.g. `192.168.1.42`).

### macOS
```
ipconfig getifaddr en0
```

---

## Step 3 — Configure the app

Open `src/utils/remoteConfig.js` and update `SERVER_IP`:

```js
const SERVER_IP = '192.168.1.42'; // ← paste your laptop IP here
```

Save the file. You only need to do this once per venue (the IP may change between locations).

---

## Step 4 — Start the local server

```bash
node server.js
```

You should see output like:

```
╔══════════════════════════════════════════════════════╗
║        ConnectFBLA Remote Control Server             ║
╚══════════════════════════════════════════════════════╝

  Browser UI  →  http://192.168.1.42:3001
  Presentation→  http://192.168.1.42:3001/presentation-mode
  Status      →  http://192.168.1.42:3001/status

  Phone WS    →  ws://192.168.1.42:3001/phone
  Browser WS  →  ws://192.168.1.42:3001/

  Set SERVER_IP = "192.168.1.42" in remoteConfig.js

  Waiting for phone and browser to connect...
```

---

## Step 5 — Start the Expo app on the phone

```bash
npx expo start
```

Or for tunnel mode if on a restrictive network:

```bash
npx expo start --tunnel
```

Scan the QR code with the Expo Go app on your phone. The app will start and automatically connect to the server in the background (you'll see `[RemoteControl] Connected to server` in the Metro log).

---

## Step 6 — Open the browser mirror

On the **laptop browser**, navigate to:

```
http://192.168.1.42:3001
```

For the clean presentation view (no sidebar):

```
http://192.168.1.42:3001/presentation-mode
```

Or press **P** in the browser to toggle presentation mode, and **F11** for fullscreen.

---

## Step 7 — Verify the connection

The sidebar shows:
- **Server**: Connected (green)
- **Phone**: Live (green, pulsing)
- **FPS**: Should show ~3 fps once the phone is connected

You can also check `http://192.168.1.42:3001/status` for a JSON health report.

---

## Controls

| Action | Effect on phone |
|--------|----------------|
| Click in phone frame | Tap that location (tab bar → tab switch; top-left corner → back) |
| Drag left/right | Swipe (right = go back) |
| Mouse wheel scroll | Scroll the current screen |
| Quick Navigate buttons | Instantly jump to any tab |
| Back button | Go back one screen |

---

## Troubleshooting

### Phone shows "Waiting for phone" in the browser

- Confirm `SERVER_IP` in `remoteConfig.js` matches the IP shown by `node server.js`.
- Confirm both laptop and phone are on the **same WiFi SSID**.
- Check that Windows Firewall isn't blocking port 3001:
  ```
  netsh advfirewall firewall add rule name="ConnectFBLA Remote" dir=in action=allow protocol=TCP localport=3001
  ```

### Server says "Cannot find module 'express'"

You skipped Step 1. Run `npm install`.

### Screenshots are slow or choppy

- Move closer to the WiFi router.
- Reduce JPEG quality in `remoteConfig.js`: lower `SCREENSHOT_INTERVAL_MS` to 400–500 if needed.
- Close other bandwidth-heavy apps on the laptop.

### "captureRef: view not found" error in Metro log

Make sure the phone is past the loading/onboarding screen and showing actual app content. The capture fails on screens that aren't fully mounted yet.

### Conference venue doesn't allow personal devices on their WiFi

Use your phone's **Personal Hotspot**:
1. Enable hotspot on phone.
2. Connect the laptop to that hotspot.
3. Run `ipconfig` on the laptop to get the new IP.
4. Update `SERVER_IP` and restart.

---

## Presentation-day checklist

- [ ] `SERVER_IP` updated in `remoteConfig.js`
- [ ] `npm install` completed
- [ ] `node server.js` running in a terminal (keep terminal open)
- [ ] Expo app open on phone, Metro log shows "Connected to server"
- [ ] Browser open at `/presentation-mode`
- [ ] Phone and browser both show green status
- [ ] Tested: tap on tab bar switches tabs
- [ ] Tested: Quick Navigate buttons work
- [ ] F11 fullscreen toggled — phone frame fills screen cleanly
