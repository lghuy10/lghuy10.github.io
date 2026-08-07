import json, os, re, html, sys
from pathlib import Path

ROOT = Path(__file__).parent
SRC_JSON = ROOT / "temp_fes_extract" / "_SummaryFes_structured.json"

with open(str(SRC_JSON), "r", encoding="utf-8") as f:
    s = json.load(f)
rows = s["tables"][0]["rows"]
header = rows[0]
data_rows = rows[1:]
print(f"Header ({len(header)} cols):")
for i, h in enumerate(header):
    print(f"  [{i}] {h!r}")

NAME_KEYS = {
    "Trần Hưng Đạo": "lehoitranhungdao.html",
    "Khai hạ": "lehoikhahacauan.html",
    "Chùa Bà Thiên Hậu": "lehoichuabathienhau.html",
    "Bình Dương": "lehoichuabathienhau.html",
    "Dinh Cô": "lehoidincolonghai.html",
    "Sayangva": "lehoicungthanlua.html",
    "Thần Lúa": "lehoicungthanlua.html",
    "Chơ-ro": "lehoicungthanlua.html",
    "Ốp Yang Vri": "lehoithanrung.html",
    "Thần Rừng": "lehoithanrung.html",
    "Mùa trái chín": "lehoimuatraichin.html",
    "Lái Thiêu": "lehoimuatraichin.html",
    "Nghinh Ông Cần Giờ": "lehoinghinong.html",
    "Cần Giờ": "lehoinghinong.html",
    "Thắng Tam": "lehoinghinongtamthang.html",
    "Thắng Tam (Vũng Tàu)": "lehoinghinongtamthang.html",
    "Nguyên Tiêu": "lehoinguyentieu.html",
    "Người Việt gốc Hoa": "lehoinguyentieu.html",
}

def resolve_file(name_long: str) -> str:
    best = None
    best_score = 0
    for k, fn in NAME_KEYS.items():
        if k.lower() in name_long.lower():
            score = len(k)
            if score > best_score:
                best_score = score
                best = fn
    return best

fests = []
for r in data_rows:
    d = dict(zip(header, r))
    d["__file"] = resolve_file(d["Tên lễ hội"])
    fests.append(d)
    print(f"  {d['STT']}. {d['Tên lễ hội']!r:60s} -> {d['__file']}")

COL_LABEL_HTML_H4 = [
    ("Xếp hạng lễ hội hoặc di tích", "Xếp hạng lễ hội / di tích"),
    ("Thời gian tổ chức", "Thời gian tổ chức"),
    ("Địa điểm diễn ra", "Địa điểm diễn ra"),
    ("Mục đích nhân văn", "Mục đích nhân văn"),
    ("Lịch sử hình thành", "Lịch sử hình thành"),
    ("Đối tượng tôn vinh", "Đối tượng tôn vinh"),
    ("Không gian kiến trúc", "Không gian kiến trúc"),
    ("Hoạt động chính: Phần Lễ - Phần Hội", "Các hoạt động chính của lễ hội"),
    ("Ý nghĩa lịch sử văn hóa", "Ý nghĩa lịch sử và văn hóa"),
    ("Điểm độc đáo", "Điểm độc đáo"),
    ("Nguồn tài liệu tham khảo", "Nguồn tài liệu tham khảo"),
    ("So sánh với lễ hội liên quan (nội dung bổ sung)", "So sánh với lễ hội liên quan"),
]

def txt_to_html_paras(text: str):
    if text is None:
        return []
    t = str(text).strip()
    if not t or t == "Không có dữ liệu":
        return []
    t = t.replace("\r\n", "\n").replace("\r", "\n")
    parts = [p.strip() for p in re.split(r"\n\s*\n", t) if p.strip()]
    if len(parts) == 1 and "\n" in parts[0]:
        lines = [ln.strip() for ln in parts[0].split("\n") if ln.strip()]
        parts = lines
    out = []
    for p in parts:
        esc = html.escape(p).replace("&#x27;", "'").replace("&quot;", '"')
        out.append(f"<p>\n{esc}\n</p>")
    return out

def urls_to_links(text: str, label: str):
    if text is None:
        return []
    t = str(text).strip()
    if not t or t == "Không có dữ liệu":
        return []
    lines = [ln.strip() for ln in re.split(r"\s+", t) if ln.strip()]
    urls = []
    for ln in lines:
        for w in re.split(r"\s+", ln):
            w = w.strip(" .,;()[]'\"")
            if w.startswith("http://") or w.startswith("https://"):
                urls.append(w)
    out = []
    for u in urls:
        esc_url = html.escape(u, quote=True)
        out.append(f'<p> - Xem thêm: <a href="{esc_url}" target="_blank" rel="noopener">{esc_url}</a></p>')
    return out

