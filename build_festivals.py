"""Build nội dung lễ hội từ markdown đã extract -> patch vào 6 file HTML."""
import json
import os
import re
import sys
from urllib.parse import quote

# Fix console Unicode trên Windows PowerShell/cmd cp1252
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass
os.environ.setdefault("PYTHONIOENCODING", "utf-8")

ROOT = os.path.dirname(os.path.abspath(__file__))
EXTRACT_DIR = os.path.join(ROOT, "temp_fes_extract")

MAPPING = [
    ("Lễ hội Nghinh Ông Cần Giờ.md", "lehoinghinong.html", "Lễ hội Nghinh Ông Cần Giờ"),
    ("Lễ hội Nguyên Tiêu.md",        "lehoinguyentieu.html",   "Tết Nguyên Tiêu của người Việt gốc Hoa tại TP.HCM"),
    ("Lễ hội Thần Rừng.md",          "lehoithanrung.html",     "Lễ hội Ốp Yang Vri - Cúng Thần Rừng của người Chơ-Ro"),
    ("Lễ hội chùa Bà Thiên Hậu.md",  "lehoichuabathienhau.html","Lễ hội Chùa Bà Thiên Hậu TP.HCM"),
    ("Lễ hội Cúng Thần Lúa của Người Chơ - ro.md", "lehoicungthanlua.html", "Lễ hội Sayangva - Cúng Thần Lúa của người Chơ-Ro"),
    ("Lễ hội Mùa Trái Chín.md",      "lehoimuatraichin.html",  "Lễ hội Mùa Trái Chín Lái Thiêu TP.HCM"),
    ("Lễ hội Khai hạ - Cầu an tại Lăng Tả quân Lê Văn Duyệt.md", "lehoikhahacauan.html", "Lễ hội Khai hạ - Cầu an tại Lăng Tả quân Lê Văn Duyệt"),
    ("Lễ Hội Dinh Cô Long Hải.md",   "lehoidincolonghai.html", "Lễ Hội Dinh Cô Long Hải"),
    ("Lễ Hội Nghinh Ông Tam Thắng.md","lehoinghinongtamthang.html","Lễ Hội Nghinh Ông Tam Thắng"),
    ("Lễ Hội Trần Hưng Đạo.md",      "lehoitranhungdao.html", "Lễ Hội Trần Hưng Đạo"),
]

# Mỗi lễ hội 5 ảnh (đặt sau các section lớn). Dùng text-to-image API, prompt riêng cho từng lễ hội.
IMAGE_PROMPTS = {
    "lehoinghinong.html": [
        ("Cảnh lễ hội Nghinh Ông Cần Giờ, hàng trăm tàu thuyền trang trí rực rỡ trên biển, cờ hoa rực rỡ, bình minh",
         "Lễ Nghinh Ông ra biển (ảnh minh họa)"),
        ("Lễ thượng đại kỳ tại công viên Cần Thạnh Cần Giờ, người dân mặc áo dài trang trọng dâng hương, không gian linh thiêng",
         "Lễ Thượng Đại Kỳ tại Cần Thạnh (ảnh minh họa)"),
        ("Hoạt động biểu diễn múa lân, hát bội ngoài trời ở Cần Giờ lễ hội Nghinh Ông, đông đúc người xem",
         "Biểu diễn nghệ thuật truyền thống (ảnh minh họa)"),
        ("Thi đua đẩy sạp trên cà kheo giữa sông Cần Giờ, đoàn tàu vui tươi cờ tung",
         "Trò chơi đẩy sạp trên cà kheo (ảnh minh họa)"),
        ("Hội hoa đăng trên biển Cần Giờ, hàng ngàn đèn lồng lấp lánh trên mặt nước buổi tối",
         "Hội hoa đăng trên biển (ảnh minh họa)"),
    ],
    "lehoinguyentieu.html": [
        ("Lễ hội Tết Nguyên Tiêu Chợ Lớn Sài Gòn, đường phố rực rỡ đèn lồng đỏ, đông người diễu hành",
         "Không khí lễ hội Tết Nguyên Tiêu (ảnh minh họa)"),
        ("Đoàn diễu hành lân sư rồng qua phố Chợ Lớn, người hóa trang Phúc Lộc Thọ cười vui",
         "Diễu hành Lân Sư Rồng (ảnh minh họa)"),
        ("Mâm cỗ chè trôi nước (thang viên) tròn đầy trên bàn thờ gia đình người Hoa Tết Nguyên Tiêu",
         "Mâm cúng Tết Nguyên Tiêu (ảnh minh họa)"),
        ("Đại La cổ Triều Châu biểu diễn đường phố Tết Nguyên Tiêu, đội hình cờ hội rực rỡ",
         "Đoàn Đại La Cổ (ảnh minh họa)"),
        ("Tuần lễ ẩm thực Dimsum Tết Nguyên Tiêu, hàng trăm món bánh bao mọng nước trưng bày",
         "Tuần lễ ẩm thực Dimsum (ảnh minh họa)"),
    ],
    "lehoithanrung.html": [
        ("Lễ cúng thần Rừng Cà Mum Xuân Sơn, già làng Chơ-Ro đứng dưới gốc cây cổ thụ rước nhang, người dân trang phục thổ cẩm",
         "Nghi thức cúng Thần Rừng Cà Mum (ảnh minh họa)"),
        ("Người phụ nữ Chơ-Ro giã bánh trong lễ cúng, gói bánh lá vàng tươi",
         "Chuẩn bị bánh cúng lễ (ảnh minh họa)"),
        ("Đêm văn hóa cồng chiêng Chơ-Ro, mọi người quây tròn đốt lửa trại vui nhảy múa",
         "Phần hội cồng chiêng đêm hội (ảnh minh họa)"),
        ("Gói bánh lá cúng thần rừng xếp đều trên tre, lá tươi xanh, màu mỡ",
         "Gói bánh cúng lễ (ảnh minh họa)"),
        ("Người dân Chơ-Ro uống rượu cần trong lễ hội, cười nói vui vẻ, ấm cúng",
         "Thưởng thức rượu cần phần hội (ảnh minh họa)"),
    ],
    "lehoichuabathienhau.html": [
        ("Chùa Bà Thiên Hậu Bình Dương ngày khai hội, mái ngói cong cổ kính, hàng nghìn vòng nhang treo, trời sáng",
         "Chùa Bà Thiên Hậu ngày khai hội (ảnh minh họa)"),
        ("Lễ rước kiệu Bà Thiên Hậu, hàng ngàn người vây quanh kiệu diễu hành qua đường phố, cờ hoa",
         "Rước kiệu Bà tuần du truyền thống (ảnh minh họa)"),
        ("Tình nguyện viên phát nước uống miễn phí cho khách đi lễ, nụ cười thân thiện",
         "Hoạt động thiện nguyện phát đồ ăn uống (ảnh minh họa)"),
        ("Người dân thành tâm dâng hương trước điện Bà Thiên Hậu, khói nhang thơm, ánh đèn vàng",
         "Người dân dâng hương cầu an (ảnh minh họa)"),
        ("Đại hội lân sư rồng Chùa Bà, 25 đoàn biểu diễn phun lửa trên đường phố, rực lửa",
         "Đại hội Lân Sư Rồng (ảnh minh họa)"),
    ],
    "lehoicungthanlua.html": [
        ("Nhà văn hóa dân tộc Chơ-Ro xã Kim Long, nghi thức cúng Thần Lúa, cây nêu bằng tre trang trí bông lúa",
         "Cây nêu lễ hội cúng Thần Lúa (ảnh minh họa)"),
        ("Già làng Chơ-Ro trang nghiêm dâng rượu cần và khấn tạ ơn Thần Lúa, bàn tế bày lễ vật",
         "Già làng dâng rượu cần (ảnh minh họa)"),
        ("Đoàn phụ nữ Chơ-Ro mặc thổ cẩm rước hồn lúa về, cồng chiêng rộn rã",
         "Rước hồn lúa về buôn làng (ảnh minh họa)"),
        ("Nam nữ Chơ-Ro quây tròn đánh cồng chiêng, nhảy múa quanh đống lửa đêm hội",
         "Đêm hội cồng chiêng (ảnh minh họa)"),
        ("Món Canh Bồi truyền thống lá rau nhíp đọt mây rừng trong bát sứ, món ăn lễ hội đặc trưng",
         "Món Canh Bồi truyền thống (ảnh minh họa)"),
    ],
    "lehoimuatraichin.html": [
        ("Lễ hội Mùa Trái Chín Lái Thiêu, cánh đồng trái cây trồng vụ mùa sớm, sân khấu nổi rực rỡ bên sông Sài Gòn",
         "Toàn cảnh lễ hội Mùa Trái Chín (ảnh minh họa)"),
        ("Ghe gỗ trang trí đầy trái cây xoài, măng cụt, mận - trước cổng chào lễ hội",
         "Ghe trái cây trang trí (ảnh minh họa)"),
        ("Gian hàng trưng bày trái cây Lái Thiêu chín mọng: măng cụt, xoài, bưởi, sầu riêng",
         "Gian hàng trái cây trong lễ hội (ảnh minh họa)"),
        ("Sân khấu vọng cổ ngoài hiên nhà vườn, nghệ sĩ hát Đờn ca tài tử, du khách thưởng trà",
         "Sân khấu vọng cổ Đờn ca tài tử (ảnh minh họa)"),
        ("Món đặc sản Gỏi gà măng cụt Lái Thiêu trên đĩa sứ, giòn bùi màu xanh hấp dẫn",
         "Gỏi gà măng cụt đặc sản (ảnh minh họa)"),
    ],
    "lehoikhahacauan.html": [
        ("Lễ hội Khai hạ Cầu an tại Lăng Tả quân Lê Văn Duyệt, hàng nghìn người dân thành tâm dâng hương, không khí trang nghiêm",
         "Toàn cảnh lễ hội Khai hạ - Cầu an (ảnh minh họa)"),
        ("Nghi thức hạ nêu khai bút khai ấn tại Lăng Ông Bà Chiểu, bàn thờ trang trọng cúng tế lễ vật",
         "Nghi thức Khai hạ - Hạ nêu (ảnh minh họa)"),
        ("Đoàn diễu hành múa lân sư rồng trước cổng Lăng Tả quân, pháo hoa rực rỡ, đông người xem",
         "Diễu hành Lân Sư Rồng (ảnh minh họa)"),
        ("Hoạt động viết thư pháp xin chữ đầu năm tại Lăng, thầy thư pháp viết chữ Hán đỏ trên giấy vàng",
         "Viết thư pháp xin chữ đầu năm (ảnh minh họa)"),
        ("Tết trồng cây tại khuôn viên Lăng Tả quân, người dân cùng nhau trồng cây xanh, bảo vệ môi trường",
         "Tết trồng cây – hoạt động điểm mới (ảnh minh họa)"),
    ],
    "lehoidincolonghai.html": [
        ("Lễ hội Dinh Cô Long Hải, bãi biển Long Hải Vũng Tàu buổi sáng, hàng trăm chiếc thuyền trang trí cờ hoa neo đậu",
         "Toàn cảnh lễ hội Dinh Cô Long Hải (ảnh minh họa)"),
        ("Đền thờ Dinh Cô trên núi Long Hải, mái ngói cong cổ kính, người dân đi lễ thành tâm leo cầu thang đá",
         "Đền thờ Dinh Cô – nơi tổ chức lễ hội (ảnh minh họa)"),
        ("Nghi thức cúng Bà Cô tại đình đình Long Hải, mâm cúng 9 món ngon đặc sản vùng biển trang trọng",
         "Mâm cúng lễ thờ Bà Cô (ảnh minh họa)"),
        ("Đoàn thuyền rước kiệu Bà Cô trên biển Long Hải, cờ hoa tung bay, tiếng cồng chiêng rộn rã",
         "Rước kiệu Bà Cô trên biển (ảnh minh họa)"),
        ("Trò chơi dân gian đua thuyền gỗ trên vịnh Long Hải, đoàn đua tay chèo mạnh mẽ, tranh thủy nhiệt tình",
         "Trò chơi đua thuyền truyền thống (ảnh minh họa)"),
    ],
    "lehoinghinongtamthang.html": [
        ("Lễ hội Nghinh Ông Tam Thắng, bến cảng Tam Thắng Bình Thuận buổi bình minh, hàng trăm tàu cá trang trí rực rỡ",
         "Toàn cảnh lễ hội Nghinh Ông Tam Thắng (ảnh minh họa)"),
        ("Nghi thức cúng Ông Thần Thủy tại đình làng Tam Thắng, già làng trang nghiêm đọc văn khấn trước bàn thờ",
         "Nghi thức cúng Ông Thần Thủy (ảnh minh họa)"),
        ("Đoàn tàu rước kiệu Ông trên biển, hàng loạt ghe nhỏ kéo theo cờ hội màu sắc, pháo băng nổ rực rỡ",
         "Rước kiệu Ông trên biển (ảnh minh họa)"),
        ("Hoạt động múa lân hát bội tại sân đình Tam Thắng, dân làng quây quần vui vẻ xem biểu diễn",
         "Biểu diễn nghệ thuật múa lân (ảnh minh họa)"),
        ("Trò chơi đẩy sạp cà kheo trên sông Tam Thắng, đội hình hào hứng cờ tung đua nhau vui nhộn",
         "Trò chơi đẩy sạp cà kheo (ảnh minh họa)"),
    ],
    "lehoitranhungdao.html": [
        ("Lễ hội Trần Hưng Đạo tại Đền Hùng TP.HCM, hàng nghìn học sinh đội mũ xanh xếp hàng trang nghiêm dâng hương",
         "Toàn cảnh lễ hội Giỗ tổ Trần Hưng Đạo (ảnh minh họa)"),
        ("Nghi lễ dâng hương tại điện thờ Trần Hưng Đạo, bàn thờ lớn khảm vàng, hàng ngàn vòng hoa hồng tươi",
         "Nghi lễ dâng hương Đền thờ (ảnh minh họa)"),
        ("Đoàn diễu hành kỵ binh mô phỏng quân đội Trần, mặc áo giáp màu đỏ, cờ quốc kỳ đỏ vàng tung bay trên đường",
         "Diễu hành kỵ binh quân Trần (ảnh minh họa)"),
        ("Sân khấu diễn xướng văn nghệ ca ngợi công đức Đức Thánh Trần, nghệ sĩ mặc trang phục cổ trang",
         "Diễn xướng văn nghệ ca ngợi Trần Hưng Đạo (ảnh minh họa)"),
        ("Tọa đàm lịch sử về cuộc kháng chiến chống Nguyên Mông, học sinh chăm chú nghe thầy cô giảng bài",
         "Tọa đàm lịch sử – giáo dục truyền thống (ảnh minh họa)"),
    ],
}

