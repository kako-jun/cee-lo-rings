# Phina.js to Phaser 3 Complete Mapping Guide

This document maps all Phina.js features used in the original Tin! Tilo! Rings! to their Phaser 3 equivalents for accurate porting.

## Core Framework Differences

### Scene/Display Object

| Phina.js | Phaser 3 | Notes |
|----------|----------|-------|
| `phina.display.DisplayScene` | `Phaser.Scene` | Main scene class |
| `this.backgroundColor = "#732121"` | `this.cameras.main.setBackgroundColor("#732121")` | Background color |
| `sprite.addChildTo(this)` | `this.add.existing(sprite)` | Add to scene |
| `sprite.remove()` | `sprite.destroy()` | Remove sprite |

### Sprite Creation

| Phina.js | Phaser 3 | Notes |
|----------|----------|-------|
| `Sprite(image, width, height)` | `this.add.image(x, y, key)` | Basic sprite |
| `sprite.setPosition(x, y)` | `sprite.setPosition(x, y)` | Same |
| `sprite.x`, `sprite.y` | `sprite.x`, `sprite.y` | Same |
| `sprite.width`, `sprite.height` | `sprite.displayWidth`, `sprite.displayHeight` | Display size |
| `sprite.alpha` | `sprite.alpha` | Same |
| `sprite.rotation` | `sprite.rotation` (radians) | Same |
| `sprite.scaleX`, `sprite.scaleY` | `sprite.scaleX`, `sprite.scaleY` | Same |
| `sprite.setImage(key)` | `sprite.setTexture(key)` | Change texture |
| `sprite.setOrigin(0.5, 0.5)` | `sprite.setOrigin(0.5, 0.5)` | Same |

### Tweening/Animation

| Phina.js | Phaser 3 | Notes |
|----------|----------|-------|
| `Tweener()` | `this.tweens.add({...})` | Tween creation |
| `.to({ x: 100 }, 1000)` | `this.tweens.add({ targets: sprite, x: 100, duration: 1000 })` | Tween to value |
| `.by({ x: 100 }, 1000)` | `this.tweens.add({ targets: sprite, x: '+=100', duration: 1000 })` | Tween by value |
| `.fadeIn(duration)` | `alpha: { from: 0, to: 1 }` | Fade in |
| `.fadeOut(duration)` | `alpha: { from: 1, to: 0 }` | Fade out |
| `.fade(alpha, duration)` | `alpha: alpha` | Fade to alpha |
| `.wait(duration)` | `delay: duration` | Wait before tween |
| `.setLoop(true)` | `repeat: -1` | Loop forever |
| `.play()` | Auto-starts | Phaser tweens auto-start |
| `sprite.attach(tweener)` | Tweens are independent | Different architecture |

### Easing Functions Mapping

| Phina.js | Phaser 3 | Notes |
|----------|----------|-------|
| `"easeOutExpo"` | `"Expo.easeOut"` | Exponential ease out |
| `"easeInOutQuad"` | `"Quad.easeInOut"` | Quadratic ease in/out |
| `"easeInOutBack"` | `"Back.easeInOut"` | Back ease in/out |
| `"easeInOutElastic"` | `"Elastic.easeInOut"` | Elastic ease in/out |
| `"easeInOutSine"` | `"Sine.easeInOut"` | Sine ease in/out |

### Timeline for Multiple Tweens

| Phina.js | Phaser 3 | Notes |
|----------|----------|-------|
| Multiple `.attach()` calls | Multiple `this.tweens.add()` | Run in parallel |
| Chained tweens | `this.tweens.timeline()` | Sequential tweens |

## Sprite Classes to Implement

### 1. RingSprites
**Original:** Lines 1024-1197 in sprites.js
**Key Methods:**
- `redraw(ns, color)` - Update ring numbers and color
- `rotate(speed)` - Continuous vertical scrolling
- `brake(speed, callback)` - Snap to 42px grid with easeOutExpo
- `stop(is_zone)` - Capture visible numbers (eyes)
- `transform(sprite)` - Perspective effect (alpha, x, width based on Y)
- `calcRingPattern()` - Determine perspective ratios

