import os

path = r"C:\Users\navee\krutidev-typing-app\public\fonts\KrutiDev010_AltCodes.txt"
with open(path, "r", encoding="utf-8") as f:
    lines = f.read().strip().split('\n')[1:] # Skip header

out = "export const altCodesMap = {\n"
for line in lines:
    if '|' not in line: continue
    code, char = line.split('|')
    # code is like "Alt+0161"
    digits = code.split('+')[1]
    arr = ["'AltLeft'", "'AltRight'"]
    for d in digits:
        arr.append(f"'Numpad{d}'")
    
    # Escape quotes
    if char == "'":
        char = "\\'"
    elif char == "\\":
        char = "\\\\"
    
    out += f"  '{char}': [{', '.join(arr)}],\n"
    
out += "};\n"

out_path = r"C:\Users\navee\krutidev-typing-app\src\core\altCodesMap.js"
with open(out_path, "w", encoding="utf-8") as f:
    f.write(out)
