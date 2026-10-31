# Whale Rider: Code Quest — Progress

## 2026-10-31 (repo)
- Accomplished: git repo initialised; first commit pushed to the public GitHub repo https://github.com/ProfChiu/WhaleRiderV2 (main).
- Decisions: assets/nurse/ is gitignored (generated). src/nurse_assets.js embeds the nurse art once built, so committing it later makes that art public.
- Next: unchanged (nurse art, color pick, Levels 3–5).

## 2026-10-31 (3 slots, auto light)
- Accomplished: back to 3 question slots and 3 castle lights on every level. The castle checks the slots left to right after each placement; the moment they form a legal statement equal to the GOAL it wins, even with slot 3 empty, and any unused light switches on by itself with a flash and chime.
- Decisions: players aren't told how many cards a statement needs (harder). A wrong result fails when all 3 slots are full or no unused operator card could still fix it; CS1525 / CS1002 fire immediately.
- Next: unchanged (nurse art, color pick, Levels 3–5).

## 2026-10-31 (castle = compiler)
- Accomplished: Levels 1–2 are now 2-slot statements; the castle compiles them, so there is no second whale wave. 3-slot levels still work if a level defines `answers`.
- Accomplished: new win sequence: slots fade → billboard types "COMPILED ✔" + the legal statement and why → door opens → all cards fly (sparkle trail) into a fanned hand at the nurse's right → she walks into the castle with it → success dialog + jingle → "LEVEL N" banner → question pops onto the castle → whale arrives.
- Decisions: each level carries a `legal` block (statement + 2 comment lines) in src/levels.js. The whale carries only the cards it drops.
- Next: nurse art; color pick; author Levels 3–5 as 2-slot statements with legal blocks.

## 2026-10-31 (drag feel)
- Accomplished: rebuilt dragging. Pressing a card lifts it (rises 16 px, scales up, shadow), it glides after the mouse, snaps into an empty slot when it comes within ~90 px, and lands on release. A drop anywhere else sends it home; a plain click still places it in the next slot.
- Fixed: the card hit areas were offset up-left (Phaser container hit areas are top-left based), so only the card centre responded. This was the main reason dragging felt broken.
- Next: unchanged (nurse art, color pick, Levels 3–5).

## 2026-10-31 (build board)
- Accomplished: published the Build Board artifact (https://claude.ai/artifact/5Khp6dEBgVPju7PCTWZB5M). It has 4 phases, an art review + 30-row asset tracker (status, notes, final-art preview upload), 4 color variations drawn as Level 1 mock-ups with WCAG contrast checks and a "Choose this" pick, and a puzzle review + 9-level plan.
- Decisions: board data lives in the artifact's database, so status changes and art uploads persist. Labels on cards and the billboard stay live text (no baked text in art).
- Next: pick a color direction on the board; deliver nurse walk/ride/jump/point poses; build Levels 3–5 on the current engine (L4 = the required-cast level).

## 2026-10-31 (later)
- Accomplished: the question (GIVEN + GOAL + a status line) moved from the HUD onto a billboard on the castle roof. It flashes red on a mistake and gold on a win. Cards can be dragged onto any slot; click still sends a card to the next empty slot; dragging a placed card back out works.
- Accomplished: the nurse now speaks only to give hints on mistakes. 1st mistake: the error plus why. 2nd+: a stronger hint, and the correct card gets a pulsing glow with a bouncing ▼ arrow. Level data gained `solution` ids for this.
- Fixed: the asset script now writes to a temp file and swaps it in at the end. A stalled Dropbox download had left nurse_assets.js half-written and broken the game.
- Still blocked: NURSE PNGs won't download, even after restarting fileproviderd. A stick-nurse stand-in is still in use.
- Next: Make Available Offline on _ASSETS/Characters/NURSE, run tools/build_nurse_assets.sh, set the walk direction; real Level 2+ puzzles.

## 2026-10-31
- Accomplished: Phase 1 playable in Phaser 3 (open index.html). Title → whale flies in right-to-left carrying the nurse and 6 cards → drops 3 CODE cards, nurse jumps down → player clicks cards into slots 1→2→3 → whale makes a second pass with 3 VALUE cards → right answer opens the castle door, cards shrink to icons, nurse walks left into the door → confetti + jingle win overlay → Level 2 (stub: int division) → loops. Scripted playthrough verified with no console errors.
- Decisions: layout follows Wan's sketches (castle door on the LEFT, slots beside it, nurse on the right); two card waves; GIVEN/GOAL in the top HUD; click to place; grey palette with a teal accent, red for errors, gold for the win; ground, whale, music and confetti generated in code.
- Decisions: Level 1 = (float)a → + b → 3.5f. Decoys: (int)b (loses the .5), operator first (CS1525), 3 (int), 3.5 (CS0664, a double literal into a float). Levels are data in src/levels.js.
- Note: in real C#, int + float compiles fine (implicit widening). The puzzle never claims it doesn't; its errors are all real C# behaviour.
- Blocked: the NURSE PNGs are Dropbox online-only and won't download from the terminal, so a white stick-nurse stand-in is used. Fix: make _ASSETS/Characters/NURSE available offline, then run tools/build_nurse_assets.sh.
- Next: run the nurse asset script; check which way the walk sprite faces (NURSE_WALK_FACES_RIGHT); swap in the real WhaleRider whale; design real Level 2+ puzzles.
