// Loads all exercise sets from src/data/exercises/*.json
const exerciseModules = import.meta.glob('../data/exercises/*.{json,js}', { eager: true });

let allExerciseSets = [];

Object.entries(exerciseModules).forEach(([, module]) => {
  const content = module.default || module;
  if (content && content.setId && Array.isArray(content.exercises)) {
    allExerciseSets.push(content);
  }
});

// Sort sets alphabetically by setName
allExerciseSets.sort((a, b) => a.setName.localeCompare(b.setName));

export const getAllExerciseSets = () => allExerciseSets;

export const getAllExercises = () =>
  allExerciseSets.flatMap(set =>
    set.exercises.map(ex => ({
      ...ex,
      setName: set.setName,
      timeLimitMinutes: ex.timeLimitMinutes ?? set.timeLimitMinutes ?? 10,
      minWpm: ex.minWpm ?? set.minWpm ?? 60,
      minAccuracy: ex.minAccuracy ?? set.minAccuracy ?? 95,
      maxMarks: ex.maxMarks ?? set.maxMarks ?? 20,
      passingMarks: ex.passingMarks ?? set.passingMarks ?? 10,
    }))
  );
