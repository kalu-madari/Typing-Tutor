export const krutidev010Layout = {
  id: 'krutidev010',
  name: 'Kruti Dev 010',
  type: 'legacy', // legacy = requires font mapping, unicode = standard rendering
  fontFamily: 'KrutiDev010, sans-serif',
  
  // For the typing engine: Given a character from the lesson text, what key(s) does the user need to press?
  // In KrutiDev, the lesson text is stored as English characters (e.g., 'k' renders as 'क').
  // So the user simply needs to press 'k'.
  getExpectedKeys: function(targetChar) {
    if (targetChar === '\n') return ['Enter'];

    const allKeys = this.keyboardMap.flat();
    
    // If it matches a base key
    const directMatch = allKeys.find(k => k.key === targetChar);
    if (directMatch) return [targetChar];
    
    // If it matches a shift state character
    const shiftMatch = allKeys.find(k => k.shiftDisplay === targetChar && k.shiftDisplay !== k.display);
    if (shiftMatch) {
      // Always use opposite hand shift
      const isLeftHand = shiftMatch.finger.startsWith('left-');
      const shiftKey = isLeftHand ? 'ShiftRight' : 'ShiftLeft';
      return [targetChar, shiftMatch.key, shiftKey];
    }
    
    return [targetChar];
  },
  
  // For the Virtual Keyboard: Defines the layout and what each key displays
  keyboardMap: [
    // Row 1 (Numbers)
    [
      { key: '`', display: '`', shiftDisplay: '~', finger: 'left-pinky' },
      { key: '1', display: '1', shiftDisplay: '!', finger: 'left-pinky' },
      { key: '2', display: '2', shiftDisplay: '@', finger: 'left-ring' },
      { key: '3', display: '3', shiftDisplay: '#', finger: 'left-middle' },
      { key: '4', display: '4', shiftDisplay: '$', finger: 'left-index' },
      { key: '5', display: '5', shiftDisplay: '%', finger: 'left-index' },
      { key: '6', display: '6', shiftDisplay: '^', finger: 'right-index' },
      { key: '7', display: '7', shiftDisplay: '&', finger: 'right-index' },
      { key: '8', display: '8', shiftDisplay: '*', finger: 'right-middle' },
      { key: '9', display: '9', shiftDisplay: '(', finger: 'right-ring' },
      { key: '0', display: '0', shiftDisplay: ')', finger: 'right-pinky' },
      { key: '-', display: '-', shiftDisplay: '_', finger: 'right-pinky' },
      { key: '=', display: '=', shiftDisplay: '+', finger: 'right-pinky' },
      { key: 'Backspace', display: 'Backspace', shiftDisplay: 'Backspace', finger: 'right-pinky', width: '88px', labelStyle: { fontSize: '11px', alignSelf: 'flex-end', padding: '4px' } }
    ],
    // Row 2 (Top Row)
    [
      { key: 'Tab', display: 'Tab', shiftDisplay: 'Tab', finger: 'left-pinky', width: '64px', labelStyle: { fontSize: '11px', alignSelf: 'flex-start', padding: '4px' } },
      { key: 'q', display: 'q', shiftDisplay: 'Q', finger: 'left-pinky' },
      { key: 'w', display: 'w', shiftDisplay: 'W', finger: 'left-ring' },
      { key: 'e', display: 'e', shiftDisplay: 'E', finger: 'left-middle' },
      { key: 'r', display: 'r', shiftDisplay: 'R', finger: 'left-index' },
      { key: 't', display: 't', shiftDisplay: 'T', finger: 'left-index' },
      { key: 'y', display: 'y', shiftDisplay: 'Y', finger: 'right-index' },
      { key: 'u', display: 'u', shiftDisplay: 'U', finger: 'right-index' },
      { key: 'i', display: 'i', shiftDisplay: 'I', finger: 'right-middle' },
      { key: 'o', display: 'o', shiftDisplay: 'O', finger: 'right-ring' },
      { key: 'p', display: 'p', shiftDisplay: 'P', finger: 'right-pinky' },
      { key: '[', display: '[', shiftDisplay: '{', finger: 'right-pinky' },
      { key: ']', display: ']', shiftDisplay: '}', finger: 'right-pinky' },
      { key: '\\', display: '\\', shiftDisplay: '|', finger: 'right-pinky', width: '64px' }
    ],
    // Row 3 (Home Row)
    [
      { key: 'Caps', display: 'Caps', shiftDisplay: 'Caps', finger: 'left-pinky', width: '76px', labelStyle: { fontSize: '11px', alignSelf: 'flex-start', padding: '4px' } },
      { key: 'a', display: 'a', shiftDisplay: 'A', finger: 'left-pinky' },
      { key: 's', display: 's', shiftDisplay: 'S', finger: 'left-ring' },
      { key: 'd', display: 'd', shiftDisplay: 'D', finger: 'left-middle' },
      { key: 'f', display: 'f', shiftDisplay: 'F', finger: 'left-index' },
      { key: 'g', display: 'g', shiftDisplay: 'G', finger: 'left-index' },
      { key: 'h', display: 'h', shiftDisplay: 'H', finger: 'right-index' },
      { key: 'j', display: 'j', shiftDisplay: 'J', finger: 'right-index' },
      { key: 'k', display: 'k', shiftDisplay: 'K', finger: 'right-middle' },
      { key: 'l', display: 'l', shiftDisplay: 'L', finger: 'right-ring' },
      { key: ';', display: ';', shiftDisplay: ':', finger: 'right-pinky' },
      { key: '\'', display: '\'', shiftDisplay: '"', finger: 'right-pinky' },
      { key: 'Enter', display: 'Enter', shiftDisplay: 'Enter', finger: 'right-pinky', width: '100px', labelStyle: { fontSize: '11px', alignSelf: 'flex-end', padding: '4px' } }
    ],
    // Row 4 (Bottom Row)
    [
      { key: 'ShiftLeft', display: 'Shift', shiftDisplay: 'Shift', finger: 'left-pinky', width: '100px', labelStyle: { fontSize: '11px', alignSelf: 'flex-start', padding: '4px' } },
      { key: 'z', display: 'z', shiftDisplay: 'Z', finger: 'left-pinky' },
      { key: 'x', display: 'x', shiftDisplay: 'X', finger: 'left-ring' },
      { key: 'c', display: 'c', shiftDisplay: 'C', finger: 'left-middle' },
      { key: 'v', display: 'v', shiftDisplay: 'V', finger: 'left-index' },
      { key: 'b', display: 'b', shiftDisplay: 'B', finger: 'left-index' },
      { key: 'n', display: 'n', shiftDisplay: 'N', finger: 'right-index' },
      { key: 'm', display: 'm', shiftDisplay: 'M', finger: 'right-index' },
      { key: ',', display: ',', shiftDisplay: '<', finger: 'right-middle' },
      { key: '.', display: '.', shiftDisplay: '>', finger: 'right-ring' },
      { key: '/', display: '/', shiftDisplay: '?', finger: 'right-pinky' },
      { key: 'ShiftRight', display: 'Shift', shiftDisplay: 'Shift', finger: 'right-pinky', width: '124px', labelStyle: { fontSize: '11px', alignSelf: 'flex-end', padding: '4px' } }
    ],
    // Row 5 (Modifiers & Space)
    [
      { key: 'CtrlLeft', display: 'Ctrl', shiftDisplay: 'Ctrl', finger: 'left-pinky', width: '60px', labelStyle: { fontSize: '11px', alignSelf: 'flex-start', padding: '4px' } },
      { key: 'WinLeft', display: 'Win', shiftDisplay: 'Win', finger: 'left-pinky', width: '50px', labelStyle: { fontSize: '11px', padding: '4px' } },
      { key: 'AltLeft', display: 'Alt', shiftDisplay: 'Alt', finger: 'left-thumb', width: '50px', labelStyle: { fontSize: '11px', padding: '4px' } },
      { key: ' ', display: '␣', shiftDisplay: '␣', finger: 'thumb', width: '286px', labelStyle: { fontSize: '24px', fontFamily: 'var(--font-ui)' } },
      { key: 'AltRight', display: 'Alt', shiftDisplay: 'Alt', finger: 'right-thumb', width: '50px', labelStyle: { fontSize: '11px', padding: '4px' } },
      { key: 'WinRight', display: 'Win', shiftDisplay: 'Win', finger: 'right-pinky', width: '50px', labelStyle: { fontSize: '11px', padding: '4px' } },
      { key: 'Menu', display: 'Menu', shiftDisplay: 'Menu', finger: 'right-pinky', width: '50px', labelStyle: { fontSize: '11px', padding: '4px' } },
      { key: 'CtrlRight', display: 'Ctrl', shiftDisplay: 'Ctrl', finger: 'right-pinky', width: '60px', labelStyle: { fontSize: '11px', alignSelf: 'flex-end', padding: '4px' } }
    ]
  ],

  // For the Virtual Keyboard Numpad: Defines the CSS grid area layout
  numpadKeys: [
    { key: 'NumLock', display: 'Num', finger: 'right-index', gridArea: '1 / 1 / 2 / 2' },
    { key: 'NumpadDivide', display: '/', finger: 'right-index', gridArea: '1 / 2 / 2 / 3' },
    { key: 'NumpadMultiply', display: '*', finger: 'right-middle', gridArea: '1 / 3 / 2 / 4' },
    { key: 'NumpadSubtract', display: '-', finger: 'right-ring', gridArea: '1 / 4 / 2 / 5' },
    { key: 'Numpad7', display: '7', finger: 'right-index', gridArea: '2 / 1 / 3 / 2' },
    { key: 'Numpad8', display: '8', finger: 'right-middle', gridArea: '2 / 2 / 3 / 3' },
    { key: 'Numpad9', display: '9', finger: 'right-ring', gridArea: '2 / 3 / 3 / 4' },
    { key: 'NumpadAdd', display: '+', finger: 'right-pinky', gridArea: '2 / 4 / 4 / 5' },
    { key: 'Numpad4', display: '4', finger: 'right-index', gridArea: '3 / 1 / 4 / 2' },
    { key: 'Numpad5', display: '5', finger: 'right-middle', gridArea: '3 / 2 / 4 / 3' },
    { key: 'Numpad6', display: '6', finger: 'right-ring', gridArea: '3 / 3 / 4 / 4' },
    { key: 'Numpad1', display: '1', finger: 'right-index', gridArea: '4 / 1 / 5 / 2' },
    { key: 'Numpad2', display: '2', finger: 'right-middle', gridArea: '4 / 2 / 5 / 3' },
    { key: 'Numpad3', display: '3', finger: 'right-ring', gridArea: '4 / 3 / 5 / 4' },
    { key: 'NumpadEnter', display: 'Ent', finger: 'right-pinky', gridArea: '4 / 4 / 6 / 5' },
    { key: 'Numpad0', display: '0', finger: 'right-index', gridArea: '5 / 1 / 6 / 3' },
    { key: 'NumpadDecimal', display: '.', finger: 'right-ring', gridArea: '5 / 3 / 6 / 4' }
  ]
};
