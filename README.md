# Whale Rider: Code Quest

A small browser card-puzzle game for learning C#, data structures and programming basics.

A whale flies in carrying the nurse and a handful of code cards. Drag the cards into the
castle's slots to finish the code on the castle billboard so it meets the GOAL. The castle is
the compiler: correct code opens the door. A decoy gets what real C# would do (a compiler error
such as CS0103, a runtime crash such as NullReferenceException, the wrong output, or an endless
loop), plus a hint from the nurse. The 15 levels follow the beginner mistakes taught in GAME 220.

## Play
Open `index.html` in a browser and pick a version: LIVE (the build in progress) or any
frozen version (v0.0, v0.1, …). Phaser 3 loads from a CDN, so an internet connection is needed.

## Versions
- `game/` is the live build: edit this one.
- `versions/vX.Y/` are frozen, self-contained copies. Never edit them.
- To freeze the live build as a new version (after committing):
  `python3 tools/bump_version.py 0.1 "Short title" "One or two sentences on what changed."`
  This copies `game/`, stamps the version number on its title screen and adds it to the launcher.

## Files
- `index.html`: version launcher (reads `versions/manifest.js`)
- `game/src/levels.js`: the 15 levels: given code, goal, cards, each decoy's outcome, the "legal" explanation
- `game/src/scenes.js`: game scenes: title, level, win overlay
- `game/src/art.js`: stand-in art drawn in code (grey palette, teal accent)
- `tools/build_nurse_assets.sh`: embeds the nurse mascot art into `game/src/nurse_assets.js`
- `docs/question_bank.json`: the reviewed question bank the levels are built from
- `tools/bump_version.py`: freezes `game/` as `versions/vX.Y/`
- `PROGRESS.md`: dated build log
