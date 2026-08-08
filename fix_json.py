import codecs
with codecs.open('src/data/chapters/chapter5.json', 'r', 'utf-8') as f:
    data = f.read()

# Replace any unescaped backslashes followed by Š
# The literal text in the file is \Š (which is two characters: \ and Š)
data = data.replace('\\Š', '\\nŠ')

with codecs.open('src/data/chapters/chapter5.json', 'w', 'utf-8') as f:
    f.write(data)
print("Done")
