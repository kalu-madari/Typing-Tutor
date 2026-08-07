export const krutidev010Layout = {
  id: 'krutidev010',
  name: 'Kruti Dev 010',
  type: 'legacy', // legacy = requires font mapping, unicode = standard rendering
  fontFamily: 'KrutiDev010, sans-serif',
  
  // For the typing engine: Given a character from the lesson text, what key(s) does the user need to press?
  // In KrutiDev, the lesson text is stored as English characters (e.g., 'k' renders as 'क').
  // So the user simply needs to press 'k'.
  getExpectedKeys: (targetChar) => {
    return [targetChar.toLowerCase()];
  },
  
  // For the Virtual Keyboard: Defines the layout and what each key displays
  keyboardMap: [
    // Row 1 (Numbers)
    [
      { key: '\`', display: '\`', shiftDisplay: '~', finger: 'left-pinky' },
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
      { key: '=', display: '=', shiftDisplay: '+', finger: 'right-pinky' }
    ],
    // Row 2 (Top Row)
    [
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
      { key: '\\', display: '\\', shiftDisplay: '|', finger: 'right-pinky' }
    ],
    // Row 3 (Home Row)
    [
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
      { key: '\'', display: '\'', shiftDisplay: '"', finger: 'right-pinky' }
    ],
    // Row 4 (Bottom Row)
    [
      { key: 'z', display: 'z', shiftDisplay: 'Z', finger: 'left-pinky' },
      { key: 'x', display: 'x', shiftDisplay: 'X', finger: 'left-ring' },
      { key: 'c', display: 'c', shiftDisplay: 'C', finger: 'left-middle' },
      { key: 'v', display: 'v', shiftDisplay: 'V', finger: 'left-index' },
      { key: 'b', display: 'b', shiftDisplay: 'B', finger: 'left-index' },
      { key: 'n', display: 'n', shiftDisplay: 'N', finger: 'right-index' },
      { key: 'm', display: 'm', shiftDisplay: 'M', finger: 'right-index' },
      { key: ',', display: ',', shiftDisplay: '<', finger: 'right-middle' },
      { key: '.', display: '.', shiftDisplay: '>', finger: 'right-ring' },
      { key: '/', display: '/', shiftDisplay: '?', finger: 'right-pinky' }
    ]
  ]
};
