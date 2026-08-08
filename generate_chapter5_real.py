import json
import sys
import os

sys.path.append(r"C:\Users\navee\krutidev-typing-app\tools")
from unicode_to_krutidev import unicode_to_krutidev

sentences = {
  "Alt+0161": "गाँव वहाँ कहाँ माँ छाँव पाँव । हँसी खुशी से गाँव में रहना सीखें । माँ हमेशा बच्चों का ध्यान रखती हैं ।",
  "Alt+0165": "चञ्चल अञ्जन मञ्जन । वह बहुत चञ्चल है । हमें मञ्जन करना चाहिए ।",
  "Alt+0171": "त्र् त्र् त्र् । यह त्र् है ।",
  "Alt+0179": "वाङ्मय अङ्ग कङ्गन । यह वाङ्मय है ।",
  "Alt+0182": "मुफ़्त रफ़्तार दफ़्तर । दफ़्तर में बहुत काम है । रफ़्तार कम करो ।", 
  "Alt+0183": "कोऽपि शिवोऽहम् । यह अवग्रह ऽ है ।",
  "Alt+0184": "शय्या अय्या । यह शय्या है ।",
  "Alt+0186": "ब्रह्मा जिह्वा । वह ब्रह्मा है । जिह्वा एक अंग है ।",
  "Alt+0188": "यह ( ब्रैकेट है । ( राम ) ।",
  "Alt+0189": "यह ) ब्रैकेट है । ( राम ) ।",
  "Alt+0190": "२ + २ = ४ । यह बराबर = है ।",
  "Alt+0191": "{ यह कर्ली ब्रैकेट है ।",
  "Alt+0192": "} यह कर्ली ब्रैकेट है ।",
  "Alt+0197": "ऊन ऊपर ऊर्जा । हमको कार्य के लिए ऊर्जा चाहिए ।",
  "Alt+0216": "क्रम चक्र वक्र विक्रय आक्रमण । समय का चक्र निरंतर चलता रहता है ।",
  "Alt+0217": "महत्त्व तत्त्व । यह बहुत महत्त्वपूर्ण है ।",
  "Alt+0219": "२ x २ = ४ ।",
  "Alt+0221": "फ्री फ्रांस अफ्रीका । सब फ्री रहना पसंद करते हैं ।",
  "Alt+0222": "उसने कहा “ यह सही है ।",
  "Alt+0223": "उसने कहा ” यह सही है ।",
  "Alt+0224": "चिह्न अपराह्न । यह एक चिह्न है ।",
  "Alt+0225": "बाह्य असह्य । यह बाह्य रूप है ।",
  "Alt+0226": "हृदय अपहृत । मेरा हृदय प्रसन्न है ।",
  "Alt+0227": "ब्राह्मण ब्रह्मा । वह एक विद्वान ब्राह्मण है ।",
  "Alt+0229": "० ० ० ० ० । मेरे पास ० रुपये हैं ।",
  "Alt+0230": "द्रव दरिद्र रुद्र । शिव का नाम रुद्र है ।",
  "Alt+0231": "प्रकार प्रमाण प्रयास प्रभाव । हमें सही प्रकार से प्रयास करना चाहिए ।",
  "Alt+0234": "मिट्टी पट्टी छुट्टी । आज मेरी छुट्टी है ।",
  "Alt+0235": "गट्ठर । लकड़ी का गट्ठर लाओ ।",
  "Alt+0236": "गड्डा लड्डू । मुझे लड्डू पसंद है ।",
  "Alt+0237": "उद्देश्य खद्दर । उसका उद्देश्य अच्छा है ।",
  "Alt+0239": "बुड्ढा । वह बुड्ढा आदमी है ।",
  "Alt+0244": "पक्का मक्का । यह काम पक्का हो गया ।",
  "Alt+0247": "ज्झ ज्झ ज्झ ।",
  "Alt+0338": "डा॰ प्रो॰ । डा॰ राम कुमार ।",
  "Alt+0352": "८ ८ ८ ८ ८ । यह अंक ८ है ।",
  "Alt+0402": "१ १ १ १ १ । यह अंक १ है ।",
  "Alt+0710": "६ ६ ६ ६ ६ । यह अंक ६ है ।",
  "Alt+8211": "दृष्टि दृश्य । यह दृश्य बहुत सुंदर है ।",
  "Alt+8212": "कृपा कृषि । भगवान की कृपा है ।",
  "Alt+8218": "डॉक्टर कॉलेज । वह डॉक्टर है ।",
  "Alt+8222": "२ २ २ २ २ । यह अंक २ है ।",
  "Alt+8224": "४ ४ ४ ४ ४ । यह अंक ४ है ।",
  "Alt+8225": "५ ५ ५ ५ ५ । यह अंक ५ है ।",
  "Alt+8230": "३ ३ ३ ३ ३ । यह अंक ३ है ।",
  "Alt+8240": "७ ७ ७ ७ ७ । यह अंक ७ है ।",
  "Alt+8249": "९ ९ ९ ९ ९ । यह अंक ९ है ।"
}

with open(r"C:\Users\navee\krutidev-typing-app\public\fonts\KrutiDev010_AltCodes_Hindi.txt", "r", encoding="utf-8") as f:
    lines = f.read().strip().split('\n')[1:]
    
lessons = []
for i, line in enumerate(lines):
    if '|' not in line: continue
    alt_code, char, hindi = line.split('|')
    
    title = f"{hindi} ({char}) - {alt_code}"
    
    uni_text = sentences.get(alt_code, f"{hindi} {hindi} {hindi} ।")
    kruti_text = unicode_to_krutidev(uni_text)
    
    # Prepend the character standalone a few times to ensure they practice the pure alt code
    text = f"{char} {char} {char} {char} A {kruti_text}"
    
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
