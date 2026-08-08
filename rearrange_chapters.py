import json
import os

base_dir = r"C:\Users\navee\krutidev-typing-app\src\data\chapters"

def load_json(name):
    path = os.path.join(base_dir, name)
    if not os.path.exists(path):
        return None
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def save_json(name, data):
    path = os.path.join(base_dir, name)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

# 1. Rename existing chapter 4,5,6 to 10,11,12
for old_num, new_num in [(6, 12), (5, 11), (4, 10)]: # Reverse order to prevent overwriting if files exist
    old_file = f"chapter{old_num}.json"
    new_file = f"chapter{new_num}.json"
    data = load_json(old_file)
    if data is not None:
        if isinstance(data, dict) and "chapterId" in data:
            data["chapterId"] = new_num
            for les in data.get("lessons", []):
                les["id"] = les["id"].replace(f"chap{old_num}-", f"chap{new_num}-")
        elif isinstance(data, list):
            for les in data:
                les["chapterId"] = new_num
                les["id"] = les["id"].replace(f"chap{old_num}-", f"chap{new_num}-")
        
        # Save to new file and delete old file
        save_json(new_file, data)
        os.remove(os.path.join(base_dir, old_file))

# 2. Add [ ] \ to Chapter 2
chap2 = load_json("chapter2.json")
if chap2 is not None:
    new_lessons_2 = [
      {
        "id": f"chap2-les{len(chap2)+1}", "chapterId": 2, "lessonNumber": len(chap2)+1,
        "title": "The Brackets", "newKeys": ["[", "]"], "type": "practice",
        "text": "p [ p [ [p [p p [ p [ ] [ ] [p] p] ]p]"
      },
      {
        "id": f"chap2-les{len(chap2)+2}", "chapterId": 2, "lessonNumber": len(chap2)+2,
        "title": "The Backslash", "newKeys": ["\\"], "type": "practice",
        "text": "] \\ ] \\ \\] \\] ] \\ ] \\ [ \\ [ \\ \\p\\"
      }
    ]
    chap2.extend(new_lessons_2)
    save_json("chapter2.json", chap2)

# 3. Create chapter 4 (Top number row)
chap4 = [
    {
        "id": "chap4-les1", "chapterId": 4, "lessonNumber": 1,
        "title": "Numbers 1 and 0", "newKeys": ["1", "0"], "type": "practice",
        "text": "1 0 1 0 10 01 101 010 1 0"
    },
    {
        "id": "chap4-les2", "chapterId": 4, "lessonNumber": 2,
        "title": "Numbers 2 and 9", "newKeys": ["2", "9"], "type": "practice",
        "text": "2 9 2 9 29 92 292 929 2 9"
    },
    {
        "id": "chap4-les3", "chapterId": 4, "lessonNumber": 3,
        "title": "Numbers 3 and 8", "newKeys": ["3", "8"], "type": "practice",
        "text": "3 8 3 8 38 83 383 838 3 8"
    },
    {
        "id": "chap4-les4", "chapterId": 4, "lessonNumber": 4,
        "title": "Numbers 4 and 7", "newKeys": ["4", "7"], "type": "practice",
        "text": "4 7 4 7 47 74 474 747 4 7"
    },
    {
        "id": "chap4-les5", "chapterId": 4, "lessonNumber": 5,
        "title": "Numbers 5 and 6", "newKeys": ["5", "6"], "type": "practice",
        "text": "5 6 5 6 56 65 565 656 5 6"
    },
    {
        "id": "chap4-les6", "chapterId": 4, "lessonNumber": 6,
        "title": "Symbols - and =", "newKeys": ["-", "="], "type": "practice",
        "text": "- = - = -= =- -=- =-= - ="
    },
    {
        "id": "chap4-les7", "chapterId": 4, "lessonNumber": 7,
        "title": "The Backtick", "newKeys": ["`"], "type": "practice",
        "text": "` 1 ` 1 `1 1` `1` 1`1 ` 1"
    }
]
save_json("chapter4.json", chap4)

# Function to generate shifted chapter
def make_shifted_chapter(src_num, dst_num):
    src = load_json(f"chapter{src_num}.json")
    if not src: return
    dst = []
    
    mapping = {
        'a':'A','b':'B','c':'C','d':'D','e':'E','f':'F','g':'G','h':'H','i':'I',
        'j':'J','k':'K','l':'L','m':'M','n':'N','o':'O','p':'P','q':'Q','r':'R',
        's':'S','t':'T','u':'U','v':'V','w':'W','x':'X','y':'Y','z':'Z',
        '`':'~', '1':'!', '2':'@', '3':'#', '4':'$', '5':'%', '6':'^', '7':'&',
        '8':'*', '9':'(', '0':')', '-':'_', '=':'+', '[':'{', ']':'}', '\\':'|',
        ';':':', "'":'"', ',':'<', '.':'>', '/':'?'
    }
    
    for les in src:
        new_les = json.loads(json.dumps(les))
        new_les["id"] = new_les["id"].replace(f"chap{src_num}", f"chap{dst_num}")
        new_les["chapterId"] = dst_num
        
        if "title" in new_les:
            new_les["title"] = new_les["title"] + " (Shift)"
            
        if "text" in new_les:
            new_text = ""
            for char in new_les["text"]:
                new_text += mapping.get(char, char)
            new_les["text"] = new_text
            
        if "newKeys" in new_les:
            new_les["newKeys"] = [mapping.get(k, k) for k in new_les["newKeys"]]
            
        if "previouslyUsedKeys" in new_les:
            new_les["previouslyUsedKeys"] = [mapping.get(k, k) for k in new_les["previouslyUsedKeys"]]
            
        dst.append(new_les)
        
    save_json(f"chapter{dst_num}.json", dst)

# Create shifted chapters
make_shifted_chapter(1, 5)
make_shifted_chapter(2, 6)
make_shifted_chapter(3, 7)
make_shifted_chapter(4, 8)

# Create chapter 9 (Mix of 1-8)
chap9 = [
    {
        "id": "chap9-les1", "chapterId": 9, "lessonNumber": 1,
        "title": "Home Row Mix (Regular + Shift)", "type": "practice",
        "text": "f F j J d D k K s S l L a A ; :"
    },
    {
        "id": "chap9-les2", "chapterId": 9, "lessonNumber": 2,
        "title": "Top Row Mix (Regular + Shift)", "type": "practice",
        "text": "r R u U e E i I w W o O q Q p P [ { ] } \\ |"
    },
    {
        "id": "chap9-les3", "chapterId": 9, "lessonNumber": 3,
        "title": "Bottom Row Mix (Regular + Shift)", "type": "practice",
        "text": "v V m M c C , < x X . > z Z / ?"
    },
    {
        "id": "chap9-les4", "chapterId": 9, "lessonNumber": 4,
        "title": "Number Row Mix (Regular + Shift)", "type": "practice",
        "text": "1 ! 2 @ 3 # 4 $ 5 % 6 ^ 7 & 8 * 9 ( 0 ) - _ = + ` ~"
    },
    {
        "id": "chap9-les5", "chapterId": 9, "lessonNumber": 5,
        "title": "Full Keyboard Mix", "type": "practice",
        "text": "a A 1 ! q Q z Z / ? 0 ) p P ; : ' \" ] } = +"
    }
]
save_json("chapter9.json", chap9)
print("Curriculum rearranged successfully!")