def t2i_url(prompt, size="landscape_16_9"):
    return f"https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt={quote(prompt)}&image_size={size}"

def build_frames(html_name):
    frames = []
    for prompt, caption in IMAGE_PROMPTS.get(html_name, []):
        frames.append({
            "src": t2i_url(prompt),
            "caption": caption
        })
    return frames


def _load_summary_fes():
    """Tải bảng SummaryFes và index theo tên lễ hội (tìm gần đúng) cho các HTML target."""
    summary_json = os.path.join(EXTRACT_DIR, "_SummaryFes_structured.json")
    if not os.path.exists(summary_json):
        return {}  # fallback nếu thiếu
    data = json.load(open(summary_json, encoding="utf-8"))
    tables = data.get("tables", [])
    if not tables:
        return {}
    rows = tables[0].get("rows", [])
    if len(rows) < 2:
        return {}
    header = rows[0]
    col_idx = {name.lower().strip(): i for i, name in enumerate(header)}

    def _c(*names):
        for n in names:
            k = n.lower().strip()
            if k in col_idx:
                return col_idx[k]
        return -1

    c_time = _c("Thời gian tổ chức")
    c_addr = _c("Địa điểm diễn ra")
    c_rank = _c("Xếp hạng lễ hội hoặc di tích")
    c_purpose = _c("Mục đích nhân văn")
    c_history = _c("Lịch sử hình thành")
    c_act = _c("Hoạt động chính: Phần Lễ - Phần Hội")
    c_meaning = _c("Ý nghĩa lịch sử văn hóa")
    c_hon = _c("Đối tượng tôn vinh")
    c_arch = _c("Không gian kiến trúc")
    c_uniq = _c("Điểm độc đáo")
    c_img = _c("Hình ảnh")
    c_art = _c("Bài viết")
    c_vid = _c("Video thực tế")
    c_src = _c("Nguồn tài liệu tham khảo")
    c_cmp = _c("So sánh với lễ hội liên quan (nội dung bổ sung)")
    c_name = _c("Tên lễ hội")

    summary_by_html = {}

    SUMMARY_TO_HTML = [
        # (từ khoá trong tên lễ hội bảng, html_name)
        ("trần hưng đạo", "lehoitranhungdao.html"),
        ("khai hạ", "lehoikhahacauan.html"),
        ("chùa bà thiên hậu", "lehoichuabathienhau.html"),
        ("bà thiên hậu", "lehoichuabathienhau.html"),
        ("dinh cô", "lehoidincolonghai.html"),
        ("sayangva", "lehoicungthanlua.html"),
        ("thần lúa", "lehoicungthanlua.html"),
        ("ốp yang vri", "lehoithanrung.html"),
        ("thần rừng", "lehoithanrung.html"),
        ("mùa trái chín", "lehoimuatraichin.html"),
        ("nghinh ông cần giờ", "lehoinghinong.html"),
        ("nghinh ông thắng tam", "lehoinghinongtamthang.html"),
        ("nguyên tiêu", "lehoinguyentieu.html"),
    ]

    def _split_nonempty(cell):
        if not cell or cell.strip() == "" or "không có dữ liệu" in cell.strip().lower():
            return []
        parts = [p.strip() for p in re.split(r"\n+", cell) if p.strip()]
        return parts

    def _urls(cell):
        if not cell:
            return []
        return [u.strip() for u in re.findall(r"https?://[^\s]+", cell) if u.strip()]

    data_rows = rows[1:]
    for r in data_rows:
        name = r[c_name] if c_name >= 0 else ""
        matched_html = None
        for kw, html in SUMMARY_TO_HTML:
            if re.search(re.escape(kw), name, re.IGNORECASE):
                matched_html = html
                break
        if matched_html is None:
            continue
        sec = {}
        if c_rank >= 0:
            v = _split_nonempty(r[c_rank])
            if v:
                sec["rank"] = v
        if c_addr >= 0:
            v = _split_nonempty(r[c_addr])
            if v:
                sec["address"] = v
        if c_time >= 0:
            v = _split_nonempty(r[c_time])
            if v:
                sec["time"] = v
        if c_purpose >= 0:
            v = _split_nonempty(r[c_purpose])
            if v:
                sec["purpose"] = v
        if c_history >= 0:
            v = _split_nonempty(r[c_history])
            if v:
                sec["history"] = v
        if c_act >= 0:
            v = _split_nonempty(r[c_act])
            if v:
                sec["activities"] = v
        if c_meaning >= 0:
            v = _split_nonempty(r[c_meaning])
            if v:
                sec["meaning"] = v
        if c_hon >= 0:
            v = _split_nonempty(r[c_hon])
            if v:
                sec["honoree"] = v
        if c_arch >= 0:
            v = _split_nonempty(r[c_arch])
            if v:
                sec["architecture"] = v
        if c_uniq >= 0:
            v = _split_nonempty(r[c_uniq])
            if v:
                sec["unique"] = v
        resources = []
        if c_art >= 0:
            resources.extend(_urls(r[c_art]))
        if c_vid >= 0:
            resources.extend(_urls(r[c_vid]))
        if c_src >= 0:
            # nguồn tài liệu thường là text -> giữ nguyên cả đoạn
            srcs = _split_nonempty(r[c_src])
            if srcs and resources:
                # đặt sau URL
                resources.extend(srcs)
            elif srcs:
                resources.extend(srcs)
        if resources:
            sec["resources"] = resources
        images_captions = []
        if c_img >= 0:
            imgs = _split_nonempty(r[c_img])
            if imgs:
                images_captions.extend(imgs)
        if c_cmp >= 0:
            cmp = _split_nonempty(r[c_cmp])
            if cmp:
                sec.setdefault("unique", []).extend(cmp)
        if images_captions:
            sec["images_captions"] = images_captions
        summary_by_html[matched_html] = sec
    return summary_by_html


