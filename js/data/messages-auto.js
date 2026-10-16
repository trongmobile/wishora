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
      "Halloween rộn ràng chúc gia đình mình luôn vui tươi, nhận được thật nhiều điều bất ngờ thú vị."
    ],
    "friend": [
      "Chúc bạn hiền đêm Halloween bị ma dọa chạy té khói nhưng bù lại hốt được cả núi kẹo ngon.",
      "Tối nay nhớ hóa trang thật xuất sắc để đi dọa thiên hạ nhé, chúc bạn một đêm Halloween cháy hết mình.",
      "Chúc bạn tôi Halloween không gặp ma nhưng gặp toàn vận may và đồ ăn ngon."
    ],
    "child": [
      "Chúc cục cưng của ba mẹ tối nay hóa trang thật đẹp và đi xin được thật nhiều kẹo ngon mang về khoe nhé.",
      "Hôm nay tha hồ làm ác quỷ nhỏ đáng yêu của ba mẹ nha, chúc con có một đêm Halloween tuyệt vời nhất."
    ]
  },
  "teachers-day-20-11": {
    "homeroom": [
      "Em xin gửi lời tri ân sâu sắc đến thầy cô chủ nhiệm nhân ngày 20/11. Cảm ơn thầy cô đã luôn kiên nhẫn dẫn dắt và đồng hành cùng lớp trong suốt thời gian qua.",
      "Nhân ngày Nhà giáo Việt Nam, em chúc thầy cô chủ nhiệm luôn dồi dào sức khỏe và bình an. Cảm ơn thầy cô đã chở che và dạy bảo chúng em nên người.",
      "Kính chúc người lái đò thầm lặng của lớp mình luôn mạnh khỏe và hạnh phúc. Cảm ơn thầy cô đã luôn thấu hiểu, yêu thương và dìu dắt chúng em từng bước đi."
    ],
    "lecturer": [
      "Em xin kính chúc thầy cô giảng viên ngày 20/11 tràn đầy sức khỏe và nhiệt huyết. Những tri thức quý báu từ bài giảng của thầy cô là hành trang theo em suốt chặng đường dài.",
      "Nhân ngày 20/11, em xin gửi lời cảm ơn chân thành đến các thầy cô giảng viên. Kính chúc thầy cô luôn thành công trên bục giảng và gặt hái nhiều trái ngọt trong sự nghiệp.",
      "Em vô cùng biết ơn sự hướng dẫn tận tình của thầy cô giảng viên trong mỗi giờ học. Chúc thầy cô một ngày lễ Nhà giáo thật nhiều niềm vui và luôn bình an."
    ],
    "edu": [
      "Nhân ngày Nhà giáo Việt Nam, chúc bạn và những người đồng nghiệp luôn vững lòng với sứ mệnh trồng người. Mong chúng ta mãi giữ được sự nhiệt huyết và niềm vui trong từng bài giảng.",
      "Chúc mừng ngày 20/11 đến những người bạn cùng chung chí hướng trong ngành giáo dục. Chúc bạn luôn nhiều sức khỏe, bình an và gặt hái thêm nhiều thành công mới."
    ]
  }
};
