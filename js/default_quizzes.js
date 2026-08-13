const DEFAULT_QUIZZES = [
  {
    "id": 1,
    "title": "Lễ hội Tết Nguyên tiêu",
    "questions": [
      {
        "id": 1,
        "question_text": "Lễ hội Tết Nguyên tiêu của cộng đồng người Hoa diễn ra chủ yếu tại",
        "option_a": "các lăng thờ Cá Ông ven biển.",
        "option_b": "hệ thống hội quán và các cơ sở tín ngưỡng của người Hoa.",
        "option_c": "các đền thờ danh tướng thời Trần.",
        "option_d": "các đình làng gắn với tín ngưỡng Thành hoàng.",
        "correct_option": "B"
      },
      {
        "id": 2,
        "question_text": "Đặc trưng nổi bật của Lễ hội Tết Nguyên tiêu là",
        "option_a": "nghi thức nghinh rước trên biển cầu ngư.",
        "option_b": "lễ tế tưởng niệm các bậc tiền hiền khai khẩn.",
        "option_c": "các hoạt động văn hóa, tín ngưỡng của cộng đồng người Hoa vào Rằm tháng Giêng.",
        "option_d": "nghi thức khai hạ và dựng nêu đầu năm.",
        "correct_option": "C"
      },
      {
        "id": 3,
        "question_text": "Lễ hội Tết Nguyên tiêu đã được ghi danh là",
        "option_a": "Di tích quốc gia đặc biệt.",
        "option_b": "Bảo vật quốc gia.",
        "option_c": "Di sản tư liệu quốc gia.",
        "option_d": "Di sản văn hóa phi vật thể quốc gia.",
        "correct_option": "D"
      },
      {
        "id": 4,
        "question_text": "Lễ hội Tết Nguyên tiêu khác với Lễ hội Nghinh Ông ở điểm nào?",
        "option_a": "Đều hướng tới cầu bình an và hạnh phúc cho cộng đồng.",
        "option_b": "Đều gắn với tín ngưỡng của cư dân vùng biển.",
        "option_c": "Gắn với văn hóa cộng đồng người Hoa và hệ thống hội quán.",
        "option_d": "Gắn với nghi thức rước Nam Hải Đại Tướng Quân.",
        "correct_option": "C"
      },
      {
        "id": 5,
        "question_text": "Giá trị cộng đồng của Lễ hội Tết Nguyên tiêu được thể hiện rõ nhất qua việc",
        "option_a": "bảo tồn nghề đánh bắt hải sản truyền thống.",
        "option_b": "tăng cường giao lưu văn hóa giữa cộng đồng người Hoa với các dân tộc khác.",
        "option_c": "tưởng niệm các anh hùng chống ngoại xâm.",
        "option_d": "duy trì nghi thức tế Thành hoàng tại đình làng.",
        "correct_option": "B"
      },
      {
        "id": 6,
        "question_text": "Việc duy trì các nghi lễ truyền thống trong Lễ hội Tết Nguyên tiêu có ý nghĩa chủ yếu là",
        "option_a": "gìn giữ bản sắc văn hóa và tín ngưỡng của cộng đồng người Hoa.",
        "option_b": "mở rộng hoạt động thương mại đầu xuân.",
        "option_c": "phát triển các loại hình vui chơi giải trí.",
        "option_d": "quảng bá các sản phẩm thủ công truyền thống.",
        "correct_option": "A"
      },
      {
        "id": 7,
        "question_text": "Điểm giống nhau giữa Lễ hội Tết Nguyên tiêu và Lễ hội Chùa Bà Thiên Hậu là",
        "option_a": "đều gắn với tín ngưỡng thờ Cá Ông của cư dân vùng biển.",
        "option_b": "đều tưởng niệm danh tướng thời Trần.",
        "option_c": "đều phản ánh đời sống tín ngưỡng của cộng đồng người Hoa.",
        "option_d": "đều tổ chức nghi thức khai hạ đầu năm.",
        "correct_option": "C"
      },
      {
        "id": 8,
        "question_text": "Một trường THPT tổ chức Ngày hội \"Sắc màu văn hóa Thành phố Hồ Chí Minh\". Nhóm của em muốn giới thiệu nét văn hóa của cộng đồng người Hoa. Lễ hội nào phù hợp nhất để lựa chọn?",
        "option_a": "Lễ hội Nghinh Ông.",
        "option_b": "Lễ hội Trần Hưng Đạo.",
        "option_c": "Lễ hội Tết Nguyên tiêu.",
        "option_d": "Lễ hội Khai hạ - Cầu an.",
        "correct_option": "C"
      },
      {
        "id": 9,
        "question_text": "Trong quá trình tham gia Lễ hội Tết Nguyên tiêu, việc làm nào góp phần phát huy giá trị của lễ hội?",
        "option_a": "Tôn trọng không gian tín ngưỡng, thực hiện đúng quy định và giữ gìn vệ sinh chung.",
        "option_b": "Quay phim tại mọi khu vực để thu hút người xem trên mạng xã hội.",
        "option_c": "Tự ý sắp xếp lại đồ thờ cúng để chụp ảnh đẹp hơn.",
        "option_d": "Đốt nhiều vàng mã nhằm thể hiện lòng thành kính.",
        "correct_option": "A"
      },
      {
        "id": 10,
        "question_text": "Để quảng bá Lễ hội Tết Nguyên tiêu trên nền tảng số, sản phẩm nào dưới đây phù hợp nhất?",
        "option_a": "Video giới thiệu nguồn gốc, nghi lễ và giá trị văn hóa của lễ hội.",
        "option_b": "Video tổng hợp các trò chơi giải trí hiện đại trong dịp lễ.",
        "option_c": "Video giới thiệu các địa điểm du lịch biển của thành phố.",
        "option_d": "Video quảng bá các khu mua sắm và trung tâm thương mại.",
        "correct_option": "A"
      }
    ]
  },
  {
    "id": 2,
    "title": "Lễ hội Chùa Bà Thiên Hậu",
    "questions": [
      {
        "id": 1,
        "question_text": "Lễ hội Chùa Bà Thiên Hậu gắn liền với tín ngưỡng của cộng đồng",
        "option_a": "người Chăm.",
        "option_b": "người Kinh.",
        "option_c": "người Hoa.",
        "option_d": "người Khơ-me.",
        "correct_option": "C"
      },
      {
        "id": 2,
        "question_text": "Không gian văn hóa đặc trưng của Lễ hội Chùa Bà Thiên Hậu là",
        "option_a": "đình làng và miếu Thành hoàng.",
        "option_b": "hội quán và chùa của cộng đồng người Hoa.",
        "option_c": "lăng thờ Nam Hải Đại Tướng Quân.",
        "option_d": "đền thờ các danh tướng thời Trần.",
        "correct_option": "B"
      },
      {
        "id": 3,
        "question_text": "Đối tượng được tôn kính trong Lễ hội Chùa Bà Thiên Hậu là",
        "option_a": "Thiên Hậu Thánh Mẫu.",
        "option_b": "Đức Thánh Trần.",
        "option_c": "Tả quân Lê Văn Duyệt.",
        "option_d": "Nam Hải Đại Tướng Quân.",
        "correct_option": "A"
      },
      {
        "id": 4,
        "question_text": "Lễ hội Chùa Bà Thiên Hậu khác với Lễ hội Nghinh Ông ở điểm nào?",
        "option_a": "Đều cầu mong cuộc sống bình an và thuận lợi.",
        "option_b": "Đều gắn với tín ngưỡng của cư dân vùng biển.",
        "option_c": "Tôn vinh Thiên Hậu Thánh Mẫu và gắn với cộng đồng người Hoa.",
        "option_d": "Đều tổ chức nghi thức nghinh rước trên biển.",
        "correct_option": "C"
      },
      {
        "id": 5,
        "question_text": "Điểm giống nhau giữa Lễ hội Chùa Bà Thiên Hậu và Lễ hội Tết Nguyên tiêu là",
        "option_a": "đều tưởng niệm các danh tướng có công với đất nước.",
        "option_b": "đều phản ánh đời sống tín ngưỡng của cộng đồng người Hoa.",
        "option_c": "đều gắn với tục thờ Cá Ông của ngư dân.",
        "option_d": "đều tổ chức tại các đình làng Nam Bộ.",
        "correct_option": "B"
      },
      {
        "id": 6,
        "question_text": "Giá trị nổi bật của Lễ hội Chùa Bà Thiên Hậu là",
        "option_a": "bảo tồn tín ngưỡng, gắn kết cộng đồng và gìn giữ bản sắc văn hóa người Hoa.",
        "option_b": "phát triển nghề đánh bắt thủy sản truyền thống.",
        "option_c": "tưởng niệm các anh hùng chống ngoại xâm thời Trần.",
        "option_d": "giáo dục truyền thống khai hoang, lập ấp ở Nam Bộ.",
        "correct_option": "A"
      },
      {
        "id": 7,
        "question_text": "Việc đông đảo người dân nhiều dân tộc cùng tham gia Lễ hội Chùa Bà Thiên Hậu phản ánh rõ nhất",
        "option_a": "giá trị thương mại của lễ hội.",
        "option_b": "giá trị cộng đồng và giao lưu văn hóa.",
        "option_c": "giá trị quân sự trong lịch sử dân tộc.",
        "option_d": "giá trị nghề biển của cư dân ven biển.",
        "correct_option": "B"
      },
      {
        "id": 8,
        "question_text": "Một nhóm học sinh muốn giới thiệu nét văn hóa đặc trưng của cộng đồng người Hoa trong Ngày hội văn hóa dân tộc. Lễ hội nào phù hợp nhất để lựa chọn?",
        "option_a": "Lễ hội Trần Hưng Đạo.",
        "option_b": "Lễ hội Nghinh Ông.",
        "option_c": "Lễ hội Khai hạ - Cầu an.",
        "option_d": "Lễ hội Chùa Bà Thiên Hậu.",
        "correct_option": "D"
      },
      {
        "id": 9,
        "question_text": "Khi tham gia Lễ hội Chùa Bà Thiên Hậu, việc làm nào thể hiện ý thức tôn trọng giá trị văn hóa và tín ngưỡng?",
        "option_a": "Chụp ảnh trong khu vực hành lễ để đăng mạng xã hội.",
        "option_b": "Tôn trọng không gian tín ngưỡng, thực hiện đúng quy định và giữ gìn vệ sinh chung.",
        "option_c": "Tự ý sắp xếp lễ vật để thuận tiện tham quan.",
        "option_d": "Đốt nhiều vàng mã nhằm thể hiện lòng thành kính.",
        "correct_option": "B"
      },
      {
        "id": 10,
        "question_text": "Nếu xây dựng sản phẩm truyền thông quảng bá Lễ hội Chùa Bà Thiên Hậu, nội dung nào thể hiện rõ nhất giá trị của lễ hội?",
        "option_a": "Giới thiệu các trung tâm mua sắm và dịch vụ quanh khu vực lễ hội.",
        "option_b": "Giới thiệu các trò chơi giải trí trong dịp đầu năm.",
        "option_c": "Giới thiệu nguồn gốc, nghi lễ và vai trò của lễ hội trong đời sống cộng đồng người Hoa.",
        "option_d": "Giới thiệu các hoạt động đánh bắt hải sản truyền thống.",
        "correct_option": "C"
      }
    ]
  },
  {
    "id": 3,
    "title": "Lễ hội Trần Hưng Đạo",
    "questions": [
      {
        "id": 1,
        "question_text": "Lễ hội Trần Hưng Đạo được tổ chức nhằm tưởng niệm",
        "option_a": "Tả quân Lê Văn Duyệt.",
        "option_b": "Thiên Hậu Thánh Mẫu.",
        "option_c": "Hưng Đạo Đại Vương Trần Quốc Tuấn.",
        "option_d": "Nam Hải Đại Tướng Quân.",
        "correct_option": "C"
      },
      {
        "id": 2,
        "question_text": "Không gian tổ chức Lễ hội Trần Hưng Đạo gắn với",
        "option_a": "các hội quán của cộng đồng người Hoa.",
        "option_b": "các đền thờ Hưng Đạo Đại Vương.",
        "option_c": "các đình thờ Thành hoàng.",
        "option_d": "các lăng thờ Cá Ông.",
        "correct_option": "B"
      },
      {
        "id": 3,
        "question_text": "Lễ hội Trần Hưng Đạo phản ánh rõ nét truyền thống",
        "option_a": "uống nước nhớ nguồn, tôn vinh anh hùng dân tộc.",
        "option_b": "cầu ngư của cư dân ven biển.",
        "option_c": "tín ngưỡng thờ Mẫu của người Hoa.",
        "option_d": "cầu mùa của cư dân nông nghiệp.",
        "correct_option": "A"
      },
      {
        "id": 4,
        "question_text": "Điểm giống nhau giữa Lễ hội Trần Hưng Đạo và Lễ hội Giỗ Tả quân Lê Văn Duyệt là",
        "option_a": "đều gắn với tín ngưỡng của cộng đồng người Hoa.",
        "option_b": "đều tưởng niệm nhân vật lịch sử có công với đất nước.",
        "option_c": "đều tổ chức tại các hội quán cổ.",
        "option_d": "đều có nghi thức nghinh rước trên biển.",
        "correct_option": "B"
      },
      {
        "id": 5,
        "question_text": "Lễ hội Trần Hưng Đạo khác với Lễ hội Nghinh Ông ở điểm nào?",
        "option_a": "Đều hướng tới cầu bình an cho cộng đồng.",
        "option_b": "Gắn với việc tôn vinh vị anh hùng dân tộc trong lịch sử.",
        "option_c": "Đều tổ chức nghi thức rước trên sông, trên biển.",
        "option_d": "Đều phản ánh tín ngưỡng của ngư dân ven biển.",
        "correct_option": "B"
      },
      {
        "id": 6,
        "question_text": "Giá trị giáo dục nổi bật của Lễ hội Trần Hưng Đạo là",
        "option_a": "khuyến khích giao lưu thương mại đầu năm.",
        "option_b": "giáo dục lòng yêu nước, ý thức bảo vệ Tổ quốc và truyền thống dân tộc.",
        "option_c": "giới thiệu nghề đánh bắt thủy sản.",
        "option_d": "quảng bá nghệ thuật ẩm thực truyền thống.",
        "correct_option": "B"
      },
      {
        "id": 7,
        "question_text": "Việc nhân dân nhiều thế hệ cùng tham gia Lễ hội Trần Hưng Đạo góp phần quan trọng vào",
        "option_a": "bảo tồn và lan tỏa truyền thống yêu nước qua hoạt động văn hóa cộng đồng.",
        "option_b": "mở rộng hoạt động mua bán trong dịp lễ.",
        "option_c": "phát triển các môn thể thao dân gian.",
        "option_d": "quảng bá sản phẩm thủ công mỹ nghệ.",
        "correct_option": "A"
      },
      {
        "id": 8,
        "question_text": "Một bảo tàng xây dựng chuyên đề \"Các anh hùng dân tộc trong lễ hội truyền thống Thành phố Hồ Chí Minh\". Lễ hội nào nên được lựa chọn làm nội dung tiêu biểu?",
        "option_a": "Lễ hội Tết Nguyên tiêu.",
        "option_b": "Lễ hội Trần Hưng Đạo.",
        "option_c": "Lễ hội Nghinh Ông.",
        "option_d": "Lễ hội Chùa Bà Thiên Hậu.",
        "correct_option": "B"
      },
      {
        "id": 9,
        "question_text": "Trong cuộc thi thiết kế hành trình trải nghiệm với chủ đề \"Theo dấu những người có công với đất nước\", phương án nào phù hợp nhất?",
        "option_a": "Kết hợp tham quan Đền thờ Đức Thánh Trần và Lăng Tả quân Lê Văn Duyệt.",
        "option_b": "Kết hợp tham quan Chùa Bà Thiên Hậu và các hội quán người Hoa.",
        "option_c": "Kết hợp tham quan Lăng Cá Ông và Dinh Cô.",
        "option_d": "Kết hợp tham quan các đình làng tổ chức lễ Kỳ Yên.",
        "correct_option": "A"
      },
      {
        "id": 10,
        "question_text": "Một học sinh cho rằng Lễ hội Trần Hưng Đạo chỉ mang ý nghĩa tín ngưỡng nên không cần đưa vào chương trình giáo dục địa phương. Nhận định nào phản biện phù hợp nhất?",
        "option_a": "Lễ hội chủ yếu phục vụ phát triển du lịch nên không liên quan đến giáo dục.",
        "option_b": "Lễ hội góp phần giáo dục truyền thống yêu nước, lòng biết ơn và ý thức giữ gìn bản sắc văn hóa dân tộc.",
        "option_c": "Lễ hội chỉ dành cho những người nghiên cứu lịch sử.",
        "option_d": "Lễ hội chỉ có giá trị đối với người dân địa phương nơi tổ chức.",
        "correct_option": "B"
      }
    ]
  },
  {
    "id": 4,
    "title": "Lễ hội Dinh Cô",
    "questions": [
      {
        "id": 1,
        "question_text": "Lễ hội Dinh Cô gắn với tín ngưỡng thờ",
        "option_a": "Thiên Hậu Thánh Mẫu.",
        "option_b": "một thiếu nữ được nhân dân tôn kính là Cô.",
        "option_c": "Hưng Đạo Đại Vương Trần Quốc Tuấn.",
        "option_d": "Nam Hải Đại Tướng Quân.",
        "correct_option": "B"
      },
      {
        "id": 2,
        "question_text": "Không gian văn hóa đặc trưng của Lễ hội Dinh Cô là",
        "option_a": "các hội quán của cộng đồng người Hoa.",
        "option_b": "các đền thờ danh tướng thời Trần.",
        "option_c": "khu vực ven biển gắn với Dinh Cô.",
        "option_d": "các đình làng thờ Thành hoàng.",
        "correct_option": "C"
      },
      {
        "id": 3,
        "question_text": "Hoạt động nào là nét đặc trưng của Lễ hội Dinh Cô?",
        "option_a": "Dâng hương, rước kiệu và lễ cầu an của ngư dân.",
        "option_b": "Khai hạ, khai bút và khai ấn đầu năm.",
        "option_c": "Diễu hành nghệ thuật qua các hội quán người Hoa.",
        "option_d": "Tế Đức Thánh Trần và ôn lại chiến công chống ngoại xâm.",
        "correct_option": "A"
      },
      {
        "id": 4,
        "question_text": "Điểm khác biệt giữa Lễ hội Dinh Cô và Lễ hội Nghinh Ông là",
        "option_a": "đều phản ánh đời sống tín ngưỡng của cư dân ven biển.",
        "option_b": "đều cầu mong mưa thuận gió hòa và cuộc sống bình an.",
        "option_c": "Dinh Cô tôn vinh nhân vật được nhân dân suy tôn, còn Nghinh Ông gắn với tín ngưỡng thờ Nam Hải Đại Tướng Quân.",
        "option_d": "Dinh Cô và Nghinh Ông đều gắn với cộng đồng người Hoa.",
        "correct_option": "C"
      },
      {
        "id": 5,
        "question_text": "Điểm giống nhau giữa Lễ hội Dinh Cô và Lễ hội Chùa Bà Thiên Hậu là",
        "option_a": "đều thể hiện niềm tin vào sự che chở của các đấng linh thiêng đối với cuộc sống của người dân.",
        "option_b": "đều tưởng niệm các danh tướng có công với đất nước.",
        "option_c": "đều tổ chức tại hệ thống hội quán của người Hoa.",
        "option_d": "đều gắn với nghi thức khai hạ đầu năm.",
        "correct_option": "A"
      },
      {
        "id": 6,
        "question_text": "Giá trị nổi bật của Lễ hội Dinh Cô đối với cư dân vùng biển là",
        "option_a": "giáo dục truyền thống hiếu học và tôn sư trọng đạo.",
        "option_b": "củng cố niềm tin tâm linh, gắn kết cộng đồng và động viên ngư dân vươn khơi.",
        "option_c": "quảng bá nghệ thuật biểu diễn truyền thống.",
        "option_d": "giới thiệu các làng nghề thủ công địa phương.",
        "correct_option": "B"
      },
      {
        "id": 7,
        "question_text": "Việc duy trì Lễ hội Dinh Cô hằng năm góp phần quan trọng vào",
        "option_a": "mở rộng hoạt động thương mại đầu năm.",
        "option_b": "bảo tồn tín ngưỡng dân gian và bản sắc văn hóa cư dân vùng biển.",
        "option_c": "phát triển các môn thể thao truyền thống.",
        "option_d": "hình thành các tuyến giao thương ven biển.",
        "correct_option": "B"
      },
      {
        "id": 8,
        "question_text": "Một doanh nghiệp lữ hành xây dựng tuyến du lịch với chủ đề \"Tín ngưỡng của cư dân biển Thành phố Hồ Chí Minh\". Cặp lễ hội nào phù hợp nhất?",
        "option_a": "Tết Nguyên tiêu và Chùa Bà Thiên Hậu.",
        "option_b": "Trần Hưng Đạo và Giỗ Tả quân Lê Văn Duyệt.",
        "option_c": "Dinh Cô và Nghinh Ông.",
        "option_d": "Kỳ Yên và Khai hạ - Cầu an.",
        "correct_option": "C"
      },
      {
        "id": 9,
        "question_text": "Nhóm học sinh thiết kế sơ đồ phân loại các lễ hội theo đối tượng được tôn vinh. Lễ hội Dinh Cô nên được xếp vào nhóm nào?",
        "option_a": "Tôn vinh các anh hùng dân tộc.",
        "option_b": "Tôn vinh các vị thần bảo hộ nghề biển.",
        "option_c": "Tôn vinh nhân vật được nhân dân suy tôn và tôn kính.",
        "option_d": "Tôn vinh các bậc tiền hiền khai khẩn.",
        "correct_option": "C"
      },
      {
        "id": 10,
        "question_text": "Một địa phương muốn quảng bá giá trị văn hóa của Lễ hội Dinh Cô nhưng vẫn bảo đảm giữ gìn bản sắc truyền thống. Giải pháp nào phù hợp nhất?",
        "option_a": "Tăng số lượng các hoạt động giải trí hiện đại để thu hút du khách.",
        "option_b": "Mở rộng các dịch vụ thương mại trong khu vực hành lễ.",
        "option_c": "Kết hợp giới thiệu lịch sử, nghi lễ truyền thống với tuyên truyền ý thức bảo vệ môi trường lễ hội.",
        "option_d": "Rút ngắn phần nghi lễ để dành nhiều thời gian cho hoạt động mua sắm.",
        "correct_option": "C"
      }
    ]
  },
  {
    "id": 5,
    "title": "Lễ hội Nghinh Ông Cần Giờ",
    "questions": [
      {
        "id": 1,
        "question_text": "Lễ hội Nghinh Ông Cần Giờ gắn với tín ngưỡng thờ",
        "option_a": "Thiên Hậu Thánh Mẫu.",
        "option_b": "Hưng Đạo Đại Vương Trần Quốc Tuấn.",
        "option_c": "Nam Hải Đại Tướng Quân (Cá Ông).",
        "option_d": "Đức Thượng công Tả quân Lê Văn Duyệt.",
        "correct_option": "C"
      },
      {
        "id": 2,
        "question_text": "Không gian văn hóa đặc trưng của Lễ hội Nghinh Ông Cần Giờ là",
        "option_a": "các hội quán của cộng đồng người Hoa.",
        "option_b": "khu vực ven biển và Lăng Ông Thủy Tướng.",
        "option_c": "các đền thờ danh tướng thời Trần.",
        "option_d": "các đình làng thờ Thành hoàng.",
        "correct_option": "B"
      },
      {
        "id": 3,
        "question_text": "Nghi lễ nào là nét đặc trưng của Lễ hội Nghinh Ông Cần Giờ?",
        "option_a": "Rước kiệu Thiên Hậu qua các tuyến phố.",
        "option_b": "Tế Đức Thánh Trần và dâng hương tưởng niệm.",
        "option_c": "Nghinh rước Nam Hải Đại Tướng Quân từ biển vào bờ.",
        "option_d": "Khai hạ, khai bút và khai ấn đầu năm.",
        "correct_option": "C"
      },
      {
        "id": 4,
        "question_text": "Điểm giống nhau giữa Lễ hội Nghinh Ông Cần Giờ và Lễ hội Dinh Cô là",
        "option_a": "đều gắn với tín ngưỡng của cư dân vùng biển và cầu cho cuộc sống bình an.",
        "option_b": "đều tưởng niệm các danh tướng có công với đất nước.",
        "option_c": "đều là lễ hội truyền thống của cộng đồng người Hoa.",
        "option_d": "đều tổ chức chủ yếu tại các đình làng Nam Bộ.",
        "correct_option": "A"
      },
      {
        "id": 5,
        "question_text": "Lễ hội Nghinh Ông Cần Giờ khác với Lễ hội Trần Hưng Đạo ở điểm nổi bật nào?",
        "option_a": "Đều góp phần giáo dục truyền thống yêu nước.",
        "option_b": "Đều có nghi thức dâng hương và tế lễ.",
        "option_c": "Gắn với tín ngưỡng nghề biển và khát vọng vươn khơi của ngư dân.",
        "option_d": "Gắn với việc tưởng niệm các nhân vật lịch sử của dân tộc.",
        "correct_option": "C"
      },
      {
        "id": 6,
        "question_text": "Giá trị giáo dục của Lễ hội Nghinh Ông Cần Giờ được thể hiện rõ nhất qua việc",
        "option_a": "giáo dục truyền thống hiếu học của cư dân địa phương.",
        "option_b": "bồi đắp tình yêu biển đảo, ý thức bảo vệ môi trường biển và tinh thần đoàn kết của cộng đồng ngư dân.",
        "option_c": "phát triển các hoạt động thương mại và dịch vụ du lịch.",
        "option_d": "quảng bá nghệ thuật ẩm thực của cư dân vùng biển.",
        "correct_option": "B"
      },
      {
        "id": 7,
        "question_text": "Điểm nổi bật về giá trị cộng đồng của Lễ hội Nghinh Ông Cần Giờ là",
        "option_a": "quy tụ cộng đồng người Hoa thực hành các nghi lễ truyền thống.",
        "option_b": "gắn kết cộng đồng ngư dân, góp phần gìn giữ bản sắc văn hóa biển.",
        "option_c": "tưởng niệm các bậc tiền hiền có công khai phá vùng đất Gia Định.",
        "option_d": "duy trì các nghi thức tế lễ Thành hoàng tại đình làng.",
        "correct_option": "B"
      },
      {
        "id": 8,
        "question_text": "Một công ty du lịch xây dựng chương trình trải nghiệm với chủ đề \"Dấu ấn văn hóa biển Thành phố Hồ Chí Minh\". Lễ hội nào nên được lựa chọn làm điểm nhấn?",
        "option_a": "Lễ hội Tết Nguyên tiêu.",
        "option_b": "Lễ hội Khai hạ - Cầu an.",
        "option_c": "Lễ hội Nghinh Ông Cần Giờ.",
        "option_d": "Lễ hội Trần Hưng Đạo.",
        "correct_option": "C"
      },
      {
        "id": 9,
        "question_text": "Một nhóm học sinh xây dựng sơ đồ phân loại các lễ hội theo đối tượng được tôn vinh. Lễ hội Nghinh Ông Cần Giờ nên được xếp vào nhóm nào?",
        "option_a": "Lễ hội tôn vinh anh hùng dân tộc.",
        "option_b": "Lễ hội tôn vinh thần bảo hộ nghề biển.",
        "option_c": "Lễ hội tôn vinh Thành hoàng làng.",
        "option_d": "Lễ hội tôn vinh các bậc tiền hiền khai khẩn.",
        "correct_option": "B"
      },
      {
        "id": 10,
        "question_text": "Thành phố tổ chức Tuần lễ quảng bá các lễ hội truyền thống. Nếu chủ đề là \"Biển, con người và khát vọng vươn khơi\", hoạt động nào phù hợp nhất để giới thiệu Lễ hội Nghinh Ông Cần Giờ?",
        "option_a": "Tái hiện nghi thức nghinh rước trên biển kết hợp giới thiệu văn hóa ngư dân Cần Giờ.",
        "option_b": "Trình diễn nghi thức khai hạ và khai bút đầu năm.",
        "option_c": "Tổ chức lễ rước kiệu Thiên Hậu qua các tuyến phố.",
        "option_d": "Giới thiệu các nghi thức tế Đức Thánh Trần và triển lãm chiến công chống Nguyên.",
        "correct_option": "A"
      }
    ]
  },
  {
    "id": 6,
    "title": "Lễ hội Nghinh Ông Thắng Tam",
    "questions": [
      {
        "id": 1,
        "question_text": "Lễ hội Nghinh Ông Thắng Tam gắn với tín ngưỡng thờ",
        "option_a": "Thiên Hậu Thánh Mẫu.",
        "option_b": "Nam Hải Đại Tướng Quân (Cá Ông).",
        "option_c": "Hưng Đạo Đại Vương Trần Quốc Tuấn.",
        "option_d": "Đức Thượng công Tả quân Lê Văn Duyệt.",
        "correct_option": "B"
      },
      {
        "id": 2,
        "question_text": "Không gian văn hóa gắn với Lễ hội Nghinh Ông Thắng Tam là",
        "option_a": "Đình Thắng Tam và Lăng Ông Nam Hải.",
        "option_b": "Hội quán Nghĩa An của người Hoa.",
        "option_c": "Đền thờ Đức Thánh Trần.",
        "option_d": "Lăng Tả quân Lê Văn Duyệt.",
        "correct_option": "A"
      },
      {
        "id": 3,
        "question_text": "Nghi thức tiêu biểu của Lễ hội Nghinh Ông Thắng Tam là",
        "option_a": "lễ khai hạ đầu năm.",
        "option_b": "rước kiệu Thiên Hậu.",
        "option_c": "lễ nghinh rước Ông từ biển vào bờ.",
        "option_d": "lễ tế Đức Thánh Trần.",
        "correct_option": "C"
      },
      {
        "id": 4,
        "question_text": "Điểm giống nhau giữa Lễ hội Nghinh Ông Thắng Tam và Lễ hội Nghinh Ông Cần Giờ là",
        "option_a": "đều gắn với tín ngưỡng thờ Nam Hải Đại Tướng Quân và văn hóa cư dân biển.",
        "option_b": "đều là lễ hội tiêu biểu của cộng đồng người Hoa.",
        "option_c": "đều tưởng niệm các danh tướng có công với đất nước.",
        "option_d": "đều tổ chức chủ yếu tại các đình làng Nam Bộ.",
        "correct_option": "A"
      },
      {
        "id": 5,
        "question_text": "Lễ hội Nghinh Ông Thắng Tam khác với Lễ hội Dinh Cô ở điểm nào?",
        "option_a": "Đều cầu mong cuộc sống bình an và thuận lợi.",
        "option_b": "Đều diễn ra trong không gian văn hóa ven biển.",
        "option_c": "Gắn với tín ngưỡng thờ Nam Hải Đại Tướng Quân của ngư dân.",
        "option_d": "Đều phản ánh niềm tin vào sự che chở của các đấng linh thiêng.",
        "correct_option": "C"
      },
      {
        "id": 6,
        "question_text": "Giá trị nổi bật của Lễ hội Nghinh Ông Thắng Tam là",
        "option_a": "giáo dục truyền thống hiếu học của cư dân địa phương.",
        "option_b": "củng cố niềm tin tâm linh, gắn kết cộng đồng ngư dân và gìn giữ văn hóa biển.",
        "option_c": "quảng bá nghề thủ công truyền thống.",
        "option_d": "tôn vinh truyền thống khoa bảng của vùng đất Nam Bộ.",
        "correct_option": "B"
      },
      {
        "id": 7,
        "question_text": "Việc duy trì Lễ hội Nghinh Ông Thắng Tam góp phần quan trọng vào",
        "option_a": "phát triển các hoạt động thương mại đầu năm.",
        "option_b": "quảng bá các khu nghỉ dưỡng ven biển.",
        "option_c": "bảo tồn tín ngưỡng dân gian và bản sắc văn hóa của cư dân vùng biển.",
        "option_d": "mở rộng giao lưu văn hóa giữa cộng đồng người Hoa.",
        "correct_option": "C"
      },
      {
        "id": 8,
        "question_text": "Một triển lãm với chủ đề \"Di sản văn hóa biển của Thành phố Hồ Chí Minh\" cần lựa chọn lễ hội tiêu biểu để giới thiệu. Lễ hội nào phù hợp nhất?",
        "option_a": "Lễ hội Trần Hưng Đạo.",
        "option_b": "Lễ hội Chùa Bà Thiên Hậu.",
        "option_c": "Lễ hội Nghinh Ông Thắng Tam.",
        "option_d": "Lễ hội Khai hạ - Cầu an.",
        "correct_option": "C"
      },
      {
        "id": 9,
        "question_text": "Một nhóm học sinh xây dựng bảng phân loại lễ hội theo đối tượng được tôn vinh. Lễ hội Nghinh Ông Thắng Tam nên được xếp vào nhóm nào?",
        "option_a": "Lễ hội tôn vinh các anh hùng dân tộc.",
        "option_b": "Lễ hội tôn vinh thần bảo hộ nghề biển.",
        "option_c": "Lễ hội tôn vinh các bậc tiền hiền khai khẩn.",
        "option_d": "Lễ hội tôn vinh Thành hoàng làng.",
        "correct_option": "B"
      },
      {
        "id": 10,
        "question_text": "Muốn phát huy giá trị Lễ hội Nghinh Ông Thắng Tam gắn với phát triển du lịch bền vững. Giải pháp nào phù hợp nhất?",
        "option_a": "Tăng số lượng hoạt động thương mại trong khu vực hành lễ.",
        "option_b": "Giảm thời lượng nghi lễ để mở rộng các chương trình giải trí.",
        "option_c": "Kết hợp giới thiệu văn hóa ngư dân, bảo tồn nghi lễ truyền thống và nâng cao ý thức bảo vệ môi trường biển.",
        "option_d": "Thay thế nghi thức truyền thống bằng các chương trình biểu diễn hiện đại.",
        "correct_option": "C"
      }
    ]
  },
  {
    "id": 7,
    "title": "Lễ hội Lái Thiêu Mùa Trái Chín",
    "questions": [
      {
        "id": 1,
        "question_text": "Lễ hội Lái Thiêu mùa trái chín được tổ chức nhằm tôn vinh",
        "option_a": "tín ngưỡng thờ Nam Hải Đại Tướng Quân.",
        "option_b": "các di tích lịch sử của địa phương.",
        "option_c": "giá trị văn hóa miệt vườn và đặc sản trái cây.",
        "option_d": "truyền thống thờ Thành hoàng làng.",
        "correct_option": "C"
      },
      {
        "id": 2,
        "question_text": "Hoạt động nổi bật của Lễ hội Lái Thiêu mùa trái chín là",
        "option_a": "tham quan vườn cây, thưởng thức trái cây và trải nghiệm làm vườn.",
        "option_b": "lễ rước Ông từ biển vào bờ.",
        "option_c": "rước kiệu Thiên Hậu qua các tuyến phố.",
        "option_d": "tế lễ tưởng niệm các anh hùng dân tộc.",
        "correct_option": "A"
      },
      {
        "id": 3,
        "question_text": "Lễ hội Lái Thiêu mùa trái chín gắn với loại hình văn hóa nào?",
        "option_a": "Văn hóa miệt vườn Nam Bộ.",
        "option_b": "Văn hóa tín ngưỡng người Hoa.",
        "option_c": "Văn hóa nghề biển.",
        "option_d": "Văn hóa đình làng.",
        "correct_option": "A"
      },
      {
        "id": 4,
        "question_text": "Lễ hội Lái Thiêu mùa trái chín khác với Lễ hội Nghinh Ông Cần Giờ ở điểm nổi bật nào?",
        "option_a": "Đều góp phần quảng bá du lịch địa phương.",
        "option_b": "Đều thu hút đông đảo du khách tham gia.",
        "option_c": "Gắn với văn hóa miệt vườn và sản vật địa phương, không phải tín ngưỡng nghề biển.",
        "option_d": "Đều phản ánh đời sống của cư dân ven biển.",
        "correct_option": "C"
      },
      {
        "id": 5,
        "question_text": "Điểm giống nhau giữa Lễ hội Lái Thiêu mùa trái chín và Lễ hội Tết Nguyên tiêu là",
        "option_a": "đều góp phần quảng bá hình ảnh địa phương và thu hút khách du lịch.",
        "option_b": "đều tôn vinh các anh hùng dân tộc.",
        "option_c": "đều diễn ra tại hệ thống hội quán người Hoa.",
        "option_d": "đều gắn với nghi thức tế lễ truyền thống.",
        "correct_option": "A"
      },
      {
        "id": 6,
        "question_text": "Giá trị nổi bật của Lễ hội Lái Thiêu mùa trái chín là",
        "option_a": "bảo tồn tín ngưỡng dân gian của cư dân vùng biển.",
        "option_b": "quảng bá nông sản, phát triển du lịch và gìn giữ văn hóa miệt vườn.",
        "option_c": "giáo dục truyền thống chống ngoại xâm.",
        "option_d": "duy trì nghi thức thờ Thành hoàng làng.",
        "correct_option": "B"
      },
      {
        "id": 7,
        "question_text": "Việc duy trì Lễ hội Lái Thiêu mùa trái chín góp phần",
        "option_a": "bảo tồn nghề đánh bắt hải sản truyền thống.",
        "option_b": "phát huy giá trị vườn cây ăn trái và nâng cao thu nhập cho người dân.",
        "option_c": "mở rộng các hoạt động tín ngưỡng dân gian.",
        "option_d": "gìn giữ nghi thức tế lễ tại các đình cổ.",
        "correct_option": "B"
      },
      {
        "id": 8,
        "question_text": "Một trường THPT tổ chức hoạt động trải nghiệm với chủ đề \"Nông nghiệp gắn với phát triển du lịch\". Lễ hội nào phù hợp nhất để học sinh tìm hiểu?",
        "option_a": "Lễ hội Trần Hưng Đạo.",
        "option_b": "Lễ hội Lái Thiêu mùa trái chín.",
        "option_c": "Lễ hội Nghinh Ông Thắng Tam.",
        "option_d": "Lễ hội Khai hạ - Cầu an.",
        "correct_option": "B"
      },
      {
        "id": 9,
        "question_text": "Một nhóm học sinh xây dựng sơ đồ phân loại lễ hội theo giá trị nổi bật. Lễ hội Lái Thiêu mùa trái chín nên được xếp vào nhóm nào?",
        "option_a": "Lễ hội tưởng niệm nhân vật lịch sử.",
        "option_b": "Lễ hội văn hóa - du lịch gắn với nông nghiệp.",
        "option_c": "Lễ hội tín ngưỡng của cư dân biển.",
        "option_d": "Lễ hội của cộng đồng người Hoa.",
        "correct_option": "B"
      },
      {
        "id": 10,
        "question_text": "Để phát huy giá trị của Lễ hội Lái Thiêu mùa trái chín theo hướng bền vững, giải pháp nào phù hợp nhất?",
        "option_a": "Mở rộng các khu vui chơi hiện đại trong khu vực vườn cây.",
        "option_b": "Khuyến khích bảo tồn vườn cây đặc sản kết hợp phát triển du lịch sinh thái và quảng bá nông sản địa phương.",
        "option_c": "Thay thế các hoạt động trải nghiệm bằng các chương trình biểu diễn nghệ thuật.",
        "option_d": "Tăng số lượng gian hàng thương mại nhưng giảm diện tích vườn cây phục vụ tham quan.",
        "correct_option": "B"
      }
    ]
  },
  {
    "id": 8,
    "title": "Lễ hội Khai hạ - Cầu an tại Lăng Tả quân Lê Văn Duyệt",
    "questions": [
      {
        "id": 1,
        "question_text": "Lễ hội Khai hạ - Cầu an được tổ chức hằng năm tại",
        "option_a": "Đền thờ Đức Thánh Trần.",
        "option_b": "Hội quán Nghĩa An.",
        "option_c": "Lăng Tả quân Lê Văn Duyệt.",
        "option_d": "Lăng Ông Nam Hải.",
        "correct_option": "C"
      },
      {
        "id": 2,
        "question_text": "Nghi thức đặc trưng tạo nên tên gọi của lễ hội là",
        "option_a": "lễ nghinh Ông từ biển vào bờ.",
        "option_b": "lễ khai hạ mở đầu năm mới và cầu an.",
        "option_c": "lễ rước kiệu Thiên Hậu.",
        "option_d": "lễ tế Hưng Đạo Đại Vương.",
        "correct_option": "B"
      },
      {
        "id": 3,
        "question_text": "Lễ hội Khai hạ - Cầu an thể hiện niềm tri ân đối với",
        "option_a": "Đức Thượng công Tả quân Lê Văn Duyệt.",
        "option_b": "Thiên Hậu Thánh Mẫu.",
        "option_c": "Nam Hải Đại Tướng Quân.",
        "option_d": "Hưng Đạo Đại Vương Trần Quốc Tuấn.",
        "correct_option": "A"
      },
      {
        "id": 4,
        "question_text": "Điểm khác biệt nổi bật giữa Lễ hội Khai hạ - Cầu an và Lễ hội Giỗ Tả quân Lê Văn Duyệt là",
        "option_a": "đều diễn ra tại Lăng Tả quân Lê Văn Duyệt.",
        "option_b": "đều thể hiện lòng tri ân đối với Tả quân Lê Văn Duyệt.",
        "option_c": "Lễ hội Khai hạ gắn với nghi thức mở đầu năm mới và cầu an cho cộng đồng.",
        "option_d": "đều thu hút đông đảo người dân đến dâng hương tưởng niệm.",
        "correct_option": "C"
      },
      {
        "id": 5,
        "question_text": "Điểm giống nhau giữa Lễ hội Khai hạ - Cầu an và Lễ hội Trần Hưng Đạo là",
        "option_a": "đều tổ chức tại các hội quán người Hoa.",
        "option_b": "đều tôn vinh nhân vật lịch sử có công với đất nước.",
        "option_c": "đều gắn với tín ngưỡng nghề biển.",
        "option_d": "đều diễn ra tại các lăng thờ Nam Hải Đại Tướng Quân.",
        "correct_option": "B"
      },
      {
        "id": 6,
        "question_text": "Giá trị tâm linh nổi bật của Lễ hội Khai hạ - Cầu an là",
        "option_a": "cầu mong mưa thuận gió hòa, quốc thái dân an và cuộc sống bình yên.",
        "option_b": "cầu cho mùa màng bội thu và cây trái sai quả.",
        "option_c": "cầu cho việc buôn bán đầu năm phát đạt.",
        "option_d": "cầu cho ngư dân ra khơi đánh bắt thuận lợi.",
        "correct_option": "A"
      },
      {
        "id": 7,
        "question_text": "Việc duy trì Lễ hội Khai hạ - Cầu an góp phần quan trọng vào",
        "option_a": "quảng bá nghệ thuật thư pháp đầu xuân.",
        "option_b": "bảo tồn tín ngưỡng dân gian của cộng đồng người Hoa.",
        "option_c": "giáo dục truyền thống \"Uống nước nhớ nguồn\" và gìn giữ bản sắc văn hóa Nam Bộ.",
        "option_d": "phát triển các hoạt động thương mại đầu năm.",
        "correct_option": "C"
      },
      {
        "id": 8,
        "question_text": "Một bảo tàng xây dựng chuyên đề \"Những lễ hội tưởng niệm nhân vật lịch sử ở Thành phố Hồ Chí Minh\". Lễ hội nào dưới đây phù hợp để lựa chọn?",
        "option_a": "Lễ hội Khai hạ - Cầu an tại Lăng Tả quân Lê Văn Duyệt.",
        "option_b": "Lễ hội Lái Thiêu mùa trái chín.",
        "option_c": "Lễ hội Nghinh Ông Thắng Tam.",
        "option_d": "Lễ hội Chùa Bà Thiên Hậu.",
        "correct_option": "A"
      },
      {
        "id": 9,
        "question_text": "Một nhóm học sinh xây dựng sơ đồ phân loại các lễ hội theo thời điểm tổ chức. Lễ hội Khai hạ - Cầu an nên được xếp vào nhóm nào?",
        "option_a": "Lễ hội diễn ra vào mùa thu.",
        "option_b": "Lễ hội mở đầu năm mới.",
        "option_c": "Lễ hội gắn với mùa đánh bắt hải sản.",
        "option_d": "Lễ hội gắn với mùa trái cây chín.",
        "correct_option": "B"
      },
      {
        "id": 10,
        "question_text": "Một địa phương muốn quảng bá Lễ hội Khai hạ - Cầu an nhưng vẫn giữ được ý nghĩa truyền thống. Hoạt động nào phù hợp nhất?",
        "option_a": "Tăng số lượng các chương trình biểu diễn hiện đại để thu hút du khách.",
        "option_b": "Mở rộng khu vực kinh doanh trong không gian hành lễ.",
        "option_c": "Giới thiệu lịch sử Tả quân Lê Văn Duyệt, ý nghĩa nghi lễ Khai hạ và hướng dẫn người dân thực hành văn minh khi tham gia lễ hội.",
        "option_d": "Rút ngắn phần nghi lễ để tăng thời gian tổ chức các hoạt động giải trí.",
        "correct_option": "C"
      }
    ]
  },
  {
    "id": 9,
    "title": "Lễ hội Thần lúa (Ốp Yang Va)",
    "questions": [
      {
        "id": 1,
        "question_text": "Lễ hội Thần lúa (Ốp Yang Va) là lễ hội truyền thống của cộng đồng",
        "option_a": "người Hoa.",
        "option_b": "người Kinh.",
        "option_c": "người Chơ Ro.",
        "option_d": "người Chăm.",
        "correct_option": "C"
      },
      {
        "id": 2,
        "question_text": "Đối tượng được tôn vinh trong Lễ hội Thần lúa (Ốp Yang Va) là",
        "option_a": "vị thần bảo hộ nghề biển.",
        "option_b": "vị thần gắn với cây lúa và mùa màng.",
        "option_c": "vị anh hùng dân tộc thời Trần.",
        "option_d": "vị Thành hoàng của làng.",
        "correct_option": "B"
      },
      {
        "id": 3,
        "question_text": "Lễ hội Thần lúa (Ốp Yang Va) phản ánh rõ nét đời sống của",
        "option_a": "cư dân vùng biển.",
        "option_b": "cộng đồng thương nhân người Hoa.",
        "option_c": "cư dân nông nghiệp truyền thống.",
        "option_d": "cư dân đô thị Nam Bộ.",
        "correct_option": "C"
      },
      {
        "id": 4,
        "question_text": "Điểm khác biệt giữa Lễ hội Thần lúa (Ốp Yang Va) và Lễ hội Nghinh Ông Cần Giờ là",
        "option_a": "đều cầu mong cuộc sống bình an và no đủ.",
        "option_b": "đều góp phần bảo tồn bản sắc văn hóa dân tộc.",
        "option_c": "Lễ hội Thần lúa gắn với tín ngưỡng nông nghiệp, còn Lễ hội Nghinh Ông Cần Giờ gắn với tín ngưỡng nghề biển.",
        "option_d": "đều diễn ra trong không gian ven biển.",
        "correct_option": "C"
      },
      {
        "id": 5,
        "question_text": "Điểm giống nhau giữa Lễ hội Thần lúa (Ốp Yang Va) và Lễ hội Khai hạ - Cầu an tại Lăng Tả quân Lê Văn Duyệt là",
        "option_a": "đều thể hiện ước vọng về cuộc sống bình an, thuận lợi của cộng đồng.",
        "option_b": "đều tôn vinh các nhân vật lịch sử có công với đất nước.",
        "option_c": "đều tổ chức tại các đình làng Nam Bộ.",
        "option_d": "đều gắn với tín ngưỡng của cộng đồng người Hoa.",
        "correct_option": "A"
      },
      {
        "id": 6,
        "question_text": "Giá trị nổi bật của Lễ hội Thần lúa (Ốp Yang Va) là",
        "option_a": "bảo tồn tín ngưỡng dân gian của cư dân vùng biển.",
        "option_b": "gìn giữ bản sắc văn hóa của đồng bào Chơ Ro và tôn vinh nền văn minh lúa nước.",
        "option_c": "giáo dục truyền thống chống ngoại xâm.",
        "option_d": "quảng bá hoạt động thương mại đầu năm.",
        "correct_option": "B"
      },
      {
        "id": 7,
        "question_text": "Việc tổ chức Lễ hội Thần lúa (Ốp Yang Va) hằng năm góp phần",
        "option_a": "phát triển các hoạt động tín ngưỡng của cộng đồng người Hoa.",
        "option_b": "duy trì nghề đánh bắt hải sản truyền thống.",
        "option_c": "tăng cường sự gắn kết cộng đồng và truyền dạy các phong tục truyền thống.",
        "option_d": "quảng bá nghệ thuật thư pháp đầu xuân.",
        "correct_option": "C"
      },
      {
        "id": 8,
        "question_text": "Một trường THPT tổ chức chuyên đề \"Bản sắc văn hóa các dân tộc thiểu số ở Thành phố Hồ Chí Minh\". Lễ hội nào phù hợp nhất để giới thiệu?",
        "option_a": "Lễ hội Trần Hưng Đạo.",
        "option_b": "Lễ hội Tết Nguyên tiêu.",
        "option_c": "Lễ hội Thần lúa (Ốp Yang Va).",
        "option_d": "Lễ hội Nghinh Ông Thắng Tam.",
        "correct_option": "C"
      },
      {
        "id": 9,
        "question_text": "Một nhóm học sinh xây dựng sơ đồ phân loại các lễ hội theo loại hình sinh kế truyền thống của cộng đồng. Lễ hội Thần lúa (Ốp Yang Va) nên được xếp vào nhóm nào?",
        "option_a": "Lễ hội gắn với nghề biển.",
        "option_b": "Lễ hội gắn với thương mại.",
        "option_c": "Lễ hội gắn với sản xuất nông nghiệp.",
        "option_d": "Lễ hội gắn với nhân vật lịch sử.",
        "correct_option": "C"
      },
      {
        "id": 10,
        "question_text": "Địa phương muốn phát huy giá trị của Lễ hội Thần lúa (Ốp Yang Va) gắn với phát triển du lịch cộng đồng. Giải pháp nào phù hợp nhất?",
        "option_a": "Thay các nghi lễ truyền thống bằng chương trình biểu diễn hiện đại để thu hút khách.",
        "option_b": "Mở rộng khu thương mại trong không gian tổ chức lễ hội.",
        "option_c": "Kết hợp giới thiệu nghi lễ truyền thống, trải nghiệm văn hóa Chơ Ro và tuyên truyền bảo tồn bản sắc dân tộc.",
        "option_d": "Rút ngắn phần nghi lễ để tăng thời gian tổ chức các trò chơi giải trí.",
        "correct_option": "C"
      }
    ]
  },
  {
    "id": 10,
    "title": "Lễ hội Thần rừng (Ốp Yang Vri)",
    "questions": [
      {
        "id": 1,
        "question_text": "Lễ hội Thần rừng (Ốp Yang Vri) là lễ hội truyền thống của cộng đồng",
        "option_a": "người Chơ Ro.",
        "option_b": "người Hoa.",
        "option_c": "người Kinh.",
        "option_d": "người Chăm.",
        "correct_option": "A"
      },
      {
        "id": 2,
        "question_text": "Đối tượng được tôn vinh trong Lễ hội Thần rừng (Ốp Yang Vri) là",
        "option_a": "vị thần bảo hộ nghề biển.",
        "option_b": "vị thần gắn với núi rừng và thiên nhiên.",
        "option_c": "vị anh hùng dân tộc.",
        "option_d": "vị Thành hoàng làng.",
        "correct_option": "B"
      },
      {
        "id": 3,
        "question_text": "Lễ hội Thần rừng (Ốp Yang Vri) phản ánh rõ nét tín ngưỡng",
        "option_a": "của cư dân thương mại.",
        "option_b": "của cư dân vùng biển.",
        "option_c": "gắn với đời sống núi rừng của đồng bào Chơ Ro.",
        "option_d": "gắn với cộng đồng người Hoa.",
        "correct_option": "C"
      },
      {
        "id": 4,
        "question_text": "Điểm khác biệt giữa Lễ hội Thần rừng (Ốp Yang Vri) và Lễ hội Thần lúa (Ốp Yang Va) là",
        "option_a": "đều là lễ hội truyền thống của đồng bào Chơ Ro.",
        "option_b": "đều thể hiện lòng biết ơn đối với thiên nhiên.",
        "option_c": "Lễ hội Thần rừng tôn vinh rừng và môi trường sống, còn Lễ hội Thần lúa gắn với cây lúa và mùa màng.",
        "option_d": "đều phản ánh tín ngưỡng của cư dân vùng biển.",
        "correct_option": "C"
      },
      {
        "id": 5,
        "question_text": "Điểm giống nhau giữa Lễ hội Thần rừng (Ốp Yang Vri) và Lễ hội Nghinh Ông Cần Giờ là",
        "option_a": "đều thể hiện niềm tin vào sự che chở của các đấng linh thiêng đối với cuộc sống cộng đồng.",
        "option_b": "đều gắn với tín ngưỡng của cộng đồng người Hoa.",
        "option_c": "đều tổ chức trong hệ thống hội quán.",
        "option_d": "đều tôn vinh các anh hùng dân tộc.",
        "correct_option": "A"
      },
      {
        "id": 6,
        "question_text": "Giá trị nổi bật của Lễ hội Thần rừng (Ốp Yang Vri) là",
        "option_a": "quảng bá các sản phẩm thủ công truyền thống.",
        "option_b": "gìn giữ bản sắc văn hóa Chơ Ro và giáo dục ý thức bảo vệ rừng.",
        "option_c": "phát triển hoạt động thương mại đầu năm.",
        "option_d": "tôn vinh truyền thống khoa bảng.",
        "correct_option": "B"
      },
      {
        "id": 7,
        "question_text": "Việc duy trì Lễ hội Thần rừng (Ốp Yang Vri) góp phần",
        "option_a": "bảo tồn tri thức dân gian về ứng xử với thiên nhiên và tăng cường sự gắn kết cộng đồng.",
        "option_b": "mở rộng hoạt động giao thương giữa các địa phương.",
        "option_c": "phát triển nghề đánh bắt hải sản.",
        "option_d": "duy trì tín ngưỡng của cộng đồng người Hoa.",
        "correct_option": "A"
      },
      {
        "id": 8,
        "question_text": "Một trường THPT tổ chức hoạt động trải nghiệm với chủ đề \"Con người và thiên nhiên trong văn hóa truyền thống\". Lễ hội nào phù hợp nhất để học sinh tìm hiểu?",
        "option_a": "Lễ hội Trần Hưng Đạo.",
        "option_b": "Lễ hội Thần rừng (Ốp Yang Vri).",
        "option_c": "Lễ hội Tết Nguyên tiêu.",
        "option_d": "Lễ hội Khai hạ - Cầu an.",
        "correct_option": "B"
      },
      {
        "id": 9,
        "question_text": "Một nhóm học sinh xây dựng sơ đồ phân loại các lễ hội theo đối tượng được tôn vinh. Lễ hội Thần rừng (Ốp Yang Vri) nên được xếp vào nhóm nào?",
        "option_a": "Lễ hội tôn vinh các anh hùng dân tộc.",
        "option_b": "Lễ hội tôn vinh các vị thần gắn với thiên nhiên.",
        "option_c": "Lễ hội tôn vinh các bậc tiền hiền khai khẩn.",
        "option_d": "Lễ hội tôn vinh Thành hoàng làng.",
        "correct_option": "B"
      },
      {
        "id": 10,
        "question_text": "Một địa phương muốn phát huy giá trị của Lễ hội Thần rừng (Ốp Yang Vri) gắn với bảo vệ môi trường. Hoạt động nào phù hợp nhất?",
        "option_a": "Tổ chức thêm các khu mua sắm trong không gian lễ hội.",
        "option_b": "Thay phần nghi lễ bằng các chương trình biểu diễn hiện đại.",
        "option_c": "Kết hợp giới thiệu nghi lễ truyền thống với hoạt động tuyên truyền bảo vệ rừng và đa dạng sinh học.",
        "option_d": "Rút ngắn phần nghi lễ để tăng thời gian tổ chức các trò chơi giải trí.",
        "correct_option": "C"
      }
    ]
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DEFAULT_QUIZZES;
}