SUMMARY_BY_HTML = _load_summary_fes()


def _merge_summary_into_sec(sec, html_name):
    """Merge section của SummaryFes (ưu tiên) vào dict section của doc lẻ.
    Quy tắc: nếu summary có key mà sec thiếu -> bổ sung.
             nếu cả 2 đều có key -> ưu tiên summary dài hơn / nhiều thông tin hơn.
    """
    s = SUMMARY_BY_HTML.get(html_name, {})
    if not s:
        return sec
    # Đảm bảo __title__ giữ kiểu list trong sec trước khi merge (tránh AttributeError extend sau này)
    if "__title__" in sec and isinstance(sec["__title__"], str):
        sec["__title__"] = [sec["__title__"]]
    KEY_PRIORITY = ["rank", "address", "time", "purpose", "history", "activities",
                    "meaning", "honoree", "architecture", "unique", "resources",
                    "images_captions"]

    def _norm_cmp(x):
        # Chuẩn hóa chuỗi để so sánh trùng lặp (bỏ dấu câu cuối, khoảng trắng thừa, lowercase)
        return re.sub(r"[\s\.\,\;\:\!\?\-]+$", "", str(x)).strip().lower()

    for k in KEY_PRIORITY:
        if k not in s:
            continue
        sum_val = s[k] if isinstance(s[k], list) else [s[k]]
        if k not in sec or not sec[k]:
            sec[k] = list(sum_val)
        else:
            doc_val = sec[k] if isinstance(sec[k], list) else [sec[k]]
            # Ưu tiên summary: hợp nhất 2 danh sách, loại dòng gần như trùng nhau
            seen_norm = set()
            merged = []
            # Duyệt summary trước (ưu tiên)
            for line in sum_val:
                n = _norm_cmp(line)
                if n and n not in seen_norm:
                    seen_norm.add(n)
                    merged.append(line)
            # Duyệt doc lẻ sau (bổ sung thông tin độc đáo)
            for line in doc_val:
                n = _norm_cmp(line)
                if n and n not in seen_norm:
                    seen_norm.add(n)
                    merged.append(line)
            sec[k] = merged
    return sec


