import zipfile, re, sys
path = r'g:\KHKT2026\new_web\question.docx'
with zipfile.ZipFile(path) as z:
    xml = z.read('word/document.xml').decode('utf-8')
text = re.sub(r'<w:t[^>]*>(.*?)</w:t>', lambda m: m.group(1), xml)
text = re.sub(r'<[^>]+>', ' ', text)
text = re.sub(r'\s+', ' ', text).strip()
print(text[:40000])
