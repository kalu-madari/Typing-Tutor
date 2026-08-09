const fs = require('fs');
const path = require('path');

const newAchievements = [];

// 1. Generate 20 WPM Achievements (330 - 520)
for (let i = 33; i <= 52; i++) {
  const wpm = i * 10;
  newAchievements.push(`  { id: 'wpm-${wpm}', title: 'WPM ${wpm}', desc: 'Reach ${wpm} WPM', icon: '🚀', category: 'speed' },`);
}

// 2. Generate 50 Lesson Achievements (110,000 - 600,000 in 10k increments)
for (let i = 11; i <= 60; i++) {
  const lessons = i * 10000;
  newAchievements.push(`  { id: 'lessons-${lessons}', title: '${lessons} Lessons', desc: 'Complete ${lessons} lessons', icon: '📚', category: 'lessons' },`);
}

// 3. Generate 50 Streak Achievements (30,000 - 79,000 in 1k increments)
for (let i = 30; i <= 79; i++) {
  const streak = i * 1000;
  newAchievements.push(`  { id: 'streak-${streak}', title: '${streak} Days', desc: 'Maintain a ${streak}-day streak', icon: '🔥', category: 'streak' },`);
}

// 4. Generate 30 Accuracy Achievements (60,000 - 350,000 in 10k increments)
for (let i = 6; i <= 35; i++) {
  const acc = i * 10000;
  newAchievements.push(`  { id: 'acc-100-${acc}', title: 'Perfect ${acc}', desc: 'Get 100% accuracy on ${acc} lessons', icon: '🎯', category: 'accuracy' },`);
}

// 5. Generate 50 Volume Achievements (1.1 Trillion - 6.0 Trillion)
for (let i = 11; i <= 60; i++) {
  const vol = i * 100000; // 100000m = 100,000,000,000 = 100B, wait, 1.1T = 1,100,000m
  const strM = i * 100000;
  newAchievements.push(`  { id: 'chars-${strM}m', title: '${i / 10} Trillion', desc: 'Type ${(strM * 1000000).toLocaleString()} characters', icon: '💎', category: 'volume' },`);
}

const filePath = path.join(__dirname, '..', 'src', 'core', 'achievements.js');
const content = fs.readFileSync(filePath, 'utf-8');

const insertionPoint = content.indexOf('];');
if (insertionPoint !== -1) {
  const newContent = content.slice(0, insertionPoint) + 
    '\\n  // --- SET 6-10: Final 200 Achievements (Total: 500) ---\\n' +
    newAchievements.join('\\n') + '\\n' +
    content.slice(insertionPoint);
    
  fs.writeFileSync(filePath, newContent, 'utf-8');
  console.log('Successfully added 200 achievements! Total generated: ' + newAchievements.length);
} else {
  console.error('Could not find insertion point.');
}
