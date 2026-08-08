import json

with open(r"C:\Users\navee\krutidev-typing-app\public\fonts\KrutiDev010_AltCodes_Hindi.txt", "r", encoding="utf-8") as f:
    lines = f.read().strip().split('\n')[1:] # skip header
    
lessons = []
for i, line in enumerate(lines):
    if '|' not in line: continue
    alt_code, char, hindi = line.split('|')
    
    title = f"{hindi} ({char}) - {alt_code}"
    
    text = f"{char} {char} {char} {char} {char} A {char} {char} {char} {char} {char} A"
    
    lessons.append({
        "id": f"chap5-les{i+1}",
        "chapterId": 5,
        "lessonNumber": i+1,
        "title": title,
        "description": f"Learn to type {hindi} using {alt_code}",
        "difficulty": 3,
        "estimatedTimeMinutes": 1,
        "minAccuracy": 90,
        "targetWpm": 20,
        "text": text,
        "type": "practice"
    })
    
out = {
  "chapterId": 5,
  "chapterTitle": "Special Alt Codes",
  "totalLessons": len(lessons),
  "goalWpm": 20,
  "minimumAccuracy": 90,
  "lessons": lessons
}

with open(r"C:\Users\navee\krutidev-typing-app\src\data\chapters\chapter5.json", "w", encoding="utf-8") as f:
    json.dump(out, f, indent=2, ensure_ascii=False)
