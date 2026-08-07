import json

with open('parsed_quizzes.json', 'r', encoding='utf-8') as f:
    quizzes = json.load(f)

def clean_title(raw_t):
    t = raw_t.strip()
    # Remove Roman numeral prefix if any
    parts = t.split('.', 1)
    if len(parts) > 1 and parts[0].strip() in ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']:
        t = parts[1].strip()
    if '(' in t and 'câu' in t:
        t = t.split('(', 1)[0].strip()
    
    # Custom nice title mapping
    titles = [
        "Lễ hội Tết Nguyên tiêu",
        "Lễ hội Chùa Bà Thiên Hậu",
        "Lễ hội Trần Hưng Đạo",
        "Lễ hội Dinh Cô",
        "Lễ hội Nghinh Ông Cần Giờ",
        "Lễ hội Nghinh Ông Thắng Tam",
        "Lễ hội Lái Thiêu Mùa Trái Chín",
        "Lễ hội Khai hạ - Cầu an tại Lăng Tả quân Lê Văn Duyệt",
        "Lễ hội Thần lúa (Ốp Yang Va)",
        "Lễ hội Thần rừng (Ốp Yang Vri)"
    ]
    return t

titles_list = [
    "Lễ hội Tết Nguyên tiêu",
    "Lễ hội Chùa Bà Thiên Hậu",
    "Lễ hội Trần Hưng Đạo",
    "Lễ hội Dinh Cô",
    "Lễ hội Nghinh Ông Cần Giờ",
    "Lễ hội Nghinh Ông Thắng Tam",
    "Lễ hội Lái Thiêu Mùa Trái Chín",
    "Lễ hội Khai hạ - Cầu an tại Lăng Tả quân Lê Văn Duyệt",
    "Lễ hội Thần lúa (Ốp Yang Va)",
    "Lễ hội Thần rừng (Ốp Yang Vri)"
]

formatted_quizzes = []
for idx, qz in enumerate(quizzes):
    title = titles_list[idx] if idx < len(titles_list) else qz['title']
    
    clean_questions = []
    for q in qz['questions']:
        clean_questions.append({
            "id": q['id'],
            "question_text": q['question'],
            "option_a": q['option_a'],
            "option_b": q['option_b'],
            "option_c": q['option_c'],
            "option_d": q['option_d'],
            "correct_option": q['correct_option']
        })
    
    formatted_quizzes.append({
        "id": idx + 1,
        "title": title,
        "questions": clean_questions
    })

# Write JSON
with open('default_quizzes.json', 'w', encoding='utf-8') as f:
    json.dump(formatted_quizzes, f, ensure_ascii=False, indent=2)

# Write JS
js_content = "const DEFAULT_QUIZZES = " + json.dumps(formatted_quizzes, ensure_ascii=False, indent=2) + ";\n\nif (typeof module !== 'undefined' && module.exports) {\n  module.exports = DEFAULT_QUIZZES;\n}\n"

with open('js/default_quizzes.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

print(f"Generated default_quizzes.json and js/default_quizzes.js with {len(formatted_quizzes)} quizzes.")
