import docx
import json

doc = docx.Document('question.docx')

sample_info = []
for i, p in enumerate(doc.paragraphs):
    if not p.text.strip():
        continue
    runs_info = []
    for r in p.runs:
        runs_info.append({
            'text': r.text,
            'bold': bool(r.bold),
            'underline': bool(r.underline),
            'italic': bool(r.italic),
            'color': str(r.font.color.rgb) if r.font.color and r.font.color.rgb else None
        })
    sample_info.append({
        'index': i,
        'text': p.text,
        'runs': runs_info
    })

with open('docx_parsed.json', 'w', encoding='utf-8') as f:
    json.dump(sample_info, f, ensure_ascii=False, indent=2)

print(f"Total non-empty paragraphs: {len(sample_info)}")
