# Changelog

All notable changes to this project will be documented in this file.

Releases are managed by [semantic-release](https://github.com/semantic-release/semantic-release) using the [conventionalcommits](https://www.conventionalcommits.org) preset; new entries are auto-generated from commit messages.

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
