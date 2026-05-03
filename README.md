# Polecat Icons

A lightweight SVG icon library using the JS-injection pattern. Drop an `<i>` element with a class on it; the script swaps it for an inline `<svg>` that scales with font size and inherits colour from CSS.

---

## Using icons in a web page

Add the stylesheet and script via jsDelivr — no npm, no build step required on the consuming side:

```html
<link rel="stylesheet"
  href="https://cdn.jsdelivr.net/gh/richardtguy/polecat-icons@v0.0.1/dist/icons.css">

<script
  src="https://cdn.jsdelivr.net/gh/richardtguy/polecat-icons@v0.0.1/dist/icons.js"></script>
```

Then place an `<i>` element with the class `pi-{name}` wherever you want an icon:

```html
<i class="pi-polecat"></i>
```

The script runs automatically on page load and replaces each `<i>` with an inline `<svg>`.

### Colour

Icons inherit the CSS `color` property of their parent — no extra work needed:

```html
<span style="color: tomato"><i class="pi-polecat"></i> liked</span>

<!-- Works inside buttons, alerts, nav links — anywhere colour is set via CSS -->
<button style="color: white; background: #c0392b">
  <i class="mi-polecat"></i> Delete
</button>
```

### Size

Icons scale with `font-size`. Use the built-in size modifier classes, or set `font-size` directly:

| Class    | Size          |
|----------|---------------|
| `pi-xs`  | 0.625rem (10px) |
| `pi-sm`  | 0.875rem (14px) |
| *(none)* | inherits from context |
| `pi-lg`  | 1.25rem (20px) |
| `pi-xl`  | 1.5rem (24px)  |
| `pi-2x`  | 2rem (32px)    |
| `pi-3x`  | 3rem (48px)    |
| `pi-4x`  | 4rem (64px)    |

```html
<i class="pi-polecat mi-sm"></i>
```

---

## Available icons

| Name | Class |
|------|-------|
| Polecat | `pi-polecat` |

---

## Adding new icons

### 1. Get or draw an SVG

Any 24×24 SVG works. Icons from [Feather](https://feathericons.com), [Heroicons](https://heroicons.com), or your own designs are all fine.

### 2. Make the paths use `currentColor`

For the icon to inherit colour from CSS, its paths must use `currentColor` rather than a hardcoded hex value. Open the SVG in a text editor and replace any `fill="#000000"` or `stroke="#1a1a1a"` (etc.) with `fill="currentColor"` or `stroke="currentColor"`. Leave `fill="none"` entries alone.

The build script does this automatically for any remaining hardcoded values, but it's good practice to do it explicitly.

A typical source SVG looks like this:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
     fill="none" stroke="currentColor" stroke-width="2"
     stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="10"/>
  <line x1="12" y1="8" x2="12" y2="12"/>
  <line x1="12" y1="16" x2="12.01" y2="16"/>
</svg>
```

### 3. Save it to `src/`

Name the file after the icon, using lowercase and hyphens:

```
src/alert-circle.svg
src/thumbs-up.svg
src/chevron-down.svg
```

The filename becomes the class name: `src/alert-circle.svg` → `<i class="mi-alert-circle">`.

---

## Building the distribution files

### Prerequisites

Node.js (any recent version). No npm packages are required.

### Run the build

```bash
node build.js
```

This reads every `.svg` file in `src/`, processes it, and writes two files:

- `dist/icons.js` — the JS bundle containing all icons and the injection script
- `dist/icons.css` — base styles and modifier classes

### What the build script does to each SVG

- Strips `width` and `height` from the `<svg>` tag (size is controlled by CSS)
- Replaces hardcoded `fill`/`stroke` colour values with `currentColor`
- Collapses whitespace to reduce bundle size

### Releasing a new version

Commit and push your changes, then tag the release:

```bash
git add src/my-new-icon.svg dist/icons.js dist/icons.css
git commit -m "Add my-new-icon; rebuild dist"
git tag v1.1.0
git push && git push --tags
```

Update the jsDelivr URLs in any pages that should pick up the new version.

---

## Hosting via jsDelivr

jsDelivr serves files from public GitHub repos with correct `Content-Type` headers (GitHub's raw URLs don't, which prevents browsers from executing JS or applying CSS).

URL pattern:

```
https://cdn.jsdelivr.net/gh/{username}/{repo}@{ref}/{path}
```

- `{ref}` can be a tag (`v1.0.0`), branch (`main`), or commit SHA
- Pinning to a tag is recommended — using `@main` means any push could affect live pages

jsDelivr caches files aggressively. If you push a change to a branch reference, you may need to [purge the cache](https://www.jsdelivr.com/tools/purge) before the new version is served.

---

## Project structure

```
myicons/
  src/           ← SVG sources — add new icons here
  dist/
    icons.js     ← generated — do not edit directly
    icons.css    ← generated — do not edit directly
  build.js       ← build script
  demo.html      ← open in a browser to preview all icons
  README.md
```