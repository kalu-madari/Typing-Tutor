import chapter1 from '../data/chapter1.json';
import chapter2 from '../data/chapter2.json';
import chapter3 from '../data/chapter3.json';
import chapter4 from '../data/chapter4.json';
import chapter5 from '../data/chapter-05-basic-level-1.json';

const mappedChapter5 = (chapter5.lessons || []).map(l => ({
  id: l["Lesson ID"],
  chapterId: 5,
  lessonNumber: l["Lesson Number"],
  title: l["Lesson Name"],
  description: l["Lesson Description"],
  difficulty: l["Difficulty"] === "Medium" ? 3 : 2,
  estimatedTimeMinutes: l["Estimated Time"],
  minAccuracy: l["Target Accuracy"],
  targetWpm: l["Target WPM"],
  unlockedAfter: l["Required Previous Lesson"],
  teachingText: l["Teaching Text"],
  newKeys: [],
  previouslyUsedKeys: ["a","s","d","f","g","h","j","k","l",";","q","w","e","r","t","y","u","i","o","p","z","x","c","v","b","n","m"],
  text: Object.values(l["Typing Prompts"]).filter(Boolean).join(" ")
}));

const allLessons = [...chapter1, ...chapter2, ...chapter3, ...chapter4, ...mappedChapter5];

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