def parse_md(md_path):
    """Parse markdown export thành dict các section."""
    text = open(md_path, encoding="utf-8").read()
    lines = text.split("\n")
    out = {}
    _STANDARD_KEYS = {"rank", "address", "time", "intro", "purpose",
                      "history", "activities", "meaning", "honoree",
                      "unique", "architecture", "resources"}

    # Trích xuất bullets
    bullets = []
    for line in lines:
        s = line.rstrip()
        if s.startswith("- "):
            bullets.append(re.sub(r"^-\s*", "", s).strip())

    # Heading patterns (cho bullet-style detection)
    _HEADING_PATTERNS = [
        r"^(?:\d+[\.\)]\s*)?xếp hạng(.*di tích.*)?$",
        r"^(?:\d+[\.\)]\s*)?loại\s*di\s*sản$",
        r"^(?:\d+[\.\)]\s*)?địa\s*chỉ$", r"^(?:\d+[\.\)]\s*)?địa\s*điểm$",
        r"^(?:\d+[\.\)]\s*)?thời\s*gian$", r"^(?:\d+[\.\)]\s*)?thời\s*điểm$",
        r"^(?:\d+[\.\)]\s*)?giới\s*thiệu\s*(chung)?$",
        r"^(?:\d+[\.\)]\s*)?mục\s*đích$", r"^(?:\d+[\.\)]\s*)?mục\s*tiêu$",
        r"^(?:\d+[\.\)]\s*)?giá\s*trị$",
        r"^(?:\d+[\.\)]\s*)?nguồn\s*gốc$",
        r"^(?:\d+[\.\)]\s*)?lịch\s*sử\s*(hình\s*thành|lễ\s*hội)?$",
        r"^(?:\d+[\.\)]\s*)?các\s*hoạt\s*động\s*(chính|của\s*lễ\s*hội)?$",
        r"^(?:\d+[\.\)]\s*)?nội\s*dung\s*chính$",
        r"^(?:\d+[\.\)]\s*)?(ý\s*nghĩa|nghĩa\s*lý)\s*(lịch\s*sử.*văn\s*hóa)?(.*lễ\s*hội)?$",
        r"^(?:\d+[\.\)]\s*)?(ý\s*nghĩa|nghĩa\s*lý)\s*của\s*(lăng|đền|di\s*tích).*$",
        r"^(?:\d+[\.\)]\s*)?điểm\s*(nổi\s*bật|độc\s*đáo|riêng|đặc\s*sắc)(\s*của\s*lễ\s*hội)?$",
        r"^(?:\d+[\.\)]\s*)?tại\s*sao.*$",
        r"^(?:\d+[\.\)]\s*)?giới\s*thiệu\s*(về|với)?\s*.*(lăng|đền|tả\s*quân|đức|trần|hưng\s*đạo|ông|bà)$",
        r"^(?:\d+[\.\)]\s*)?đối\s*tượng\s*tôn\s*vinh\s*$",
        r"^(?:\d+[\.\)]\s*)?(không\s*gian|kiến\s*trúc)$",
        r"^(?:\d+[\.\)]\s*)?(tư\s*liệu|nguồn\s*tài\s*liệu|tham\s*khảo)$",
        r"^(?:\d+[\.\)]\s*)?hình\s*ảnh\s*$",
    ]
    _HEADING_COMPILED = [re.compile(p, re.IGNORECASE) for p in _HEADING_PATTERNS]

    def _is_heading_candidate(text):
        if not text or len(text) > 160:
            return False
        head = text
        if ":" in text:
            head = text.split(":", 1)[0].strip()
        for rx in _HEADING_COMPILED:
            if rx.search(head):
                return True
            if rx.search(text):
                return True
        return False

    # ---------- PASS A: parse theo ### (heading 3) ----------
    current_head = None
    current_body = []
    sec_a_raw = []
    # Track các heading sub-section (7.1, 7.2, ...) → merge vào parent activities thay vì tạo section mới
    _subhead_re = re.compile(r"^\s*\d+\.\d+[\.\)]?\s*")
    parent_stack = []  # list of (head, body) để merge sub-section vào cha
    for line in lines:
        line = line.rstrip()
        if not line.strip():
            continue
        if line.startswith("### "):
            raw_head = re.sub(r"^###\s*", "", line).strip()
            # Check đây là subheading? (dạng Số.Số + nội dung, có parent hợp lệ trong stack)
            is_sub = bool(_subhead_re.match(raw_head))
            # Clean subhead number prefix (bỏ 7.1., 7.2., ...)
            cleaned_subraw = _subhead_re.sub("", raw_head).strip() if is_sub else raw_head
            # KV inline parse
            extracted_body = None
            actual_head = cleaned_subraw
            m_kv = re.match(r"^\s*(?:\d+[\.\)]\s*)?(.+?)[:：]\s*(.+)$", cleaned_subraw)
            if m_kv and len(m_kv.group(2).strip()) > 5:
                actual_head = m_kv.group(1).strip()
                extracted_body = m_kv.group(2).strip()
            # Nếu ko phải subheading và đã có current_head → đẩy vào stack
            if not is_sub:
                # Pop hết stack -> merge vào current
                while parent_stack:
                    ph, pb = parent_stack.pop()
                    if pb:
                        if current_head is None or current_head == "__sub__":
                            current_head = ph
                            if current_body is not pb:
                                current_body.extend(pb)
                        else:
                            current_body.extend(pb)
                if current_head is not None:
                    sec_a_raw.append((current_head, current_body))
                current_head = actual_head
                current_body = []
                if extracted_body:
                    current_body.append(extracted_body)
                # Check heading mới có tiềm năng chứa sub-section không? (vd: các hoạt động chính)
                nk = _normalize_key(actual_head)
                if nk == "activities":
                    parent_stack = []
                    # Đẩy vào stack parent "root activity"
                    parent_stack.append((current_head, current_body))
            else:
                # Subheading: merge vào parent gần nhất
                if parent_stack:
                    # Gắn tiêu đề subheading làm một paragraph trong parent body
                    sub_bullets_added = []
                    if extracted_body:
                        parent_stack[-1][1].append(extracted_body)
                    # Lưu temporary: mọi bullet sau sẽ append vào body cuối cùng của parent_stack
                    # -> dùng current_body trỏ thẳng vào parent body
                    current_head = "__sub__"
                    current_body = parent_stack[-1][1]
                else:
                    # Không có parent, coi như heading bình thường
                    if current_head is not None:
                        sec_a_raw.append((current_head, current_body))
                    current_head = actual_head
                    current_body = []
                    if extracted_body:
                        current_body.append(extracted_body)
        elif line.startswith("## "):
            while parent_stack:
                ph, pb = parent_stack.pop()
                if pb:
                    if current_head is None or current_head == "__sub__":
                        current_head = ph
                        if current_body is not pb:
                            current_body.extend(pb)
                    else:
                        current_body.extend(pb)
            if current_head is not None:
                sec_a_raw.append((current_head, current_body))
                current_head = None
                current_body = []
        elif line.startswith("- "):
            content = re.sub(r"^-\s*", "", line).strip()
            if content:
                if current_head is None or current_head == "__sub__":
                    if parent_stack:
                        parent_stack[-1][1].append(content)
                    elif current_head is None:
                        if "__title__" not in out and len(content) < 80 and re.search(r"lễ\s*hội", content, re.I):
                            out["__title__"] = [content]
                        else:
                            current_body.append(content)
                    else:
                        current_body.append(content)
                else:
                    current_body.append(content)
        else:
            if current_head is None or current_head == "__sub__":
                if parent_stack and line.strip():
                    parent_stack[-1][1].append(line.strip())
                elif current_head is None:
                    if "__title__" not in out:
                        out["__title__"] = [line.strip()]
                else:
                    current_body.append(line.strip())
    while parent_stack:
        ph, pb = parent_stack.pop()
        if pb:
            if current_head is None or current_head == "__sub__":
                current_head = ph
                if current_body is not pb:
                    current_body.extend(pb)
            else:
                current_body.extend(pb)
    if current_head is not None and current_head != "__sub__":
        sec_a_raw.append((current_head, current_body))

    # ---------- PASS B: parse theo bullets (plain bullet sections) ----------
    sec_b_raw = []
    if bullets:
        b_head = None
        b_body = []
        seen_idx0_title = False
        for idx, b in enumerate(bullets):
            if idx == 0 and len(b) < 100 and re.search(r"lễ\s*hội", b, re.I):
                if "__title__" not in out:
                    out["__title__"] = [b]
                    seen_idx0_title = True
                    continue
            is_head = _is_heading_candidate(b)
            if not is_head and len(b) < 70 and idx + 1 < len(bullets):
                next_b = bullets[idx + 1]
                if len(next_b) > 100 and not _is_heading_candidate(next_b):
                    if b.lower() not in ("video", "bài viết", "hình ảnh", "bảo vệ đất nước"):
                        is_head = True
            if is_head:
                if b_head is not None:
                    sec_b_raw.append((b_head, b_body))
                b_head = b
                b_body = []
            else:
                if b.lower() in ("video", "bài viết", "hình ảnh") and idx + 1 < len(bullets):
                    nxt = bullets[idx + 1]
                    if _is_heading_candidate(nxt):
                        continue
                if b_head is not None:
                    b_body.append(b)
                else:
                    if seen_idx0_title and b and len(b) > 20:
                        b_body.append(b)
        if b_head is not None:
            sec_b_raw.append((b_head, b_body))

    # ---------- Chọn pass tốt hơn ----------
    def _score(raw_sections):
        dummy = {}
        for head, body in raw_sections:
            key = _normalize_key(head)
            if key == "__title__":
                continue
            if key not in dummy:
                dummy[key] = list(body)
            else:
                if isinstance(dummy[key], str):
                    dummy[key] = [dummy[key]]
                dummy[key].extend(body)
        return len(_STANDARD_KEYS & set(dummy.keys()))

    sc_a = _score(sec_a_raw)
    sc_b = _score(sec_b_raw)
    sections_raw = sec_a_raw if sc_a >= sc_b else sec_b_raw
    # Merge: nếu B có key mà A không có → bổ sung từ B vào A (nếu A là gốc)
    merged_raw = []
    if sc_a >= sc_b:
        merged_raw = list(sec_a_raw)
        # lấy các key có trong B nhưng chưa có trong A
        a_keys = set()
        for h, b in sec_a_raw:
            a_keys.add(_normalize_key(h))
        for h, b in sec_b_raw:
            k = _normalize_key(h)
            if k != "__title__" and k not in a_keys and b:
                merged_raw.append((h, b))
        sections_raw = merged_raw
    else:
        merged_raw = list(sec_b_raw)
        b_keys = set()
        for h, b in sec_b_raw:
            b_keys.add(_normalize_key(h))
        for h, b in sec_a_raw:
            k = _normalize_key(h)
            if k != "__title__" and k not in b_keys and b:
                merged_raw.append((h, b))
        sections_raw = merged_raw

    # Normalize section keys
    for head, body in sections_raw:
        key = _normalize_key(head)
        if key == "__title__":
            # Title được ưu tiên lấy từ dòng đầu tiên (nếu đã set)
            if "__title__" not in out:
                out["__title__"] = [head.strip()]
            else:
                # Đảm bảo list
                if isinstance(out["__title__"], str):
                    out["__title__"] = [out["__title__"]]
                if head.strip() and head.strip() not in [str(x).strip() for x in out["__title__"]]:
                    out["__title__"].append(head.strip())
            continue
        if key not in out:
            out[key] = list(body)
        else:
            if isinstance(out[key], str):
                out[key] = [out[key]]
            out[key].extend(body)
    return out


