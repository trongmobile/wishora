/**
 * Lời chúc mẫu do workflow SEO hằng tuần sinh bằng Gemini (.github/workflows/weekly-seo.yml), nối sau lời chúc viết tay trong messages.js.
 * File do tools/marketing/weekly-seo.mjs ghi lại mỗi lần chạy; lần chạy sau giữ nguyên mọi lời chúc đang có,
 * nên sửa hoặc xóa trực tiếp ở đây (kể cả ngay trong PR) là được.
 * Cấu trúc giống MESSAGES: { <id dịp>: { <người nhận>: [...] } }.
 */
export const AUTO_MESSAGES = {
  "halloween": {
    "family": [
      "Chúc cả nhà một đêm Halloween thật ấm áp, cùng nhau quây quần ăn kẹo và kể chuyện ma vui vẻ.",
      "Đêm Halloween chúc nhà mình ai cũng hóa trang thành nhân vật thật ngầu và có buổi tối ngập tiếng cười.",
      "Halloween rộn ràng chúc gia đình mình luôn vui tươi, nhận được thật nhiều điều bất ngờ thú vị.",
      "Chúc gia đình mình có một buổi tối Halloween thật rôm rả, cùng nhau khoác lên những bộ đồ lạ mắt và lưu giữ thật nhiều tấm ảnh kỷ niệm!",
      "Chúc tổ ấm nhỏ đêm nay rực sáng ánh đèn lồng bí ngô, mọi điều u ám tan biến, chỉ còn lại niềm vui và sự gắn kết rộn ràng của cả nhà!"
    ],
    "friend": [
      "Chúc bạn hiền đêm Halloween bị ma dọa chạy té khói nhưng bù lại hốt được cả núi kẹo ngon.",
      "Tối nay nhớ hóa trang thật xuất sắc để đi dọa thiên hạ nhé, chúc bạn một đêm Halloween cháy hết mình.",
      "Chúc bạn tôi Halloween không gặp ma nhưng gặp toàn vận may và đồ ăn ngon.",
      "Tối nay đừng ở nhà trùm mền nha bạn ơi, lên đồ rồi cùng quẩy tung nóc phố phường đêm Halloween nào!"
    ],
    "child": [
      "Chúc cục cưng của ba mẹ tối nay hóa trang thật đẹp và đi xin được thật nhiều kẹo ngon mang về khoe nhé.",
      "Hôm nay tha hồ làm ác quỷ nhỏ đáng yêu của ba mẹ nha, chúc con có một đêm Halloween tuyệt vời nhất.",
      "Chúc thiên thần nhỏ của ba mẹ có một đêm hội hóa trang rộn rã, tha hồ tung tăng khoe bộ cánh độc lạ và chơi thật đã nhé!",
      "Mong bé cưng có một mùa Halloween ngập tràn niềm vui cổ tích, bước vào thế giới phép thuật thần tiên mà con hằng mơ ước!"
    ],
    "default": [
      "Chúc bạn có một đêm Halloween kỳ bí và tràn ngập tiếng cười, ánh đèn bí ngô sẽ thắp sáng mọi điều may mắn quanh bạn tối nay!",
      "Chúc bạn một lễ hội ma quái thật rộn ràng, có những trải nghiệm thật thú vị bên bạn bè và gom về cả giỏ niềm vui!",
      "Mong bạn có một đêm tiệc Halloween bùng nổ, tha hồ vui chơi và tận hưởng không khí rùng rợn nhưng siêu hào hứng này nhé!",
      "Chúc bạn một đêm hội hóa trang rực rỡ sắc màu, tự tin khoe cá tính và tận hưởng trọn vẹn từng khoảnh khắc vui tươi."
    ],
    "bestfriend": [
      "Năm nay tao chấp nhận nhường mày làm ác quỷ đẹp nhất đêm Halloween, miễn là nhớ chia tao nửa số kẹo kiếm được nhé."
    ],
    "lover": [
      "Chẳng cần phải đợi hóa trang thành ma quỷ, nụ cười của em cũng đủ làm anh chết mê chết mệt rồi. Chúc người thương một đêm Halloween thật ngọt ngào."
    ],
    "colleague": [
      "Chúc bạn có một mùa Halloween hứng khởi, máy tính không gặp lỗi kỳ lạ và màn hình không hiện ra những thông báo đáng sợ ngoài giờ làm."
    ]
  },
  "teachers-day-20-11": {
    "homeroom": [
      "Em xin gửi lời tri ân sâu sắc đến thầy cô chủ nhiệm nhân ngày 20/11. Cảm ơn thầy cô đã luôn kiên nhẫn dẫn dắt và đồng hành cùng lớp trong suốt thời gian qua.",
      "Nhân ngày Nhà giáo Việt Nam, em chúc thầy cô chủ nhiệm luôn dồi dào sức khỏe và bình an. Cảm ơn thầy cô đã chở che và dạy bảo chúng em nên người.",
      "Kính chúc người lái đò thầm lặng của lớp mình luôn mạnh khỏe và hạnh phúc. Cảm ơn thầy cô đã luôn thấu hiểu, yêu thương và dìu dắt chúng em từng bước đi.",
      "Em kính chúc thầy cô chủ nhiệm ngày 20/11 thật nhiều niềm vui và hạnh phúc. Cảm ơn thầy cô đã luôn kiên nhẫn uốn nắn và sát cánh cùng tập thể lớp qua từng chặng đường."
    ],
    "lecturer": [
      "Em xin kính chúc thầy cô giảng viên ngày 20/11 tràn đầy sức khỏe và nhiệt huyết. Những tri thức quý báu từ bài giảng của thầy cô là hành trang theo em suốt chặng đường dài.",
      "Nhân ngày 20/11, em xin gửi lời cảm ơn chân thành đến các thầy cô giảng viên. Kính chúc thầy cô luôn thành công trên bục giảng và gặt hái nhiều trái ngọt trong sự nghiệp.",
      "Em vô cùng biết ơn sự hướng dẫn tận tình của thầy cô giảng viên trong mỗi giờ học. Chúc thầy cô một ngày lễ Nhà giáo thật nhiều niềm vui và luôn bình an.",
      "Em xin kính chúc thầy cô giảng viên ngày 20/11 luôn tràn đầy năng lượng và sáng tạo. Những tư duy sắc bén từ bài giảng của thầy cô đã mở ra cho em chân trời mới."
    ],
    "edu": [
      "Nhân ngày Nhà giáo Việt Nam, chúc bạn và những người đồng nghiệp luôn vững lòng với sứ mệnh trồng người. Mong chúng ta mãi giữ được sự nhiệt huyết và niềm vui trong từng bài giảng.",
      "Chúc mừng ngày 20/11 đến những người bạn cùng chung chí hướng trong ngành giáo dục. Chúc bạn luôn nhiều sức khỏe, bình an và gặt hái thêm nhiều thành công mới.",
      "Gửi lời chúc mừng chân thành nhất đến người đồng nghiệp thân quý trong ngày 20/11. Chúc bạn luôn giữ vững ngọn lửa nhiệt huyết để tiếp tục hành trình truyền lửa cho thế hệ trẻ.",
      "Nhân dịp Hiến chương Nhà giáo, chúc cho những người làm nghề giáo như chúng ta luôn có đủ sức khỏe và kiên nhẫn. Mong rằng mỗi ngày đến trường đều là một ngày vui và tràn đầy cảm hứng."
    ],
    "friend": [
      "Nhân ngày 20/11, mình xin chúc bạn luôn dồi dào sức khỏe và giữ trọn sự kiên định, tâm huyết với sự nghiệp giáo dục cao quý mà bạn đã chọn.",
      "Chúc mừng bạn nhân ngày Nhà giáo Việt Nam. Ngưỡng mộ sự tận tụy của bạn dành cho từng thế hệ học trò, chúc bạn luôn tìm thấy niềm tự hào trên bục giảng.",
      "Ngày 20/11, chúc bạn luôn tràn đầy nghị lực và bình an để tiếp tục sứ mệnh gieo mầm tri thức. Rất tự hào khi có một người bạn mẫu mực với nghề giáo như bạn.",
      "Chúc mừng ngày 20/11 nhé người bạn tuyệt vời của tôi. Chúc bạn luôn kiên định với bục giảng, có thật nhiều học sinh yêu quý và gặt hái nhiều thành quả trong công việc."
    ],
    "default": [
      "Xin trân trọng gửi lời tri ân sâu sắc nhất đến những người gieo hạt tri thức nhân ngày 20/11. Chúc sự nghiệp trồng người luôn đơm hoa kết trái vẹn tròn.",
      "Nhân ngày Nhà giáo Việt Nam, kính chúc những người làm nghề giáo luôn dồi dào sức khỏe, an yên và gặt hái thật nhiều thành tựu trên con đường đã chọn.",
      "Tri ân những cống hiến thầm lặng và bao dung cao cả vì tương lai của các thế hệ mai sau. Kính chúc một mùa Hiến chương Nhà giáo thật nhiều ý nghĩa và ấm áp.",
      "Nhân ngày 20/11, xin gửi lời tri ân sâu sắc đến những người tận tụy truyền đạt tri thức. Chúc một mùa Hiến chương trọn vẹn niềm vui và luôn tràn đầy nhiệt huyết với nghề."
    ],
    "teacher": [
      "Nhân ngày 20/11, em xin bày tỏ lòng biết ơn sâu sắc trước sự kiên nhẫn và tận tụy của thầy cô. Kính chúc thầy cô vạn sự bình an và luôn giữ trọn niềm say mê với bục giảng.",
      "Mỗi bước đường em đi hôm nay đều có dấu ấn từ những lời dạy bảo quý báu của thầy cô. Em kính chúc thầy cô luôn dồi dào sức khỏe và tự hào về các thế hệ học trò.",
      "Em xin gửi lời tri ân sâu sắc đến thầy cô nhân ngày 20/11. Cảm ơn những lời khuyên chân thành và sự quan tâm ân cần đã giúp em tự tin hơn trên chặng đường trưởng thành."
    ]
  },
  "christmas": {
    "colleague": [
      "Chúc bạn một mùa Giáng sinh ngập tràn niềm vui và gác lại hết những bộn bề công việc. Merry Christmas!",
      "Giáng sinh an lành nhé đồng nghiệp ơi! Chúc bạn nhận được nhiều món quà bất ngờ và có kỳ nghỉ lễ thật sảng khoái.",
      "Cảm ơn bạn đã luôn hỗ trợ mình trong công việc thời gian qua. Chúc bạn và gia đình một mùa Noel ấm cúng và hạnh phúc."
    ],
    "family": [
      "Giáng sinh năm nay thật đặc biệt khi con được quây quần bên ba mẹ. Chúc ba mẹ luôn mạnh khỏe và bình an.",
      "Gửi những cái ôm ấm áp nhất tới gia đình mình trong đêm Noel lạnh giá này. Chúc nhà mình luôn vui vẻ và ngập tiếng cười.",
      "Merry Christmas cả nhà yêu! Mong mọi điều tốt đẹp và bình an nhất sẽ đến với gia đình mình trong mùa lễ này."
    ],
    "lover": [
      "Mỗi mùa Giáng sinh có bạn ở bên đều trở nên kỳ diệu hơn. Chúc tình yêu của chúng ta mãi ngọt ngào như ngày đầu.",
      "Đêm Noel lạnh nhưng có tay bạn nắm thì ấm áp lạ thường. Cảm ơn bạn đã đến và sưởi ấm mùa đông của mình."
    ]
  }
};
