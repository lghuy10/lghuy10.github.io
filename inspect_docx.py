import zipfile, os, re, base64, json, sys
from pathlib import Path
p = Path(r'g:\KHKT2026\new_web\images.docx')
with zipfile.ZipFile(p) as z:
    names = z.namelist()
    print('FILES:')
    for n in names:
        print(n)
    print('\nIMAGE FILES:')
    for n in names:
        if n.startswith('word/media/'):
            print(n)
    print('\nDOCUMENT XML SNIPPET:')
    txt = z.read('word/document.xml').decode('utf-8', errors='ignore')
    print(txt[:30000])
