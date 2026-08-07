import json

with open('docx_parsed.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

lines = []
lines.append("Checking first 60 paragraphs:")
for p in data[:60]:
    bolds = [r['text'] for r in p['runs'] if r['bold']]
    underlines = [r['text'] for r in p['runs'] if r['underline']]
    italics = [r['text'] for r in p['runs'] if r['italic']]
    colors = [r['color'] for r in p['runs'] if r['color']]
    lines.append(f"[{p['index']}] {p['text']}")
    if bolds:
        lines.append(f'   BOLD: {bolds}')
    if underlines:
        lines.append(f'   UNDERLINE: {underlines}')
    if italics:
        lines.append(f'   ITALIC: {italics}')
    if colors:
        lines.append(f'   COLOR: {colors}')

with open('check_answers.txt', 'w', encoding='utf-8') as out:
    out.write('\n'.join(lines))

print("Wrote check_answers.txt")
