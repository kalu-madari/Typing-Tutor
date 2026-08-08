const modules = {
  ...import.meta.glob('../data/chapter*.{json,js}', { eager: true }),
  ...import.meta.glob('../data/chapters/*.{json,js}', { eager: true })
};

let allLessons = [];

Object.entries(modules).forEach(([path, module]) => {
  const content = module.default || module;
  let lessonsArray = [];
  
  if (Array.isArray(content)) {
    // Legacy internal schema (like chapter1.json, chapter2.json)
    lessonsArray = content;
  } else if (content && content.lessons && Array.isArray(content.lessons)) {
    // New strict schema (like chapter-05-basic-level-1.json)
    lessonsArray = content.lessons.map(l => ({
      id: l["Lesson ID"] || l.id,
      chapterId: content.chapterId || l.chapterId || 1,
      lessonNumber: l["Lesson Number"] || l.lessonNumber,
      title: l["Lesson Name"] || l.title,
      description: l["Lesson Description"] || l.description,
      difficulty: (l["Difficulty"] === "Medium" ? 3 : (l["Difficulty"] === "Hard" ? 4 : 2)) || l.difficulty || 2,
      estimatedTimeMinutes: l["Estimated Time"] || l.estimatedTimeMinutes,
      minAccuracy: l["Target Accuracy"] || l.minAccuracy,
      targetWpm: l["Target WPM"] || l.targetWpm,
      unlockedAfter: l["Required Previous Lesson"] || l.unlockedAfter,
      newKeys: l.newKeys || [],
      previouslyUsedKeys: l.previouslyUsedKeys || ["a","s","d","f","g","h","j","k","l",";","q","w","e","r","t","y","u","i","o","p","z","x","c","v","b","n","m"],
      text: l["Typing Prompts"] ? Object.values(l["Typing Prompts"]).filter(Boolean).join(" ") : l.text,
      type: l["Practice Type"]?.toLowerCase() === 'test' ? 'test' : l.type || 'practice'
    }));
  }
  
  allLessons = allLessons.concat(lessonsArray);
});

// Sort by chapterId and then lessonNumber to ensure correct ordering
allLessons.sort((a, b) => {
  if (a.chapterId !== b.chapterId) return a.chapterId - b.chapterId;
  return a.lessonNumber - b.lessonNumber;
});

const defaultTitles = {
  1: 'Home Row (Regular)',
  2: 'The Top Row (Regular)',
  3: 'The Bottom Row (Regular)',
  4: 'The Number Row (Regular)',
  5: 'Home Row (Shift)',
  6: 'The Top Row (Shift)',
  7: 'The Bottom Row (Shift)',
  8: 'The Number Row (Shift)',
  9: 'Mix Practice (All Rows)',
  10: 'Words Practice',
  11: 'Alt Codes Special Characters',
  12: 'Advanced Word Practice'
};
const defaultDescs = {
  1: 'Build muscle memory for the KrutiDev keyboard layout on the home row.',
  2: 'Learn to use your fingers on the top row.',
  3: 'Learn to stretch down to the bottom row.',
  4: 'Master the number keys and symbols.',
  5: 'Use the Shift key to type half-letters on the home row.',
  6: 'Use the Shift key to type half-letters on the top row.',
  7: 'Use the Shift key to type half-letters on the bottom row.',
  8: 'Use the Shift key for special symbols on the number row.',
  9: 'Combine everything you have learned across all rows.',
  10: 'Practice typing real Hindi words.',
  11: 'Learn to type complex characters using Alt Codes.',
  12: 'Advanced real-world typing practice.'
};

const chapters = [];
const chapterIds = [...new Set(allLessons.map(l => l.chapterId))].sort((a, b) => a - b);

chapterIds.forEach(id => {
  const chLessons = allLessons.filter(l => l.chapterId === id);
  // Find title from original module if possible, or fallback
  let title = defaultTitles[id] || `Chapter ${id}`;
  let desc = defaultDescs[id] || `Practice exercises for Chapter ${id}`;
  
  // Attempt to find original chapterTitle in modules
  Object.values(modules).forEach(m => {
    const c = m.default || m;
    if (c && !Array.isArray(c) && c.chapterId === id) {
      if (c.chapterTitle) title = c.chapterTitle;
      if (c.chapterDescription) desc = c.chapterDescription;
    }
  });

  chapters.push({
    id,
    title,
    description: desc,
    lessons: chLessons
  });
});

export const getChapters = () => {
  return chapters;
};

export const getLessonById = (id) => {
  return allLessons.find(l => l.id === id);
};

export const getAllLessons = () => {
  return allLessons;
};

export const getNextLesson = (currentId) => {
  const index = allLessons.findIndex(l => l.id === currentId);
  if (index >= 0 && index < allLessons.length - 1) {
    return allLessons[index + 1];
  }
  return null;
};
