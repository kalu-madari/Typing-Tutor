import chapter1 from '../data/chapter1.json';

const allLessons = [...chapter1];

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
