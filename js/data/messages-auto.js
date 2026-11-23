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
      "Cảm ơn bạn đã luôn hỗ trợ mình trong công việc thời gian qua. Chúc bạn và gia đình một mùa Noel ấm cúng và hạnh phúc.",
      "Mùa lễ hội cuối năm rộn ràng ghé đến rồi! Chúc bạn có những ngày Giáng sinh thật rực rỡ, nạp đầy năng lượng tươi mới để cùng nhau bứt phá trong năm sắp tới.",
      "Nhạc Noel rộn rã vang lên báo hiệu một mùa Giáng sinh tươi vui nữa lại về. Cảm ơn bạn đã là người đồng hành ăn ý suốt năm qua, chúc bạn đón lễ thật rạng rỡ nhé!"
    ],
    "family": [
      "Giáng sinh năm nay thật đặc biệt khi con được quây quần bên ba mẹ. Chúc ba mẹ luôn mạnh khỏe và bình an.",
      "Gửi những cái ôm ấm áp nhất tới gia đình mình trong đêm Noel lạnh giá này. Chúc nhà mình luôn vui vẻ và ngập tiếng cười.",
      "Merry Christmas cả nhà yêu! Mong mọi điều tốt đẹp và bình an nhất sẽ đến với gia đình mình trong mùa lễ này.",
      "Đêm Giáng sinh rộn ràng tiếng nhạc, con chỉ mong cả nhà mình luôn giữ mãi nụ cười rạng rỡ bên nhau. Chúc gia đình mình đón một mùa lễ thật tưng bừng và đáng nhớ!"
    ],
    "lover": [
      "Mỗi mùa Giáng sinh có bạn ở bên đều trở nên kỳ diệu hơn. Chúc tình yêu của chúng ta mãi ngọt ngào như ngày đầu.",
      "Đêm Noel lạnh nhưng có tay bạn nắm thì ấm áp lạ thường. Cảm ơn bạn đã đến và sưởi ấm mùa đông của mình.",
      "Giáng sinh lung linh hơn muôn phần khi có bạn cùng dạo bước qua những con phố rực rỡ ánh đèn. Chúc người thương của mình một mùa lễ thật nhiều hạnh phúc!",
      "Không khí Noel ngoài kia dù có se lạnh thì ở cạnh bạn mọi thứ đều trở nên ngọt ngào và ấm áp. Chúc người yêu một mùa Giáng sinh thật vui vẻ và an yên."
    ],
    "friend": [
      "Noel rộn ràng phố xá lên đèn rồi, chuẩn bị xúng xính đồ đẹp đi dạo thôi bạn ơi. Chúc bạn có một đêm Giáng sinh vui hết nấc và tràn ngập tiếng cười!",
      "Chúc bạn một mùa Giáng sinh rực rỡ và ấm áp! Tạm cất hết âu lo sang một bên để tận hưởng không khí lễ hội tưng bừng cuối năm nhé.",
      "Giáng sinh đến rồi, mong mọi điều may mắn và tươi vui nhất sẽ tìm đến bạn. Cảm ơn vì đã luôn đồng hành cùng mình trong suốt một năm nhiều kỷ niệm!",
      "Giáng sinh rộn ràng đến rồi, hẹn bạn một buổi tối cùng nhau quây quần bên nồi lẩu nóng hổi và hát hò vang trời nhé. Chúc bạn đón mùa lễ năm nay thật náo nhiệt!"
    ],
    "default": [
      "Chúc bạn một mùa Giáng sinh ngập tràn ánh sáng diệu kỳ và những giai điệu rộn rã. Mong những ngày cuối năm của bạn luôn đong đầy niềm hạnh phúc.",
      "Chuông ngân vang báo hiệu mùa lễ hội rộn ràng nhất năm đã đến. Chúc bạn đón một đêm Giáng sinh thật tươi vui, ấm áp và trọn vẹn yêu thương.",
      "Giáng sinh an lành! Mong không khí se lạnh ngoài phố càng làm nổi bật sự ấm áp trong tim bạn cùng những khoảnh khắc sum vầy đáng nhớ."
    ]
  },
  "new-year": {
    "family": [
      "Năm mới con chỉ mong ba mẹ luôn khỏe mạnh, lúc nào cũng vui vẻ và bình an bên con cháu.",
      "Cảm ơn gia đình luôn là chỗ dựa ấm áp nhất của con. Chúc nhà mình năm mới ngập tràn tiếng cười và mọi sự như ý.",
      "Chúc ông bà năm mới thật nhiều sức khỏe, sống lâu trăm tuổi và luôn an vui cùng con cháu.",
      "Chúc mừng năm mới cả nhà mình! Con mong năm mới gia đình ta sẽ có thêm thật nhiều bữa cơm sum vầy, tiếng cười giòn tan và những chuyến đi vui vẻ cùng nhau.",
      "Năm mới đến rồi, con chúc ba mẹ luôn giữ tinh thần phơi phới, bớt lo toan vất vả và tận hưởng thật nhiều niềm vui nhỏ bé mỗi ngày."
    ],
    "colleague": [
      "Chúc bạn một năm mới làm việc thật hiệu suất, ít tăng ca và đạt được nhiều bước tiến mới trong sự nghiệp.",
      "Cảm ơn bạn đã luôn hỗ trợ mình trong công việc suốt năm qua. Chúc bạn năm mới nhiều năng lượng và gặt hái nhiều thành công.",
      "Chúc bạn và team mình năm mới hợp tác ăn ý, dự án nào cũng suôn sẻ và về đích đúng hẹn.",
      "Chúc mừng năm mới! Chúc bạn năm nay đi làm ngày nào cũng tràn đầy hứng khởi, ý tưởng tuôn trào không ngớt và gặp toàn những đồng đội dễ thương hết nấc.",
      "Năm mới gõ cửa rồi, chúc bạn mở màn một năm thật rực rỡ! Mong bạn sớm chinh phục được những mục tiêu lớn và luôn giữ vững phong độ tuyệt vời như hiện tại."
    ],
    "lover": [
      "Khoảnh khắc giao thừa có bạn bên cạnh là điều tuyệt vời nhất. Chúc cho tình yêu của chúng ta năm mới càng thêm gắn bó.",
      "Mong rằng năm mới này mỗi ngày trôi qua của chúng ta đều là những ngày vui vẻ và hạnh phúc trọn vẹn.",
      "Chúc mừng năm mới! Mong năm nay chúng mình sẽ cùng nhau đi thật nhiều nơi mới mẻ, ăn thật nhiều món ngon và lúc nào cũng rộn ràng tiếng cười bên nhau.",
      "Năm mới đến tưng bừng rồi! Chúc người thương của mình luôn rạng rỡ, mọi ước mơ đều thành hiện thực và nhớ là luôn có mình cổ vũ ngay phía sau nhé."
    ],
    "friend": [
      "Chúc mừng năm mới! Chúc bạn năm nay ăn ngon ngủ kỹ, rủ đi đâu cũng có mặt ngay, lúc nào cũng rạng rỡ và tràn đầy năng lượng nhé.",
      "Chào năm mới! Mong bạn sớm hoàn thành hết mấy kế hoạch còn dang dở, ngày nào cũng có chuyện vui để kể cho tụi mình nghe.",
      "Năm mới tưng bừng nhé bạn! Chúc mọi dự định ấp ủ bấy lâu đều thành hiện thực, đi đến đâu cũng gặp toàn điều may mắn và dễ thương.",
      "Chúc mừng năm mới bạn hiền! Năm nay chúc bạn ngày càng tươi trẻ, thử được hết mấy sở thích mới toanh và tụi mình sớm có kèo tụ tập linh đình nhé."
    ],
    "default": [
      "Khép lại năm cũ và mở ra trang mới thật tưng bừng! Chúc mừng năm mới với thật nhiều năng lượng tích cực, cơ hội mới và niềm vui mỗi ngày.",
      "Chúc mừng năm mới! Chúc bạn có một năm thật nhiều trải nghiệm đáng nhớ, dám thử thách bản thân và gặt hái thật nhiều thành quả ngọt ngào.",
      "Không khí năm mới đang ngập tràn khắp nơi. Chúc bạn bước sang năm mới với tâm thế hân hoan, nụ cười luôn trên môi và vạn sự hanh thông."
    ]
  },
  "giao-thua": {
    "family": [
      "Pháo hoa sáng rực đêm giao thừa, chúc nhà mình năm mới lúc nào cũng rộn rã tiếng cười và ngập tràn may mắn.",
      "Khoảnh khắc thiêng liêng này, chỉ mong gia đình ta luôn mạnh khỏe, bình an và sát cánh bên nhau qua mọi chặng đường.",
      "Năm cũ qua đi, chúc mọi thành viên trong nhà mình đón một năm mới với thật nhiều năng lượng tích cực và niềm vui mới.",
      "Giao thừa ấm cúng bên nhau, chúc nhà mình năm mới lúc nào cũng đong đầy yêu thương, gắn kết và đón nhận nhiều tài lộc.",
      "Đêm chuyển giao năm mới, mong gia đình mình luôn giữ được sự bình yên, mọi thành viên đều mạnh khỏe và thuận lợi trong mọi việc."
    ],
    "parents": [
      "Giây phút giao thừa chuyển giao năm mới, con chúc ba mẹ luôn dồi dào sức khỏe, an khang và mãi là điểm tựa vững chắc của chúng con.",
      "Đêm giao thừa rộn rã tiếng pháo hoa, con cảm ơn ba mẹ cả năm qua đã vất vả lo toan cho gia đình. Năm mới đến rồi, con chúc ba mẹ luôn vui tươi, nhẹ nhàng và đón một cái Tết thật tưng bừng!",
      "Thời khắc giao thừa đã điểm, con chúc ba mẹ bước sang năm mới lúc nào cũng trẻ trung, yêu đời và có thật nhiều chuyến du xuân rộn ràng niềm vui. Cả nhà mình năm nay sẽ có thêm nhiều kỷ niệm đẹp ba mẹ nhé!",
      "Giao thừa thiêng liêng đã điểm, con chúc ba mẹ năm mới an khang thịnh vượng, lúc nào cũng an nhiên và hạnh phúc bên con cháu.",
      "Cảm ơn ba mẹ đã luôn yêu thương và chăm lo cho chúng con suốt năm qua. Giao thừa đến rồi, con chúc ba mẹ thật nhiều sức khỏe để tận hưởng một năm mới thật an lành."
    ],
    "lover": [
      "Cảm ơn em đã cùng anh đi qua biết bao kỷ niệm rực rỡ trong năm cũ. Tiếng pháo hoa giao thừa vang lên rồi, mình cùng nắm tay nhau đón một năm mới thật tưng bừng và ngọt ngào nhé!",
      "Giao thừa đến rồi, em chúc anh bước sang năm mới luôn rạng rỡ, tràn đầy hứng khởi và có thật nhiều chuyến đi vui hết nấc cùng em. Mình lại tiếp tục quậy tưng bừng trong năm mới thôi!",
      "Khoảnh khắc chuyển giao năm mới này, cảm ơn anh vì một năm qua đã luôn chiều chuộng và làm em cười mỗi ngày. Chúc anh năm mới lúc nào cũng vui vẻ, tươi tắn và bên em thật lâu nhé!",
      "Đêm giao thừa ngập tràn ánh sáng, chúc người thương của anh năm mới luôn xinh đẹp, ngọt ngào và mãi là nguồn động lực lớn nhất của anh.",
      "Khoảnh khắc giao thừa rộn ràng tiếng pháo hoa, anh chỉ muốn ôm em thật chặt để chào đón khởi đầu mới của hai đứa. Chúc em năm mới luôn rạng rỡ, an yên và cùng anh viết tiếp thật nhiều niềm vui!"
    ],
    "friend": [
      "Pháo hoa giao thừa sắp nổ rồi, chúc bạn năm mới ăn ngon ngủ kỹ, đi chơi không lo kẹt xe và lúc nào cũng cười tươi hết cỡ. Năm mới nhớ tụ tập cùng hội mình thật nhiều đấy nhé!",
      "Cảm ơn bạn vì một năm qua đã luôn lắng nghe và đồng hành cùng mình qua bao phen dở khóc dở cười. Giao thừa gõ cửa rồi, chúc bạn năm mới bùng nổ năng lượng và rực rỡ hơn nữa nhé!",
      "Chuông giao thừa điểm rồi, gác lại hết mọi áp lực năm cũ sang một bên thôi bạn ơi! Chúc bạn bước sang năm mới tinh thần phơi phới, làm gì cũng hanh thông và gặp toàn chuyện vui bất ngờ.",
      "Đồng hồ sắp điểm sang năm mới rồi, chúc bạn năm nay tha hồ vi vu khám phá những điều mới mẻ và có thêm cả rổ kỷ niệm đáng nhớ. Giao thừa thật tưng bừng và rộn rã tiếng cười nhé bạn thân!",
      "Đêm nay thức trọn vẹn đón giao thừa cùng tiếng pháo hoa rộn rã nhé bạn ơi! Chúc bạn sang năm mới luôn dồi dào sức khỏe, giữ mãi nụ cười tươi rói và lúc nào cũng gặp toàn điều may mắn."
    ],
    "default": [
      "Khoảnh khắc giao thừa ấm áp, chúc bạn bước sang năm mới với một khởi đầu mới mẻ, tràn đầy hứng khởi và gặt hái nhiều thành công.",
      "Tiếng pháo hoa vang lên chào năm mới, chúc bạn và những người thân yêu có một đêm giao thừa ngập tràn niềm vui và bình yên.",
      "Gác lại những bộn bề của năm cũ, chúc bạn đón chào giao thừa với tâm thế nhẹ nhàng và một năm mới rực rỡ hơn."
    ]
  },
  "tet": {
    "parents": [
      "Mong ba mẹ luôn giữ gìn sức khỏe để lúc nào nhà mình cũng rộn rã tiếng cười trong những ngày đầu năm mới.",
      "Năm mới đến, con chỉ mong ba mẹ thật nhiều sức khỏe, bình an và thảnh thơi tận hưởng niềm vui bên con cái.",
      "Cảm ơn ba mẹ đã luôn là điểm tựa vững chắc cho con. Con chúc ba mẹ năm mới ngập tràn niềm vui và an yên."
    ],
    "grandparents": [
      "Kính chúc ông bà năm mới phúc thọ an khang, mỗi ngày trôi qua đều là những giây phút bình yên bên con cháu.",
      "Cháu chúc ông bà luôn dồi dào sức khỏe, tinh thần minh mẫn để làm chỗ dựa tinh thần ấm áp cho cả nhà.",
      "Mong ông bà sang năm mới luôn vui khỏe, an hưởng tuổi già và tràn ngập niềm vui sum vầy cùng con cháu."
    ],
    "family": [
      "Chúc cho mái nhà chung của chúng ta năm mới luôn đong đầy yêu thương, mọi thành viên đều khỏe mạnh và bình an."
    ],
    "relatives": [
      "Năm mới sang, chúc đại gia đình mình một năm vạn sự hanh thông, nhà cửa lúc nào cũng rộn ràng tiếng cười.",
      "Cháu chúc các bác các cô chú năm mới bình an, gặt hái nhiều thành quả mới và luôn giữ vững lửa nhiệt huyết.",
      "Kính chúc họ hàng nội ngoại năm mới đong đầy yêu thương, mọi dự định đều thành hiện thực và nhiều may mắn."
    ],
    "boss": [
      "Kính chúc sếp năm mới nhiều sinh khí mới, đưa tập thể đi đến những cột mốc rực rỡ và luôn giữ vững phong độ.",
      "Nhân dịp xuân về, kính chúc sếp cùng gia quyến an khang thịnh vượng, vạn sự cát tường và luôn tràn đầy năng lượng.",
      "Chúc sếp năm mới thắng lợi mới, gặt hái nhiều thành tựu lớn trong công việc và có những phút giây sum vầy trọn vẹn."
    ],
    "partner": [
      "Kính chúc quý đối tác một năm mới bứt phá mạnh mẽ, hợp tác bền chặt và cùng nhau gặt hái nhiều thắng lợi mới.",
      "Năm mới sang, chúc quý đối tác vạn sự khởi sắc, dòng tiền hanh thông và uy tín ngày càng lan tỏa rộng rãi."
    ]
  },
  "valentine": {
    "wife": [
      "Cảm ơn em đã chăm lo cho tổ ấm nhỏ của chúng mình. Chúc vợ yêu một ngày Valentine thật hạnh phúc và ngập tràn nụ cười.",
      "Mỗi ngày trôi qua, anh càng thêm yêu sự dịu dàng và thấu hiểu của em. Chúc người bạn đời của anh một mùa Valentine ngọt ngào.",
      "Cuộc sống bận rộn ngoài kia, chỉ cần về nhà thấy nụ cười của em là anh yên lòng. Chúc vợ một ngày 14 tháng 2 trọn vẹn yêu thương."
    ],
    "husband": [
      "Cảm ơn bờ vai vững chãi của anh đã luôn là chỗ dựa bình yên cho em. Chúc chồng yêu một ngày Valentine ấm áp và luôn vui vẻ.",
      "Nhiều lúc chẳng cần nói gì nhiều, chỉ cần có anh ở cạnh là em thấy đủ đầy. Chúc mừng ngày lễ tình yêu, người đàn ông của em.",
      "Cảm ơn anh vì sự kiên nhẫn và cách anh yêu thương em mỗi ngày. Chúc chồng một mùa Valentine thật ngọt ngào bên gia đình nhỏ."
    ],
    "friend": [
      "Chúc đứa bạn thân của tôi sớm thoát ế để còn có người đi chơi ngày này. Valentine vui vẻ và luôn rực rỡ nhé!",
      "Cảm ơn bạn vì luôn là đứa chịu nghe tôi than thở mọi chuyện trên đời. Chúc bạn một mùa Valentine thật nhiều niềm vui và sớm tìm được một nửa ưng ý."
    ]
  }
};