def _normalize_key(h):
    """Map các heading khác nhau về cùng 1 key chuẩn."""
    h2 = re.sub(r"^\s*\d+[\.\)]\s*", "", h).strip()  # bỏ số thứ tự
    h2 = h2.replace(":", " ").replace("  ", " ").strip().lower()
    # Các heading bổ sung từ bullet pattern
    if re.search(r"loại\s*di\s*sản", h2) or re.search(r"hạng\s*di\s*tích|phân\s*hạng", h2):
        return "rank"
    if re.search(r"giá\s*trị(?!\s*của)", h2) or re.search(r"ý\s*nghĩa\s*nhân\s*văn|tầm\s*quan\s*trọng", h2) or re.search(r"ý\s*nghĩa", h2):
        return "meaning"
    if re.search(r"^nguồn\s*gốc$|^nguồn\s*gốc\s|nền\s*tảng.*lịch\s*sử", h2):
        return "history"
    if re.search(r"^điểm\s*(nổi\s*bật|đặc\s*sắc|độc\s*đáo|riêng\s*có)(\s*của\s*lễ\s*hội)?$", h2) or re.search(r"nét\s*đặc\s*trưng|đặc\s*điểm", h2):
        return "unique"
    if re.search(r"giới thiệu (về|với)?\s*(lăng|đền|bà|ông|tả quân|đức|nhân vật|trần|hưng|đạo)", h2):
        return "honoree"
    if re.search(r"tại sao|công danh|sự nghiệp|nổi tiếng|đặc biệt", h2):
        return "unique"
    if re.search(r"ý\s*nghĩa.*(lăng|đền|di tích|địa danh|kiến trúc)", h2) and not re.search(r"ý\s*nghĩa\s*lịch\s*sử\s*(và\s*)?văn\s*hóa", h2):
        return "architecture"
    if re.search(r"xếp hạng|hạng|di tích|hạng mục", h2):
        return "rank"
    if re.search(r"địa chỉ|địa điểm|địa bàn|nơi tổ chức", h2):
        return "address"
    if re.search(r"thời gian|thời điểm|ngày.*diễn ra", h2):
        return "time"
    if re.search(r"giới thiệu|tóm tắt|tổng quan", h2):
        return "intro"
    if not re.search(r"^ý\s*nghĩa", h2) and re.search(r"nguồn gốc|lịch sử|hình thành|khởi nguồn", h2):
        return "history"
    if re.search(r"mục đích|mục tiêu|ý đồ|nhân văn|tôn vinh|ý nghĩa|ý nghĩa.*lịch sử.*văn hóa", h2) and "điểm" not in h2 and "khác biệt" not in h2:
        if re.search(r"điểm|đặc sắc|độc đáo|riêng|khác biệt", h2):
            return "unique"
        if re.search(r"mục đích|mục tiêu", h2):
            return "purpose"
        if re.search(r"tôn vinh|đối tượng", h2):
            return "honoree"
        return "meaning"
    if re.search(r"hoạt động chính|nội dung.*chính|chương trình|các.*hoạt động", h2):
        return "activities"
    if re.search(r"đối tượng tôn vinh", h2):
        return "honoree"
    if re.search(r"không gian|kiến trúc", h2):
        return "architecture"
    if re.search(r"điểm độc đáo|điểm riêng|đặc sắc|đặc trưng|khác biệt.*riêng", h2):
        return "unique"
    if re.search(r"tư liệu|nguồn tài liệu|liên kết|tham khảo|video|bài viết", h2):
        return "resources"
    if re.search(r"hình ảnh|ảnh", h2):
        return "images_captions"
    if re.search(r"mùa trái chín|lễ hội.*nghinh ông|nguyên tiêu|thần rừng|bà thiên hậu|thần lúa", h2):
        return "__title__"
    return "__misc__"


