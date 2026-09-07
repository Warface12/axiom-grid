# TopPick app distribution

Working path today: installable PWA via `/apps` and `app/manifest.ts`.

## Available now
- Web app manifest (`/manifest.webmanifest`)
- Service worker (`/public/sw.js`) — network-first for pages; never caches `/api`, `/go`, `/admin`, or market-sensitive JSON
- Install hub at `/apps` with a real `beforeinstallprompt` button when the browser offers it
- iOS: Add to Home Screen instructions (Apple does not allow a silent PWA install button)

## Not available (do not show working download buttons)
- Signed Android APK / Play Store listing — needs a keystore, Play Console account, and a signed release
- Native iOS App Store build — needs an Apple Developer Program membership, signing, and App Store Connect
- Signed Windows installer / packaged desktop runtime — not published

Until those artifacts exist, `/apps` keeps native download controls disabled.

## Owner actions required for native apps
1. Android: create an upload keystore, store it outside git, configure Play App Signing.
2. iOS: enroll in the Apple Developer Program; do not host raw IPA files as a public install.
3. Windows: decide whether PWA remains the desktop path (recommended) before adding a large runtime.
