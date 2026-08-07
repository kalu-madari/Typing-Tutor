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
