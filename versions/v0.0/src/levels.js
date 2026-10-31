// Level data. The castle is the compiler. There are always 3 slots; the player builds
// a statement left to right (operand, then operators) and the castle checks it after
// every placement. The moment it is legal and equals the GOAL, the door opens; any
// unused slot's light switches on by itself. A statement may need only 2 cards.
//   answers – optional: older mode where slot 3 takes a VALUE card from a 2nd whale wave
//   legal   – shown on the billboard after a win: line 1 = the statement, rest = why it's legal
//   hint    – what the nurse says when that card causes a wrong result
window.LEVELS = [
  {
    title: 'Int meets Float',
    solution: ['castA', 'plusB'],
    given: 'int a = 2;   float b = 1.5f;',
    goal: { type: 'float', value: 3.5, label: 'float result = 3.5f' },
    code: [
      { id: 'castA', kind: 'operand', label: '(float)a', type: 'float', value: 2,
        show: '2.0f', hint: '' },
      { id: 'castB', kind: 'operand', label: '(int)b', type: 'int', value: 1,
        show: '1', hint: '(int)b chops 1.5 down to 1. That .5 is gone forever. Cast the INT up instead.' },
      { id: 'plusB', kind: 'op', label: '+ b', op: '+', rhs: { type: 'float', value: 1.5 }, hint: '' },
    ],
    legal: [
      'float result = (float)a + b;',
      '// (float)a → 2.0f,  2.0f + 1.5f = 3.5f',
      '// float + float = float  ✔ legal',
    ],
    win: 'Compiled! 3.5f, and not a single decimal lost.',
  },
  {
    // Stub level 2: proves the loop. Same engine, new data.
    title: 'Integer Division',
    solution: ['castA', 'divB'],
    given: 'int a = 7;   int b = 2;',
    goal: { type: 'float', value: 3.5, label: 'float result = 3.5f' },
    code: [
      { id: 'castA', kind: 'operand', label: '(float)a', type: 'float', value: 7,
        show: '7.0f', hint: '' },
      { id: 'rawA', kind: 'operand', label: 'a', type: 'int', value: 7,
        show: '7', hint: 'int / int = int. 7 / 2 gives 3, and the .5 gets dropped. Cast first!' },
      { id: 'divB', kind: 'op', label: '/ b', op: '/', rhs: { type: 'int', value: 2 }, hint: '' },
    ],
    legal: [
      'float result = (float)a / b;',
      '// (float)a → 7.0f,  7.0f / 2 = 3.5f',
      '// float / int = float division  ✔ legal',
    ],
    win: 'Cast first, divide second. Textbook recovery!',
  },
];
