import json

festivals = [
    {
        "name": "Lễ hội Khai Hạ - Cầu An",
        "page": "lehoikhahacauan.html",
        "category": "truyenthong",
        "category_en": "Traditional festival",
        "category_vi": "Lễ hội truyền thống",
        "address_md": "Lăng Đức Thượng Công Tả Quân Lê văn Duyệt, số 1 đường Vũ Tùng, Phường Gia Định, Thành phố Hồ Chí Minh",
        "coords_guess": [10.80192, 106.69731],
        "image": "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=L%E1%BB%85%20h%E1%BB%99i%20Khai%20h%E1%BA%A1%20C%E1%BA%A7u%20an%20t%E1%BA%A1i%20L%C4%83ng%20T%E1%BA%A3%20qu%C3%A2n%20L%C3%AA%20V%C4%83n%20Duy%E1%BB%87t%2C%20h%C3%A0ng%20ngh%C3%ACn%20ng%C6%B0%E1%BB%9Di%20d%C3%A2n%20th%C3%A0nh%20t%C3%A2m%20d%C3%A2ng%20h%C6%B0%C6%A1ng%2C%20kh%C3%B4ng%20kh%C3%AD%20trang%20nghi%C3%AAm&image_size=landscape_16_9",
        "description": "Lễ hội truyền thống cầu bình an, quốc thái dân an tại Lăng Tả quân Lê Văn Duyệt.",
        "vr": "non"
    },
    {
        "name": "Lễ hội Nghinh Ông Cần Giờ",
        "page": "lehoinghinong.html",
        "category": "venbien",
        "category_vi": "Lễ hội ven biển",
        "address_md": "Xã Cần Giờ (và xã Bình Khánh, An Thới Đông), Thành phố Hồ Chí Minh",
        "coords_guess": [10.52339, 106.86591],
        "image": "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=L%E1%BB%85%20h%E1%BB%99i%20Nghinh%20%C3%94ng%20C%E1%BA%A7n%20Gi%E1%BB%9D%2C%20b%C3%A3i%20bi%E1%BB%83n%20ng%C3%A0y%20h%E1%BB%99i%2C%20h%C3%A0ng%20tr%C4%83m%20chi%E1%BA%BFc%20thuy%E1%BB%81n%20trang%20tr%C3%AD%20c%E1%BB%9D%20hoa%2C%20ti%E1%BA%BFng%20c%E1%BB%97ng%20chi%C3%AAng%20r%E1%BB%99n%20r%C3%A3&image_size=landscape_16_9",
        "description": "Lễ hội đặc sắc của ngư dân Cần Giờ nhằm tôn vinh cá Ông (cá voi) và cầu ngư lộc.",
        "vr": "non"
    },
    {
        "name": "Lễ hội Tết Nguyên Tiêu",
        "page": "lehoinguyentieu.html",
        "category": "congdonghoa",
        "category_vi": "Lễ hội cộng đồng Hoa",
        "address_md": "Phường An Đông, khu vực Chợ Lớn, quận 5, Thành phố Hồ Chí Minh",
        "coords_guess": [10.75422, 106.66856],
        "image": "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=L%E1%BB%85%20h%E1%BB%99i%20Nguy%C3%AAn%20Ti%C3%AAu%20Ch%E1%BB%A3%20L%E1%BB%9Bn%2C%20%C4%91o%C3%A0n%20di%E1%BB%85u%20h%C3%A0nh%20m%C3%BAa%20l%C3%A2n%20s%C6%B0%20r%E1%BB%93ng%2C%20r%C6%B0%E1%BB%9Bc%20%C4%91%C3%A8n%20s%C3%B4i%20%E1%BB%91ng%20tr%C3%AAn%20ph%E1%BB%91&image_size=landscape_16_9",
        "description": "Lễ hội rằm tháng Giêng của cộng đồng người Hoa với rước đèn và múa lân.",
        "vr": "non"
    },
    {
        "name": "Lễ hội Thần Rừng Ốp Yang Vri",
        "page": "lehoithanrung.html",
        "category": "danhocthieuso",
        "category_vi": "Lễ hội dân tộc thiểu số",
        "address_md": "Xã Xuân Sơn (cánh đồng Cà Mum), Hóc Môn, TP.HCM (các xã Xuân Sơn, Bầu Lâm, Ngãi Giao, Kim Long, Nghĩa Thành)",
        "coords_guess": [10.89326, 106.63785],
        "image": "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=L%E1%BB%85%20h%E1%BB%99i%20Th%E1%BA%A7n%20R%E1%BB%ABng%20ng%C6%B0%E1%BB%9Di%20Ch%C6%A1-Ro%2C%20gi%C3%A0%20l%C3%A0ng%20trang%20nghi%C3%AAm%20c%C3%B9ng%20c%E1%BB%91m%20d%C3%A2n%2C%20b%C3%A0n%20t%E1%BA%BF%20b%C3%A0y%20l%E1%BB%85%20v%E1%BA%ADt%20t%E1%BA%A1i%20c%E1%BA%A3nh%20%C4%91%E1%BB%93ng%20C%C3%A0%20Mum&image_size=landscape_16_9",
        "description": "Lễ hội truyền thống của người Chơ-Ro nhằm tạ ơn Thần Rừng, cầu bình an và mùa màng bội thu.",
        "vr": "non"
    },
    {
        "name": "Lễ hội Chùa Bà Thiên Hậu",
        "page": "lehoichuabathienhau.html",
        "category": "tongiao",
        "category_vi": "Lễ hội tôn giáo",
        "address_md": "Chùa Bà Thiên Hậu, Thủ Dầu Một, tỉnh Bình Dương (Bình Dương cũ)",
        "coords_guess": [10.96858, 106.66973],
        "image": "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=L%E1%BB%85%20h%E1%BB%99i%20Ch%C3%B9a%20B%C3%A0%20Thi%C3%AAn%20H%E1%BA%ADu%20Th%E1%BB%A7%20D%E1%BA%A7u%20M%E1%BB%99t%2C%20h%C3%A0ng%20ngh%C3%ACn%20ng%C6%B0%E1%BB%9Di%20h%C6%B0%C6%A1ng%20th%E1%BB%9D%20B%C3%A0%2C%20khu%20v%E1%BB%B1c%20%C4%91%C3%ACnh%20%C4%91%E1%BB%93%20chim%20c%E1%BB%9D%20hu%E1%BA%BF&image_size=landscape_16_9",
        "description": "Lễ hội lớn tại Bình Dương tôn vinh Bà Thiên Hậu, thu hút đông đảo người dân và du khách.",
        "vr": "non"
    },
    {
        "name": "Lễ hội Cúng Thần Lúa Ốp Yang Va",
        "page": "lehoicungthanlua.html",
        "category": "danhocthieuso",
        "category_vi": "Lễ hội dân tộc thiểu số",
        "address_md": "Nhà văn hóa dân tộc Chơ Ro xã Kim Long, Thành phố Hồ Chí Minh",
        "coords_guess": [10.86973, 106.74127],
        "image": "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=L%E1%BB%85%20h%E1%BB%99i%20C%C3%B9ng%20Th%E1%BA%A7n%20L%E1%BB%A9a%20ng%C6%B0%E1%BB%9Di%20Ch%C6%A1-Ro%2C%20c%E1%BB%99ng%20chi%C3%AAng%20r%E1%BB%99n%20r%C3%A3%2C%20b%C3%A0n%20t%E1%BA%BF%20b%C3%A0y%20b%C3%B4ng%20l%E1%BB%A9a%20v%C3%A0%20m%C3%A2m%20c%E1%BB%97ng%20d%C3%A2n%20gi%C3%A0%20l%C3%A0ng&image_size=landscape_16_9",
        "description": "Lễ hội của người Chơ-ro nhằm tạ ơn thần lúa và cầu mùa màng bội thu.",
        "vr": "non"
    },
    {
        "name": "Lễ hội Lái Thiêu Mùa Trái Chín",
        "page": "lehoimuatraichin.html",
        "category": "nongnghiep",
        "category_vi": "Lễ hội nông nghiệp",
        "address_md": "Thị xã Thuận An, Bình Dương cũ (khu vực Lái Thiêu, bờ sông Sài Gòn)",
        "coords_guess": [10.87011, 106.65439],
        "image": "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=L%E1%BB%85%20h%E1%BB%99i%20M%C3%B9a%20Tr%C3%A1i%20Ch%C3%ADn%20L%C3%A1i%20Thi%C3%AAu%2C%20gian%20h%C3%A0ng%20tr%C6%B0ng%20b%C3%A0y%20xo%C3%A0i%20ch%C3%ADn%20m%E1%BB%9Bng%20m%C6%A1ng%20b%E1%BB%9Dng%20thom%20s%E1%BA%A7u%20ri%C3%AAng%2C%20s%C3%A2n%20kh%E1%BA%A9u%20n%E1%BB%95i%20r%E1%BB%A1c%20r%E1%BB%91i&image_size=landscape_16_9",
        "description": "Lễ hội tôn vinh trái cây đặc sản Lái Thiêu, thúc đẩy du lịch và thương mại nông nghiệp.",
        "vr": "non"
    },
    {
        "name": "Lễ Hội Dinh Cô Long Hải",
        "page": "lehoidincolonghai.html",
        "category": "venbien",
        "category_vi": "Lễ hội ven biển",
        "address_md": "Xã Long Hải, huyện Long Điền, tỉnh Bà Rịa - Vũng Tàu (Bà Rịa-Vũng Tàu cũ)",
        "coords_guess": [10.44073, 107.11689],
        "image": "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=L%E1%BB%85%20h%E1%BB%99i%20Dinh%20C%C3%B4%20Long%20H%E1%BA%A3i%2C%20%C4%91%E1%BB%81n%20th%E1%BB%9D%20B%C3%A0%20C%C3%B4%20tr%C3%AAn%20n%C3%BAi%20nh%C3%ACn%20xu%E1%BB%91ng%20b%C3%A3i%20bi%E1%BB%83n%2C%20ng%C6%B0%E1%BB%9Di%20d%C3%A2n%20c%C3%B9ng%20leo%20c%E1%BA%A7u%20thang%20%C4%91%C3%A1%20%C4%91i%20l%E1%BB%85&image_size=landscape_16_9",
        "description": "Lễ hội tâm linh của ngư dân Long Hải với nghi lễ thờ Bà Cô, cầu biển yên sóng lặng.",
        "vr": "non"
    },
    {
        "name": "Lễ Hội Nghinh Ông Thắng Tam Vũng Tàu",
        "page": "lehoinghinongtamthang.html",
        "category": "venbien",
        "category_vi": "Lễ hội ven biển",
        "address_md": "Đình Thắng Tam, số 77A đường Hoàng Hoa Thám, phường Vũng Tàu, thành phố Vũng Tàu, tỉnh Bà Rịa - Vũng Tàu",
        "coords_guess": [10.59583, 107.05921],
        "image": "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=L%E1%BB%85%20h%E1%BB%99i%20Nghinh%20%C3%94ng%20Tam%20Th%E1%BA%AFng%20V%C5%A9ng%20T%C3%A0u%2C%20%C4%91o%C3%A0n%20thuy%E1%BB%81n%20r%C6%B0%E1%BB%9Bc%20linh%20v%E1%BB%8B%20C%C3%A1%20%C3%94ng%20t%E1%BB%AB%20bi%E1%BB%83n%20v%C3%A0o%20b%E1%BB%9D%2C%20ti%E1%BA%BFng%20c%E1%BB%97ng%20chi%C3%AAng%20r%E1%BB%99n%20r%C3%A3&image_size=landscape_16_9",
        "description": "Lễ hội Cá Ông lớn bậc nhất Vũng Tàu, lưu giữ 12 sắc phong triều Nguyễn, Di sản văn hóa phi vật thể Quốc gia.",
        "vr": "non"
    },
    {
        "name": "Lễ Hội Giỗ Tổ Trần Hưng Đạo",
        "page": "lehoitranhungdao.html",
        "category": "truyenthong",
        "category_vi": "Lễ hội truyền thống",
        "address_md": "Đền thờ Đức Thánh Trần Hưng Đạo, số 36 Võ Thị Sáu, phường Xuân Hòa, Thành phố Hồ Chí Minh (và các Đền thờ Đức Thánh Trần khác)",
        "coords_guess": [10.78134, 106.66021],
        "image": "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=L%E1%BB%85%20h%E1%BB%99i%20Gi%E1%BB%97%20t%E1%BB%95%20Tr%E1%BA%A7n%20H%C5%A9ng%20%C4%90%E1%BA%A1o%2C%20h%C3%A0ng%20ngh%C3%ACn%20ng%C6%B0%E1%BB%9Di%20d%C3%A2n%20x%E1%BA%BFp%20h%C3%A0ng%20trang%20nghi%C3%AAm%20d%C3%A2ng%20h%C6%B0%C6%A1ng%20t%E1%BA%A1i%20%C4%90%E1%BB%81n%20th%E1%BB%9D%20%C4%90%E1%BB%A9c%20Th%C3%A0nh%20Tr%E1%BA%A7n&image_size=landscape_16_9",
        "description": "Lễ hội tưởng nhớ công đức Đức Thánh Trần - anh hùng dân tộc, giáo dục lòng yêu nước.",
        "vr": "non"
    }
]

# Quick sanity check
print(f"Total festivals: {len(festivals)}")
cats = {f["category"]: f["category_vi"] for f in festivals}
print(f"Categories (unique {len(cats)}):")
for k, v in cats.items():
    print(f"  {k} -> {v}")
