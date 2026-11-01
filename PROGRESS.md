# Whale Rider: Code Quest — Progress

## 2026-10-31 (card layout)
- Accomplished: redesigned to match Wan's sketch. Every card is the same portrait size (90×136), with the code shrunk and wrapped to fit without splitting words. Card-sized answer slots stand beside the castle; the dealt cards stand in a row to their right.
- Accomplished: the billboard is bigger (800×322) and stands behind the castle, with all content right of the tower. It shows the code listing with numbered blanks ①–④; a card dropped in a slot turns its blank into that code. Failing cards turn the outcome color, and on a win the listing becomes the plain compiled program plus a WHY note.
- Accomplished: an art drop-in. Put game/art/<texture>.png and run tools/build_art.py; drawn stand-ins are used only for what's missing (game/art/README.md lists the names and sizes). Tested with dummy art.
- Verified: an automated playthrough of all 15 levels, no console errors.
- Next: Wan playtests; freeze as v0.1; final art.

## 2026-10-31 (v0.1 build)
- Accomplished: the live game now plays all 15 approved GAME 220 questions. Each decoy card has its own outcome, each with its own look: compile error (red, CS code), runtime crash (orange flash and big shake), wrong result (blue), timeout (purple chasing lights). Some questions also have a sequence outcome (Q3 CS0165, Q10 "returns 20", Q15 NullReferenceException), and a wrong order gets "won't compile".
- Accomplished: cards are as wide as their code. The slot row grows like a line of code. Dealt cards wait in a tray on the ground. The billboard is bigger, with multi-line GIVEN. There are 3 or 4 slots and lights per level.
- Verified: an automated playthrough of all 15 levels (a decoy, the sequence outcomes and the solution each) plus a real mouse-drag run, with no console errors. All 15 are marked Tested on the Build Board.
- Next: Wan playtests the live build; then freeze it with `python3 tools/bump_version.py 0.1 …`; nurse art is still blocked.

## 2026-10-31 (review round 1)
- Accomplished: Wan approved Q1–Q12 and Q14. Q13 and Q15 were rewritten as 2-card answers with 2 decoys each (4 slots): Q13 `hp =` › `hp - amount;` (decoys `int hp =`, `amount;`), Q15 `inn = new Room();` › `inn.Name = "Inn";` (decoys `Room inn = new Room();`, `inn = Room;`).
- Decisions: Q15 was set back to Needs review because its cards changed. The board holds approval status; docs/question_bank.json holds the content.
- Next: approve Q13 and Q15; build v0.1.

## 2026-10-31 (approval buttons)
- Accomplished: each question on the Build Board now has an Approve button (with Undo), and the bank header counts how many are approved. The status dropdown is gone.
- Decisions: Wan only approves. Built and Tested are set by Claude: Built once a question is in the live game, Tested once the automated playthrough passes.
- Next: approve questions on the board; v0.1 builds the approved ones.

## 2026-10-31 (question bank)
- Accomplished: picked the 15 beginner C# mistakes that fit the current 3-slot token cards and wrote them as Q1–Q15, in GAME 220 class order (C01–C07). Each has GIVEN, GOAL, the solution cards and 2 decoys with the real C# result. Saved in docs/question_bank.json; replaced the 9 old puzzle cards on the Build Board and updated its format panel and findings.
- Decisions: every decoy result is real C# behaviour (compile error code, runtime crash or wrong output). Dropped ideas that need line or file cards for now.
- Update: from Q10 on, answers take 2–4 cards in 4 slots / 4 lights (Q10 4, Q11 2, Q12 3, Q13 4, Q14 4, Q15 2 with order as the puzzle), so players can't guess the length.
- Next: review Q1–Q15 on the board; then v0.1 = a per-question outcome evaluator, crash and timeout looks, a 2-line GIVEN, and the levels loaded from the bank.

## 2026-10-31 (versions)
- Accomplished: the root index.html is now a version launcher. LIVE opens game/ (the working build); each frozen version opens its own copy. The title screen shows the version number and has an "◀ ALL VERSIONS" link back to the launcher.
- Accomplished: froze the current game as v0.0, "Phase 1: the castle compiler" (versions/v0.0/, commit 6cf0844). Checked in a browser: v0.0 and LIVE both start and play, the back link works, no errors.
- Decisions: snapshots are full copies of game/, so later edits never change them. tools/bump_version.py takes the version number explicitly. The shared bump-version skill is Dropbox online-only on this Mac and assumes a different layout, so this project has its own script.
- Next: lock the 10 GAME 220 questions and build v0.1 in game/; when done, run `python3 tools/bump_version.py 0.1 "…" "…"`.

## 2026-10-31 (GAME 220 review)
- Accomplished: checked the game against GAME220UNITY (course outline, voice guide, the LEARN // C# study app) and proposed 10 questions built from the course's "break it live" demos (C01–C15), using a text-adventure setting.
- Decisions (proposed, not yet confirmed): retire the float Levels 1–2, since float, int.Parse, Dictionary and Stack/Queue are all outside the GAME 220 ceiling. Use a larger billboard that shows code with blanks ①②③. Use three card shapes (token, line, file). Each question lists its own outcomes (compile error / runtime crash / wrong output / win) in place of the arithmetic evaluator. Share the nurse voice with LEARN // C#.
- Next: Wan to confirm the 10 questions; then replace the build board's puzzle plan, rebuild the evaluator around per-question outcomes, and build the code-panel billboard and the line/file cards. Commit f10991f is still unpushed. The nurse art is still blocked.

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
