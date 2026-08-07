import Dexie from 'dexie';

export const db = new Dexie('KrutidevTypingAppDB');

db.version(1).stores({
  lessonsCompleted: 'id, date, wpm, accuracy, lessonId',
  settings: 'key, value',
  stats: 'key, value', // For streak, best WPM, etc.
});
