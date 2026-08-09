import json
import os
import glob

def check_alt_codes():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    chapters_dir = os.path.join(base_dir, 'src', 'data', 'chapters')
    
    found_alt_codes = False
    
    for i in range(1, 11):
        filepath = os.path.join(chapters_dir, f'chapter{i}.json')
        if not os.path.exists(filepath):
            continue
            
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        lessons = data if isinstance(data, list) else data.get('lessons', [])
        
        for lesson in lessons:
            text = lesson.get('text', '')
            alt_chars = [c for c in text if ord(c) > 126]
            if alt_chars:
                print(f"WARNING: Alt-code characters found in Chapter {i}, Lesson {lesson.get('lessonNumber')}: {set(alt_chars)}")
                found_alt_codes = True
                
    if not found_alt_codes:
        print("Success: No alt-code characters found in Chapters 1-10.")

if __name__ == '__main__':
    check_alt_codes()
