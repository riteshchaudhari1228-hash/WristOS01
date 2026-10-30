# WristOS — Smartwatch Companion

A responsive smartwatch companion dashboard built with React, TypeScript and Vite. The starter includes **real browser Bluetooth LE discovery** and reads standard Battery Service and Heart Rate Service data when a connected device exposes them.

> Compatibility is device-dependent. Many consumer watches use proprietary protocols or require their manufacturer's companion app. This project does not fake sensor readings or claim unsupported controls are working.

## Features in this starter

- Responsive dashboard with dark/light appearance
- User-initiated Bluetooth LE device discovery
- Standard Bluetooth Battery Service (`battery_service`) reading
- Standard Bluetooth Heart Rate Service (`heart_rate`) notifications
- Connection and disconnection status
- Device/service capability reporting
- Honest placeholders for features requiring native Android or vendor SDK integration

## Requirements

- Node.js 20 or newer recommended
- Chrome or Edge with Web Bluetooth support
- Bluetooth enabled on the computer/phone
- HTTPS when hosted (localhost is allowed for local development)

Safari and Firefox do not currently provide the same Web Bluetooth support. iOS browser support is limited; a native iOS app would be needed for broad iPhone integration.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## Production build

```bash
npm run build
npm run preview
```

The production files are generated in `dist/`.

## Upload to GitHub

1. Create a new repository named `WristOS`.
2. Extract this ZIP file.
3. Upload the **contents** of the `WristOS` folder to the repository root (not the ZIP itself).
4. Commit the files.
5. For a live website, import the repository into Vercel and use:
   - Framework preset: Vite
   - Build command: `npm run build`
   - Output directory: `dist`

You can also use GitHub Pages. Since this Vite project uses a relative base path (`./`), build output can be hosted from `dist`. Configure a GitHub Actions Pages workflow if you want automatic deployments.

## Bluetooth notes

The browser prompts the user to select a device. The app requests optional access to:
- Battery Service (`0x180F`)
- Heart Rate Service (`0x180D`)
- Device Information (`0x180A`)

A device may appear in the picker but still not expose these services. In that case the app can connect but cannot read those measurements through this generic implementation.

### What is not implemented yet

These require a compatible device protocol, native phone permissions, or vendor SDK:
- Steps, sleep, SpO₂, stress and workout history
- Incoming call actions and phone notification mirroring
- Music/camera remote controls
- Find phone/watch, watch-face changes, alarms and firmware updates
- Reliable background connection while the browser is closed

Do not treat the browser dashboard as a replacement for a vendor companion app. To implement model-specific features, first identify the exact watch model and investigate its documented SDK/protocol.

## Privacy

This starter does not send Bluetooth readings to a server. The device name and live readings are held in the browser session. No account or cloud database is configured.

## Safety

Health readings are informational and are not medical advice. Do not use this app for diagnosis or emergency monitoring.
