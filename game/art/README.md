# Final art drop-in

Put an image here named after the texture it replaces, then run
`python3 tools/build_art.py`. Anything not here is drawn in code as a stand-in, so
art can arrive one piece at a time. Text (code, labels, questions) is always live
text drawn on top, so never bake words into the art.

| File name | What it is | Size (px) | Notes |
|---|---|---|---|
| `background.png` | sky, hills and trees behind everything | 1280 × 560 | replaces the drawn sky, hills and trees |
| `ground.png` | the grass strip | 1280 × 160 | replaces the drawn ground |
| `tower.png` | the castle (the compiler) | 200 × 330 | the door opening sits at x 52–148, y 152–330 |
| `door.png` | the castle door | 96 × 178 | squashes sideways to open |
| `board.png` | the question billboard | 800 × 322 | stretched to fit; keep the right ~650 px plain, code is drawn there |
| `cardFront.png` | the face of every code card | 90 × 136 (or 2×: 180 × 272) | keep the middle plain, code is drawn on it |
| `cardBack.png` | the back of every card | 90 × 136 (or 2×) | |
| `slot.png` | an empty answer slot | 98 × 144 (or 2×) | |
| `whale.png` | the whale, facing LEFT | 560 × 244 | |
| `tree.png`, `pine.png`, `cloud.png` | scenery pieces | 120 × 190, 80 × 190, 140 × 70 | used only when there is no `background.png` |
| `confetti.png`, `spark.png` | win-screen particles | 10 × 14, 12 × 12 | |

The nurse is separate: see `tools/build_nurse_assets.sh`.
