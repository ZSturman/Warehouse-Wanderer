# Warehouse Wanderer

An Android/iOS warehouse-visit passport with local visit tracking, wishlists and targeted UI tests.

**Status:** Independent, unofficial prototype with no retailer affiliation. Prior Android emulator flows passed; no physical Android acceptance is established. Native builds require a compatible JDK/Android SDK. Optional map features need your own API key.

[Project portfolio](https://zacharysturman.com/projects/warehouse-wanderer)

## Quick start

```sh
cd warehouse-wanderer
npm ci
```

## Usage

```sh
cd warehouse-wanderer
npm run web -- --port 4388
# Or build a local Android development app:
npm run android
```

## How it works

Expo/React Native screens use local persistence and warehouse data providers. Config plugins preserve native setup when Expo regenerates Android and iOS hosts.

## Testing

```sh
cd warehouse-wanderer
npm test -- --runInBand __tests__/AddVisitScreen.test.tsx __tests__/formatters.test.ts
npx tsc --noEmit
```

See [validation and next steps](docs/NEXT_STEPS.md) for the checks performed on this snapshot. Automated fixture tests do not establish physical-device compatibility.

## Configuration and privacy

This is a curated source snapshot, published November 12, 2026. Configure your own endpoints, credentials and signing identities. Private development history, local environment files, personal recordings, runtime databases, signing materials and deployment automation are excluded. Deployment and device installation are explicit operator actions.

## License and attribution

Existing licenses and third-party notices apply to the files they cover. Publication of this snapshot does not grant a new license to original material; no additional license is granted where none is supplied.
