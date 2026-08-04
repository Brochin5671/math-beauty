# Changelog

All notable changes to this project will be documented in this file.

Releases are managed by [semantic-release](https://github.com/semantic-release/semantic-release) using the [conventionalcommits](https://www.conventionalcommits.org) preset; new entries are auto-generated from commit messages.

## [2.4.1](https://github.com/Brochin5671/math-beauty/compare/v2.4.0...v2.4.1) (2026-08-04)

### Fixes

* **ci:** give the Playwright jobs room for a slow install ([24d693a](https://github.com/Brochin5671/math-beauty/commit/24d693ae7c54f3bbebad0f9cbb074e234d2864e1))

## [2.4.0](https://github.com/Brochin5671/math-beauty/compare/v2.3.4...v2.4.0) (2026-08-04)

### Features

* **ci:** scan dependencies on a schedule, not only on a pull request ([c066e9d](https://github.com/Brochin5671/math-beauty/commit/c066e9d20f792c3bc8ba4764e6a2b4c8bcacbddb))

## [2.3.4](https://github.com/Brochin5671/math-beauty/compare/v2.3.3...v2.3.4) (2026-08-04)

### Fixes

* **a11y:** give the light palette values that hold ([6a1889d](https://github.com/Brochin5671/math-beauty/commit/6a1889de6d9d2d5b36778c71e713acff4f5671a3)), closes [#9333ea](https://github.com/Brochin5671/math-beauty/issues/9333ea)
* **a11y:** keep a focused slide in view when the arrow keys scroll ([9508f8c](https://github.com/Brochin5671/math-beauty/commit/9508f8c59c8efbc2b6fdbcd0188d214c73f71037))
* **a11y:** narrow transition-all where it animates a focus indicator ([0e2f8f2](https://github.com/Brochin5671/math-beauty/commit/0e2f8f2ceffa672d8e5abd3067762f0d2a838ebb))
* **deps:** raise fast-uri and pin undici above their advisories ([bac1b89](https://github.com/Brochin5671/math-beauty/commit/bac1b89b99eb826e12834546b7066f91a654de73))

## [2.3.3](https://github.com/Brochin5671/math-beauty/compare/v2.3.2...v2.3.3) (2026-07-29)

### Fixes

* **a11y:** restore a focus indicator in forced-colors mode ([85a26bb](https://github.com/Brochin5671/math-beauty/commit/85a26bb22529519f97cc90232ea36cf94068ea6b))
* **a11y:** stop the browser restoring hidden inputs behind React ([3b010a0](https://github.com/Brochin5671/math-beauty/commit/3b010a0c9fbe9f77d1fd7d79039f7903dc4f28de))
* **build:** keep prose comments out of the shipped HTML ([30f6de2](https://github.com/Brochin5671/math-beauty/commit/30f6de2ebd5f7b9604a257f4d10cdb91b8c6cc4d))

## [2.3.2](https://github.com/Brochin5671/math-beauty/compare/v2.3.1...v2.3.2) (2026-07-27)

### Fixes

* **a11y:** drop a line-clamp that a flex row cannot honour ([1c310fd](https://github.com/Brochin5671/math-beauty/commit/1c310fd89b0beffbe7cdc807846d8ab61522a8cd))
* **a11y:** name the carousel region, overridable by the caller ([24c578a](https://github.com/Brochin5671/math-beauty/commit/24c578af0860dab4e16384907a5ef0011c7cd473))
* **a11y:** paint a focus indicator under forced colors ([d0a3837](https://github.com/Brochin5671/math-beauty/commit/d0a383768bf04bb29f7a7f5c2031f551664b1d17))
* **deps:** pin postcss past the source-map path traversal advisory ([7d57f8f](https://github.com/Brochin5671/math-beauty/commit/7d57f8fe3215fa9a1ddbdf0d3431864c69950662))
* **hooks:** key useIsMobile off the media query rather than innerWidth ([e21b6a9](https://github.com/Brochin5671/math-beauty/commit/e21b6a99c2d7cddb930c873bcd96f549b4e50384))
* **security:** apply the security headers to server-rendered responses ([8c25811](https://github.com/Brochin5671/math-beauty/commit/8c25811cfeeb00c636d77473831f61458a7af7dc))
* **seo:** check the URL scheme and derive the html lang from the locale ([7e733dd](https://github.com/Brochin5671/math-beauty/commit/7e733dd3f00e2db248b2a50fa0edb74439bda156))
* **seo:** link the generated favicons, manifest and theme-color ([4486e9e](https://github.com/Brochin5671/math-beauty/commit/4486e9eb22a43b65608721c88e0c7e98543f0f87))
* **tests:** stop waitForHydration skipping island-free pages ([0bf6d6e](https://github.com/Brochin5671/math-beauty/commit/0bf6d6ef270292055ef7f7da6b9862a1a26c14ab))

### Performance Improvements

* hydrate only the header island the viewport shows ([c76b0e9](https://github.com/Brochin5671/math-beauty/commit/c76b0e9a61d93e598cc3f0afd7efd29f1163cc95))

### Documentation

* **components:** describe state mirrors and CVA axes without naming a preview surface ([e52d54d](https://github.com/Brochin5671/math-beauty/commit/e52d54dd8dddbd64f78ca9e64d21c2c53ed6b84b))
* resolve the parameterization markers and describe this repo, not a template ([580a580](https://github.com/Brochin5671/math-beauty/commit/580a58069a551e4bb47cde67a997dae430cc0011))

## [2.3.1](https://github.com/Brochin5671/math-beauty/compare/v2.3.0...v2.3.1) (2026-07-24)

### Fixes

* a direct /404 or /500 hit renders the 404 page instead of an empty response ([e1a0b1e](https://github.com/Brochin5671/math-beauty/commit/e1a0b1e133f5217bc24e8df6359f5a055b956a97))
* **deploy:** stop provisioning an unused session kv namespace ([c88f49b](https://github.com/Brochin5671/math-beauty/commit/c88f49bea85440b5fbe27c4a5473376d599762d1))
* **deps:** bump astro, close dev advisories, prune dead deferrals ([214221f](https://github.com/Brochin5671/math-beauty/commit/214221f67842d3cc2a5fa48801dbe3b80d08868c))
* **library:** sync Slider numeric value and Grid as-prop ([5a7379e](https://github.com/Brochin5671/math-beauty/commit/5a7379ee874d1b4556f0e08ec0938f7b59c6250c))
* return real status and noindex on 404/500, gate direct access ([8a99c42](https://github.com/Brochin5671/math-beauty/commit/8a99c42535758fb3ed0f54cecc5fc67e4bc5652b))
* **security:** harden slugify and add CSP object-src ([eb0b8d8](https://github.com/Brochin5671/math-beauty/commit/eb0b8d8e972901e9f5ed5e2c244f11e0a3e51930))
* **seo:** escape JSON-LD output ([c914394](https://github.com/Brochin5671/math-beauty/commit/c91439474029d04a7278f5ce07486a807a9217bd))

## [2.3.0](https://github.com/Brochin5671/math-beauty/compare/v2.2.1...v2.3.0) (2026-07-20)

### Features

* **viewer:** match the canvas copy to the pointer in use ([8b73428](https://github.com/Brochin5671/math-beauty/commit/8b73428473834f9b5d8b4b9a9c512829c8e14af4))

## [2.2.1](https://github.com/Brochin5671/math-beauty/compare/v2.2.0...v2.2.1) (2026-07-20)

### Fixes

* **ci:** deploy from the push to main and nothing else ([4eae0ad](https://github.com/Brochin5671/math-beauty/commit/4eae0ad8be11875b894084fe2bf3540fe49a8497))

## [2.2.0](https://github.com/Brochin5671/math-beauty/compare/v2.1.3...v2.2.0) (2026-07-19)

### Features

* **viewer:** label the help button ([f6eedd1](https://github.com/Brochin5671/math-beauty/commit/f6eedd13d8a213ff9fe81c2d811c3dce9a5aa2b5))

### Fixes

* set an explicit initial viewport scale ([91d9619](https://github.com/Brochin5671/math-beauty/commit/91d9619cdaaa4623365356dff02c5daeb49f0a95))
* **viewer:** deliver pointer events to the island on iOS Safari ([caffa76](https://github.com/Brochin5671/math-beauty/commit/caffa768c5197bed266724a3fee2204ac08da7ee))
* **viewer:** drive canvas gestures from native pointer events ([1203be9](https://github.com/Brochin5671/math-beauty/commit/1203be93c504373a333e7232d472dc63aed7a7bb))

## [2.1.3](https://github.com/Brochin5671/math-beauty/compare/v2.1.2...v2.1.3) (2026-07-19)

### Fixes

* **ci:** deploy on a merged pull request as well as a push ([29d5411](https://github.com/Brochin5671/math-beauty/commit/29d54113b7b73fe1d859fd0e21910050baa0be6c))
* **library:** keep a minus key reachable on software keyboards ([35ab0bf](https://github.com/Brochin5671/math-beauty/commit/35ab0bf6d73379f76a6caed13a77dedb4449d67c))

## [2.1.2](https://github.com/Brochin5671/math-beauty/compare/v2.1.1...v2.1.2) (2026-07-19)

### Fixes

* **viewer:** give touch the slop a finger actually needs ([8b704c7](https://github.com/Brochin5671/math-beauty/commit/8b704c70347f4ad45528ee781395ebb946a6c537))

## [2.1.1](https://github.com/Brochin5671/math-beauty/compare/v2.1.0...v2.1.1) (2026-07-19)

### Fixes

* **viewer:** let the browser handle touch until the canvas can ([840c058](https://github.com/Brochin5671/math-beauty/commit/840c0584e37d790da6074088a3d4dd22b8a194a1))

### Performance Improvements

* **viewer:** load the control panel apart from the canvas ([d0ff763](https://github.com/Brochin5671/math-beauty/commit/d0ff7635de6e4b923347daa000c1efef48ccfbdd))

## [2.1.0](https://github.com/Brochin5671/math-beauty/compare/v2.0.2...v2.1.0) (2026-07-19)

### Features

* **library:** add NumberField with parent-controlled stepping ([d321eba](https://github.com/Brochin5671/math-beauty/commit/d321eba452e27237d8eaa018d795bbd25898cd10))
* **viewer:** add drag, wheel and pinch gestures to the canvas ([a52f805](https://github.com/Brochin5671/math-beauty/commit/a52f805a8f9c2a0b01755a79b3c34078d429fec1))
* **viewer:** default the color preset to Temperature ([37499fb](https://github.com/Brochin5671/math-beauty/commit/37499fbed83900456fcd39ccb30f09089788f7e8))
* **viewer:** format the equations and restructure the help dialog ([1005546](https://github.com/Brochin5671/math-beauty/commit/1005546c7cda7b945e415c74dad73cdcc0512859))

### Fixes

* **viewer:** anchor canvas zoom instead of a fixed pan factor ([02f4ca4](https://github.com/Brochin5671/math-beauty/commit/02f4ca4542711a508eff82ccdd693030ff7a9b00))
* **viewer:** guard the centre zoom the same way the anchored one is guarded ([933ff55](https://github.com/Brochin5671/math-beauty/commit/933ff5515be4aabe743ee59fda70a4684938178a))
* **viewer:** reject camera values that break the coordinate mapping ([2f4a33b](https://github.com/Brochin5671/math-beauty/commit/2f4a33bca210be91d7de921bc21697a0392a9c44))

### Documentation

* describe the library as this project's own and refresh the controls ([0bcd03c](https://github.com/Brochin5671/math-beauty/commit/0bcd03c8ab363c1a8a9182483d4672f9874b0d50))

### Changed

* **fractals:** add a camera module for anchored zoom and pan ([57938d3](https://github.com/Brochin5671/math-beauty/commit/57938d374037b44edfc721012c4236d5e3d98258))
* **viewer:** replace NumberStepper with NumberField ([fda7b21](https://github.com/Brochin5671/math-beauty/commit/fda7b217235fe986c4b2d9f993f7f8dc2cb0a63b))

## [2.0.2](https://github.com/Brochin5671/math-beauty/compare/v2.0.1...v2.0.2) (2026-07-19)

### Fixes

* prevent double-tap zoom and tap highlight on the mobile canvas ([6d221c7](https://github.com/Brochin5671/math-beauty/commit/6d221c79b79f747c30937611180ee1fed65d4657))

### Documentation

* update README ([aafd4ea](https://github.com/Brochin5671/math-beauty/commit/aafd4ea2118d07a3f7a0c474bbb9bdbe702f7993))

## [2.0.1](https://github.com/Brochin5671/math-beauty/compare/v2.0.0...v2.0.1) (2026-07-19)

### Fixes

* **seo:** use the fractal favicon as the social card image ([#8](https://github.com/Brochin5671/math-beauty/issues/8)) ([4677732](https://github.com/Brochin5671/math-beauty/commit/4677732c4c13e2304832bcd4495d8e56bff9ff2a))

## [2.0.0](https://github.com/Brochin5671/math-beauty/compare/v1.0.0...v2.0.0) (2026-07-19)

### ⚠ BREAKING CHANGES

* replaces the fly.io, Bootstrap and Express application with an Astro and Cloudflare Workers stack.

### Features

* modernize the fractal viewer onto Astro and Cloudflare Workers ([#4](https://github.com/Brochin5671/math-beauty/issues/4)) ([11ffad7](https://github.com/Brochin5671/math-beauty/commit/11ffad7301010325bb190f3989112348b2d2c57c))
