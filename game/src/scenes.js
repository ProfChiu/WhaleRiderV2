// Whale Rider: Code Quest — Phase 1 scenes.
const W = 1280, H = 720, GROUND = 560;
const CARD_W = 104, CARD_H = 156;              // every card is the same size
const LIFT = 16;   // how far a card rises when picked up
const CARD_Y = GROUND - 8 - CARD_H / 2;                           // the dealt cards stand on the ground
const SLOT_W = 74, SLOT_H = 110, SLOT_GAP = 10;                   // drop targets: just big enough to aim at
const SLOT_X0 = 250, SLOT_Y = GROUND - 8 - SLOT_H / 2;            // answer slots stand beside the castle
const PLACED_S = (SLOT_W - 6) / CARD_W;                           // a card shrinks to sit in its slot
const BOARD = { x: 110, y: 50, w: 800, h: 322 };  // billboard behind the castle; its left edge hides behind the tower
const BOARD_TEXT_X = 250, CODE_X = 304, CODE_Y0 = 84, CODE_LH = 24;   // board content starts right of the tower
const LIGHT_OFF = 0x555c62;
const NURSE_X = 1210, NURSE_H = 210;
const TOWER_X = 20, TOWER_TOP = GROUND - 330;
const DOOR_X = TOWER_X + 52, DOOR_Y = TOWER_TOP + 152, DOOR_CX = TOWER_X + 100;
const MONO = 'Menlo, Consolas, "Courier New", monospace';
const SANS = '"Helvetica Neue", Arial, sans-serif';

function txt(scene, x, y, s, style) {
  return scene.add.text(x, y, s, Object.assign({ fontFamily: SANS, fontSize: '16px', color: '#ffffff', resolution: 2 }, style));
}

// ---------------- Sound: tiny Web Audio synth (no files) ----------------
const Sfx = {
  ctx: null,
  unlock() {
    try {
      if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (this.ctx.state === 'suspended') this.ctx.resume();
    } catch (e) { /* audio unavailable */ }
  },
  tone(freq, dur, type = 'triangle', vol = 0.15, when = 0, slideTo = null) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + when;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.ctx.destination);
    o.start(t); o.stop(t + dur + 0.05);
  },
  click() { this.tone(880, 0.08, 'square', 0.06); },
  land() { this.tone(180, 0.12, 'sine', 0.12, 0, 90); },
  flip() { this.tone(1200, 0.05, 'triangle', 0.05); },
  lock() { this.tone(660, 0.1, 'triangle', 0.1); this.tone(990, 0.15, 'triangle', 0.1, 0.08); },
  error() { this.tone(160, 0.35, 'sawtooth', 0.09, 0, 80); this.tone(150, 0.35, 'square', 0.04, 0.05, 75); },
  door() { this.tone(70, 0.9, 'triangle', 0.2, 0, 50); },
  whale() { this.tone(220, 0.8, 'sine', 0.06, 0, 330); this.tone(330, 0.6, 'sine', 0.04, 0.4, 200); },
  magic() { [880, 1175, 1397, 1760, 2093].forEach((f, i) => this.tone(f, 0.3, 'sine', 0.07, i * 0.07)); },
  jingle() {
    const n = [523, 659, 784, 1047, 784, 1047];
    const d = [0.12, 0.12, 0.12, 0.25, 0.12, 0.5];
    let t = 0;
    n.forEach((f, i) => { this.tone(f, d[i] + 0.1, 'triangle', 0.14, t); this.tone(f / 2, d[i] + 0.1, 'sine', 0.06, t); t += d[i]; });
    [523, 659, 784].forEach(f => this.tone(f, 0.9, 'sine', 0.06, t));
  },
};

// ---------------- Boot: textures + nurse art ----------------
class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }
  preload() {
    // Final art: game/art/*.png embedded by tools/build_art.py, plus the nurse. Anything missing is drawn in code.
    const imgs = Object.assign({}, window.ART_IMG || {}, window.NURSE_IMG || {});
    Object.keys(imgs).forEach(k => this.load.image(k, imgs[k]));
  }
  create() {
    window.buildTextures(this);
    // Fallback stick-nurse if an image is missing
    ['nurseStand', 'nurseWalk', 'nurseSpin', 'nurseBow'].forEach(k => {
      if (this.textures.exists(k)) return;
      const g = this.make.graphics({ add: false });
      g.fillStyle(0xffffff, 1); g.fillCircle(50, 40, 30);
      g.fillStyle(0xe6e9ec, 1); g.fillRect(25, 75, 50, 90);
      g.fillStyle(PAL.error, 1); g.fillRect(44, 95, 12, 30); g.fillRect(35, 104, 30, 12);
      g.generateTexture(k, 100, 220); g.destroy();
    });
    ['faceSmile', 'faceUpset', 'faceHappy', 'faceSmirk', 'faceSleepy'].forEach(k => {
      if (this.textures.exists(k)) return;
      const g = this.make.graphics({ add: false });
      g.fillStyle(0xffffff, 1); g.fillCircle(40, 40, 38); g.generateTexture(k, 80, 80); g.destroy();
    });
    this.scene.start('Title');
  }
}

// ---------------- Shared world drawing ----------------
function drawWorld(scene) {
  if (scene.textures.exists('background')) scene.add.image(0, 0, 'background').setOrigin(0).setDisplaySize(W, GROUND + 10).setDepth(0);
  else drawScenery(scene);
  if (scene.textures.exists('ground')) { scene.add.image(0, GROUND, 'ground').setOrigin(0).setDisplaySize(W, H - GROUND).setDepth(4); return; }
  const gr = scene.add.graphics().setDepth(4);
  gr.fillStyle(PAL.ground, 1); gr.fillRect(0, GROUND, W, H - GROUND);
  gr.fillStyle(PAL.groundDark, 1); gr.fillRect(0, GROUND, W, 6);
  gr.lineStyle(2, PAL.groundDark, 1);
  for (let i = 0; i < 70; i++) {
    const x = Phaser.Math.Between(0, W), y = Phaser.Math.Between(GROUND + 12, H - 6);
    gr.lineBetween(x, y, x - 4, y - 8); gr.lineBetween(x, y, x + 1, y - 10); gr.lineBetween(x, y, x + 5, y - 7);
  }
}
// Stand-in sky, hills and trees (replaced by game/art/background.png when it exists).
function drawScenery(scene) {
  const g = scene.add.graphics().setDepth(0);
  g.fillGradientStyle(PAL.sky1, PAL.sky1, PAL.sky2, PAL.sky2, 1);
  g.fillRect(0, 0, W, GROUND);
  for (let i = 0; i < 4; i++) {
    const c = scene.add.image(Phaser.Math.Between(0, W), Phaser.Math.Between(90, 230), 'cloud')
      .setDepth(1).setScale(Phaser.Math.FloatBetween(0.7, 1.4)).setAlpha(0.85);
    scene.tweens.add({ targets: c, x: c.x - 300, duration: Phaser.Math.Between(40000, 70000), yoyo: true, repeat: -1 });
  }
  const h = scene.add.graphics().setDepth(2);
  h.fillStyle(PAL.hillFar, 1);
  h.fillEllipse(250, GROUND + 40, 760, 260); h.fillEllipse(900, GROUND + 60, 900, 300);
  h.fillStyle(PAL.hillMid, 1);
  h.fillEllipse(620, GROUND + 50, 700, 170); h.fillEllipse(1220, GROUND + 40, 520, 200);
  const trees = [[300, 'pine', 0.7], [600, 'tree', 0.8], [560, 'pine', 0.55], [990, 'tree', 0.9],
    [1050, 'pine', 0.65], [1240, 'tree', 0.75], [430, 'tree', 0.6], [760, 'pine', 0.5]];
  trees.forEach(([x, k, s]) => scene.add.image(x, GROUND + 4, k).setOrigin(0.5, 1).setScale(s).setDepth(3).setAlpha(0.9));
}

