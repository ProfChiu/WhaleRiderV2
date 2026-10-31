# Whale Rider: Code Quest

A small browser card-puzzle game for learning C#, data structures and programming basics.

A whale flies in carrying the nurse and a handful of code cards. Drag the cards into the
castle's three slots to build a C# statement that reaches the GOAL on the castle billboard.
The castle is the compiler: a legal statement opens the door, and a wrong one gets the real
compiler error (CS1525, CS1002, CS0664…) plus a hint from the nurse.

## Play
Open `index.html` in a browser (Phaser 3 loads from a CDN, so an internet connection is needed).

## Files
- `src/levels.js`: level data (given code, goal, cards, hints, the "legal" explanation)
- `src/scenes.js`: game scenes: title, level, win overlay
- `src/art.js`: stand-in art drawn in code (grey palette, teal accent)
- `tools/build_nurse_assets.sh`: embeds the nurse mascot art into `src/nurse_assets.js`
- `PROGRESS.md`: dated build log
