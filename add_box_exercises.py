import json
import os

base_dir = r"C:\Users\navee\krutidev-typing-app\src\data\chapters"

for i in range(1, 9):
    path = os.path.join(base_dir, f"chapter{i}.json")
    if not os.path.exists(path):
        continue
        
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    new_data = []
    
    # Process only if it's a list (Chapters 1-8 should be lists)
    if isinstance(data, list):
        for les in data:
            les_num = les.get("lessonNumber", 0)
            
            # For the first 6 lessons
            if les_num <= 6:
                # 1. Box practice lesson
                box_les = json.loads(json.dumps(les))
                box_les["type"] = "box_practice"
                box_les["lessonNumber"] = (les_num * 2) - 1 # 1, 3, 5, 7, 9, 11
                box_les["id"] = f"chap{i}-les{(les_num * 2) - 1}"
                if "unlockedAfter" in box_les and box_les["unlockedAfter"]:
                    # Fix unlockedAfter to point to the previous review lesson
                    prev_review_id = f"chap{i}-les{(les_num * 2) - 2}" if les_num > 1 else None
                    if prev_review_id:
                        box_les["unlockedAfter"] = prev_review_id
                
                # 2. Review lesson (normal practice)
                review_les = json.loads(json.dumps(les))
                review_les["title"] = "Review: " + review_les.get("title", "")
                review_les["lessonNumber"] = les_num * 2 # 2, 4, 6, 8, 10, 12
                review_les["id"] = f"chap{i}-les{les_num * 2}"
                review_les["unlockedAfter"] = box_les["id"]
                
                new_data.append(box_les)
                new_data.append(review_les)
            else:
                # Shift remaining lessons down by 6 positions
                new_les = json.loads(json.dumps(les))
                new_les["lessonNumber"] = les_num + 6
                new_les["id"] = f"chap{i}-les{les_num + 6}"
                
                # Update unlockedAfter if it points to a lesson in this chapter
                old_unlock = new_les.get("unlockedAfter", "")
                if old_unlock and old_unlock.startswith(f"chap{i}-les"):
                    try:
                        old_num = int(old_unlock.split("-les")[1])
                        if old_num <= 6:
                            # If it unlocked after a <= 6 lesson, it now unlocks after its review
                            new_les["unlockedAfter"] = f"chap{i}-les{old_num * 2}"
                        else:
                            new_les["unlockedAfter"] = f"chap{i}-les{old_num + 6}"
                    except:
                        pass
                
                new_data.append(new_les)
                
        with open(path, "w", encoding="utf-8") as f:
            json.dump(new_data, f, indent=2, ensure_ascii=False)
        print(f"Processed Chapter {i}")