def build_article_html(sec, html_name, title_display):
    """Build nội dung <article> theo cấu trúc lehoikhahacauan.html."""
    frames = build_frames(html_name)
    # Tách frames ra để xen giữa các section (1 ảnh đầu, sau mỗi 2 section 1 ảnh, cuối 1 ảnh)
    frame_idx = 0

    def next_frame():
        nonlocal frame_idx
        if frame_idx >= len(frames):
            return ""
        f = frames[frame_idx]
        frame_idx += 1
        return (
            f'<div class="post-frame">'
            f'<img alt="{f["caption"]}" src="{f["src"]}"/>'
            f'<div class="img-ref">{f["caption"]}</div>'
            f"</div>"
        )

    def h4(t): return f'<h4>• {t}</h4>'
    def p(x): return f"<p>\n{x}\n</p>"

    parts = []
    parts.append('<a href="/blog.html"></a>')
    parts.append('<header class="entry-header"></header>')
    parts.append('<div class="entry-content">')

    # Ảnh header
    parts.append(next_frame() or '<div class="post-frame"><img alt="TODO: Bổ sung ảnh đại diện lễ hội" src=""/><div class="img-ref">TODO: Bổ sung ảnh đại diện lễ hội</div></div>')

    parts.append("<h3>Bài viết giới thiệu</h3>")

    missing = []

    # 1. Xếp hạng di tích
    if sec.get("rank"):
        parts.append(h4("Xếp hạng di tích"))
        parts.append(p("<br/>".join(sec["rank"])))
    else:
        parts.append(h4("Xếp hạng di tích"))
        parts.append("<p>TODO: Bổ sung xếp hạng di tích (thiếu trong file Word).</p>")
        missing.append("Xếp hạng di tích")

    # 2. Địa chỉ
    if sec.get("address"):
        parts.append(h4("Địa chỉ"))
        parts.append(p("<br/>".join(sec["address"])))
    else:
        parts.append(h4("Địa chỉ"))
        parts.append("<p>TODO: Bổ sung địa chỉ tổ chức lễ hội.</p>")
        missing.append("Địa chỉ")

    # 3. Thời gian
    if sec.get("time"):
        parts.append(h4("Thời gian"))
        parts.append(p("<br/>".join(sec["time"])))
    else:
        parts.append(h4("Thời gian"))
        parts.append("<p>TODO: Bổ sung thời gian tổ chức lễ hội (ngày/tháng âm/dương lịch).</p>")
        missing.append("Thời gian")

    # 3b. Giới thiệu (nếu có riêng)
    if sec.get("intro"):
        parts.append(h4("Giới thiệu chung"))
        parts.append(p("<br/>".join(sec["intro"])))
    else:
        # Thử dùng phần intro từ resources or honoree if needed (không bắt buộc)
        pass

    # 4. Mục đích
    if sec.get("purpose"):
        parts.append(h4("Mục đích"))
        parts.append(p("<br/>".join(sec["purpose"])))

    # 5. Lịch sử hình thành
    if sec.get("history"):
        parts.append(h4("Lịch sử hình thành"))
        parts.append(p("<br/>".join(sec["history"])))
    else:
        parts.append(h4("Lịch sử hình thành"))
        parts.append("<p>TODO: Bổ sung lịch sử nguồn gốc lễ hội.</p>")
        missing.append("Lịch sử hình thành")

    # Ảnh xen giữa
    fr = next_frame()
    if fr:
        parts.append('<div class="entry-content">' + fr + "</div>")

    # 6. Hoạt động chính
    if sec.get("activities"):
        parts.append(h4("Các hoạt động chính của lễ hội"))
        for body in sec["activities"]:
            # Loại dấu • nếu có, nhưng giữ các keyword Phần lễ / Phần hội / Điểm mới
            text = re.sub(r"^[•\-]\s*", "", body)
            parts.append(p("• " + text if not re.match(r"(Phần [lL]ễ|[Pp]hần [hH]ội|[Đđ]iểm [mM]ới|[Pp]hần [cC]huẩn [bB]ị|[Đđ]iểm [nN]hân)", text) else text))
    else:
        parts.append(h4("Các hoạt động chính của lễ hội"))
        parts.append("<p>TODO: Bổ sung hoạt động lễ hội (phần lễ, phần hội, điểm mới...).</p>")
        missing.append("Các hoạt động chính")

    # Ảnh số 2
    fr = next_frame()
    if fr:
        parts.append('<div class="entry-content">' + fr + "</div>")

    # 7. Ý nghĩa văn hóa
    if sec.get("meaning"):
        parts.append(h4(f"Ý nghĩa lịch sử và văn hóa {title_display}"))
        parts.append(p("<br/>".join(sec["meaning"])))
    else:
        parts.append(h4("Ý nghĩa lịch sử và văn hóa"))
        parts.append("<p>TODO: Bổ sung ý nghĩa lịch sử và văn hóa.</p>")
        missing.append("Ý nghĩa lịch sử và văn hóa")

    # 8. Đối tượng tôn vinh (nếu có)
    if sec.get("honoree"):
        parts.append(h4("Đối tượng tôn vinh"))
        parts.append(p("<br/>".join(sec["honoree"])))

    # 9. Kiến trúc không gian (nếu có)
    if sec.get("architecture"):
        parts.append(h4("Không gian và kiến trúc"))
        parts.append(p("<br/>".join(sec["architecture"])))

    # 10. Điểm độc đáo (nếu có)
    if sec.get("unique"):
        parts.append(h4("Điểm độc đáo riêng"))
        for body in sec["unique"]:
            text = re.sub(r"^[•\-]\s*", "", body)
            parts.append(p("- " + text))
    elif sec.get("__misc__"):
        # Section khác được liệt kê như so sánh thần rừng thần lúa -> đưa vào đây
        parts.append(h4("Thông tin bổ sung"))
        for body in sec["__misc__"][:10]:
            text = re.sub(r"^[•\-]\s*", "", body)
            parts.append(p("- " + text))

    # Ảnh số 3 (trước tư liệu)
    fr = next_frame()
    if fr:
        parts.append('<div class="entry-content">' + fr + "</div>")

    # 11. Tư liệu tìm hiểu thêm (Resources)
    if sec.get("resources"):
        parts.append(h4("Tư liệu tìm hiểu thêm"))
        videos = []
        articles = []
        source_cites = []
        current_cat = None
        for line in sec["resources"]:
            l_low = line.lower()
            is_url = bool(re.match(r"https?://", str(line)))
            # Keyword đánh dấu phân loại (dành cho dòng không phải URL)
            if not is_url:
                if re.search(r"video|phim|phóng sự|thực tế|youtube|youtu", l_low) and len(line) < 80:
                    current_cat = "video"
                    continue
                if re.search(r"bài viết|báo chí|thông cáo|ghi nhận|lịch trình|danh mục|tin tức|bài báo|nguồn|tư liệu|tham khảo", l_low) and len(line) < 80:
                    current_cat = "article"
                    continue
                # Không phải URL, không phải keyword -> xem là nguồn trích dẫn text
                source_cites.append(line)
                continue
            # Là URL: phân loại theo domain
            if re.search(r"(youtube\.com|youtu\.be|vimeo\.com|dailymotion\.com|facebook\.com/.*/videos|fb\.watch)", l_low):
                videos.append(line)
            elif re.search(r"(tcdulichtphcm\.vn|vov\.vn|vtv\.vn|tuoitre\.vn|vnexpress\.net|laodong\.vn|thanhnien\.vn|bienphong\.com\.vn|phunuvietnam\.vn|baophutho\.vn|vietnamnet\.vn|sggp\.org\.vn|vietnamtourism\.gov\.vn|dulichbinhduong\.org\.vn|bantho\.net|luatminhkhue\.vn|hcmcpv\.org\.vn|baolangson\.vn|baomoi\.com\.epi|baotangbrvt\.org\.vn|vinwonders\.com|mia\.vn|aseantraveller\.net|qdnd\.vn)", l_low):
                articles.append(line)
            elif current_cat == "article":
                articles.append(line)
            elif current_cat == "video":
                videos.append(line)
            else:
                # Mặc định: URL không rõ domain -> đưa vào bài viết (thường là tin tức)
                articles.append(line)

        if videos:
            parts.append("<h5>• Video</h5>")
            for v in videos:
                parts.append(f'<p> - Xem thêm: <a href="{v}" target="_blank" rel="noopener">{v}</a></p>')
        if articles:
            parts.append("<h5>• Bài viết</h5>")
            for a in articles:
                parts.append(f'<p> - Xem thêm: <a href="{a}" target="_blank" rel="noopener">{a}</a></p>')
        if source_cites:
            # Lọc bỏ các dòng rườm rà kiểu "Bạn có thể xem...", "Phóng sự ... tại YouTube/Báo..." chỉ giữ nguồn ngắn gọn
            _FLUFF_RE = re.compile(
                r"^(?:"
                r"bạn\s*(có\s*thể|thường)?\s*(xem|tìm\s*hiểu|tham\s*khảo|đọc)\b|"
                r"(?:xem\s*khung\s*cảnh|xem\s*cảnh|xem\s*hát\s*bội|tìm\s*hiểu\s*sâu\s*hơn|chi\s*tiết\s*hơn|thêm\s*thông\s*tin)"
                r".*?(?:qua\s*(?:đường\s*)?link|bài\s*báo|video|nguồn\s*tài\s*liệu)|"
                r"(?:xem\s*thêm|chi\s*tiết|thông\s*tin|cảnh\s*.?qua|hát\s*bội.?trong\s*lễ\s*hội|hát\s*bả\s*trạo)\b|"
                r"(?:nét\s*đẹp\s*lễ\s*hội|không\s*khí\s*ngày\s*hội|phóng\s*sự(?:\s*(?:khai\s*mạc|rước\s*kiệu))?|toàn\s*cảnh\s*không\s*gian|"
                r"thông\s*cáo\s*chính\s*thức|ghi\s*nhận\s*báo\s*chí|lịch\s*trình\s*trải\s*nghiệm|cảnh\s*ngày\s*hội|"
                r"trải\s*nghiệm\s*thực\s*tế|clip\s*truyền\s*hình|thước\s*phim\s*thực\s*tế|tìm\s*hiểu\s*toàn\s*bộ)\s*:.*"
                r"(?:tại\s*(?:video\s+|báo\s+điện\s+tử|cổng\s+thông\s+tin|phóng\s+sự|video\s+báo\s+)|trên\s+you\s*tube|tại\s+vtv\.vn|tại\s+lao\s+động|tại\s+vietnamnet|tại\s+thanh\s*niên|tại\s+bình\s*dương)"
                r")",
                re.IGNORECASE
            )
            _KEYWORD_KEEP = re.compile(
                r"(nghị\s*quyết|nxb|nhà\s*xuất\s*bản|cục\s*du\s*lịch|bảo\s*tàng|viện\s*khoa\s*học|sở\s*văn\s*hóa|tòa\s*thường\s*vụ|quốc\s*hội|sổ\s*tay|hồ\s*sơ|cơ\s*sở\s*dữ\s*liệu|thư\s*viện|huỳnh\s*ngọc\s*trảng|gia\s*định\s*thành\s*thông\s*chí|đề\s*xuất\s*an\s*tả\s*quân)",
                re.IGNORECASE
            )
            clean = []
            seen_src = set()
            for s in source_cites:
                ss = s.strip()
                if not ss:
                    continue
                has_keep = bool(_KEYWORD_KEEP.search(ss))
                is_fluff = bool(_FLUFF_RE.search(ss))
                # Bổ sung luật thêm: dòng có chứa "tại <báo/youtube>" hoặc "trên YouTube" & không có keep keyword → loại
                if not has_keep and not is_fluff:
                    if re.search(
                        r"(tại\s*(?:video\s+|báo\s+điện\s+tử|cổng\s+thông\s+tin|phóng\s+sự|video\s+báo)|trên\s+you\s*tube|tại\s+(vtv|lao\s+động|vietnamnet|thanh\s*niên|bình\s*dương))",
                        ss, re.IGNORECASE
                    ):
                        is_fluff = True
                # Luật 2: Bắt đầu bằng pattern "Cụm từ ngắn 2-6 từ + dấu hai chấm" (tiêu đề mô tả)
                # ví dụ: "Nét đẹp lễ hội:", "Không khí ngày hội:", "Ký sự truyền hình:", "Toàn cảnh không gian:"
                if not has_keep and not is_fluff:
                    if re.match(
                        r"^\s*["
                        r"A-ZĐÂÊÔƠƯÀÁẢẠÃÈÉẺẸÃÌÍỈỊÃÒÓỎỌÃÙÚỦỤÃỲÝỶỸÃ"
                        r"a-zđâêôơưàáảạãèéẻẹãìíỉịãòóỏọãùúủụãỳýỷỹã"
                        r"\s]+"
                        r"(?:lễ\s*hội|ngày\s*hội|phóng\s*sự|ký\s*sự|truyền\s*hình|thông\s*cáo|ghi\s*nhận|lịch\s*trình|"
                        r"nét\s*đẹp|không\s*khí|toàn\s*cảnh|trải\s*nghiệm|thước\s*phim|clip\s*phim|cảnh\s*ngày|"
                        r"tìm\s*hiểu|mở\s*đầu|rước\s*kiệu|hoạt\s*cảnh|tư\s*liệu)\b"
                        r".{0,50}:\s",
                        ss, re.IGNORECASE
                    ):
                        # Xác nhận thêm: tiêu đề này mô tả link đến báo/video (đã có mục riêng)
                        if re.search(
                            r"(https?://|youtube|youtu\.be|báo\s+điện\s+tử|vtv\.vn|lao\s*động|vietnamnet|"
                            r"sài\s*gòn\s*giải\s*phóng|thanh\s*niên|tại\s+nhà\s+văn\s*hóa|đài\s+truyền\s*hình|"
                            r"phóng\s+sự|cục\s+du\s+lịch\s+(?!quốc\s+gia\s+việt\s+nam,\s+hồ\s+sơ|"
                            r"cơ\s+sở\s+dữ\s+liệu|điểm\s+đến))",
                            ss, re.IGNORECASE
                        ):
                            is_fluff = True
                # Luật 3: "... do đài truyền hình <tỉnh> thực hiện" (không phải trích dẫn chính thức)
                if not has_keep and not is_fluff:
                    if re.search(
                        r"do\s+đài\s+truyền\s*hình(?:\s+[a-zđâêôơưàáảạãèéẻẹãìíỉịãòóỏọãùúủụãỳýỷỹã]+){1,5}\s+thực\s*hiện",
                        ss, re.IGNORECASE
                    ):
                        is_fluff = True
                # Luật 4: Có URL http bên trong text mô tả → đã được tách vào Video/Bài viết, bỏ text lặp
                if not has_keep and not is_fluff and re.search(r"https?://", ss):
                    is_fluff = True
                # Luật 5: Là caption ảnh (chứa "Ảnh:" hoặc mô tả địa điểm chụp, người dân làm gì đó "giã bánh", "chuẩn bị cho lễ cúng")
                if not has_keep and not is_fluff:
                    if re.search(r"(?:Ảnh\s*[:：]|Hình\s*[:：]|\(Nguồn\s*[:：]|\(ảnh\s*:|ảnh\s*bởi|chụp\s*màn\s*hình)", ss, re.IGNORECASE):
                        is_fluff = True
                if not has_keep and not is_fluff:
                    # Mô tả chi tiết hình ảnh (người dân + hành động lễ hội + địa điểm cụ thể như cánh đồng, di tích)
                    if re.search(
                        r"(?:người\s+dân|cư\s+dân|em\s+bé|bà\s+con|anh\s+em|đoàn\s+lân|đoàn\s+sư|tượng\s+|mộ\s+cô|khu\s+di\s+tích|ngôi\s+nhà\s+mồ|cánh\s+đồng|dàn\s+nhạc|đàn\s+ông\s+bà)\s+"
                        r"(?:giã\s+bánh|chuẩn\s+bị|trình\s+diễn|diễn\s+tấu|mặc\s+|đứng\s+tại|sau\s+trùng\s+tu|được\s+bài\s+trí|khang\s+trang|chào\s+hỏi|ăn\s+hặt|đánh\s+cồng\s+chiêng)",
                        ss, re.IGNORECASE
                    ):
                        is_fluff = True
                # Luật 6: Dòng chỉ tên báo đơn lẻ kiểu "Báo tuổi trẻ", "Laodong.vn", "nguồn: thanhnien"
                if not has_keep and not is_fluff:
                    if re.fullmatch(
                        r"\s*(?:Nguồn\s*[:：]\s*)?"
                        r"(?:Báo\s+)?(?:Tuổi\s+trẻ|Thanh\s*niên|VTV|Sài\s*Gòn\s*Giải\s*Phóng|VOV|Biển\s*Phòng|Việt\s*Namnet|LAODONG|Lao\s*Động|Bảo\s*Phú\s*Thọ|Phụ\s*Nữ|Bình\s*Dương)"
                        r"(?:\.vn|\.com\.vn|\.org\.vn)?\s*`?\.?\s*",
                        ss, re.IGNORECASE
                    ):
                        is_fluff = True
                # Luật 7: Dòng chứa cụm "nguồn: <tên báo>" lặp nhiều lần
                if not has_keep and not is_fluff and len(ss) < 180:
                    # Đếm số lần xuất hiện pattern "nguồn: <báo>" trong 1 dòng
                    if len(re.findall(r"nguồn\s*[:：]\s*[a-zđâêôơưàáảạãèéẻẹãìíỉịãòóỏọãùúủụãỳýỷỹã\.\- ]{3,20}", ss, re.IGNORECASE)) >= 2:
                        is_fluff = True
                # Luật 8: Fragment lỗi nối không đúng (dạng "bảo vệ đất nước.nguồn:" hoặc có ".nguồn:" ở giữa)
                if not has_keep and not is_fluff:
                    if re.search(r"[a-zđâêôơưàáảạãèéẻẹãìíỉịãòóỏọãùúủụãỳýỷỹã]\s*\.\s*nguồn\s*[:：]", ss, re.IGNORECASE) and not re.search(
                        r"^\s*(?:Nghị\s+quyết|NXB|Nhà\s+xuất\s+bản|Cục\s+Du\s+lịch|Sổ\s+tay|Hồ\s+sơ|Cơ\s+sở\s+dữ\s+liệu|Bảo\s+tàng)\b",
                        ss, re.IGNORECASE
                    ):
                        is_fluff = True
                # Luật 9: Dòng mang tính "mời xem / dẫn dắt link" nhưng không chứa nguồn chính thức
                # ví dụ: "Bạn có thể tìm hiểu sâu hơn...", "Video ghi nhận không gian...", "Tìm hiểu nét riêng biệt..."
                if not has_keep and not is_fluff:
                    if re.match(
                        r"^\s*(?:Bạn\s+(?:có\s+thể|cũng\s+có\s+thể|thường)?\s*"
                        r"(?:tìm\s*hiểu|thao\s*khảo|tham\s*khảo|xem\s+thêm|đi\s+đến|chuẩn\s+bị\s+đi)\b.*"
                        r"(?:qua\s*(?:bài\s*viết|bào\s*viết|bảo\s*tàng|link|đường\s*link|bài\s*báo|video|đây\s*$|"
                        r"tại\s+đây\s*\.?$|trước\s+khi\s+đi|của\s+(?:bảo\s*tàng|báo\s+điện\s+tử|bào\s+chí))|"
                        r"(?:Tìm\s*hiểu|Xem\s*lại|Video\s+(?:ghi\s*nhận|phóng\s*sự|thực\s*tế|truyền\s*hình)|"
                        r"Ghi\s*nhận(?:\s+báo\s*chí)?|Bảo\s*tồn,\s*lan\s*tỏa)\b.*"
                        r"(?:(?:của|tại|về|ở|trong|qua|từ)\s+(?:người\s+Chơ\s*ro|cồng\s+chiêng|lễ\s+cúng\s+thần|cánh\s+đồng|"
                        r"nghệ\s*thuật\s+diễn\s+xướng|lễ\s*hội|không\s*gian\s+kiến\s*trúc|ý\s*nghĩa\s+văn\s*hóa|cụm\s+tháp|"
                        r"tiết\s+mục\s+sôi\s*động|diễu\s*hành|link)$|"
                        r"(?:người\s+Chơ\s*ro|Chơ\s*ro)\s*$|"
                        r"văn\s*hóa\s+Chơ\s*Ro\.?\s*$|"
                        r"Tiết\s+Nguyên\s+tiêu\s+qua\s*link\.?\s*$))",
                        ss, re.IGNORECASE
                    ):
                        is_fluff = True
                if is_fluff and not has_keep:
                    continue
                # Loại dòng quá ngắn không chứa thông tin
                if len(ss) < 12 and not re.match(r"https?://", ss):
                    continue
                # Loại dòng chỉ toàn "link", "qua link", "bài báo"
                if re.fullmatch(r"(?:qua\s*)?(?:đường\s*)?link(?:\s*(?:bài\s*báo|video))?\.?\s*", ss, re.IGNORECASE):
                    continue
                norm = ss.lower()
                if norm in seen_src:
                    continue
                seen_src.add(norm)
                # Rút gọn nếu dòng dài (>160 ký tự) + chứa danh từ giữ -> giữ tối đa 157 ký tự
                if len(ss) > 160 and has_keep:
                    ss = ss[:157] + "..."
                clean.append((ss, has_keep))
            # Phân loại clean: ưu tiên có keep keyword
            keep_lines = [line for (line, kp) in clean if kp]
            soft_lines = [line for (line, kp) in clean if not kp]
            # Quy tắc cuối: nếu không có dòng nào có keep keyword và soft_lines < 2 -> fallback tự tạo
            use_fallback = False
            if not keep_lines and len(soft_lines) < 2:
                use_fallback = True
            # Ngược lại: ưu tiên hiển thị keep_lines + soft_lines (tối đa 6 dòng tổng)
            final_lines = list(keep_lines) + list(soft_lines)
            final_lines = final_lines[:6]
            if not use_fallback and final_lines:
                parts.append("<h5>• Nguồn tham khảo</h5>")
                for s in final_lines:
                    if re.match(r"https?://", s):
                        parts.append(f'<p> - <a href="{s}" target="_blank" rel="noopener">{s}</a></p>')
                    else:
                        parts.append(f"<p> - {s}</p>")
            else:
                # Không có nguồn tham khảo text -> tự tạo 2-3 dòng tóm tắt ngắn gọn về lễ hội
                def _first_line(arr, maxlen=120):
                    if not arr:
                        return ""
                    v = arr[0] if isinstance(arr, list) else str(arr)
                    v = re.sub(r"^\s*[-•]\s*", "", str(v)).strip()
                    if len(v) > maxlen:
                        v = v[: maxlen - 1] + "…"
                    return v

                fallback_lines = []
                # Dòng 1: Thời gian + địa điểm
                t = _first_line(sec.get("time"), 100)
                a = _first_line(sec.get("address"), 140)
                if t or a:
                    seg = "📅 "
                    if t:
                        seg += t.rstrip(" .")
                        if a:
                            seg += " – "
                    if a:
                        seg += a.rstrip(" .")
                    if seg != "📅 ":
                        fallback_lines.append(seg + ".")
                # Dòng 2: Xếp hạng / di sản + ý nghĩa 1 câu
                rk = _first_line(sec.get("rank"), 100)
                mn = _first_line(sec.get("meaning"), 160)
                if rk or mn:
                    seg2 = "🏛️ "
                    if rk:
                        seg2 += rk.rstrip(" .")
                        if mn:
                            seg2 += ", "
                    if mn:
                        _m = mn.rstrip(" .")
                        # Giữ lại mệnh đề đầu tiên trước dấu chấm/phẩy dài
                        _m_s = re.split(r"\.\s", _m)
                        if _m_s:
                            seg2 += _m_s[0].rstrip(" ,")
                        else:
                            seg2 += _m
                    fallback_lines.append(seg2.rstrip(" ,") + ".")
                # Dòng 3: Đối tượng tôn vinh + điểm độc đáo 1 nét
                hv = _first_line(sec.get("honoree"), 140)
                uq = _first_line(sec.get("unique"), 140)
                if hv or uq:
                    seg3 = "⭐ "
                    if hv:
                        seg3 += "Tôn vinh " + hv.rstrip(" .")
                        if uq:
                            seg3 += " | "
                    if uq:
                        _u = re.split(r"[;.]", str(uq).lstrip("- "))
                        if _u and _u[0].strip():
                            seg3 += _u[0].strip().rstrip(" .")
                    if seg3.strip() not in ("⭐", "⭐ | "):
                        fallback_lines.append(seg3.rstrip(" |-,") + ".")
                # Đảm bảo đủ 2 dòng tối thiểu (dùng intro hoặc purpose làm dự phòng)
                if len(fallback_lines) < 2:
                    it = _first_line(sec.get("intro") or sec.get("purpose"), 160)
                    if it:
                        fallback_lines.append("📖 " + it.rstrip(" .") + ".")
                if len(fallback_lines) < 2:
                    fallback_lines.append(
                        "📖 "
                        + re.sub(r"^Lễ hội\s+", "", title_display, flags=re.I).strip()
                        + " là lễ hội văn hóa truyền thống đặc sắc gắn với đời sống tâm linh người dân tại TP.HCM."
                    )
                # Giới hạn 3 dòng tối đa
                fallback_lines = fallback_lines[:3]
                if fallback_lines:
                    parts.append("<h5>• Nguồn tham khảo</h5>")
                    for s in fallback_lines:
                        parts.append(f"<p> - {s}</p>")
        if not videos and not articles:
            # Đưa toàn bộ nội dung resource raw (kể cả source_cites)
            parts.append("<h5>• Tư liệu</h5>")
            for line in sec["resources"]:
                if re.match(r"https?://", line):
                    parts.append(f'<p> - <a href="{line}" target="_blank" rel="noopener">{line}</a></p>')
                else:
                    parts.append(f"<p> - {line}</p>")

    # Ảnh cuối (4, 5)
    for _ in range(2):
        fr = next_frame()
        if fr:
            parts.append('<div class="entry-content">' + fr + "</div>")

    # Close entry-content
    parts.append("</div>")

    # Build aside summary dùng sau
    return "\n".join(parts), missing