// ---------------- Card ----------------
// Break code into lines of at most n characters, breaking at a space or before . or (.
// `hard` reports whether some word had to be cut in the middle.
function wrapCode(s, n) {
  const lines = []; let rest = s, hard = false;
  while (rest.length > n) {
    let cut = -1;
    for (let i = n; i > 0; i--) { const ch = rest[i]; if (ch === ' ' || ch === '.' || ch === '(') { cut = i; break; } }
    if (cut <= 0) { cut = n; hard = true; }
    lines.push(rest.slice(0, cut).trimEnd()); rest = rest.slice(cut).trimStart();
  }
  lines.push(rest);
  return { lines, hard };
}
// Every card is the same size. The code on it uses the biggest font that fits without cutting a word.
function fitCode(label) {
  for (const px of [30, 24, 19, 16, 14, 12, 11, 10]) {
    const n = Math.floor((CARD_W - 12) / (px * 0.61));
    const { lines, hard } = wrapCode(label, n);
    if (!hard && lines.length * px * 1.3 <= CARD_H - 44) return { px, text: lines.join('\n') };
  }
  return { px: 10, text: wrapCode(label, 11).lines.join('\n') };
}
class Card extends Phaser.GameObjects.Container {
  constructor(scene, x, y, def) {
    super(scene, x, y);
    this.def = def; this.slotIndex = null; this.locked = false; this.faceUp = false;
    const w = this.w = CARD_W, h = this.h = CARD_H;
    this.glow = scene.add.graphics();
    this.glow.fillStyle(PAL.accent, 0.6).fillRoundedRect(-w / 2 - 6, -h / 2 - 6, w + 12, h + 12, 13);
    this.glow.setVisible(false);
    this.back = scene.add.image(0, 0, 'cardBack').setDisplaySize(w, h);
    this.face = scene.add.container(0, 0);
    if (scene.textures.exists('cardFront')) {
      this.face.add(scene.add.image(0, 0, 'cardFront').setDisplaySize(w, h));      // final art
    } else {
      const f = scene.add.graphics();
      f.fillStyle(PAL.cardFace, 1).fillRoundedRect(-w / 2, -h / 2, w, h, 9);
      f.fillStyle(PAL.accent, 1).fillRoundedRect(-w / 2, -h / 2, w, 22, { tl: 9, tr: 9, bl: 0, br: 0 });
      f.lineStyle(3, PAL.accent, 1).strokeRoundedRect(-w / 2, -h / 2, w, h, 9);
      f.lineStyle(1, 0xc9ced2, 1).lineBetween(-w / 2 + 10, h / 2 - 16, w / 2 - 10, h / 2 - 16);
      this.face.add([f, txt(scene, 0, -h / 2 + 11, 'C#', { fontSize: '11px', fontStyle: 'bold', color: '#12393a' }).setOrigin(0.5)]);
    }
    const fit = fitCode(def.label);
    this.face.add(txt(scene, 0, 6, fit.text, { fontFamily: MONO, fontSize: fit.px + 'px', color: PAL.inkHex, fontStyle: 'bold', align: 'center', lineSpacing: 2 }).setOrigin(0.5));
    this.face.setVisible(false);
    this.check = txt(scene, w / 2 - 11, -h / 2 + 11, '✔', { fontSize: '14px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5).setVisible(false);
    this.add([this.glow, this.back, this.face, this.check]);
    this.setSize(w, h);
    scene.add.existing(this);
    this.setDepth(10);
  }
  showFace(up) { this.faceUp = up; this.back.setVisible(!up); this.face.setVisible(up); }
  flip(delay = 0) {
    return new Promise(res => {
      this.scene.tweens.add({
        targets: this, scaleX: 0, duration: 110, delay, ease: 'Sine.In',
        onComplete: () => {
          this.showFace(!this.faceUp); Sfx.flip();
          this.scene.tweens.add({ targets: this, scaleX: 1, duration: 110, ease: 'Sine.Out', onComplete: res });
        },
      });
    });
  }
  // Press = lift. The scene then moves the card (see LevelScene.press/update/release).
  enableInput(h) {
    this.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(0, 0, this.w, this.h),   // container hit areas are origin-relative (top-left)
      hitAreaCallback: Phaser.Geom.Rectangle.Contains, useHandCursor: true,
    });
    this.on('pointerover', () => { if (this.scene.canClick(this)) this.glow.setVisible(true); });
    this.on('pointerout', () => { if (!this.held && !this.hinted) this.glow.setVisible(false); });
    this.on('pointerdown', p => h.press(this, p));
  }
  setLifted(on, rest = 1) {
    if (!this.shadow) {
      this.shadow = this.scene.add.graphics();
      this.shadow.fillStyle(0x000000, 0.28).fillRoundedRect(-this.w / 2 + 6, -this.h / 2 + LIFT + 4, this.w, this.h, 9);
      this.addAt(this.shadow, 0);
    }
    this.held = on;
    this.shadow.setVisible(on);
    this.glow.setVisible(on);
    this.setDepth(on ? 20 : this.baseDepth || 10);
    this.scene.tweens.add({ targets: this, scale: on ? 1.08 : rest, angle: on ? -2 : 0, duration: 120, ease: 'Sine.Out' });
  }
  setHint(on) {
    this.hinted = on;
    if (this.hintTween) { this.hintTween.stop(); this.hintTween = null; }
    if (this.arrowTween) { this.arrowTween.stop(); this.arrowTween = null; }
    if (!this.arrow) {
      this.arrow = txt(this.scene, 0, -this.h / 2 - 24, '▼', { fontSize: '28px', color: PAL.accentHex, stroke: '#12393a', strokeThickness: 4 }).setOrigin(0.5);
      this.add(this.arrow);
    }
    this.arrow.setVisible(on).setY(-this.h / 2 - 24);
    this.glow.setAlpha(1).setVisible(on).setScale(on ? 1.06 : 1);
    if (on) {
      this.hintTween = this.scene.tweens.add({ targets: this.glow, alpha: 0.45, duration: 420, yoyo: true, repeat: -1 });
      this.arrowTween = this.scene.tweens.add({ targets: this.arrow, y: '-=12', duration: 380, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    }
  }
}

// Fly an object along an arc. Resolves when it lands.
function flyTo(scene, obj, x, y, dur = 600, arc = -120, extra = {}) {
  return new Promise(res => {
    const sx = obj.x, sy = obj.y;
    const cx = (sx + x) / 2, cy = Math.min(sy, y) + arc;
    scene.tweens.addCounter({
      from: 0, to: 1, duration: dur, ease: 'Sine.InOut',
      onUpdate: tw => {
        const t = tw.getValue(), u = 1 - t;
        obj.x = u * u * sx + 2 * u * t * cx + t * t * x;
        obj.y = u * u * sy + 2 * u * t * cy + t * t * y;
        if (extra.onUpdate) extra.onUpdate(t);
      },
      onComplete: res,
    });
    if (extra.angle !== undefined) scene.tweens.add({ targets: obj, angle: extra.angle, duration: dur });
    if (extra.scale !== undefined) scene.tweens.add({ targets: obj, scale: extra.scale, duration: dur });
  });
}
const wait = (scene, ms) => new Promise(r => scene.time.delayedCall(ms, r));

// ---------------- Title ----------------
class TitleScene extends Phaser.Scene {
  constructor() { super('Title'); }
  create() {
    drawWorld(this);
    this.add.rectangle(W / 2, H / 2, W, H, PAL.ink, 0.55).setDepth(40);
    txt(this, W / 2, 250, 'WHALE RIDER', { fontSize: '64px', fontStyle: 'bold' }).setOrigin(0.5).setDepth(41);
    txt(this, W / 2, 320, 'CODE QUEST', { fontSize: '28px', color: PAL.accentHex, fontStyle: 'bold', letterSpacing: 8 }).setOrigin(0.5).setDepth(41);
    txt(this, W / 2, 380, 'Put the cards in the right order. Programs care about order.', { fontSize: '18px', color: '#c9ced2' }).setOrigin(0.5).setDepth(41);
    const b = txt(this, W / 2, 470, '▶  CLICK TO START', { fontSize: '22px', color: PAL.accentHex, fontStyle: 'bold' }).setOrigin(0.5).setDepth(41);
    this.tweens.add({ targets: b, alpha: 0.4, duration: 700, yoyo: true, repeat: -1 });
    // Version tag + link back to the version picker (bottom corners).
    const ver = window.APP_VERSION || 'dev';
    txt(this, W - 20, H - 18, ver === 'dev' ? 'LIVE BUILD (dev)' : 'VERSION ' + ver, { fontSize: '14px', color: '#9aa1a7' })
      .setOrigin(1, 1).setDepth(41);
    let back = null;
    if (window.APP_LAUNCHER) {
      back = txt(this, 20, H - 18, '◀  ALL VERSIONS', { fontSize: '14px', color: PAL.accentHex, fontStyle: 'bold' })
        .setOrigin(0, 1).setDepth(42).setInteractive({ useHandCursor: true });
      back.on('pointerdown', () => { window.location.href = window.APP_LAUNCHER; });
    }
    let started = false;
    this.input.on('pointerdown', (p, over) => {
      if (started || (back && over.includes(back))) return;   // the versions link handles itself
      started = true;
      Sfx.unlock(); Sfx.click();
      this.cameras.main.fadeOut(300, 43, 47, 51);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Level', { levelIndex: 0 }));
    });
  }
}

// ---------------- Level ----------------
// How each outcome kind looks on the castle.
const OUTCOME = {
  compile: { color: 0xe5484d, hex: '#e5484d', head: '✖ COMPILE ERROR' },
  order:   { color: 0xe5484d, hex: '#e5484d', head: "✖ WON'T COMPILE" },
  crash:   { color: 0xff8a3d, hex: '#ff8a3d', head: '✹ RUNTIME CRASH' },
  output:  { color: 0x7aa2ff, hex: '#7aa2ff', head: '≠ WRONG RESULT' },
  timeout: { color: 0xb18cff, hex: '#b18cff', head: '∞ TIMEOUT' },
};
const ORDER_FAIL = { kind: 'order', tag: 'check the order',
  msg: "The castle reads left to right, like the computer does. These pieces don't fit together in this order." };
const sameList = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

class LevelScene extends Phaser.Scene {
  constructor() { super('Level'); }
  init(data) {
    this.levelIndex = data.levelIndex || 0;
    this.L = window.LEVELS[this.levelIndex];
    this.nSlots = this.L.slots || 3;   // 3 or 4 slots; an answer may need fewer cards
    this.slots = new Array(this.nSlots).fill(null);
    this.cards = [];
    this.state = 'intro';
  }
  create() {
    this.cameras.main.fadeIn(350, 43, 47, 51);
    this.input.on('pointerdown', () => Sfx.unlock());
    drawWorld(this);
    this.buildCastle();
    this.buildSlots();
    this.buildHud();
    this.buildBillboard();
    this.held = null;
    this.input.on('pointermove', p => this.holdMove(p));
    this.input.on('pointerup', () => this.release());
    this.input.on('pointerupoutside', () => this.release());
    this.mistakes = 0;
    this.nurse = this.add.image(-500, -500, 'nurseStand').setOrigin(0.5, 1).setDepth(12);
    this.buildBubble();
    this.introSequence();
  }

  // ----- static pieces -----
  buildCastle() {
    this.add.image(TOWER_X, GROUND, 'tower').setOrigin(0, 1).setDepth(5);
    this.door = this.add.image(DOOR_X, DOOR_Y, 'door').setOrigin(0, 0).setDepth(6);
    const plateY = TOWER_TOP + 96, n = this.nSlots, step = n > 3 ? 30 : 36;
    this.add.rectangle(DOOR_CX, plateY, step * n + 14, 34, 0x3a3f44).setStrokeStyle(2, 0x2b2f33).setDepth(6);
    this.lights = [...Array(n).keys()].map(i =>
      this.add.circle(DOOR_CX + (i - (n - 1) / 2) * step, plateY, n > 3 ? 9 : 10, LIGHT_OFF).setStrokeStyle(2, 0x2b2f33).setDepth(7));
    this.doorTag = txt(this, DOOR_CX, TOWER_TOP + 58, '', { fontFamily: MONO, fontSize: '14px', fontStyle: 'bold',
      backgroundColor: PAL.errorHex, padding: { x: 6, y: 3 } }).setOrigin(0.5).setDepth(8).setVisible(false);
  }
  // Card-sized answer slots stand in a row beside the castle.
  buildSlots() {
    this.slotG = this.add.graphics().setDepth(7);
    this.slotImgs = [];
    this.slotGlow = [];
    this.badges = []; this.nums = [];
    this.slotX = [...Array(this.nSlots).keys()].map(i => SLOT_X0 + SLOT_W / 2 + i * (SLOT_W + SLOT_GAP));
    this.slotX.forEach((x, i) => {
      if (this.textures.exists('slot')) this.slotImgs.push(this.add.image(x, SLOT_Y, 'slot').setDisplaySize(SLOT_W, SLOT_H).setDepth(7));
      const glow = this.add.graphics().setDepth(7).setVisible(false);
      glow.lineStyle(4, PAL.accent, 1).strokeRoundedRect(x - SLOT_W / 2 - 6, SLOT_Y - SLOT_H / 2 - 6, SLOT_W + 12, SLOT_H + 12, 13);
      this.tweens.add({ targets: glow, alpha: 0.35, duration: 600, yoyo: true, repeat: -1 });
      this.slotGlow.push(glow);
      this.badges.push(this.add.circle(x, SLOT_Y - SLOT_H / 2 - 18, 14, 0x3a3f44).setDepth(7));
      this.nums.push(txt(this, x, SLOT_Y - SLOT_H / 2 - 18, String(i + 1), { fontSize: '15px', fontStyle: 'bold' }).setOrigin(0.5).setDepth(8));
    });
    this.slotParts = [this.slotG, ...this.slotImgs, ...this.badges, ...this.nums];
    this.layoutSlots();
  }
  // Redraw the slots and the code on the board after any change to what is in the slots.
  layoutSlots() {
    const g = this.slotG; g.clear();
    if (!this.slotImgs.length) this.slotX.forEach(x => {
      g.fillStyle(0x8c949a, 0.85).fillRoundedRect(x - SLOT_W / 2, SLOT_Y - SLOT_H / 2, SLOT_W, SLOT_H, 11);
      g.lineStyle(3, PAL.slot, 1).strokeRoundedRect(x - SLOT_W / 2, SLOT_Y - SLOT_H / 2, SLOT_W, SLOT_H, 11);
    });
    if (this.codeRows) this.refreshBoard();
  }
  buildHud() {
    this.add.rectangle(W / 2, 20, W, 40, PAL.hud, 0.95).setDepth(30);
    txt(this, 20, 11, `LEVEL ${this.levelIndex + 1}  ·  ${this.L.course}  ·  ${this.L.title.toUpperCase()}`, { fontSize: '15px', color: '#c9ced2', fontStyle: 'bold', letterSpacing: 1 }).setDepth(31);
    txt(this, W - 20, 12, 'drag a card onto a slot  ·  or click it', { fontSize: '13px', color: '#8f989e' }).setOrigin(1, 0).setDepth(31);
  }
  // The billboard stands behind the castle (its left edge is hidden by the tower). It shows the
  // code with a blank for each slot; a card dropped in a slot turns its blank into that code.
  buildBillboard() {
    const B = BOARD, cx = B.x + B.w / 2, cy = B.y + B.h / 2;
    this.X = v => v - cx; this.Y = v => v - cy;
    const posts = this.add.graphics().setDepth(4.4);
    posts.fillStyle(0x4f565c, 1);
    [B.x + B.w - 60, B.x + B.w - 220].forEach(px => posts.fillRect(px, B.y + B.h - 6, 14, GROUND - B.y - B.h + 6));
    this.bb = this.add.container(cx, cy).setDepth(4.5);
    this.board = this.add.graphics();
    this.boardArt = this.textures.exists('board') ? this.add.image(0, 0, 'board').setDisplaySize(B.w, B.h) : null;
    this.tab = this.add.graphics();
    this.tabText = txt(this, this.X(BOARD_TEXT_X + 65), this.Y(B.y), 'QUESTION', { fontSize: '13px', fontStyle: 'bold', color: '#12393a', letterSpacing: 2 }).setOrigin(0.5);
    this.codeRows = this.add.container(0, 0);
    const goalY = CODE_Y0 + this.L.code.length * CODE_LH + 14;
    this.goalLabel = txt(this, this.X(BOARD_TEXT_X), this.Y(goalY + 6), 'GOAL', { fontSize: '13px', color: PAL.accentHex, fontStyle: 'bold' });
    this.goalText = txt(this, this.X(CODE_X), this.Y(goalY), this.L.goal, { fontFamily: MONO, fontSize: '17px', color: '#ffffff', fontStyle: 'bold', backgroundColor: '#1f5f61', padding: { x: 8, y: 4 } });
    this.legalNote = txt(this, this.X(CODE_X), this.Y(goalY), '', { fontFamily: MONO, fontSize: '14px', color: '#9fd9d9', lineSpacing: 4 });
    this.boardHead = txt(this, this.X(BOARD_TEXT_X), this.Y(B.y + B.h - 31), '', { fontFamily: MONO, fontSize: '15px', fontStyle: 'bold' });
    this.boardStatus = txt(this, this.X(BOARD_TEXT_X), this.Y(B.y + B.h - 30), '', { fontSize: '14px', color: '#aeb5ba' });
    this.bb.add([this.board, ...(this.boardArt ? [this.boardArt] : []), this.tab, this.tabText, this.codeRows,
      this.goalLabel, this.goalText, this.legalNote, this.boardHead, this.boardStatus]);
    this.failIdx = [];
    this.setBoardBorder(PAL.accent);
    this.refreshBoard();
  }
  // Lay out the code listing: plain code, plus one chip per slot (a numbered blank, or the card's code).
  refreshBoard(pop = -1, final = false) {
    this.codeRows.removeAll(true);
    const CIRCLED = ['①', '②', '③', '④'];
    this.L.code.forEach((line, r) => {
      const y = this.Y(CODE_Y0 + r * CODE_LH);
      this.codeRows.add(txt(this, this.X(CODE_X - 14), y + 2, String(r + 1), { fontFamily: MONO, fontSize: '12px', color: '#6b737a' }).setOrigin(1, 0));
      let x = this.X(CODE_X);
      const parts = line.split(/(\{\d\})/);
      parts.forEach((part, pi) => {
        if (!part) return;
        const m = part.match(/^\{(\d)\}$/);
        let t;
        if (!m) {
          if (final && /^\s+$/.test(part) && pi > 0 && pi < parts.length - 1) {     // drop spaces next to an unused blank
            const prev = parts[pi - 1].match(/^\{(\d)\}$/), next = parts[pi + 1].match(/^\{(\d)\}$/);
            if ((prev && !this.slots[prev[1] - 1]) || (next && !this.slots[next[1] - 1])) return;
          }
          t = txt(this, x, y, part, { fontFamily: MONO, fontSize: '16px', color: '#c9ced2' });
        } else {
          const i = +m[1] - 1, c = this.slots[i];
          if (final) {
            if (!c) return;
            t = txt(this, x, y, c.def.label, { fontFamily: MONO, fontSize: '16px', color: '#ffffff', fontStyle: 'bold' });
          } else if (c) {
            const bad = this.failIdx.includes(i);
            t = txt(this, x, y - 2, c.def.label, { fontFamily: MONO, fontSize: '16px', color: '#ffffff', fontStyle: 'bold',
              backgroundColor: bad ? this.failHex : '#1f6f70', padding: { x: 4, y: 2 } });
            if (i === pop) { t.setScale(1.35).setAlpha(0); this.tweens.add({ targets: t, scale: 1, alpha: 1, duration: 260, ease: 'Back.Out' }); }
          } else {
            const next = this.state === 'play' && i === this.slots.indexOf(null);
            t = txt(this, x, y - 2, ' ' + CIRCLED[i] + ' ', { fontFamily: MONO, fontSize: '16px', color: next ? '#12393a' : '#aeb5ba',
              backgroundColor: next ? PAL.accentHex : '#4a5157', padding: { x: 4, y: 2 } });
          }
        }
        this.codeRows.add(t);
        x += t.width + (m && !final ? 2 : 0);
      });
    });
  }
  setBoardBorder(color) {
    const B = BOARD, x = -B.w / 2, y = -B.h / 2, tx = this.X(BOARD_TEXT_X);
    this.board.clear();
    if (!this.boardArt) {
      this.board.fillStyle(0x30353a, 0.97).fillRoundedRect(x, y, B.w, B.h, 12);
      this.board.lineStyle(1, 0x464c52, 1).lineBetween(tx - 10, y + B.h - 42, x + B.w - 16, y + B.h - 42);
    }
    this.board.lineStyle(5, color, 1).strokeRoundedRect(x, y, B.w, B.h, 12);
    this.tab.clear().fillStyle(color === PAL.gold ? PAL.gold : PAL.accent, 1).fillRoundedRect(tx, y - 12, 130, 24, 6);
  }
  status(s, head = '', headHex = '#ffffff') {
    this.boardHead.setText(head).setColor(headHex);
    this.boardStatus.setText(s).setX(this.boardHead.x + (head ? this.boardHead.width + 12 : 0));
  }
  buildBubble() {
    this.bubble = this.add.container(0, 0).setDepth(25).setVisible(false);
    this.bubbleBg = this.add.graphics();
    this.bubbleFace = this.add.image(0, 0, 'faceSmile');
    this.bubbleText = txt(this, 0, 0, '', { fontSize: '16px', color: PAL.inkHex, wordWrap: { width: 250 }, lineSpacing: 3 });
    this.bubble.add([this.bubbleBg, this.bubbleFace, this.bubbleText]);
  }
  say(msg, face = 'faceSmile', danger = false) {
    const bw = 360, pad = 12, fs = 64;
    this.bubbleText.setText(msg);
    const bh = Math.max(fs + pad * 2, this.bubbleText.height + pad * 2);
    const bx = Math.min(NURSE_X - bw + 90, W - bw - 10), by = GROUND - NURSE_H - 24 - bh;
    const tip = NURSE_X - bx - 30;
    const g = this.bubbleBg; g.clear();
    g.fillStyle(0xf7f8f9, 1).fillRoundedRect(0, 0, bw, bh, 12);
    g.lineStyle(3, danger ? PAL.error : PAL.ink, 1).strokeRoundedRect(0, 0, bw, bh, 12);
    g.fillStyle(0xf7f8f9, 1).fillTriangle(tip - 30, bh - 2, tip, bh - 2, tip + 10, bh + 20);
    g.lineStyle(3, danger ? PAL.error : PAL.ink, 1).lineBetween(tip - 30, bh, tip + 10, bh + 20).lineBetween(tip, bh, tip + 10, bh + 20);
    this.bubbleFace.setTexture(face);
    const fsc = fs / Math.max(this.bubbleFace.width, this.bubbleFace.height);
    this.bubbleFace.setScale(fsc).setPosition(pad + fs / 2, bh / 2);
    this.bubbleText.setPosition(pad * 2 + fs, (bh - this.bubbleText.height) / 2);
    this.bubble.setPosition(bx, by).setVisible(true).setScale(0.9).setAlpha(0);
    this.tweens.add({ targets: this.bubble, scale: 1, alpha: 1, duration: 160, ease: 'Back.Out' });
  }
  hush() { this.bubble.setVisible(false); }

  // ----- whale -----
  makeWhale(withNurse, cardCount) {
    const c = this.add.container(W + 380, 300).setDepth(15);
    const WS = 0.8;
    const whale = this.add.image(0, 0, 'whale').setScale(WS);
    c.add(whale);
    // y of the whale's back (body ellipse top) at local x
    const backY = lx => {
      const dx = lx / WS + 280 - 260;
      return (124 - 78 * Math.sqrt(Math.max(0, 1 - (dx / 200) ** 2)) - 122) * WS;
    };
    c.cardSprites = [];
    for (let i = 0; i < cardCount; i++) {
      const lx = -30 + i * 24;
      const s = this.add.image(lx, backY(lx) + 4, 'cardBack').setOrigin(0.5, 1).setScale(0.5).setAngle(-6 + i * 4);
      c.add(s); c.cardSprites.push(s);
    }
    if (withNurse) {
      c.rider = this.add.image(-95, backY(-95) + 6, 'nurseStand').setOrigin(0.5, 1);
      c.rider.setScale(110 / c.rider.height);
      c.add(c.rider);
    }
    this.tweens.add({ targets: c, y: '+=14', duration: 900, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    return c;
  }
  worldOf(container, child) {
    const m = child.getWorldTransformMatrix();
    return { x: m.tx, y: m.ty };
  }
  // The dealt cards stand in a row between the slots and the nurse (overlapping a little if crowded).
  playerLayout(cards) {
    const x0 = this.slotX[this.nSlots - 1] + SLOT_W / 2 + 24 + CARD_W / 2, x1 = NURSE_X - 70;
    const n = cards.length, step = n > 1 ? Math.min(CARD_W + 10, (x1 - x0) / (n - 1)) : 0;
    const pos = new Map();
    cards.forEach((c, i) => { pos.set(c, { x: x0 + i * step, y: CARD_Y }); c.baseDepth = 10 + i * 0.01; c.setDepth(c.baseDepth); });
    return pos;
  }
  async whaleDrop(defs) {
    const whale = this.makeWhale(true, defs.length);
    Sfx.whale();
    await new Promise(r => this.tweens.add({ targets: whale, x: 1010, duration: 2200, ease: 'Sine.Out', onComplete: r }));
    const landed = defs.map((def, i) => {
      const spr = whale.cardSprites[i], p = this.worldOf(whale, spr);
      spr.setVisible(false);
      return new Card(this, p.x, p.y, def).setScale(0.45).setAngle(spr.angle);
    });
    const pos = this.playerLayout(landed);
    const drops = landed.map((card, i) => wait(this, i * 140)
      .then(() => flyTo(this, card, pos.get(card).x, pos.get(card).y, 700, -60, { angle: 0, scale: 1 })).then(() => Sfx.land()));
    // Nurse jumps off
    const p = this.worldOf(whale, whale.rider);
    whale.rider.setVisible(false);
    this.nurse.setPosition(p.x, p.y).setTexture('nurseStand');
    const target = NURSE_H / this.nurse.height;
    this.nurse.setScale(110 / this.nurse.height);
    const nurseJump = wait(this, 300).then(() => flyTo(this, this.nurse, NURSE_X, GROUND + 8, 900, -140, { scale: target }))
      .then(() => { Sfx.land(); this.tweens.add({ targets: this.nurse, scaleY: target * 0.92, duration: 90, yoyo: true }); });
    await wait(this, 500);
    this.tweens.add({ targets: whale, x: -420, duration: 2400, ease: 'Sine.In', onComplete: () => whale.destroy() });
    await Promise.all([...drops, nurseJump]);
    for (let i = 0; i < landed.length; i++) landed[i].flip(i * 100);
    await wait(this, 500);
    landed.forEach(c => {
      c.home = pos.get(c);
      c.enableInput(this.cardHandlers);
      this.cards.push(c);
    });
  }

  async introSequence() {
    this.bb.setAlpha(0).setScale(0.5);
    await wait(this, 350);
    await this.levelBanner();
    await this.popQuestion();
    await this.whaleDrop(Phaser.Utils.Array.Shuffle([...this.L.cards]));
    this.status('Fill the slots left to right. The castle checks the code as you go.');
    this.state = 'play';
    this.updateGlow();
    this.refreshBoard();
  }
  async levelBanner() {
    const t1 = txt(this, W / 2, H / 2 - 40, `LEVEL ${this.levelIndex + 1}`, { fontSize: '96px', fontStyle: 'bold', stroke: '#2b2f33', strokeThickness: 10 })
      .setOrigin(0.5).setDepth(50).setAlpha(0).setScale(0.7);
    const t2 = txt(this, W / 2, H / 2 + 42, this.L.title.toUpperCase(), { fontSize: '26px', fontStyle: 'bold', color: PAL.accentHex, stroke: '#2b2f33', strokeThickness: 6, letterSpacing: 4 })
      .setOrigin(0.5).setDepth(50).setAlpha(0);
    Sfx.lock();
    await this.tweenP({ targets: [t1, t2], alpha: 1, scale: 1, duration: 320, ease: 'Back.Out' });
    await wait(this, 1000);
    await this.tweenP({ targets: [t1, t2], alpha: 0, duration: 400 });
    t1.destroy(); t2.destroy();
  }
  async popQuestion() {
    Sfx.flip();
    await this.tweenP({ targets: this.bb, alpha: 1, scale: 1, duration: 450, ease: 'Back.Out' });
    await wait(this, 250);
  }

  // ----- play -----
  canClick(card) { return this.state === 'play' && !card.locked; }
  updateGlow() {
    const next = this.slots.indexOf(null);
    this.slotGlow.forEach((g, i) => g.setVisible(this.state === 'play' && i === next));
  }
  get cardHandlers() { return { press: (c, p) => this.press(c, p) }; }

  // ----- drag: press lifts, card glides after the mouse, snaps near a legal slot, lands on release -----
  press(card, p) {
    if (!this.canClick(card) || this.held) return;
    Sfx.flip();
    this.held = {
      card, sx: p.x, sy: p.y, moved: false, snap: null,
      ox: card.x - p.x, oy: card.y - p.y - LIFT,      // keep the grab point, lifted
      tx: card.x, ty: card.y - LIFT,
    };
    card.setLifted(true);
  }
  holdMove(p) {
    const h = this.held; if (!h) return;
    if (!h.moved && Phaser.Math.Distance.Between(p.x, p.y, h.sx, h.sy) > 6) {
      h.moved = true; this.clearHints(); this.hush();
      const c = h.card;
      if (c.slotIndex !== null) { this.slots[c.slotIndex] = null; c.slotIndex = null; this.layoutSlots(); }
    }
    if (!h.moved) return;
    const fx = p.x + h.ox, fy = p.y + h.oy;
    h.snap = this.dropTarget(fx, fy);
    if (h.snap !== null) { h.tx = this.slotX[h.snap]; h.ty = SLOT_Y - LIFT; }
    else { h.tx = fx; h.ty = fy; }
    this.slotGlow.forEach((g, i) => g.setVisible(i === h.snap));
  }
  release() {
    const h = this.held; if (!h) return;
    this.held = null;
    const c = h.card, snap = h.moved && h.snap !== null && !this.slots[h.snap];
    c.setLifted(false, snap ? PLACED_S : (c.slotIndex !== null ? PLACED_S : 1));
    if (!h.moved) return this.onCardClick(c);              // a plain click
    if (snap) { Sfx.click(); return this.placeInSlot(c, h.snap, 110); }
    flyTo(this, c, c.home.x, c.home.y, 320, -40);
    this.updateGlow();
  }
  update(time, delta) {
    const h = this.held; if (!h) return;
    const k = 1 - Math.pow(0.7, delta / 16.67);              // smooth follow, frame-rate independent
    h.card.x += (h.tx - h.card.x) * k;
    h.card.y += (h.ty - h.card.y) * k;
  }
  dropTarget(x, y) {
    let best = null, bd = 95;
    this.slotX.forEach((sx, i) => {
      if (this.slots[i]) return;
      const d = Math.hypot(x - sx, y - SLOT_Y);
      if (d < bd) { bd = d; best = i; }
    });
    return best;
  }
  onCardClick(card) {
    if (!this.canClick(card)) return;
    Sfx.click(); card.glow.setVisible(false);
    if (card.slotIndex !== null) {       // take it back out
      this.slots[card.slotIndex] = null;
      card.slotIndex = null;
      flyTo(this, card, card.home.x, card.home.y, 350, -60, { scale: 1 });
      this.layoutSlots();
      this.updateGlow();
      return;
    }
    const idx = this.slots.indexOf(null);
    if (idx < 0) return;
    this.placeInSlot(card, idx);
  }
  placeInSlot(card, idx, dur = 380) {
    this.clearHints(); this.hush();
    this.slots[idx] = card; card.slotIndex = idx;
    this.state = 'moving'; this.updateGlow();
    flyTo(this, card, this.slotX[idx], SLOT_Y, dur, dur < 300 ? -15 : -80, { scale: PLACED_S }).then(() => { Sfx.land(); this.refreshBoard(idx); this.afterPlace(); });
  }
  clearHints() { this.cards.forEach(c => c.hinted && c.setHint(false)); }
  afterPlace() {
    const r = this.evaluate();
    if (r.out) return this.fail(r.out, r.cards);
    if (r.win) return this.win(r.used);
    return this.resume();
  }
  // The castle reads the filled slots from slot 1 to the first gap (see levels.js for the rules).
  evaluate() {
    const s = this.slots, L = this.L, sols = [L.solution, ...(L.alt || [])];
    for (let i = 0; i < s.length; i++) if (s[i] && s[i].def.out) return { out: s[i].def.out, cards: [i] };
    let n = 0; while (n < s.length && s[n]) n++;
    const run = s.slice(0, n).map(c => c.def.id), all = [...Array(n).keys()];
    for (const q of L.seq || []) if (sameList(run, q.run)) return { out: q.out, cards: all };
    if (sols.some(sol => sameList(run, sol))) return { win: true, used: n };
    // how far the run matches its closest answer
    const bad = Math.max(...sols.map(sol => { const k = run.findIndex((id, i) => id !== sol[i]); return k < 0 ? n : k; }));
    if (bad >= n) return {};                                     // so far so good: keep going
    return { out: ORDER_FAIL, cards: all.slice(bad) };
  }
  resume() { this.state = 'play'; this.updateGlow(); this.refreshBoard(); }
  // Infinite loop: the lights chase round and round until the castle gives up.
  async spinLights(color) {
    for (let k = 0; k < 14; k++) {
      this.lights.forEach((l, i) => { if (!this.slots[i] || !this.slots[i].locked) l.setFillStyle(i === k % this.lights.length ? color : LIGHT_OFF); });
      Sfx.tone(520 + (k % 4) * 60, 0.05, 'square', 0.05);
      await wait(this, 90);
    }
  }
  async fail(out, idxs) {
    this.state = 'checking'; this.updateGlow();
    const look = OUTCOME[out.kind] || OUTCOME.compile;
    this.status('The castle is running your code…');
    if (out.kind === 'timeout') await this.spinLights(look.color);
    Sfx.error();
    if (out.kind === 'crash') { this.cameras.main.shake(380, 0.012); this.cameras.main.flash(220, 255, 138, 61); }
    else if (out.kind !== 'output') this.cameras.main.shake(180, 0.004);
    this.doorTag.setText(out.tag).setBackgroundColor(look.hex).setVisible(true);
    this.lights.forEach(l => l.setFillStyle(look.color));
    this.status(out.tag, look.head, look.hex);
    this.failIdx = idxs; this.failHex = look.hex; this.refreshBoard();
    idxs.forEach(i => this.slots[i] && this.tweens.add({ targets: this.slots[i], angle: { from: -4, to: 4 }, duration: 60, yoyo: true, repeat: 3, onComplete: () => this.slots[i] && this.slots[i].setAngle(0) }));
    // Nurse = hint giver. Hints get stronger with each mistake on this level.
    this.mistakes++;
    const lead = ['Hmm, not quite. ', 'Again? Okay, closer look: ', "Doctor's orders: "][Math.min(this.mistakes, 3) - 1];
    const tail = this.mistakes >= 2 ? "\nTry the card I'm making glow." : '';
    this.say(lead + out.msg + tail, this.mistakes === 1 ? 'faceSmirk' : 'faceUpset', true);
    this.setBoardBorder(look.color);
    await wait(this, 2300);
    this.setBoardBorder(PAL.accent);
    idxs.forEach(i => {
      const c = this.slots[i]; if (!c) return;
      this.slots[i] = null; c.slotIndex = null;
      flyTo(this, c, c.home.x, c.home.y, 400, -70, { scale: 1 });
    });
    this.failIdx = [];
    this.layoutSlots();
    this.lights.forEach(l => l.setFillStyle(LIGHT_OFF));
    this.doorTag.setVisible(false);
    this.status('Fill the slots left to right. The castle checks the code as you go.');
    await wait(this, 420);
    this.resume();
    if (this.mistakes >= 2) this.showHintCard();
  }
  showHintCard() {
    const idx = this.slots.indexOf(null);
    const placed = this.slots.slice(0, idx).map(c => c && c.def.id);
    const sol = [this.L.solution, ...(this.L.alt || [])].find(a => placed.every((id, i) => id === a[i])) || this.L.solution;
    const id = sol[idx];
    const card = this.cards.find(c => c.def.id === id && c.slotIndex === null);
    if (card) card.setHint(true);
  }

  // ----- win: the castle compiled the code -----
  tweenP(cfg) { return new Promise(r => this.tweens.add(Object.assign({}, cfg, { onComplete: r }))); }
  // The blanks become plain code: the listing on the board IS the compiled program.
  async showLegal() {
    this.setBoardBorder(PAL.gold);
    this.tabText.setText('COMPILED ✔');
    this.status('');
    Sfx.lock();
    this.refreshBoard(-1, true);
    this.codeRows.list.forEach((t, i) => { t.setAlpha(0); this.tweens.add({ targets: t, alpha: 1, duration: 200, delay: i * 25 }); });
    await this.tweenP({ targets: [this.goalText], alpha: 0, duration: 250 });
    this.goalLabel.setText('WHY');
    const note = this.L.legal.slice(1).join('\n');
    for (let i = 1; i <= note.length; i++) { this.legalNote.setText(note.slice(0, i)); if (note[i - 1] !== ' ') await wait(this, 12); }
    this.status('The code is legal. The castle compiled it.');
  }
  async win(used) {
    this.state = 'win'; this.updateGlow(); this.hush(); this.clearHints();
    this.slots.forEach((c, i) => { if (!c) return; c.locked = true; c.check.setVisible(true); this.lights[i].setFillStyle(PAL.accent); });
    Sfx.lock();
    // unused lights switch on by themselves: the castle accepts the code as complete
    for (let i = used; i < this.lights.length; i++) {
      await wait(this, 220);
      const l = this.lights[i];
      l.setFillStyle(PAL.accent);
      Sfx.tone(1320, 0.18, 'triangle', 0.1);
      const flash = this.add.circle(l.x, l.y, 10, 0xffffff, 0.9).setDepth(8);
      this.tweens.add({ targets: flash, scale: 3, alpha: 0, duration: 380, onComplete: () => flash.destroy() });
    }
    this.lights.forEach(l => this.tweens.add({ targets: l, scale: 1.4, duration: 180, yoyo: true, repeat: 2 }));
    await wait(this, 600);
    // 1) puzzle slots fade away
    this.tweens.killTweensOf(this.slotGlow);
    await this.tweenP({ targets: [...this.slotParts, ...this.slotGlow], alpha: 0, duration: 450 });
    // 2) the question becomes the legal code
    await this.showLegal();
    await wait(this, 1000);
    // 3) door opens
    Sfx.door(); this.cameras.main.shake(400, 0.003);
    await this.tweenP({ targets: this.door, scaleX: 0.08, duration: 800, ease: 'Sine.InOut' });
    // 4) every card flies to the nurse's right and fans out like a hand of cards
    const hand = this.cards.filter(c => c.alpha > 0);
    const n = hand.length, fan = i => i - (n - 1) / 2;
    const off = hand.map((c, i) => ({ dx: 46 + fan(i) * 14, dy: -80 + Math.abs(fan(i)) * 5, a: fan(i) * 11 }));
    hand.forEach(c => { c.disableInteractive(); c.check.setVisible(false); c.glow.setVisible(false); c.setDepth(13); });
    Sfx.magic();
    await Promise.all(hand.map((c, i) => wait(this, i * 110).then(() => {
      const trail = this.add.particles(0, 0, 'spark', {
        follow: c, lifespan: 450, speed: { min: 10, max: 40 }, scale: { start: 0.7, end: 0 },
        tint: [PAL.accent, PAL.gold, 0xffffff], frequency: 25, blendMode: 'ADD',
      }).setDepth(12.5);
      return flyTo(this, c, this.nurse.x + off[i].dx, this.nurse.y + off[i].dy, 700, -160, { scale: 0.34, angle: off[i].a })
        .then(() => { trail.stop(); this.time.delayedCall(500, () => trail.destroy()); });
    })));
    await wait(this, 350);
    // 5) nurse walks into the castle, holding the hand
    this.nurse.setTexture('nurseWalk');
    this.nurse.setScale(NURSE_H / this.nurse.height);
    this.nurse.setFlipX(window.NURSE_WALK_FACES_RIGHT === true);
    const baseY = GROUND + 8, dist = this.nurse.x - DOOR_CX;
    await new Promise(r => this.tweens.addCounter({
      from: this.nurse.x, to: DOOR_CX, duration: dist * 3.2, ease: 'Linear',
      onUpdate: tw => {
        const x = tw.getValue(), bob = Math.abs(Math.sin((NURSE_X - x) / 22)) * 8;
        this.nurse.setPosition(x, baseY - bob);
        hand.forEach((c, i) => c.setPosition(x + off[i].dx, baseY - bob + off[i].dy));
      },
      onComplete: r,
    }));
    this.nurse.setDepth(5.5); hand.forEach(c => c.setDepth(5.6));
    await this.tweenP({ targets: [this.nurse, ...hand], alpha: 0, duration: 500 });
    Sfx.door();
    await this.tweenP({ targets: this.door, scaleX: 1, duration: 500 });
    await wait(this, 300);
    // 6) success dialog (WinScene), then the next level restarts with its banner
    this.scene.launch('Win', { levelIndex: this.levelIndex });
    this.scene.pause();
  }
}

// ---------------- Win overlay ----------------
class WinScene extends Phaser.Scene {
  constructor() { super('Win'); }
  init(d) { this.levelIndex = d.levelIndex; }
  create() {
    Sfx.jingle();
    const dim = this.add.rectangle(W / 2, H / 2, W, H, PAL.ink, 0).setDepth(0);
    this.tweens.add({ targets: dim, fillAlpha: 0.6, duration: 300 });
    const emitter = this.add.particles(0, -20, 'confetti', {
      x: { min: 0, max: W }, speedY: { min: 160, max: 360 }, speedX: { min: -90, max: 90 },
      rotate: { start: 0, end: 540 }, lifespan: 4200, gravityY: 120, quantity: 3, frequency: 25,
      scale: { min: 0.6, max: 1.1 }, tint: [PAL.accent, PAL.gold, 0xffffff, 0xf28cb1, 0x9aa3aa],
    }).setDepth(5);
    this.time.delayedCall(1800, () => emitter.stop());
    const panel = this.add.container(W / 2, H / 2).setDepth(10).setScale(0.6).setAlpha(0);
    const bg = this.add.graphics();
    bg.fillStyle(0x2f3439, 0.97).fillRoundedRect(-300, -170, 600, 340, 18);
    bg.lineStyle(4, PAL.accent, 1).strokeRoundedRect(-300, -170, 600, 340, 18);
    const n = this.add.image(-170, 40, 'nurseSpin');
    n.setScale(240 / n.height);
    const t1 = txt(this, 60, -90, `LEVEL ${this.levelIndex + 1}`, { fontSize: '26px', color: PAL.accentHex, fontStyle: 'bold', letterSpacing: 4 }).setOrigin(0.5);
    const t2 = txt(this, 60, -40, 'COMPLETE!', { fontSize: '54px', fontStyle: 'bold', color: PAL.goldHex }).setOrigin(0.5);
    const t3 = txt(this, 60, 20, 'Patient code compiled.', { fontSize: '20px', color: '#e8ebed' }).setOrigin(0.5);
    const t4 = txt(this, 60, 110, 'click to continue', { fontSize: '15px', color: '#8f989e' }).setOrigin(0.5);
    panel.add([bg, n, t1, t2, t3, t4]);
    this.tweens.add({ targets: panel, scale: 1, alpha: 1, duration: 450, ease: 'Back.Out' });
    this.tweens.add({ targets: n, angle: { from: -6, to: 6 }, duration: 380, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    let closed = false;
    const close = () => {
      if (closed) return; closed = true;
      this.tweens.add({ targets: [panel, dim], alpha: 0, duration: 300, onComplete: () => {
        const next = (this.levelIndex + 1) % window.LEVELS.length;
        const lvl = this.scene.get('Level');
        this.scene.stop();
        lvl.scene.resume();
        lvl.cameras.main.fadeOut(350, 43, 47, 51);
        lvl.cameras.main.once('camerafadeoutcomplete', () => lvl.scene.restart({ levelIndex: next }));
      } });
    };
    this.time.delayedCall(700, () => this.input.once('pointerdown', close));
    this.time.delayedCall(5000, close);
  }
}

window.SCENES = [BootScene, TitleScene, LevelScene, WinScene];
window.GAME_SIZE = { W, H };