**Phaser 3 Implementation:**
```javascript
class RingSprites {
  constructor(scene, x, y, position) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.sprites = [];
    // Create 40 sprites for infinite scroll
    for (let i = 0; i < 40; i++) {
      const sprite = scene.add.image(x, y, 'white_n_0');
      this.sprites.push(sprite);
    }
  }

  rotate(speed) {
    this.sprites.forEach((sprite, i) => {
      sprite.y -= speed;
      // Wrap around logic
      const initialY = this.getInitialY(i);
      if (sprite.y <= initialY - 42 * 10) {
        sprite.y = initialY;
      }
      this.transform(sprite);
    });
  }

  brake(speed, callback) {
    let maxDuration = 0;
    this.sprites.forEach(sprite => {
      const initialY = this.getInitialY(i);
      const dy = sprite.y - initialY;
      const dn = Math.floor(dy / 42);
      const destY = initialY + 42 * dn;
      const destDy = destY - sprite.y;
      const duration = 10 * Math.abs(destDy);
      maxDuration = Math.max(maxDuration, duration);

      this.scene.tweens.add({
        targets: sprite,
        y: destY,
        duration: duration,
        ease: 'Expo.easeOut',
        onUpdate: () => this.transform(sprite)
      });
    });

    if (callback) {
      this.scene.time.delayedCall(maxDuration, callback);
    }
  }

  transform(sprite) {
    // Perspective effect implementation
    if (sprite.y >= -40 && sprite.y <= 200) {
      const delta = (sprite.y + 40) / 240;
      sprite.alpha = delta * this.basicAlpha;
      sprite.x = this.x + (1 - delta) * (1 - delta) * 100 * xRatio;
      sprite.displayWidth = 42 * widthRatio - (42 * widthRatio - 42) * delta;
    } else if (sprite.y >= 700 && sprite.y <= 1000) {
      const delta = (300 - (1000 - sprite.y)) / 300;
      sprite.alpha = (1 - delta) * this.basicAlpha;
      sprite.x = this.x + delta * delta * 100 * xRatio;
      sprite.displayWidth = 42 + (42 * widthRatio - 42) * delta;
    } else {
      sprite.alpha = this.basicAlpha;
      sprite.x = this.x;
      sprite.displayWidth = 42;
    }
  }
}
```

### 2. BackgroundSprites
**Original:** Lines 560-602 in sprites.js
**Three concurrent animations:**
1. Rotation: -60° → +30° → +90° → 0° (240s total)
2. Scale: 1.0x → 1.5x → 1.0x (120s total)
3. Position: Square pattern 50px (40s total)

**Phaser 3 Implementation:**
```javascript
class BackgroundSprites {
  constructor(scene) {
    this.scene = scene;
    const bgIndex = Math.floor(Math.random() * 37) + 1;
    this.sprite = scene.add.image(320, 480, `bg_${bgIndex}`);
    this.sprite.setAlpha(0.3);
    this.startAnime();
  }

  startAnime() {
    // Animation 1: Rotation
    this.scene.tweens.add({
      targets: this.sprite,
      rotation: { from: 0, to: Phaser.Math.DegToRad(-60) },
      duration: 80000,
      ease: 'Quad.easeInOut',
      yoyo: false,
      onComplete: () => {
        this.scene.tweens.add({
          targets: this.sprite,
          rotation: { from: Phaser.Math.DegToRad(-60), to: Phaser.Math.DegToRad(30) },
          duration: 80000,
          ease: 'Quad.easeInOut',
          // Continue chain...
        });
      }
    });

    // Animation 2: Scale
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: { from: 1, to: 1.5 },
      scaleY: { from: 1, to: 1.5 },
      duration: 40000,
      ease: 'Quad.easeInOut',
      yoyo: true,
      repeat: -1
    });

    // Animation 3: Position
    this.scene.tweens.add({
      targets: this.sprite,
      x: { from: 320, to: 270 },
      duration: 10000,
      ease: 'Quad.easeInOut',
      // Continue chain...
    });
  }
}
```

### 3. KanjiSprites
**Original:** Lines 604-681 in sprites.js
**Four concurrent animations:**
1. Rotation: 360° bounce cycles
2. Scale: 2x → 3x pulsing
3. Position: 12-step complex path
4. Opacity: Fade with image change

**Phaser 3 Implementation:**
```javascript
class KanjiSprites {
  constructor(scene) {
    this.scene = scene;
    this.currentIndex = Math.floor(Math.random() * 35) + 1;
    this.sprite = scene.add.image(320, 480, `kanji_${this.currentIndex}`);
    this.sprite.setAlpha(0.2);
    this.startAnime();
  }

  change() {
    this.currentIndex = Math.floor(Math.random() * 35) + 1;
    this.sprite.setTexture(`kanji_${this.currentIndex}`);
  }

  startAnime() {
    // Four parallel animations like BackgroundSprites
    // Animation 4 includes callback to change()
  }
}
```

