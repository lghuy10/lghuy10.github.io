import json

with open('docx_parsed.json', 'r', encoding='utf-8') as f:
    paragraphs = json.load(f)

quizzes = []
current_quiz = None
current_q = None

def is_header(text):
    text = text.strip()
    prefixes = ['I.', 'II.', 'III.', 'IV.', 'V.', 'VI.', 'VII.', 'VIII.', 'IX.', 'X.']
    return any(text.startswith(p) for p in prefixes)

def get_header_title(text):
    t = text.strip()
    parts = t.split('.', 1)
    if len(parts) > 1:
        t = parts[1].strip()
    if '(' in t:
        t = t.split('(', 1)[0].strip()
    return t

for p in paragraphs:
    text = p['text'].strip()
    if not text:
        continue
    
    if is_header(text):
        if current_quiz:
            if current_q:
                current_quiz['questions'].append(current_q)
                current_q = None
            quizzes.append(current_quiz)
        
        current_quiz = {
            'id': len(quizzes) + 1,
            'title': get_header_title(text),
            'raw_title': text,
            'questions': []
        }
        continue

    if text.startswith('Câu '):
        if current_quiz:
            if current_q:
                current_quiz['questions'].append(current_q)
            
            q_text = text
            parts = text.split('.', 1)
            if len(parts) > 1 and parts[0].replace('Câu', '').strip().isdigit():
                q_text = parts[1].strip()

            current_q = {
                'id': len(current_quiz['questions']) + 1,
                'question': q_text,
                'option_a': '',
                'option_b': '',
                'option_c': '',
                'option_d': '',
                'correct_option': None,
                'p_index': p['index']
            }
        continue
    
    if current_q:
        opt_key = None
        for key in ['A.', 'B.', 'C.', 'D.']:
            if text.startswith(key):
                opt_key = key[0] # 'A', 'B', 'C', 'D'
                break
        
        if opt_key:
            has_underline = any(r['underline'] for r in p['runs'])
            bold_key = any(r['bold'] and (opt_key in r['text'] or opt_key + '.' in r['text']) for r in p['runs'])
            
            opt_text = text[2:].strip()
            if opt_text.startswith('.'):
                opt_text = opt_text[1:].strip()
            
            if opt_key == 'A': current_q['option_a'] = opt_text
            elif opt_key == 'B': current_q['option_b'] = opt_text
            elif opt_key == 'C': current_q['option_c'] = opt_text
            elif opt_key == 'D': current_q['option_d'] = opt_text

            if has_underline or (bold_key and not any(r['bold'] and 'Câu' in r['text'] for r in p['runs'])):
                current_q['correct_option'] = opt_key

if current_quiz:
    if current_q:
        current_quiz['questions'].append(current_q)
    quizzes.append(current_quiz)

report = []
report.append(f"Parsed {len(quizzes)} quizzes.")
for qz in quizzes:
    report.append(f"\nQuiz {qz['id']}: {qz['title']} ({len(qz['questions'])} questions)")
    for q in qz['questions']:
        status = f"Correct: {q['correct_option']}" if q['correct_option'] else "MISSING CORRECT OPTION!"
        report.append(f"  Q{q['id']}: {q['question'][:50]}... [{status}]")

with open('parsed_quizzes.json', 'w', encoding='utf-8') as f:
    json.dump(quizzes, f, ensure_ascii=False, indent=2)

with open('parse_report.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(report))

print("Parsing complete. Wrote parse_report.txt and parsed_quizzes.json")
