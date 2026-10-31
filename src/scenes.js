// Whale Rider: Code Quest — Phase 1 scenes.
const W = 1280, H = 720, GROUND = 560;
const CARD_W = 104, CARD_H = 140;
const LIFT = 16;   // how far a card rises when picked up
const SLOT_X = [270, 390, 510], SLOT_Y = GROUND - 75;
const CODE_X = [680, 800, 920], CODE_Y = SLOT_Y;
const ANS_X = CODE_X, ANS_Y = 642;
const NURSE_X = 1140, NURSE_H = 210;
const TOWER_X = 20, TOWER_TOP = GROUND - 330;
const DOOR_X = TOWER_X + 52, DOOR_Y = TOWER_TOP + 152, DOOR_CX = TOWER_X + 100;
const MONO = 'Menlo, Consolas, "Courier New", monospace';
const SANS = '"Helvetica Neue", Arial, sans-serif';

function txt(scene, x, y, s, style) {
  return scene.add.text(x, y, s, Object.assign({ fontFamily: SANS, fontSize: '16px', color: '#ffffff', resolution: 2 }, style));
}
function fmt(v, type) {
  if (type === 'int') return String(v);
  const s = Number.isInteger(v) ? v.toFixed(1) : String(v);
  return type === 'float' ? s + 'f' : s;
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
    const imgs = window.NURSE_IMG || {};
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
  const gr = scene.add.graphics().setDepth(4);
  gr.fillStyle(PAL.ground, 1); gr.fillRect(0, GROUND, W, H - GROUND);
  gr.fillStyle(PAL.groundDark, 1); gr.fillRect(0, GROUND, W, 6);
  gr.lineStyle(2, PAL.groundDark, 1);
  for (let i = 0; i < 70; i++) {
    const x = Phaser.Math.Between(0, W), y = Phaser.Math.Between(GROUND + 12, H - 6);
    gr.lineBetween(x, y, x - 4, y - 8); gr.lineBetween(x, y, x + 1, y - 10); gr.lineBetween(x, y, x + 5, y - 7);
  }
}

// ---------------- Card ----------------
class Card extends Phaser.GameObjects.Container {
  constructor(scene, x, y, def, kind) {
    super(scene, x, y);
    this.def = def; this.kind = kind; this.slotIndex = null; this.locked = false; this.faceUp = false;
    this.glow = scene.add.graphics();
    this.glow.fillStyle(PAL.accent, 0.6).fillRoundedRect(-CARD_W / 2 - 7, -CARD_H / 2 - 7, CARD_W + 14, CARD_H + 14, 14);
    this.glow.setVisible(false);
    this.back = scene.add.image(0, 0, 'cardBack');
    this.face = scene.add.container(0, 0);
    const f = scene.add.graphics();
    const border = kind === 'code' ? PAL.accent : 0x9aa3aa;
    f.fillStyle(PAL.cardFace, 1).fillRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 10);
    f.lineStyle(3, border, 1).strokeRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 10);
    f.fillStyle(kind === 'code' ? PAL.accent : 0x9aa3aa, 1).fillRoundedRect(-CARD_W / 2 + 8, -CARD_H / 2 + 8, 44, 16, 4);
    const tag = txt(scene, -CARD_W / 2 + 30, -CARD_H / 2 + 16, kind === 'code' ? 'CODE' : 'VALUE',
      { fontSize: '10px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    const label = txt(scene, 0, 6, def.label, {
      fontFamily: MONO, fontSize: def.label.length > 7 ? '19px' : '24px', color: PAL.inkHex,
      fontStyle: 'bold', align: 'center', wordWrap: { width: CARD_W - 12 },
    }).setOrigin(0.5);
    this.face.add([f, tag, label]);
    this.face.setVisible(false);
    this.check = txt(scene, CARD_W / 2 - 14, -CARD_H / 2 + 14, '✔', { fontSize: '18px', color: PAL.accentHex, fontStyle: 'bold' })
      .setOrigin(0.5).setVisible(false);
    this.add([this.glow, this.back, this.face, this.check]);
    this.setSize(CARD_W, CARD_H);
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
      hitArea: new Phaser.Geom.Rectangle(0, 0, CARD_W, CARD_H),   // container hit areas are origin-relative (top-left)
      hitAreaCallback: Phaser.Geom.Rectangle.Contains, useHandCursor: true,
    });
    this.on('pointerover', () => { if (this.scene.canClick(this)) this.glow.setVisible(true); });
    this.on('pointerout', () => { if (!this.held && !this.hinted) this.glow.setVisible(false); });
    this.on('pointerdown', p => h.press(this, p));
  }
  setLifted(on) {
    if (!this.shadow) {
      this.shadow = this.scene.add.graphics();
      this.shadow.fillStyle(0x000000, 0.28).fillRoundedRect(-CARD_W / 2 + 6, -CARD_H / 2 + LIFT + 4, CARD_W, CARD_H, 10);
      this.addAt(this.shadow, 0);
    }
    this.held = on;
    this.shadow.setVisible(on);
    this.glow.setVisible(on);
    this.setDepth(on ? 20 : 10);
    this.scene.tweens.add({ targets: this, scale: on ? 1.08 : 1, angle: on ? -2 : 0, duration: 120, ease: 'Sine.Out' });
  }
  setHint(on) {
    this.hinted = on;
    if (this.hintTween) { this.hintTween.stop(); this.hintTween = null; }
    if (this.arrowTween) { this.arrowTween.stop(); this.arrowTween = null; }
    if (!this.arrow) {
      this.arrow = txt(this.scene, 0, -CARD_H / 2 - 26, '▼', { fontSize: '30px', color: PAL.accentHex, stroke: '#12393a', strokeThickness: 4 }).setOrigin(0.5);
      this.add(this.arrow);
    }
    this.arrow.setVisible(on).setY(-CARD_H / 2 - 26);
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
    this.input.once('pointerdown', () => {
      Sfx.unlock(); Sfx.click();
      this.cameras.main.fadeOut(300, 43, 47, 51);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Level', { levelIndex: 0 }));
    });
  }
}