### 4. MonSprites
**Original:** Lines 683-760 in sprites.js
Similar to KanjiSprites but with elastic easing

### 5. ScoresSprites
**Original:** Lines 1573-1679 in sprites.js
**Staggered reveal timing:**
- Me rolls: 0ms
- Kabu rolls: 500ms delay
- Multi rolls: 1000ms delay

### 6. CurrentScoreSprites
**Original:** Lines 1809-1956 in sprites.js
**Sequential fade animations:**
1. Me score: 0ms → fade in → 500ms wait → fade out
2. Kabu score: 500ms delay → fade in → 500ms wait → fade out
3. Multi score: 1000ms delay → fade in
4. Combo: 1500ms delay → fade in

### 7. ModsSprites
**Original:** Lines 2024-2148 in sprites.js
Display mod values at three positions with alphabet indicators

### 8. AlphabetsSprites
**Original:** Lines 2150-2263 in sprites.js
Show line indicators (a-k) with values

## Audio System

| Phina.js | Phaser 3 | Notes |
|----------|----------|-------|
| Custom loop system | `this.sound.add(key, { loop: true })` | Built-in looping |
| `Audio.playBGM(id)` | `this.sound.play(key, { loop: true })` | Play BGM |
| `Audio.playSound(id)` | `this.sound.play(key)` | Play sound effect |
| `audio.volume = 0.2` | `this.sound.setVolume(0.2)` | Set volume |
| `Audio.changeBGMVolume(0.1)` | `bgm.setVolume(0.1)` | Change volume |

## Input System

| Phina.js | Phaser 3 | Notes |
|----------|----------|-------|
| `app.keyboard.getKey("space")` | `this.input.keyboard.on('keydown-SPACE')` | Space key |
| `sprite.onclick = () => {}` | `sprite.setInteractive(); sprite.on('pointerdown')` | Click event |
| `sprite.onpointover` | `sprite.on('pointerover')` | Hover event |
| `sprite.onpointout` | `sprite.on('pointerout')` | Leave event |

## Timer/Delay System

| Phina.js | Phaser 3 | Notes |
|----------|----------|-------|
| `setTimeout(fn, ms)` | `this.time.delayedCall(ms, fn)` | Prefer Phaser timer |
| `app.deltaTime` | `delta` (in update) | Frame delta time |

## Critical Implementation Requirements

### 1. Ring Stop Precision
- **Must** use 42-pixel grid system
- **Must** use `Math.floor(dy / 42)` for snap calculation
- **Must** use `Expo.easeOut` easing
- **Must** calculate duration as `10 * Math.abs(destDy)` milliseconds

### 2. Perspective Transform
- **Must** update sprite properties in this exact order:
  1. Calculate delta based on Y position
  2. Set alpha
  3. Set x position (with quadratic curve)
  4. Set displayWidth (with scaling)

### 3. Animation Timing
- **Must** maintain exact timing sequences from original:
  - Ready voices: 500ms → 700ms → 700ms → 700ms
  - Score reveals: 0ms (me) → 500ms (kabu) → 1000ms (multi) → 1500ms (combo)
  - Sound effects synchronized with each reveal

### 4. Multi-Tween Sprites
- **Must** run multiple tweens in parallel (rotation + scale + position + opacity)
- **Must** use independent tween chains, not timeline
- **Must** set correct loop modes (repeat: -1 for infinite)

### 5. Asset Loading
All assets from original must be loaded:
- 37 background images (bg_1 to bg_37)
- 35 kanji images (kanji_1 to kanji_35)
- 14 mon images (mon_1 to mon_14)
- All ring colors (white, yellow, pink, gray) × 10 digits
- All score images (roll names, odds, digits)
- All guide images (reach, mod, alphabets)
- All effect images
- All sound effects and BGM tracks

## Next Steps for Complete Port

1. ✅ Create this mapping document
2. ⏸️ Implement all sprite classes with exact animations
3. ⏸️ Fix ring brake() method for precise stopping
4. ⏸️ Add all missing UI elements
5. ⏸️ Implement complete audio system
6. ⏸️ Add all decorative animations
7. ⏸️ Test and debug all features
