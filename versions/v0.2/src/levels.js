// Level data: the 15 approved GAME 220 questions (content mirrors docs/question_bank.json).
//
// The castle is the compiler. The player drops cards into the slots, left to right. After
// every placement the castle reads the filled slots from slot 1 until the first gap:
//   1. a placed card with an `out` fails at once with that outcome (each decoy = one mistake)
//   2. a filled run that matches a `seq` outcome fails with that outcome
//   3. the run equals `solution` (or one in `alt`) → WIN (unused lights switch on by themselves)
//   4. the run is the start of one of them        → keep going
//   5. anything else                        → "won't compile in this order"
//
// Outcome kinds (each has its own look on the castle):
//   compile – a real C# compiler error; `tag` is the CS code
//   crash   – a runtime exception;       `tag` is the exception name
//   output  – runs, but misses the GOAL; `tag` is what it actually does
//   timeout – an infinite loop;          the castle spins and gives up
// `code` is the listing on the billboard; {1}..{4} are the slots, and each one shows the
// card placed in it. `msg` is what the nurse says. `legal` is typed on the billboard after a win (line 1 = the code).

(() => {
const compile = (tag, msg) => ({ kind: 'compile', tag, msg });
const crash = (tag, msg) => ({ kind: 'crash', tag, msg });
const output = (tag, msg) => ({ kind: 'output', tag, msg });
const timeout = (msg) => ({ kind: 'timeout', tag: 'never ends', msg });

window.LEVELS = [
  {
    title: 'Wake the Terminal', course: 'C01', slots: 3,
    given: 'public static void Main() { ? }',
    code: ["public static void Main()", "{", "    {1}{2}{3}", "}"],
    goal: 'Output:  HELLO!',
    cards: [
      { id: 'con', label: 'Console.WriteLine' },
      { id: 'msg', label: '("HELLO!")' },
      { id: 'semi', label: ';' },
      { id: 'lower', label: 'console.writeline', out: compile('CS0103', "The name 'console' does not exist. C# is case-sensitive: it's Console.WriteLine, capital C and capital W.") },
      { id: 'colon', label: ':', out: compile('CS1002', '"; expected". A colon is not a semicolon. Statements end with ;') },
    ],
    solution: ['con', 'msg', 'semi'],
    legal: ['Console.WriteLine("HELLO!");', '// The program starts in Main(). Capital C, capital W.', '// The ; ends the statement. Output: HELLO!  ✔'],
  },
  {
    title: 'Name the Hero', course: 'C01', slots: 3,
    given: "// Store the hero's name",
    code: ["// Store the hero's name", "{1} {2}{3}"],
    goal: 'the variable hero holds the name Mira',
    cards: [
      { id: 'decl', label: 'string hero =' },
      { id: 'val', label: '"Mira"' },
      { id: 'semi', label: ';' },
      { id: 'bare', label: 'Mira', out: compile('CS0103', "The name 'Mira' does not exist. Without quotes, C# thinks Mira is a variable.") },
      { id: 'single', label: "'Mira'", out: compile('CS1012', 'Too many characters in character literal. Single quotes hold ONE char. Text needs "double quotes".') },
    ],
    solution: ['decl', 'val', 'semi'],
    legal: ['string hero = "Mira";', '// Text lives in "double quotes".', "// 'M' is a char. \"Mira\" is a string.  ✔"],
  },
  {
    title: 'Start the Score', course: 'C02', slots: 3,
    given: '// line 2:  score += 10;',
    code: ["{1} {2}{3}", "score += 10;"],
    goal: 'score is 10 after line 2',
    cards: [
      { id: 'decl', label: 'int score' },
      { id: 'zero', label: '= 0' },
      { id: 'semi', label: ';' },
      { id: 'str', label: '= "0"', out: compile('CS0029', 'Cannot implicitly convert type string to int. "0" is text, 0 is a number.') },
    ],
    seq: [
      { run: ['decl', 'semi'], out: compile('CS0165', "Use of unassigned local variable 'score'. Line 2 adds 10 to... nothing. Give it a starting value.") },
    ],
    solution: ['decl', 'zero', 'semi'],
    legal: ['int score = 0;', '// score starts at 0, so line 2 makes it 10.', '// Declare AND assign before you use it.  ✔'],
  },
  {
    title: 'The Fall Check', course: 'C02', slots: 3,
    given: 'int health = 10;  int trap = 15;  health = health - trap;',
    code: ["int health = 10;", "int trap = 15;", "health = health - trap;", "{1}{2}{3}", "    Console.WriteLine(\"You fall.\");"],
    goal: 'prints  You fall.',
    cards: [
      { id: 'if', label: 'if (' },
      { id: 'lt', label: 'health < 0' },
      { id: 'le', label: 'health <= 0' },
      { id: 'close', label: ')' },
      { id: 'eq', label: 'health == 0', out: output('prints nothing', 'It runs, but track the value: 10 - 15 = -5. health is -5, not 0, so nothing prints.') },
    ],
    solution: ['if', 'lt', 'close'],
    alt: [['if', 'le', 'close']],          // either check is correct
    legal: ['if (health < 0)', '// 10 - 15 = -5. Is -5 below 0? Yes: You fall.', '// health <= 0 works too, and also catches exactly 0.  ✔'],
  },
  {
    title: 'Show the HP', course: 'C02', slots: 3,
    given: 'int hp = 10;',
    code: ["int hp = 10;", "{1}{2}{3}"],
    goal: 'Output:  HP: 10',
    cards: [
      { id: 'open', label: 'Console.WriteLine(' },
      { id: 'interp', label: '$"HP: {hp}"' },
      { id: 'close', label: ');' },
      { id: 'nodollar', label: '"HP: {hp}"', out: output('prints HP: {hp}', 'It runs, but prints HP: {hp}. Without the $ the braces are just text.') },
      { id: 'gap', label: '"HP: " hp', out: compile('CS1003', "Syntax error, ',' expected. Join text and values with + or use $\"...\".") },
    ],
    solution: ['open', 'interp', 'close'],
    legal: ['Console.WriteLine($"HP: {hp}");', '// The $ turns {hp} into the value of hp.', '// Output: HP: 10  ✔'],
  },
  {
    title: 'Count the Gold', course: 'C02', slots: 3,
    given: 'int a = 1;   int b = 2;',
    code: ["int a = 1;", "int b = 2;", "{1}{2}{3}"],
    goal: 'Output:  Gold: 3',
    cards: [
      { id: 'open', label: 'Console.WriteLine(' },
      { id: 'paren', label: '"Gold: " + (a + b)' },
      { id: 'close', label: ');' },
      { id: 'glue', label: '"Gold: " + a + b', out: output('prints Gold: 12', 'It runs, but prints Gold: 12. Once text is on the left, every + glues text. Add the numbers first.') },
      { id: 'minus', label: '"Gold: " - (a + b)', out: compile('CS0019', "Operator '-' cannot be applied to operands of type string and int.") },
    ],
    solution: ['open', 'paren', 'close'],
    legal: ['Console.WriteLine("Gold: " + (a + b));', '// ( ) runs first: 1 + 2 = 3, then glue the text.', '// Output: Gold: 3  ✔'],
  },
  {
    title: 'Leftover Potions', course: 'C02', slots: 3,
    given: 'int potions = 7;   // split between 2 players',
    code: ["int potions = 7;   // split between 2 players", "{1} {2}{3}"],
    goal: 'left is 1',
    cards: [
      { id: 'decl', label: 'int left =' },
      { id: 'mod', label: 'potions % 2' },
      { id: 'semi', label: ';' },
      { id: 'div', label: 'potions / 2', out: output('left is 3', 'It runs, but left is 3. That is how many EACH player gets. int division drops the remainder.') },
      { id: 'sub', label: 'potions - 2', out: output('left is 5', 'It runs, but left is 5. We want what is left over after sharing.') },
    ],
    solution: ['decl', 'mod', 'semi'],
    legal: ['int left = potions % 2;', '// 7 / 2 = 3 each.  7 % 2 = 1 left over.', '// % gives the remainder.  ✔'],
  },
  {
    title: 'Only the Living Heal', course: 'C02', slots: 3,
    given: 'int hp = 0;',
    code: ["int hp = 0;", "{1}", "    {2} {3}"],
    goal: 'Heal() runs only when hp > 0',
    cards: [
      { id: 'if', label: 'if (hp > 0)' },
      { id: 'heal', label: 'Heal();' },
      { id: 'semi', label: ';', out: output('Heal() always runs', 'It compiles (warning CS0642), but that ; ends the if. Heal() now runs every time, even at hp 0.') },
      { id: 'assign', label: 'if (hp = 0)', out: compile('CS0029', 'Cannot implicitly convert type int to bool. Use == or > to compare.') },
    ],
    solution: ['if', 'heal'],
    legal: ['if (hp > 0) Heal();', '// No ; after the if, so Heal() belongs to it.', '// hp is 0, so Heal() is skipped.  ✔'],
  },
  {
    title: 'The Menu That Fell Through', course: 'C03', slots: 3,
    given: 'switch (key) {\n  // case \'D\': Defend(); break;',
    code: ["switch (key)", "{", "  {1} {2} {3}", "  case 'D': Defend(); break;", "}"],
    goal: "if key is the character 'A', runs Attack() and stops",
    cards: [
      { id: 'case', label: "case 'A':" },
      { id: 'atk', label: 'Attack();' },
      { id: 'brk', label: 'break;' },
      { id: 'next', label: "case 'D':", out: compile('CS0163', "Control cannot fall through from one case label ('A') to another. End each case with break;") },
      { id: 'cont', label: 'continue;', out: output('menu repeats', 'It compiles inside the menu loop, but jumps straight back to the menu instead of ending the turn.') },
    ],
    solution: ['case', 'atk', 'brk'],
    legal: ["case 'A': Attack(); break;", '// break; ends the case.', '// C# never falls through to the next case.  ✔'],
  },
  {
    title: "The Healer's Promise", course: 'C03', slots: 4,
    given: 'int Heal(int hp) {\n  // ?\n}',
    code: ["int Heal(int hp)", "{", "    {1} {2} {3} {4}", "}"],
    goal: 'Heal(20) returns 30',
    cards: [
      { id: 'ret', label: 'return' },
      { id: 'hp', label: 'hp' },
      { id: 'plus', label: '+ 10;' },
      { id: 'print', label: 'Console.WriteLine(hp + 10);', out: compile('CS0161', "'Heal': not all code paths return a value. Printing is not returning.") },
      { id: 'minus', label: '- 10;', out: output('returns 10', 'It runs, but Heal(20) returns 10. A healer should ADD health.') },
    ],
    solution: ['ret', 'hp', 'plus'],
    legal: ['return hp + 10;', '// int Heal promises an int. return keeps the promise.', '// Heal(20) returns 30.  ✔'],
  },
  {
    title: 'The Endless Shop', course: 'C03', slots: 4,
    given: 'int gold = 0;  while (gold < 100) { ? }',
    code: ["int gold = 0;", "while (gold < 100)", "{", "    {1} {2} {3} {4}", "}"],
    goal: 'the loop ends with gold = 100',
    cards: [
      { id: 'gold', label: 'gold' },
      { id: 'add', label: '+= 10;' },
      { id: 'sub', label: '-= 10;', out: timeout('Infinite loop! gold goes DOWN: 0, -10, -20… It will never reach 100.') },
      { id: 'plus', label: '+ 10;', out: compile('CS0201', 'Only assignment, call, increment… can be used as a statement. gold + 10 works out a number, then throws it away.') },
      { id: 'print', label: 'Console.WriteLine(gold);', out: timeout('Infinite loop! The body never changes gold, so gold < 100 stays true forever.') },
    ],
    solution: ['gold', 'add'],
    legal: ['gold += 10;', '// Each pass adds 10: 10, 20 … 100.', '// At 100, gold < 100 is false and the loop ends.  ✔'],
  },
  {
    title: 'Take the Hit', course: 'C05', slots: 4,
    given: 'Player player = new Player();',
    code: ["Player player = new Player();", "{1}{2}{3}{4}"],
    goal: 'player loses 15 hp',
    cards: [
      { id: 'obj', label: 'player' },
      { id: 'call', label: '.TakeDamage(15)' },
      { id: 'semi', label: ';' },
      { id: 'cls', label: 'Player', out: compile('CS0120', 'An object reference is required. Player is the CLASS (the blueprint). player is your hero.') },
      { id: 'two', label: 'TakeDamage(player, 15)', out: compile('CS1501', "No overload for method 'TakeDamage' takes 2 arguments. Ask the object: player.TakeDamage(15).") },
    ],
    solution: ['obj', 'call', 'semi'],
    legal: ['player.TakeDamage(15);', '// object . method ( argument )', '// The hero takes the hit.  ✔'],
  },
  {
    title: 'The Hit That Did Nothing', course: 'C05', slots: 4,
    given: 'class Player {  int hp = 30;\n  void TakeDamage(int amount) { ? }  }',
    code: ["class Player", "{", "    int hp = 30;", "    void TakeDamage(int amount)", "    {", "        {1} {2} {3} {4}", "    }", "}"],
    goal: 'hp is 20 after TakeDamage(10)',
    cards: [
      { id: 'set', label: 'hp =' },
      { id: 'sub', label: 'hp - amount;' },
      { id: 'decl', label: 'int hp =', out: compile('CS0165', "Use of unassigned local variable 'hp'. int makes a NEW hp that hides the field.") },
      { id: 'amt', label: 'amount;', out: output('hp becomes 10', 'It runs, but hp = amount REPLACES the health. It should go down by amount.') },
    ],
    solution: ['set', 'sub'],
    legal: ['hp = hp - amount;', '// No int: this updates the field.', '// 30 - 10 = 20.  ✔'],
  },
  {
    title: 'Count the Loot', course: 'C06', slots: 4,
    given: 'string[] items = { "Torch", "Rope", "Key" };',
    code: ["string[] items = { \"Torch\", \"Rope\", \"Key\" };", "{1} {2} {3}", "    {4}"],
    goal: 'prints  Torch, Rope, Key',
    cards: [
      { id: 'init', label: 'for (int i = 0;' },
      { id: 'test', label: 'i < items.Length;' },
      { id: 'step', label: 'i++)' },
      { id: 'body', label: 'Console.WriteLine(items[i]);' },
      { id: 'lte', label: 'i <= items.Length;', out: crash('IndexOutOfRangeException', 'Runtime crash! i reaches 3, and items[3] does not exist. The last index is Length - 1.') },
    ],
    solution: ['init', 'test', 'step', 'body'],
    legal: ['for (int i = 0; i < items.Length; i++) Console.WriteLine(items[i]);', '// i = 0, 1, 2. It stops before 3 (items.Length).', '// Output: Torch, Rope, Key  ✔'],
  },
  {
    title: 'The Empty Room', course: 'C07', slots: 4,
    given: 'class World {  Room inn;\n  void Start() { ? }  }',
    code: ["class World", "{", "    Room inn;", "    void Start() {", "        {1}", "        {2} {3} {4}", "    }", "}"],
    goal: 'the world\'s inn is named "Inn"',
    cards: [
      { id: 'make', label: 'inn = new Room();' },
      { id: 'name', label: 'inn.Name = "Inn";' },
      { id: 'local', label: 'Room inn = new Room();', out: output('world.inn is still null', "It runs, but Room inn makes a NEW local inn. The world's inn field is still null.") },
      { id: 'type', label: 'inn = Room;', out: compile('CS0119', "'Room' is a type, which is not valid here. Build one: new Room().") },
    ],
    seq: [
      { run: ['name'], out: crash('NullReferenceException', 'Runtime crash! inn is still null on that line. Build the room BEFORE you name it.') },
    ],
    solution: ['make', 'name'],
    legal: ['inn = new Room();  inn.Name = "Inn";', '// new builds the room first, then we can name it.', '// Order matters.  ✔'],
  },
];
})();
