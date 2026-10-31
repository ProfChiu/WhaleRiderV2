// Stand-in art, drawn in code. Mostly grey; teal accent guides the player.
window.PAL = {
  accent: 0x19c3c3, accentHex: '#19c3c3',
  error: 0xe5484d, errorHex: '#e5484d',
  gold: 0xf5c542, goldHex: '#f5c542',
  ink: 0x2b2f33, inkHex: '#2b2f33',
  hud: 0x2f3439,
  cardFace: 0xeef1f3, cardBack: 0x4a5056,
  slot: 0x6b737a,
  sky1: 0xdfe3e6, sky2: 0xb9c0c5,
  hillFar: 0xc6cbcf, hillMid: 0xa9b0b5,
  tree: 0x89928f, treeDark: 0x737c79,
  ground: 0x8f9893, groundDark: 0x7c8580,
  stone: 0x9aa1a7, stoneDark: 0x6f767c,
};

window.buildTextures = function (scene) {
  const P = window.PAL;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });

  // ---- Whale (faces LEFT, like the sketch: pointed snout, teeth, big eye) ----
  g.clear();
  g.lineStyle(4, 0x3a3f44, 1);
  // tail flukes
  g.fillStyle(0x6f787f, 1);
  g.fillTriangle(500, 118, 556, 48, 540, 120);
  g.fillTriangle(500, 118, 556, 196, 540, 116);
  g.strokeTriangle(500, 118, 556, 48, 540, 120);
  g.strokeTriangle(500, 118, 556, 196, 540, 116);
  // tail stock
  g.fillStyle(0x7d868d, 1);
  g.fillPoints([{ x: 380, y: 82 }, { x: 512, y: 108 }, { x: 512, y: 128 }, { x: 380, y: 168 }], true);
  // body
  g.fillEllipse(260, 124, 400, 156);
  // snout
  g.fillPoints([{ x: 22, y: 118 }, { x: 110, y: 66 }, { x: 120, y: 176 }], true);
  // belly
  g.fillStyle(0xbcc3c8, 1);
  g.fillEllipse(250, 162, 330, 62);
  g.fillPoints([{ x: 30, y: 124 }, { x: 110, y: 140 }, { x: 110, y: 176 }], true);
  // outline
  g.strokeEllipse(260, 124, 400, 156);
  g.lineBetween(22, 118, 106, 64);
  // mouth + teeth
  g.lineStyle(3, 0x2b2f33, 1);
  g.lineBetween(30, 128, 140, 140);
  g.fillStyle(0xffffff, 1);
  for (let i = 0; i < 6; i++) {
    const x = 42 + i * 16, y = 129 + i * 1.3;
    g.fillTriangle(x, y, x + 10, y + 1, x + 5, y + 10);
  }
  // pectoral fin
  g.fillStyle(0x6f787f, 1);
  g.fillTriangle(220, 176, 320, 182, 300, 238);
  g.lineStyle(4, 0x3a3f44, 1);
  g.strokeTriangle(220, 176, 320, 182, 300, 238);
  // eye
  g.fillStyle(0xffffff, 1); g.fillCircle(118, 104, 15);
  g.lineStyle(3, 0x2b2f33, 1); g.strokeCircle(118, 104, 15);
  g.fillStyle(0x1e2226, 1); g.fillCircle(113, 105, 8);
  g.fillStyle(0xffffff, 1); g.fillCircle(110, 101, 3);
  // gill lines
  g.lineStyle(2, 0x5b636a, 1);
  for (let i = 0; i < 3; i++) g.lineBetween(160 + i * 12, 96, 154 + i * 12, 140);
  g.generateTexture('whale', 560, 244);

  // ---- Card back ----
  g.clear();
  g.fillStyle(P.cardBack, 1); g.fillRoundedRect(0, 0, 104, 140, 10);
  g.lineStyle(3, 0x2f3439, 1); g.strokeRoundedRect(1.5, 1.5, 101, 137, 10);
  g.lineStyle(2, P.accent, 0.8); g.strokeRoundedRect(10, 10, 84, 120, 6);
  g.generateTexture('cardBack', 104, 140);

  // ---- Confetti + spark ----
  g.clear(); g.fillStyle(0xffffff, 1); g.fillRect(0, 0, 10, 14);
  g.generateTexture('confetti', 10, 14);
  g.clear(); g.fillStyle(0xffffff, 1); g.fillCircle(6, 6, 6);
  g.generateTexture('spark', 12, 12);

  // ---- Tree ----
  g.clear();
  g.fillStyle(P.treeDark, 1); g.fillRect(52, 120, 16, 70);
  g.fillStyle(P.tree, 1);
  g.fillCircle(60, 70, 46); g.fillCircle(30, 100, 32); g.fillCircle(90, 100, 32);
  g.fillStyle(0x9ba39f, 1); g.fillCircle(48, 58, 18);
  g.generateTexture('tree', 120, 190);

  // ---- Pine ----
  g.clear();
  g.fillStyle(P.treeDark, 1); g.fillRect(34, 150, 12, 40);
  g.fillStyle(0x7f8885, 1);
  g.fillTriangle(40, 0, 0, 80, 80, 80);
  g.fillTriangle(40, 40, -6, 130, 86, 130);
  g.fillTriangle(40, 80, -12, 160, 92, 160);
  g.generateTexture('pine', 80, 190);

  // ---- Cloud ----
  g.clear(); g.fillStyle(0xf4f6f7, 0.9);
  g.fillEllipse(70, 40, 120, 44); g.fillEllipse(45, 30, 60, 40); g.fillEllipse(95, 26, 70, 42);
  g.generateTexture('cloud', 140, 70);

  // ---- Castle tower (door hole cut as dark arch) ----
  g.clear();
  const TW = 200, TH = 330;
  g.fillStyle(P.stone, 1); g.fillRect(10, 40, TW - 20, TH - 40);
  for (let i = 0; i < 5; i++) g.fillRect(10 + i * 38, 0, 26, 44);   // crenellations
  g.lineStyle(2, P.stoneDark, 0.7);
  for (let row = 0; row < 9; row++) {
    const y = 60 + row * 30;
    g.lineBetween(10, y, TW - 10, y);
    for (let c = 0; c < 5; c++) {
      const x = 10 + c * 40 + (row % 2 ? 20 : 0);
      if (x < TW - 10) g.lineBetween(x, y, x, y + 30);
    }
  }
  g.lineStyle(4, 0x4f565c, 1); g.strokeRect(10, 40, TW - 20, TH - 40);
  // door arch (dark interior)
  g.fillStyle(0x1b1e21, 1);
  g.fillRect(52, 200, 96, 130); g.fillCircle(100, 200, 48);
  g.lineStyle(5, 0x4f565c, 1);
  g.strokeCircle(100, 200, 50);
  g.generateTexture('tower', TW, TH);

  // ---- Door panel (separate so it can swing open) ----
  g.clear();
  g.fillStyle(0x5c636a, 1);
  g.slice(48, 48, 48, Math.PI, 0, false); g.fillPath();
  g.fillRect(0, 48, 96, 130);
  g.lineStyle(2, 0x41474c, 1);
  for (let x = 16; x < 96; x += 16) g.lineBetween(x, 6, x, 178);
  g.fillStyle(0x3a3f44, 1); g.fillRect(0, 70, 96, 8); g.fillRect(0, 140, 96, 8);
  g.fillStyle(0x2b2f33, 1); g.fillCircle(80, 112, 5);
  g.generateTexture('door', 96, 178);

  g.destroy();
};