def build_sidebar_html(sec, title_display):
    """Build nội dung <aside> theo template (AR, LOẠI LỄ HỘI, TÓM TẮT)."""
    # Phân loại lễ hội (nếu có thể đoán từ section rank/meaning)
    loai = "Lễ hội văn hóa truyền thống."
    title_val = sec.get("__title__", "")
    if isinstance(title_val, list):
        title_val = " ".join(title_val)
    sec_misc = " ".join(sec.get("rank", []) + sec.get("meaning", []) + [title_val])
    if re.search(r"đối tượng.*tôn vinh|Bà Thiên Hậu|Thần Lúa|Thần Rừng|Ông Cá|Ông Thủy", sec_misc, re.IGNORECASE):
        loai = "Lễ hội tín ngưỡng – văn hóa tâm linh truyền thống."
    if re.search(r"nông nghiệp|thần lúa|mùa trái chín|mùa màng", sec_misc, re.IGNORECASE):
        loai = "Lễ hội tín ngưỡng – văn hóa nông nghiệp truyền thống."
    if re.search(r"ngư dân|biển|nghinh ông|thủy", sec_misc, re.IGNORECASE):
        loai = "Lễ hội tín ngưỡng – văn hóa ngư dân truyền thống."
    if re.search(r"gốc hoa|nguyên tiêu|chùa bà|phúc kiên|triều châu", sec_misc, re.IGNORECASE):
        loai = "Lễ hội tín ngưỡng – văn hóa cộng đồng người Việt gốc Hoa."
    if re.search(r"chơ[- ]?ro|thổ cẩm|bùn|srê", sec_misc, re.IGNORECASE):
        loai = "Lễ hội tín ngưỡng – văn hóa truyền thống của dân tộc Chơ-Ro."

    # Tóm tắt: dùng intro + mục đích/ý nghĩa (1 câu)
    intro_parts = sec.get("intro") or sec.get("purpose") or sec.get("meaning") or []
    summary_lines = [re.sub(r"^[•\-]\s*", "", x) for x in intro_parts[:2] if len(x) < 250]
    if not summary_lines:
        # Fallback
        t = title_display.replace("Lễ hội ", "")
        summary_lines = [f"{title_display} là lễ hội văn hóa truyền thống đặc sắc, giữ gìn và phát huy bản sắc văn hóa tại TP.HCM."]
    summary = " ".join(summary_lines).strip()
    if len(summary) > 300:
        summary = summary[:297] + "..."

    aside = f'''<aside class="custom-sidebar">
<h3 style="font-weight:bold; color:#007bff;">TRẢI NGHIỆM AR</h3>
<div style="margin-bottom:15px;">
  <button id="arButton" style="background: #e53935; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 16px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px;">
    <i class="fa fa-camera"></i> Mở AR xem linh vật
  </button>
  <model-viewer id="arViewer" src="https://modelviewer.dev/shared-assets/models/Astronaut.glb" ar ar-modes="webxr scene-viewer quick-look" camera-controls style="width: 100%; height: 400px; margin-top: 10px; display: none;" ios-src="https://modelviewer.dev/shared-assets/models/Astronaut.usdz"></model-viewer>
  <p style="font-size: 0.9em; margin-top: 5px;">Nhấn nút để mở AR xem linh vật của lễ hội!</p>
</div>
<h3 style="font-weight:bold; color:#007bff;">LOẠI LỄ HỘI</h3>
<div style="margin-bottom:15px;">
{loai}
 </div>
<h3 style="font-weight:bold; color:#007bff;">TÓM TẮT LỄ HỘI</h3>
<div style="margin-bottom:15px;">
{summary}
</div>
</aside>'''
    return aside


