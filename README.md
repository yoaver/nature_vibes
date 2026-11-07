# Nature Vibes

A dependency-free Node.js site with daytime and nighttime beach and jungle environments. The beach and jungle river use Canvas; the jungle backdrop is HTML/CSS artwork. No images, API keys, or external services are needed at runtime.

## Start

Requires Node.js 20 or newer. No installation or build step needed.

```sh
npm run start
```

Open **http://localhost:3000**. Set the `PORT` environment variable for another port.

On Windows, if PowerShell blocks `npm.ps1`, use `npm.cmd run start` or run the command in Command Prompt.

## Controls

- The side bar switches between **Beach** and **Jungle**, remembering your choice.
- **Daylight / Moonlight** switches scenes and remembers your choice.
- **Pause** freezes the waves. Reduced-motion preferences pause animation by default.
- The weather buttons select **clear**, **cloudy**, or **rainy** skies in either scene and remember your choice.
- A distant lighthouse sweeps its beam over the ocean, with islands along the horizon.
- At night, click either armadillo bush's eyes to watch its resident explore and return.
- Three bat colonies (14, 18, and 22 Seba's short-tailed bats) fly between their roosts when clicked. Three daytime macaw groups have 5, 6, and 8 birds.
- Baby capybaras play when clicked; resting caimans briefly wake. Capybaras sleep in two family groups at night.
- Rain shelters butterflies and monkeys and quiets ambient flights. Pause freezes wildlife interactions too.

## Make it yours

- `public/app.js`: edit the `scenes` palettes and the canvas renderer.
- `public/jungle.js`: edit the jungle trees, river and banks, foliage, and fireflies.
- `public/jungle-wildlife.js`: bats, bank animals, roosts, and flight paths.
- `public/bat-models.js`: active Seba's bat artwork and the preserved flying-fox model for future reuse.
- `public/jungle-birds.js`: macaws, butterflies, canopy perches, and weather behavior.
- `public/jungle-monkeys.js`: both monkey troops and their branch routes.
- `public/jungle.css`: jungle backdrop shapes, colors, and swaying animations.
- `public/style.css`: change the interface and responsive layout.
- `public/index.html`: edit the text or remove the interface for a background-only page.
- `server.js`: minimal Node static server.

Saving a file in `public/` automatically reloads open browser tabs. Node also restarts when `server.js` changes. The site works offline once served locally.

Run `npm run check` to check JavaScript syntax.

Browser preview captures from `scripts/capture-preview.mjs` are saved under `screenshots/`.

## CSS technique references

The jungle artwork is original code, informed by these examples:

- [Goa — Beach CSS HTML](https://codepen.io/shailkr/pen/bGoOoaQ): curved CSS leaves and subtle shading.
- [Pure CSS landscape](https://codepen.io/armanb/pen/powMMvz): layered scenery and palette variables.
- [Isabelle's Day Off](https://codepen.io/acupoftee/pen/gOaoWmX): CSS palm construction and leaf movement.
