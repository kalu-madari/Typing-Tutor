import os
import re

filepath = r"C:\Users\navee\krutidev-typing-app\tools\Basic Level 2.txt"

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.read().split('\n')

current_name = ""
current_data = []
is_data = False
lessons = []

for line in lines:
    if re.match(r'Lesson \d+ Name', line):
        if current_name:
            lessons.append({'name': current_name, 'data': ' '.join(current_data).strip()})
        current_name = "PENDING"
        current_data = []
        is_data = False
    elif line.strip() and current_name == "PENDING":
        current_name = line.strip()
    elif re.match(r'Lesson \d+ Data', line):
        is_data = True
    elif is_data and line.strip():
        current_data.append(line.strip())

if current_name:
    lessons.append({'name': current_name, 'data': ' '.join(current_data).strip()})

print(f"Total lessons: {len(lessons)}")
for i, l in enumerate(lessons):
    words = len(l['data'].split())
    print(f"Lesson {i+1} ({l['name']}): {words} words")