def patch_html_file(md_name, html_name, title_display):
    md_path = os.path.join(EXTRACT_DIR, md_name)
    html_path = os.path.join(ROOT, html_name)
    if not os.path.exists(md_path):
        return {"html": html_name, "status": "SKIP", "reason": f"Missing markdown {md_path}"}
    if not os.path.exists(html_path):
        return {"html": html_name, "status": "SKIP", "reason": f"Missing HTML {html_path}"}

    sec = parse_md(md_path)
    sec = _merge_summary_into_sec(sec, html_name)
    article_new, missing = build_article_html(sec, html_name, title_display)
    sidebar_new = build_sidebar_html(sec, title_display)

    raw = open(html_path, encoding="utf-8").read()

    # 1) Thay title
    title_re = re.compile(r"<title>.*?</title>", re.IGNORECASE | re.DOTALL)
    raw = title_re.sub(f"<title>{title_display}</title>", raw, count=1)

    # 2) Thay <h1 class="entry-title">...</h1>
    h1_re = re.compile(r'<h1 class="entry-title">.*?</h1>', re.IGNORECASE | re.DOTALL)
    raw = h1_re.sub(f'<h1 class="entry-title">{title_display}</h1>', raw, count=1)

    # 3) Thay article block
    article_re = re.compile(r'<article class="post hentry">.*?</article>', re.IGNORECASE | re.DOTALL)
    if not article_re.search(raw):
        return {"html": html_name, "status": "FAIL", "reason": "Missing <article class=\"post hentry\"> block", "missing": missing}
    raw = article_re.sub(
        f'<article class="post hentry">\n{article_new}\n</article>',
        raw, count=1
    )

    # 4) Thay aside.custom-sidebar block
    aside_re = re.compile(r'<aside class="custom-sidebar">.*?</aside>', re.IGNORECASE | re.DOTALL)
    if not aside_re.search(raw):
        missing.append("Sidebar block not found")
    else:
        raw = aside_re.sub(sidebar_new, raw, count=1)

    # Ghi ra
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(raw)

    return {"html": html_name, "status": "OK", "missing": missing,
            "rank_present": bool(sec.get("rank")),
            "address_present": bool(sec.get("address")),
            "time_present": bool(sec.get("time")),
            "history_present": bool(sec.get("history")),
            "activities_present": bool(sec.get("activities")),
            "meaning_present": bool(sec.get("meaning")),
            "resources_present": bool(sec.get("resources")),
            "images_count": len(sec.get("images_captions", []))
            }


def main():
    results = []
    for md, html, title in MAPPING:
        res = patch_html_file(md, html, title)
        results.append(res)
        print(f"[{res['status']}] {html}: missing={res.get('missing', [])}")
    out_path = os.path.join(EXTRACT_DIR, "patch_results.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print(f"\n✅ Hoàn tất. Chi tiết tại {out_path}")


if __name__ == "__main__":
    main()
