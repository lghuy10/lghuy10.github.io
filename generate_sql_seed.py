import json

with open('default_quizzes.json', 'r', encoding='utf-8') as f:
    quizzes = json.load(f)

sql_lines = []
sql_lines.append("-- Database Schema & Seed Data for Quizzes")
sql_lines.append("CREATE TABLE IF NOT EXISTS quizzes (")
sql_lines.append("    id SERIAL PRIMARY KEY,")
sql_lines.append("    title VARCHAR(255) NOT NULL")
sql_lines.append(");")
sql_lines.append("")
sql_lines.append("CREATE TABLE IF NOT EXISTS questions (")
sql_lines.append("    id SERIAL PRIMARY KEY,")
sql_lines.append("    quiz_id INT REFERENCES quizzes(id) ON DELETE CASCADE,")
sql_lines.append("    question_text TEXT NOT NULL,")
sql_lines.append("    option_a TEXT NOT NULL,")
sql_lines.append("    option_b TEXT NOT NULL,")
sql_lines.append("    option_c TEXT NOT NULL,")
sql_lines.append("    option_d TEXT NOT NULL,")
sql_lines.append("    correct_option VARCHAR(10) NOT NULL")
sql_lines.append(");")
sql_lines.append("")
sql_lines.append("-- Clear old data")
sql_lines.append("TRUNCATE TABLE questions, quizzes RESTART IDENTITY CASCADE;")
sql_lines.append("")

def escape_sql(s):
    if not s:
        return "''"
    return "'" + str(s).replace("'", "''") + "'"

for qz in quizzes:
    sql_lines.append(f"INSERT INTO quizzes (id, title) VALUES ({qz['id']}, {escape_sql(qz['title'])});")
    for q in qz['questions']:
        sql_lines.append(
            f"INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option) VALUES "
            f"({qz['id']}, {escape_sql(q['question_text'])}, {escape_sql(q['option_a'])}, {escape_sql(q['option_b'])}, {escape_sql(q['option_c'])}, {escape_sql(q['option_d'])}, {escape_sql(q['correct_option'])});"
        )

with open('schema_seed.sql', 'w', encoding='utf-8') as f:
    f.write('\n'.join(sql_lines))

print("Generated schema_seed.sql successfully!")
