#!/usr/bin/env node
/**
 * myicons build script
 * Reads all SVGs from ./src, bundles them into ./dist/icons.js and ./dist/icons.css
 *
 * Usage: node build.js
 */

const fs   = require('fs');
const path = require('path');

const SRC_DIR  = path.join(__dirname, 'src');
const DIST_DIR = path.join(__dirname, 'dist');
const PREFIX   = 'pi'; // class prefix — icons are used as <i class="mi-star">

// ─── Helpers ────────────────────────────────────────────────────────────────

function cleanSvg(raw) {
  let svg = raw.trim();

  // Remove XML declaration if present
  svg = svg.replace(/<\?xml[^?]*\?>/g, '').trim();

  // Strip width / height from the <svg> opening tag only (not from e.g. stroke-width)
  svg = svg.replace(/(<svg\b[^>]*?)\s+width="[^"]*"/g, '$1');
  svg = svg.replace(/(<svg\b[^>]*?)\s+height="[^"]*"/g, '$1');

  // Ensure fill/stroke colours are currentColor so they inherit from CSS
  // Only replace concrete colour values — leave "none" alone
  svg = svg.replace(/fill="(?!none|currentColor)[^"]+"/g, 'fill="currentColor"');
  svg = svg.replace(/stroke="(?!none|currentColor)[^"]+"/g, 'stroke="currentColor"');

  // Collapse whitespace between tags for a smaller bundle
  svg = svg.replace(/>\s+</g, '><').replace(/\s{2,}/g, ' ');

  return svg;
}

// ─── Read SVGs ──────────────────────────────────────────────────────────────

if (!fs.existsSync(DIST_DIR)) fs.mkdirSync(DIST_DIR, { recursive: true });

const files = fs.readdirSync(SRC_DIR).filter(f => f.endsWith('.svg')).sort();

if (files.length === 0) {
  console.error('No SVG files found in ./src');
  process.exit(1);
}

const icons = {};
for (const file of files) {
  const name = path.basename(file, '.svg');
  const raw  = fs.readFileSync(path.join(SRC_DIR, file), 'utf8');
  icons[name] = cleanSvg(raw);
}

console.log(`Found ${files.length} icons: ${Object.keys(icons).join(', ')}`);

// ─── Generate icons.js ──────────────────────────────────────────────────────

const js = `/**
 * myicons ${new Date().toISOString().slice(0, 10)}
 * Auto-generated — do not edit directly. Run: node build.js
 *
 * Usage:
 *   <link rel="stylesheet" href="icons.css">
 *   <script src="icons.js"></script>
 *   <i class="${PREFIX}-star"></i>
 */
(function (global) {
  'use strict';

  // Icon data — keyed by icon name
  var ICONS = ${JSON.stringify(icons, null, 2)};

  var PREFIX = '${PREFIX}-';

  /**
   * Replace a single <i> element with an inline <svg>.
   * Copies all classes and inline styles across.
   */
  function replaceElement(el) {
    var cls = Array.prototype.slice.call(el.classList);
    var iconClass = cls.find(function (c) { return c.indexOf(PREFIX) === 0; });
    if (!iconClass) return;

    var name = iconClass.slice(PREFIX.length);
    var svgSource = ICONS[name];
    if (!svgSource) {
      console.warn('[myicons] Unknown icon: "' + name + '"');
      return;
    }

    // Parse the SVG string into a real DOM element
    var tmp = document.createElement('span');
    tmp.innerHTML = svgSource;
    var svg = tmp.firstElementChild;
    if (!svg) return;

    // Transfer classes (so size modifiers like mi-lg still work on the svg)
    cls.forEach(function (c) { svg.classList.add(c); });

    // Transfer inline styles
    if (el.style.cssText) svg.style.cssText = el.style.cssText;

    // Accessibility: treat as decorative unless the <i> has a title or aria-label
    if (!el.getAttribute('aria-label') && !el.getAttribute('title')) {
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('focusable', 'false');
    }

    el.parentNode.replaceChild(svg, el);
  }

  /**
   * Replace all matching <i> elements in a given root element.
   * Defaults to document.body.
   */
  function replace(root) {
    root = root || document.body;
    var els = Array.prototype.slice.call(
      root.querySelectorAll('i[class*="${PREFIX}"]')
    );
    els.forEach(replaceElement);
  }

  /**
   * Public API
   */
  var myicons = {
    icons:   ICONS,
    replace: replace,

    /** Add a custom icon at runtime and re-run replace() */
    add: function (name, svgString) {
      ICONS[name] = svgString;
    }
  };

  // Auto-replace on DOMContentLoaded
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { replace(); });
    } else {
      replace();
    }
  }

  // Expose globally and as CommonJS / AMD module
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = myicons;
  } else if (typeof define === 'function' && define.amd) {
    define(function () { return myicons; });
  } else {
    global.myicons = myicons;
  }

}(typeof window !== 'undefined' ? window : this));
`;

fs.writeFileSync(path.join(DIST_DIR, 'icons.js'), js);
console.log('✓ dist/icons.js written');

// ─── Generate icons.css ─────────────────────────────────────────────────────

const css = `/**
 * myicons stylesheet
 * Auto-generated — do not edit directly. Run: node build.js
 */

/* Base — icons render as 1em squares, aligned to the text baseline */
i[class*="${PREFIX}-"],
svg[class*="${PREFIX}-"] {
  display: inline-block;
  width: 1em;
  height: 1em;
  vertical-align: -0.125em;  /* optical baseline correction */
  overflow: hidden;
  flex-shrink: 0;             /* prevents collapse inside flex containers */
}

/* The injected <svg> inherits its size from font-size, and its colour
   from 'color' via currentColor in fill/stroke attributes. */
svg[class*="${PREFIX}-"] {
  display: inline-block;
  width: 1em;
  height: 1em;
}

/* ── Size modifiers ─────────────────────────────────────── */
.${PREFIX}-xs  { font-size: 0.625rem;  }   /* 10px @ 16px base */
.${PREFIX}-sm  { font-size: 0.875rem;  }   /* 14px */
                                            /* default = 1em (inherits) */
.${PREFIX}-lg  { font-size: 1.25rem;   }   /* 20px */
.${PREFIX}-xl  { font-size: 1.5rem;    }   /* 24px */
.${PREFIX}-2x  { font-size: 2rem;      }   /* 32px */
.${PREFIX}-3x  { font-size: 3rem;      }   /* 48px */
.${PREFIX}-4x  { font-size: 4rem;      }   /* 64px */

/* ── Utility modifiers ──────────────────────────────────── */
.${PREFIX}-fw {                            /* fixed-width, useful in nav lists */
  width: 1.25em;
  text-align: center;
}
`;

fs.writeFileSync(path.join(DIST_DIR, 'icons.css'), css);
console.log('✓ dist/icons.css written');
console.log('\nDone! Serve dist/icons.js and dist/icons.css from your web app.');