// ---------------- Level ----------------
class LevelScene extends Phaser.Scene {
  constructor() { super('Level'); }
  init(data) {
    this.levelIndex = data.levelIndex || 0;
    this.L = window.LEVELS[this.levelIndex];
    this.nSlots = 3;   // three question slots always; a statement may need fewer cards
    this.slots = new Array(this.nSlots).fill(null);
    this.cards = [];
    this.state = 'intro';
    this.answersDropped = false;
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
    const plateY = TOWER_TOP + 96;
    this.add.rectangle(DOOR_CX, plateY, 120, 34, 0x3a3f44).setStrokeStyle(2, 0x2b2f33).setDepth(6);
    const offs = [-36, 0, 36];
    this.lights = offs.map(dx => this.add.circle(DOOR_CX + dx, plateY, 10, 0x555c62).setStrokeStyle(2, 0x2b2f33).setDepth(7));
    this.doorTag = txt(this, DOOR_CX, TOWER_TOP + 60, '', { fontFamily: MONO, fontSize: '15px', fontStyle: 'bold',
      backgroundColor: PAL.errorHex, padding: { x: 6, y: 3 } }).setOrigin(0.5).setDepth(8).setVisible(false);
  }
  buildSlots() {
    this.slotGlow = [];
    this.runText = [];
    this.slotParts = [];
    SLOT_X.slice(0, this.nSlots).forEach((x, i) => {
      const glow = this.add.rectangle(x, SLOT_Y, CARD_W + 16, CARD_H + 16).setStrokeStyle(4, PAL.accent).setDepth(7).setVisible(false);
      this.tweens.add({ targets: glow, alpha: 0.35, duration: 600, yoyo: true, repeat: -1 });
      const g = this.add.graphics().setDepth(7);
      g.fillStyle(0x8c949a, 0.85).fillRoundedRect(x - CARD_W / 2, SLOT_Y - CARD_H / 2, CARD_W, CARD_H, 10);
      g.lineStyle(3, PAL.slot, 1).strokeRoundedRect(x - CARD_W / 2, SLOT_Y - CARD_H / 2, CARD_W, CARD_H, 10);
      const badge = this.add.circle(x, SLOT_Y - CARD_H / 2 - 22, 15, 0x3a3f44).setDepth(7);
      const num = txt(this, x, SLOT_Y - CARD_H / 2 - 22, String(i + 1), { fontSize: '16px', fontStyle: 'bold' }).setOrigin(0.5).setDepth(8);
      this.slotParts.push(g, badge, num);
      if (i < this.nSlots - 1) this.slotParts.push(txt(this, x + 60, SLOT_Y, '›', { fontSize: '30px', color: '#5b636a', fontStyle: 'bold' }).setOrigin(0.5).setDepth(7));
      this.runText.push(txt(this, x, SLOT_Y + CARD_H / 2 + 22, '', { fontFamily: MONO, fontSize: '18px', color: '#2b2f33', fontStyle: 'bold' })
        .setOrigin(0.5).setDepth(8));
      this.slotGlow.push(glow);
    });
  }
  buildHud() {
    this.add.rectangle(W / 2, 20, W, 40, PAL.hud, 0.95).setDepth(30);
    txt(this, 20, 11, `LEVEL ${this.levelIndex + 1}  ·  ${this.L.title.toUpperCase()}`, { fontSize: '15px', color: '#c9ced2', fontStyle: 'bold', letterSpacing: 1 }).setDepth(31);
    txt(this, W - 20, 12, 'drag a card onto a slot  ·  or click it', { fontSize: '13px', color: '#8f989e' }).setOrigin(1, 0).setDepth(31);
  }
  // The question lives on a billboard on the castle roof. On a win it shows the compiled, legal statement.
  buildBillboard() {
    const L = this.L, bx = 14, by = 76, bw = 452, bh = 148, cx = bx + bw / 2, cy = by + bh / 2;
    const posts = this.add.graphics().setDepth(4.9);
    posts.fillStyle(0x4f565c, 1).fillRect(60, by + bh - 4, 12, TOWER_TOP - by - bh + 10).fillRect(170, by + bh - 4, 12, TOWER_TOP - by - bh + 10);
    const X = v => v - cx, Y = v => v - cy;
    this.boardRect = { bw, bh };
    this.bb = this.add.container(cx, cy).setDepth(9);
    this.board = this.add.graphics();
    this.tab = this.add.graphics();
    this.tabText = txt(this, X(bx + 81), Y(by), 'QUESTION', { fontSize: '13px', fontStyle: 'bold', color: '#12393a', letterSpacing: 2 }).setOrigin(0.5);
    this.qParts = [
      txt(this, X(bx + 18), Y(by + 30), 'GIVEN', { fontSize: '13px', color: PAL.accentHex, fontStyle: 'bold' }),
      txt(this, X(bx + 76), Y(by + 26), L.given, { fontFamily: MONO, fontSize: '18px', color: '#e8ebed' }),
      txt(this, X(bx + 18), Y(by + 68), 'GOAL', { fontSize: '13px', color: PAL.accentHex, fontStyle: 'bold' }),
      txt(this, X(bx + 76), Y(by + 60), L.goal.label, { fontFamily: MONO, fontSize: '20px', color: '#ffffff', fontStyle: 'bold', backgroundColor: '#1f5f61', padding: { x: 8, y: 4 } }),
    ];
    this.legalCode = txt(this, X(bx + 18), Y(by + 22), '', { fontFamily: MONO, fontSize: '17px', color: '#ffffff', fontStyle: 'bold' });
    this.legalNote = txt(this, X(bx + 18), Y(by + 52), '', { fontFamily: MONO, fontSize: '14px', color: '#9fd9d9', lineSpacing: 4 });
    this.boardStatus = txt(this, X(bx + 18), Y(by + 110), '', { fontSize: '14px', color: '#aeb5ba' });
    this.bb.add([this.board, this.tab, this.tabText, ...this.qParts, this.legalCode, this.legalNote, this.boardStatus]);
    this.setBoardBorder(PAL.accent);
  }
  setBoardBorder(color) {
    const { bw, bh } = this.boardRect, x = -bw / 2, y = -bh / 2;
    this.board.clear();
    this.board.fillStyle(0x30353a, 0.97).fillRoundedRect(x, y, bw, bh, 10);
    this.board.lineStyle(4, color, 1).strokeRoundedRect(x, y, bw, bh, 10);
    this.board.lineStyle(1, 0x464c52, 1).lineBetween(x + 14, y + 100, x + bw - 14, y + 100);
    this.tab.clear().fillStyle(color === PAL.gold ? PAL.gold : PAL.accent, 1).fillRoundedRect(x + 16, y - 12, 130, 24, 6);
  }
  status(s) { this.boardStatus.setText(s); }
  buildBubble() {
    this.bubble = this.add.container(0, 0).setDepth(25).setVisible(false);
    this.bubbleBg = this.add.graphics();
    this.bubbleFace = this.add.image(0, 0, 'faceSmile');
    this.bubbleText = txt(this, 0, 0, '', { fontSize: '16px', color: PAL.inkHex, wordWrap: { width: 230 }, lineSpacing: 3 });
    this.bubble.add([this.bubbleBg, this.bubbleFace, this.bubbleText]);
  }
  say(msg, face = 'faceSmile', danger = false) {
    const bw = 340, pad = 12, fs = 64;
    this.bubbleText.setText(msg);
    const bh = Math.max(fs + pad * 2, this.bubbleText.height + pad * 2);
    const bx = NURSE_X - bw + 90, by = GROUND - NURSE_H - 24 - bh;
    const g = this.bubbleBg; g.clear();
    g.fillStyle(0xf7f8f9, 1).fillRoundedRect(0, 0, bw, bh, 12);
    g.lineStyle(3, danger ? PAL.error : PAL.ink, 1).strokeRoundedRect(0, 0, bw, bh, 12);
    g.fillStyle(0xf7f8f9, 1).fillTriangle(bw - 110, bh - 2, bw - 80, bh - 2, bw - 70, bh + 20);
    g.lineStyle(3, danger ? PAL.error : PAL.ink, 1).lineBetween(bw - 110, bh, bw - 70, bh + 20).lineBetween(bw - 80, bh, bw - 70, bh + 20);
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
    const c = this.add.container(W + 380, 262).setDepth(15);
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
      const lx = -20 + i * 28;
      const s = this.add.image(lx, backY(lx) + 4, 'cardBack').setOrigin(0.5, 1).setScale(0.55).setAngle(-4 + i * 4);
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
  async whaleDrop(defs, kind, xs, y, withNurse) {
    const total = defs.length;
    const whale = this.makeWhale(withNurse, total);
    Sfx.whale();
    await new Promise(r => this.tweens.add({ targets: whale, x: 760, duration: 2200, ease: 'Sine.Out', onComplete: r }));
    // Drop 3 cards
    const landed = [];
    const drops = defs.map((def, i) => {
      const spr = whale.cardSprites[i];
      const p = this.worldOf(whale, spr);
      spr.setVisible(false);
      const card = new Card(this, p.x, p.y, def, kind).setScale(0.55).setAngle(spr.angle);
      landed.push(card);
      return wait(this, i * 160).then(() => flyTo(this, card, xs[i], y, 700, -60, { angle: 0, scale: 1 })).then(() => Sfx.land());
    });
    // Nurse jumps off
    let nurseJump = Promise.resolve();
    if (withNurse) {
      const p = this.worldOf(whale, whale.rider);
      whale.rider.setVisible(false);
      this.nurse.setPosition(p.x, p.y).setTexture('nurseStand');
      const target = NURSE_H / this.nurse.height;
      this.nurse.setScale(110 / this.nurse.height);
      nurseJump = wait(this, 300).then(() => flyTo(this, this.nurse, NURSE_X, GROUND + 8, 900, -140, { scale: target }))
        .then(() => { Sfx.land(); this.tweens.add({ targets: this.nurse, scaleY: target * 0.92, duration: 90, yoyo: true }); });
    }
    await wait(this, 500);
    this.tweens.add({ targets: whale, x: -420, duration: 2400, ease: 'Sine.In', onComplete: () => whale.destroy() });
    await Promise.all([...drops, nurseJump]);
    for (let i = 0; i < landed.length; i++) landed[i].flip(i * 120);
    await wait(this, 500);
    landed.forEach((c, i) => {
      c.home = { x: xs[i], y };
      c.enableInput(this.cardHandlers);
      this.cards.push(c);
    });
  }

  async introSequence() {
    this.bb.setAlpha(0).setScale(0.5);
    await wait(this, 350);
    await this.levelBanner();
    await this.popQuestion();
    await this.whaleDrop(this.L.code, 'code', CODE_X, CODE_Y, true);
    this.status('Build the statement left to right. The castle checks it as you go.');
    this.state = 'play';
    this.updateGlow();
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
      if (c.slotIndex !== null) { this.slots[c.slotIndex] = null; this.runText[c.slotIndex].setText(''); c.slotIndex = null; }
    }
    if (!h.moved) return;
    const fx = p.x + h.ox, fy = p.y + h.oy;
    h.snap = this.dropTarget(fx, fy);
    if (h.snap !== null) { h.tx = SLOT_X[h.snap]; h.ty = SLOT_Y - LIFT; }
    else { h.tx = fx; h.ty = fy; }
    this.slotGlow.forEach((g, i) => g.setVisible(i === h.snap));
  }
  release() {
    const h = this.held; if (!h) return;
    this.held = null;
    const c = h.card;
    c.setLifted(false);
    if (!h.moved) return this.onCardClick(c);              // a plain click
    if (h.snap !== null && !this.slots[h.snap]) { Sfx.click(); return this.placeInSlot(c, h.snap, 110); }
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
    let best = null, bd = 90;
    SLOT_X.forEach((sx, i) => {
      if (this.slots[i]) return;
      const d = Phaser.Math.Distance.Between(x, y, sx, SLOT_Y);
      if (d < bd) { bd = d; best = i; }
    });
    return best;
  }
  onCardClick(card) {
    if (!this.canClick(card)) return;
    Sfx.click(); card.glow.setVisible(false);
    if (card.slotIndex !== null) {       // take it back out
      this.slots[card.slotIndex] = null;
      this.runText[card.slotIndex].setText('');
      card.slotIndex = null;
      flyTo(this, card, card.home.x, card.home.y, 350, -60);
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
    flyTo(this, card, SLOT_X[idx], SLOT_Y, dur, dur < 300 ? -15 : -80).then(() => { Sfx.land(); this.afterPlace(idx); });
  }
  clearHints() { this.cards.forEach(c => c.hinted && c.setHint(false)); }
  afterPlace(idx) {
    if (this.L.answers) return this.afterPlaceAnswers(idx);
    const r = this.evalStatement();
    r.show.forEach((t, i) => this.runText[i].setText(t));
    if (r.err) return this.fail(r.err[0], r.err[1], r.err[2], 'faceUpset');
    if (r.win) return this.win(r.used);
    return this.resume();
  }
  // The castle compiles whatever is in the slots, left to right, after every placement.
  evalStatement() {
    const s = this.slots, goal = this.L.goal, show = s.map(() => '');
    for (let i = 0; i < s.length; i++) {
      const c = s[i]; if (!c) continue;
      const d = c.def, left = i > 0 ? s[i - 1] : null;
      if (i === 0 && d.kind === 'op')
        return { show, err: ['CS1525', `Invalid expression term '${d.op}'. An operator needs a value on its LEFT first.`, [0]] };
      if (left && d.kind === 'operand' && left.def.kind === 'operand')
        return { show, err: ['CS1002', '"; expected". Two values side by side with no operator? That\'s not code, that\'s a shrug.', [i]] };
    }
    let n = 0; while (n < s.length && s[n]) n++;
    const filled = s.filter(Boolean).length;
    if (n === 0 || n !== filled) return { show };                 // a gap: keep building
    let type = s[0].def.type, v = s[0].def.value;
    show[0] = s[0].def.show;
    for (let i = 1; i < n; i++) {
      const op = s[i].def, r = op.rhs;
      type = (type === 'float' || r.type === 'float') ? 'float' : 'int';
      v = op.op === '+' ? v + r.value : op.op === '-' ? v - r.value : op.op === '*' ? v * r.value : op.op === '%' ? v % r.value : v / r.value;
      if (type === 'int' && op.op === '/') v = Math.trunc(v);
      show[i] = '= ' + fmt(v, type);
    }
    if (n >= 2 && v === goal.value && type === goal.type) return { show, win: true, used: n };
    const opsLeft = this.cards.some(c => c.slotIndex === null && c.def.kind === 'op');
    if (n >= 2 && (n === s.length || !opsLeft)) {
      const why = s[0].def.hint || `That makes ${fmt(v, type)}, but the goal is ${fmt(goal.value, goal.type)}.`;
      return { show, err: ['WRONG', why, [...Array(n).keys()]] };
    }
    return { show };
  }
  // Older 3-slot mode: slots 1–2 build the expression, slot 3 takes a VALUE card from a second whale wave.
  afterPlaceAnswers(idx) {
    const card = this.slots[idx], d = card.def, goal = this.L.goal;
    if (idx === 0 && d.kind === 'op')
      return this.fail('CS1525', `Invalid expression term '${d.op}'. An operator needs a value on its LEFT first.`, [0]);
    if (idx === 1 && d.kind !== 'op')
      return this.fail('CS1002', '"; expected". Two values side by side with no operator? That\'s not code, that\'s a shrug.', [1]);
    if (idx === 2 && card.kind !== 'answer')
      return this.fail('CS1002', 'Slot 3 holds the RESULT value. Build the expression in slots 1 and 2 first.', [2]);
    if (idx === 0) this.runText[0].setText(d.show);
    if (idx === 1 && !this.slots[0]) return this.resume();
    if (idx === 0 && !this.slots[1]) return this.resume();
    if (idx < 2) {
      const left = this.slots[0].def, r = this.slots[1].def.rhs;
      const opCard = this.slots[1].def;
      this.runText[0].setText(left.show);
      const type = (left.type === 'float' || r.type === 'float') ? 'float' : 'int';
      let v = opCard.op === '+' ? left.value + r.value : left.value / r.value;
      if (type === 'int' && opCard.op === '/') v = Math.trunc(v);
      this.runText[1].setText('= ' + fmt(v, type));
      if (v !== goal.value || type !== goal.type) {
        const why = left.hint || `That makes ${fmt(v, type)}, but the goal is ${fmt(goal.value, goal.type)}.`;
        return this.fail('WRONG', why, [0, 1], 'faceUpset');
      }
      [0, 1].forEach(i => { this.slots[i].locked = true; this.slots[i].check.setVisible(true); this.lights[i].setFillStyle(PAL.accent); });
      Sfx.lock();
      return this.waveTwo();
    }
    // idx === 2 : the result value (3-slot levels only)
    if (d.type === goal.type && d.value === goal.value) return this.win();
    return this.fail(d.error || 'WRONG', d.msg, [2]);
  }
  resume() { this.state = 'play'; this.updateGlow(); }
  async fail(code, msg, returnIdx, face = 'faceUpset') {
    this.state = 'checking'; this.updateGlow();
    Sfx.error();
    this.cameras.main.shake(180, 0.004);
    this.doorTag.setText('✖ ' + code).setVisible(true);
    this.lights.forEach(l => { if (l.fillColor !== PAL.accent) l.setFillStyle(PAL.error); });
    returnIdx.forEach(i => this.slots[i] && this.tweens.add({ targets: this.slots[i], angle: { from: -4, to: 4 }, duration: 60, yoyo: true, repeat: 3, onComplete: () => this.slots[i] && this.slots[i].setAngle(0) }));
    // Nurse = hint giver. Hints get stronger with each mistake on this level.
    this.mistakes++;
    const lead = ['Hmm, not quite. ', 'Again? Okay, closer look: ', 'Doctor\'s orders: '][Math.min(this.mistakes, 3) - 1];
    const tail = this.mistakes >= 2 ? '\nTry the card I\'m making glow.' : '';
    this.say(lead + msg + tail, this.mistakes === 1 ? 'faceSmirk' : face, true);
    this.setBoardBorder(PAL.error);
    await wait(this, 1700);
    this.setBoardBorder(PAL.accent);
    returnIdx.forEach(i => {
      const c = this.slots[i]; if (!c) return;
      this.slots[i] = null; c.slotIndex = null; this.runText[i].setText('');
      flyTo(this, c, c.home.x, c.home.y, 400, -70);
    });
    this.lights.forEach(l => { if (l.fillColor === PAL.error) l.setFillStyle(0x555c62); });
    this.doorTag.setVisible(false);
    await wait(this, 420);
    this.resume();
    if (this.mistakes >= 2) this.showHintCard();
  }
  showHintCard() {
    const idx = this.slots.indexOf(null);
    const id = this.L.solution && this.L.solution[idx];
    const card = this.cards.find(c => c.def.id === id && c.slotIndex === null && c.kind === (idx === 2 ? 'answer' : 'code'));
    if (card) card.setHint(true);
  }
  async waveTwo() {
    this.state = 'wave';
    this.status('Expression works! Incoming: the RESULT cards...');
    await wait(this, 500);
    await this.whaleDrop(this.L.answers, 'answer', ANS_X, ANS_Y, false);
    this.answersDropped = true;
    this.status('Last step: which VALUE matches the GOAL exactly? → slot 3');
    this.resume();
  }

  // ----- win: the castle compiled the statement -----
  tweenP(cfg) { return new Promise(r => this.tweens.add(Object.assign({}, cfg, { onComplete: r }))); }
  async showLegal() {
    await this.tweenP({ targets: this.qParts, alpha: 0, duration: 250 });
    this.setBoardBorder(PAL.gold);
    this.tabText.setText('COMPILED ✔');
    this.status('');
    Sfx.lock();
    const [code, ...notes] = this.L.legal;
    for (let i = 1; i <= code.length; i++) { this.legalCode.setText(code.slice(0, i)); if (code[i - 1] !== ' ') await wait(this, 22); }
    const note = notes.join('\n');
    for (let i = 1; i <= note.length; i++) { this.legalNote.setText(note.slice(0, i)); if (note[i - 1] !== ' ') await wait(this, 12); }
    this.status('The statement is legal. The castle compiled it.');
  }
  async win(used = 3) {
    this.state = 'win'; this.updateGlow(); this.hush(); this.clearHints();
    this.slots.forEach((c, i) => { if (!c) return; c.locked = true; c.check.setVisible(true); this.lights[i].setFillStyle(PAL.accent); });
    Sfx.lock();
    // unused lights switch on by themselves: the castle accepts the statement as complete
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
    await this.tweenP({ targets: [...this.slotParts, ...this.runText, ...this.slotGlow], alpha: 0, duration: 450 });
    // 2) the question becomes the legal statement
    await this.showLegal();
    await wait(this, 1000);
    // 3) door opens
    Sfx.door(); this.cameras.main.shake(400, 0.003);
    await this.tweenP({ targets: this.door, scaleX: 0.08, duration: 800, ease: 'Sine.InOut' });
    // 4) every card flies to the nurse's right and fans out like a hand of cards
    const hand = this.cards.filter(c => c.alpha > 0);
    const n = hand.length, fan = i => i - (n - 1) / 2;
    const off = hand.map((c, i) => ({ dx: 62 + fan(i) * 20, dy: -80 + Math.abs(fan(i)) * 5, a: fan(i) * 13 }));
    hand.forEach(c => { c.disableInteractive(); c.check.setVisible(false); c.glow.setVisible(false); c.setDepth(13); });
    Sfx.magic();
    await Promise.all(hand.map((c, i) => wait(this, i * 110).then(() => {
      const trail = this.add.particles(0, 0, 'spark', {
        follow: c, lifespan: 450, speed: { min: 10, max: 40 }, scale: { start: 0.7, end: 0 },
        tint: [PAL.accent, PAL.gold, 0xffffff], frequency: 25, blendMode: 'ADD',
      }).setDepth(12.5);
      return flyTo(this, c, this.nurse.x + off[i].dx, this.nurse.y + off[i].dy, 700, -160, { scale: 0.42, angle: off[i].a })
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