def build_sections_for(d):
    parts = []
    parts.append('<h3>Bài viết giới thiệu</h3>')
    for col_key, h4 in COL_LABEL_HTML_H4:
        txt = d.get(col_key, "")
        if col_key == "So sánh với lễ hội liên quan (nội dung bổ sung)":
            paras = txt_to_html_paras(txt)
            if not paras:
                continue
            parts.append(f'<h4>\u2022 {h4}</h4>')
            parts.extend(paras)
            continue
        paras = txt_to_html_paras(txt)
        if not paras:
            continue
        parts.append(f'<h4>\u2022 {h4}</h4>')
        parts.extend(paras)
    articles_links = urls_to_links(d.get("Bài viết", ""), "Bài viết")
    video_links = urls_to_links(d.get("Video thực tế", ""), "Video")
    if articles_links or video_links:
        parts.append('<h4>\u2022 Tư liệu tìm hiểu thêm</h4>')
        if articles_links:
            parts.append("<h5>\u2022 Bài viết</h5>")
            parts.extend(articles_links)
        if video_links:
            parts.append("<h5>\u2022 Video</h5>")
            parts.extend(video_links)
    return parts

POST_FRAME_RE = re.compile(
    r"<div class=\"post-frame\">.*?</div>\s*<div class=\"img-ref\">.*?</div>\s*</div>",
    re.DOTALL,
)

def patch_html(path: Path, new_title: str, new_sections_html: list, backup=True):
    raw = path.read_text(encoding="utf-8")
    orig = raw
    title_m = re.search(r"<title>(.*?)</title>", raw, re.DOTALL)
    if title_m:
        raw = raw[:title_m.start(1)] + html.escape(new_title) + raw[title_m.end(1):]
    h1_m = re.search(r"(<h1 class=\"entry-title\">)(.*?)(</h1>)", raw, re.DOTALL)
    if h1_m:
        raw = raw[:h1_m.start(2)] + html.escape(new_title) + raw[h1_m.end(2):]
    post_frames = POST_FRAME_RE.findall(raw)
    idx_h3 = raw.find('<h3>Bài viết giới thiệu</h3>')
    if idx_h3 < 0:
        print(f"    [SKIP] Khong tim thay <h3>Bai viet gioi thieu</h3> trong {path.name}")
        return False
    idx_cmt = raw.find('<div class="comments-area"')
    if idx_cmt < 0:
        print(f"    [SKIP] Khong tim thay comments-area trong {path.name}")
        return False
    first_pf_s = raw.find('<div class="post-frame">')
    first_pf_e = -1
    if 0 <= first_pf_s < idx_h3 and first_pf_s < idx_cmt:
        m = POST_FRAME_RE.search(raw, first_pf_s)
        if m:
            first_pf_e = m.end()
    remaining_pf = []
    if first_pf_e > 0:
        s = first_pf_e
        while True:
            m = POST_FRAME_RE.search(raw, s)
            if not m or m.start() >= idx_cmt:
                break
            remaining_pf.append(m.group(0))
            s = m.end()
    middle_pf_insert_positions = []
    if len(remaining_pf) >= 3:
        middle_pf_insert_positions = [0, 4, 8]
    elif len(remaining_pf) == 2:
        middle_pf_insert_positions = [1, 5]
    elif len(remaining_pf) == 1:
        middle_pf_insert_positions = [3]
    sections = list(new_sections_html)
    offset = 0
    for pos_idx, pf_idx in enumerate(middle_pf_insert_positions):
        if pos_idx >= len(remaining_pf):
            break
        insert_at = min(len(sections), pf_idx + offset)
        pf_html = f'<div class="entry-content">{remaining_pf[pos_idx]}</div>'
        sections.insert(insert_at, pf_html)
        offset += 1
    new_middle_parts = []
    if first_pf_e > 0:
        new_middle_parts.append(raw[first_pf_s:first_pf_e])
    new_middle_parts.extend(sections)
    prefix = raw[:first_pf_s] if first_pf_s > 0 else raw[:idx_h3]
    suffix = raw[idx_cmt:]
    result = prefix + "\n" + "\n".join(new_middle_parts) + "\n" + suffix
    if backup:
        bak = path.with_suffix(path.suffix + ".bak_prefes")
        bak.write_text(orig, encoding="utf-8")
    path.write_text(result, encoding="utf-8")
    print(f"    [OK] Updated: {path.name}  (title={new_title[:50]!r}.., sections={len(sections)}, postframes_extra={len(remaining_pf)})")
    return True

seen_files = {}
for d in fests:
    fn = d["__file__"]
    if not fn:
        print(f"[WARN] Khong map duoc file cho {d['Tên lễ hội']!r}")
        continue
    if fn in seen_files:
        print(f"[WARN] Trùng file {fn}: {d['Tên lễ hội']!r} vs {seen_files[fn]!r} -> skip de sau")
        continue
    seen_files[fn] = d["Tên lễ hội"]
    p = ROOT / fn
    if not p.exists():
        print(f"[SKIP] Khong ton tai file: {fn}")
        continue
    new_sections = build_sections_for(d)
    patch_html(p, d["Tên lễ hội"], new_sections)

print("\nDone patch ROOT files. Patching EN mirror if exists...")
EN_ROOT = ROOT / "en"
for fn in list(seen_files.keys()):
    pen = EN_ROOT / fn
    if not pen.exists():
        continue
    d = next(x for x in fests if x["__file"] == fn)
    new_sections = build_sections_for(d)
    patch_html(pen, d["Tên lễ hội"], new_sections)

print("\nAll done.")
