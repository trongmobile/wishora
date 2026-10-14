/**
 * Lời chúc mẫu. Cấu trúc: MESSAGES[occasionId] = { default: [...], <relationId>: [...] }.
 * Khi người dùng chọn mối quan hệ có danh sách riêng thì dùng danh sách đó, nếu không dùng `default`.
 * Thêm lời chúc: chỉ cần thêm chuỗi vào mảng tương ứng (xem README).
 */

/** Mối quan hệ với người nhận (dùng chung cho mọi dịp). */
export const RELATIONS = Object.freeze({
  mother: 'Mẹ',
  father: 'Ba / Bố',
  grandparents: 'Ông bà',
  parents: 'Ba mẹ',
  family: 'Gia đình',
  child: 'Con',
  sibling: 'Anh chị em',
  relatives: 'Họ hàng',
  wife: 'Vợ',
  husband: 'Chồng',
  lover: 'Người yêu',
  friend: 'Bạn bè',
  bestfriend: 'Bạn thân',
  colleague: 'Đồng nghiệp',
  boss: 'Sếp',
  partner: 'Đối tác / khách hàng',
  teacher: 'Thầy cô',
  homeroom: 'Giáo viên chủ nhiệm',
  lecturer: 'Giảng viên',
  edu: 'Đồng nghiệp ngành giáo dục',
  doctor: 'Bác sĩ / thầy thuốc',
  everyone: 'Mọi người',
});

export const MESSAGES = Object.freeze({
  birthday: {
    default: [
      'Chúc mừng sinh nhật! Chúc bạn tuổi mới thật nhiều sức khỏe, niềm vui và những điều bất ngờ dễ thương.',
      'Sinh nhật vui vẻ nhé! Mong mọi ước mơ của bạn sẽ dần trở thành sự thật trong năm tới.',
      'Thêm một tuổi mới, thêm thật nhiều hạnh phúc. Chúc bạn luôn rạng rỡ và được yêu thương!',
    ],
    mother: ['Chúc mừng sinh nhật mẹ yêu! Con chúc mẹ luôn khỏe mạnh, bình an và mãi mỉm cười thật tươi. Con yêu mẹ rất nhiều.'],
    father: ['Chúc mừng sinh nhật ba! Cảm ơn ba đã luôn là chỗ dựa vững chắc của con. Chúc ba thật nhiều sức khỏe và niềm vui.'],
    lover: ['Chúc mừng sinh nhật người em/anh thương nhất! Cảm ơn vì đã xuất hiện trong cuộc đời mình. Mình sẽ luôn ở bên cạnh bạn.'],
    friend: ['Sinh nhật vui nhé bạn hiền! Chúc bạn tuổi mới đẹp hơn, giàu hơn và bớt deadline hơn. Nhớ khao tụi mình nha!'],
    colleague: ['Chúc mừng sinh nhật! Chúc bạn tuổi mới nhiều sức khỏe, công việc thuận lợi và luôn giữ được nụ cười như hôm nay.'],
  },

  // ----- Tết & năm mới -----
  'new-year': {
    default: [
      'Chúc mừng năm mới! Mong năm mới mang đến cho bạn thật nhiều sức khỏe, niềm vui và những khởi đầu tốt đẹp.',
      'Năm mới bình an, mọi dự định đều thuận lợi và trọn vẹn. Chúc mừng năm mới!',
      'Tạm biệt năm cũ với bao kỷ niệm đẹp, chào năm mới với thật nhiều hy vọng. Chúc bạn một năm thật rực rỡ!',
    ],
    lover: ['Cảm ơn vì đã cùng mình đi qua một năm thật đẹp. Năm mới, mình vẫn muốn đi tiếp cùng bạn. Chúc mừng năm mới!'],
    friend: ['Năm mới chúc bạn ít muộn phiền, nhiều tiếng cười, và tụi mình gặp nhau nhiều hơn năm cũ nhé!'],
  },
  tet: {
    default: [
      'Chúc mừng năm mới, vạn sự như ý!',
      'Chúc bạn một năm mới bình an, sức khỏe và nhiều thành công.',
      'Xuân sang phúc đến, tài lộc đầy nhà. Chúc bạn và gia đình một cái Tết thật ấm áp, sum vầy!',
    ],
    parents: ['Năm mới, con chúc ba mẹ luôn mạnh khỏe, bình an và vui vẻ bên con cháu. Con mong được về sum vầy cùng ba mẹ thật nhiều.'],
    grandparents: ['Cháu chúc ông bà sang năm mới sống lâu trăm tuổi, luôn khỏe mạnh và hạnh phúc bên con cháu.'],
    family: ['Chúc gia đình năm mới an khang, thịnh vượng. Mong mọi người luôn khỏe mạnh và quây quần bên nhau.'],
    relatives: ['Năm mới, cháu kính chúc cô chú, bác dì và cả nhà dồi dào sức khỏe, công việc hanh thông, vạn sự như ý.'],
    boss: ['Kính chúc sếp và gia đình năm mới an khang, thịnh vượng. Cảm ơn sếp đã luôn dẫn dắt và tin tưởng cả nhóm.'],
    partner: ['Nhân dịp năm mới, kính chúc quý đối tác một năm làm ăn phát đạt, hợp tác thuận lợi và gặt hái nhiều thành công.'],
    friend: ['Chúc bạn năm mới phát tài phát lộc, ít stress, nhiều niềm vui. Xuân này mình hẹn nhau cà phê nhé!'],
  },
  'giao-thua': {
    default: [
      'Giờ phút giao thừa thiêng liêng, chúc bạn và gia đình năm mới bình an, hạnh phúc và may mắn.',
      'Đêm giao thừa, mong mọi điều không vui sẽ ở lại năm cũ, và năm mới chỉ còn bình yên và niềm vui.',
      'Khoảnh khắc đất trời giao hòa, chúc bạn đón một năm mới thật trọn vẹn bên những người thương.',
    ],
  },
  'new-year-wish': {
    default: [
      'Gửi bạn lời chúc năm mới: sức khỏe dồi dào, tâm hồn thanh thản và thật nhiều điều tốt đẹp đang chờ phía trước.',
      'Chúc mừng năm mới! Mong mỗi ngày của bạn trong năm tới đều có một lý do để mỉm cười.',
      'Năm mới, mong bạn được làm điều mình yêu, ở bên người mình thương và bình an trong mọi chặng đường.',
    ],
  },
  'khai-xuan': {
    default: [
      'Đầu xuân khai bút, chúc bạn một năm khởi sắc: làm gì cũng thuận, đi đâu cũng gặp quý nhân.',
      'Xuân mới khởi đầu, chúc bạn mở hàng đại cát, công việc hanh thông, tài lộc dồi dào.',
      'Khai xuân đón lộc, chúc bạn và gia đình sức khỏe, an khang, vạn sự cát tường.',
    ],
    boss: ['Đầu xuân kính chúc sếp một năm mới khởi sắc, công việc thuận lợi và sức khỏe dồi dào. Chúng em sẽ cố gắng hơn nữa.'],
    colleague: ['Khai xuân vui vẻ nhé! Chúc team mình năm nay chốt deal đều, dự án chạy mượt và thưởng Tết thật dày.'],
  },

  // ----- Ngày của phụ nữ -----
  'women-day-08-03': {
    default: [
      'Chúc mừng ngày Quốc tế Phụ nữ 8/3! Chúc bạn luôn xinh đẹp, tự tin và được yêu thương mỗi ngày.',
      'Cảm ơn bạn vì đã luôn mạnh mẽ và dịu dàng. Chúc bạn một ngày 8/3 thật ngọt ngào và trọn vẹn!',
    ],
    mother: ['Mẹ ơi, nhân ngày 8/3 con chúc mẹ luôn khỏe mạnh, trẻ trung và thật nhiều niềm vui. Cảm ơn mẹ đã hy sinh vì con.'],
    wife: ['Chúc mừng 8/3 vợ yêu! Cảm ơn em đã chăm lo cho gia đình mình. Anh yêu em và biết ơn em rất nhiều.'],
    lover: ['Chúc mừng ngày 8/3 người con gái của anh! Mong em luôn rạng rỡ như hôm nay, và anh sẽ luôn ở bên em.'],
    friend: ['Chúc mừng 8/3 bạn xinh! Chúc bạn luôn hạnh phúc, đẹp rạng ngời và thành công trong mọi điều mình theo đuổi.'],
    colleague: ['Nhân ngày 8/3, chúc các chị em đồng nghiệp luôn tươi trẻ, nhiều niềm vui và thành công trong công việc.'],
    teacher: ['Nhân ngày 8/3, em kính chúc cô luôn mạnh khỏe, hạnh phúc. Cảm ơn cô đã tận tâm dìu dắt chúng em.'],
  },
  'women-day-20-10': {
    default: [
      'Chúc mừng ngày Phụ nữ Việt Nam 20/10! Chúc bạn luôn khỏe mạnh, hạnh phúc và được trân trọng.',
      'Gửi bạn đóa hoa tươi thắm nhân ngày 20/10. Cảm ơn bạn vì đã mang đến thật nhiều niềm vui cho mọi người.',
    ],
    mother: ['Mẹ yêu, nhân ngày 20/10 con chúc mẹ luôn bình an, khỏe mạnh và hạnh phúc. Cảm ơn mẹ vì tất cả.'],
    lover: ['Chúc mừng 20/10 người thương của anh! Em chính là điều đẹp nhất trong cuộc sống của anh. Yêu em nhiều.'],
    friend: ['20/10 vui vẻ nhé bạn! Chúc bạn xinh đẹp, thành công, và luôn được làm điều mình thích.'],
    colleague: ['Chúc mừng ngày 20/10! Chúc các chị em luôn rạng rỡ, mạnh khỏe và gặt hái nhiều thành công.'],
    teacher: ['Nhân ngày 20/10, em kính chúc cô luôn khỏe mạnh, hạnh phúc và mãi là ngọn lửa ấm áp của chúng em.'],
    wife: ['Chúc mừng 20/10 vợ yêu! Cảm ơn em vì đã luôn là điểm tựa của gia đình mình.'],
  },

  // ----- Gia đình -----
  'mothers-day': {
    default: [
      'Chúc mừng Ngày của Mẹ! Cảm ơn mẹ vì tình yêu bao la mẹ dành cho con. Con yêu mẹ rất nhiều.',
      'Mẹ là người tuyệt vời nhất của con. Chúc mẹ luôn bình an, khỏe mạnh và thật nhiều niềm vui.',
    ],
    wife: ['Chúc mừng Ngày của Mẹ! Cảm ơn em đã là một người mẹ tuyệt vời của các con. Anh yêu em.'],
    grandparents: ['Chúc bà một Ngày của Mẹ thật ấm áp. Cháu cảm ơn bà đã thương yêu cả nhà.'],
  },
  'fathers-day': {
    default: [
      'Chúc mừng Ngày của Cha! Cảm ơn ba đã luôn lặng lẽ yêu thương và che chở cho con.',
      'Ba là người hùng của con. Chúc ba luôn khỏe mạnh, bình yên và mãi là chỗ dựa của cả nhà.',
    ],
    husband: ['Chúc mừng Ngày của Cha! Cảm ơn anh đã là người cha tuyệt vời của các con. Em yêu anh.'],
    grandparents: ['Chúc ông một Ngày của Cha thật vui. Cháu cảm ơn ông đã luôn thương yêu và dạy bảo cả nhà.'],
  },
  'family-day-28-06': {
    default: [
      'Chúc mừng Ngày Gia đình Việt Nam! Chúc mọi nhà luôn đầm ấm, bình yên và có thật nhiều bữa cơm sum vầy.',
      'Gia đình là nơi để về. Cảm ơn mọi người đã luôn yêu thương và bên cạnh nhau. Chúc cả nhà thật nhiều sức khỏe!',
      'Mong gia đình mình luôn quây quần, chia sẻ và yêu thương nhau như thế này mãi mãi.',
    ],
  },
  'children-day-01-06': {
    default: [
      'Chúc mừng Ngày Quốc tế Thiếu nhi 1/6! Chúc con luôn vui vẻ, khỏe mạnh và lớn lên thật hạnh phúc.',
      'Chúc các bé luôn ngoan, khỏe và có thật nhiều nụ cười trong những ngày thơ ấu.',
      'Mỗi ngày của con đều là một món quà. Chúc con có một ngày 1/6 thật đáng nhớ!',
    ],
    child: ['Ba mẹ chúc con yêu một ngày 1/6 thật vui. Dù con lớn lên thế nào, con vẫn mãi là bảo bối của ba mẹ.'],
    friend: ['Ai bảo lớn rồi thì hết được mừng 1/6? Chúc bạn luôn giữ được tâm hồn trẻ thơ và niềm vui nhỏ bé mỗi ngày!'],
  },

  // ----- Tình yêu & tình bạn -----
  valentine: {
    default: [
      'Chúc mừng Valentine! Cảm ơn vì đã khiến mỗi ngày của mình trở nên đặc biệt hơn.',
      'Có bạn bên cạnh, ngày nào cũng là Valentine. Chúc mừng ngày lễ tình yêu!',
    ],
    lover: [
      'Valentine này, anh/em chỉ muốn nói rằng: cảm ơn vì đã yêu mình và để mình được yêu bạn.',
      'Dù thế giới có rộng lớn thế nào, nơi mình muốn về vẫn là bên cạnh bạn. Happy Valentine!',
    ],
    wife: ['Sau từng ấy năm, anh vẫn thấy mình may mắn khi được cưới em. Valentine vui vẻ nhé vợ yêu!'],
    husband: ['Cảm ơn anh đã luôn bên em qua mọi khó khăn. Valentine này em muốn nói: em yêu anh.'],
    friend: ['Valentine không chỉ dành cho các cặp đôi. Cảm ơn bạn đã luôn là người bạn tuyệt vời của mình!'],
  },
  'white-day': {
    default: [
      'Chúc mừng White Day! Gửi bạn một chút ngọt ngào để đáp lại tấm lòng của bạn.',
      'Cảm ơn bạn vì những yêu thương đã trao. Hôm nay, đến lượt mình gửi lại bạn một món quà nhỏ.',
    ],
    lover: ['White Day này, mình muốn đáp lại tình cảm của bạn bằng tất cả sự chân thành. Mình thương bạn.'],
  },
  'friendship-day-30-07': {
    default: [
      'Chúc mừng Ngày Quốc tế Tình bạn! Cảm ơn bạn vì đã luôn ở đó, lúc vui cũng như lúc buồn.',
      'Có những người không gặp thường xuyên nhưng luôn ở trong tim. Bạn chính là một trong số đó.',
    ],
    bestfriend: ['Cảm ơn mày đã chịu đựng tao suốt từng ấy năm. Chúc tình bạn của tụi mình bền lâu hơn cả mật khẩu wifi!'],
    friend: ['Ngày Tình bạn vui vẻ nhé! Hẹn bạn một buổi cà phê để kể nhau nghe chuyện cũ và chuyện mới.'],
  },
  'anniversary-personal': {
    default: [
      'Chúc mừng ngày kỷ niệm của chúng ta! Cảm ơn vì mỗi khoảnh khắc đã cùng nhau đi qua.',
      'Thêm một năm đồng hành, thêm nhiều kỷ niệm đẹp. Chúc chúng ta luôn vững vàng và hạnh phúc.',
    ],
    partner: ['Chúc mừng ngày kỷ niệm hợp tác của chúng ta! Cảm ơn sự tin tưởng và đồng hành trong suốt thời gian qua.'],
    colleague: ['Chúc mừng kỷ niệm ngày chúng ta cùng làm việc! Cảm ơn bạn đã là đồng đội tuyệt vời.'],
  },
  'anniversary-love': {
    default: [
      'Chúc mừng kỷ niệm ngày mình yêu nhau! Cảm ơn em/anh vì đã cùng mình viết nên câu chuyện này.',
      'Từng ngày bên bạn đều là một điều đặc biệt. Mong rằng mình sẽ cùng nhau đi thật xa.',
    ],
    lover: [
      'Hôm nay là ngày kỉ niệm của mình. Cảm ơn bạn vì đã kiên nhẫn, thương yêu và ở bên mình qua mọi ngày.',
      'Một năm nữa trôi qua, và mình vẫn chọn bạn như ngày đầu tiên.',
    ],
    wife: ['Chúc mừng kỷ niệm ngày cưới của chúng ta! Cảm ơn em đã cùng anh xây nên mái ấm này.'],
    husband: ['Chúc mừng kỷ niệm ngày cưới! Cảm ơn anh đã luôn thương yêu và bao dung em.'],
  },

  // ----- Ngày lễ Việt Nam -----
  'teachers-day-20-11': {
    default: [
      'Nhân ngày Nhà giáo Việt Nam 20/11, xin gửi lời tri ân đến người đã dạy dỗ và truyền cảm hứng cho chúng em.',
      'Kính chúc thầy cô luôn mạnh khỏe, hạnh phúc và mãi giữ được ngọn lửa nhiệt huyết với nghề.',
    ],
    teacher: [
      'Em kính chúc thầy cô nhân ngày 20/11 luôn mạnh khỏe và hạnh phúc. Cảm ơn thầy cô đã dạy em kiến thức và dạy em cách làm người.',
      'Một ngày là thầy, cả đời là thầy. Em luôn biết ơn công lao dìu dắt của thầy cô.',
    ],
    homeroom: ['Con kính chúc cô/thầy chủ nhiệm ngày 20/11 vui vẻ, luôn khỏe mạnh. Cảm ơn thầy cô đã luôn quan tâm và bao dung với cả lớp.'],
    lecturer: ['Em xin kính chúc thầy/cô nhân ngày Nhà giáo Việt Nam dồi dào sức khỏe và thành công trong sự nghiệp trồng người. Em xin cảm ơn những bài giảng đã giúp em trưởng thành.'],
    edu: ['Chúc mừng ngày Nhà giáo Việt Nam! Chúc bạn và các đồng nghiệp luôn tràn đầy đam mê, sức khỏe và niềm vui bên các thế hệ học trò.'],
    friend: ['Nhân ngày 20/11, chúc bạn nhà giáo của tụi mình luôn khỏe, nhiều học trò ngoan và lớp nào cũng dễ thương!'],
  },
  'doctors-day-27-02': {
    default: [
      'Nhân ngày Thầy thuốc Việt Nam 27/2, xin gửi lời cảm ơn chân thành đến những người đã tận tâm cứu chữa và chăm sóc sức khỏe cho mọi người.',
      'Kính chúc các bác sĩ, y tá luôn dồi dào sức khỏe và hạnh phúc, tiếp tục là chỗ dựa tin cậy của bệnh nhân.',
    ],
    doctor: ['Cảm ơn bác sĩ đã tận tình điều trị và động viên tôi. Kính chúc bác sĩ nhiều sức khỏe, thành công và niềm vui trong công việc.'],
    friend: ['Chúc mừng 27/2 bạn bác sĩ/y tá của tụi mình! Cảm ơn bạn vì đã hy sinh thật nhiều cho sức khỏe của mọi người. Nhớ giữ sức nhé!'],
  },
  'entrepreneurs-day-13-10': {
    default: [
      'Nhân ngày Doanh nhân Việt Nam 13/10, xin chúc bạn một năm kinh doanh thuận lợi, vững vàng trước mọi thử thách.',
      'Chúc các doanh nhân luôn giữ được tầm nhìn, bản lĩnh và góp phần thịnh vượng cho cộng đồng.',
    ],
    boss: ['Kính chúc sếp nhân ngày Doanh nhân Việt Nam luôn sáng suốt, sức khỏe dồi dào, đưa công ty ngày càng vững mạnh.'],
    partner: ['Nhân ngày 13/10, kính chúc quý đối tác kinh doanh phát đạt. Rất mong tiếp tục đồng hành cùng nhau lâu dài.'],
  },

  // ----- Lễ hội quốc tế -----
  christmas: {
    default: [
      'Giáng sinh an lành! Chúc bạn một mùa lễ ấm áp, bình yên bên những người thương yêu.',
      'Merry Christmas! Mong ông già Noel mang đến cho bạn thật nhiều niềm vui và những điều bạn ước.',
      'Đêm Noel nhiều ánh đèn, nhiều tiếng cười và ít muộn phiền. Chúc bạn một mùa Giáng sinh thật đẹp.',
    ],
    lover: ['Giáng sinh này, quà tặng lớn nhất của mình là được ở cạnh bạn. Merry Christmas, người thương.'],
    friend: ['Merry Christmas bạn hiền! Chúc bạn Noel ấm áp, nhiều quà và ít deadline. Đi chơi Noel với tụi mình nhé!'],
    family: ['Giáng sinh an lành! Chúc cả nhà một mùa lễ ấm áp, sum vầy và thật nhiều tiếng cười.'],
  },
  halloween: {
    default: [
      'Happy Halloween! Chúc bạn một đêm thật vui, nhiều kẹo ngọt và không bị ma dọa nhé!',
      'Boo! Chúc bạn có một Halloween đầy phép màu và những bộ hóa trang thật ấn tượng.',
    ],
    child: ['Chúc con yêu một đêm Halloween thật vui, nhận được thật nhiều kẹo và đừng ăn hết một lần nhé!'],
    friend: ['Halloween vui vẻ! Cùng nhau hóa trang thật kinh dị rồi đi xin kẹo thôi nào!'],
  },
  'happiness-day-20-03': {
    default: [
      'Chúc mừng Ngày Quốc tế Hạnh phúc! Chúc bạn tìm thấy niềm vui trong những điều giản dị mỗi ngày.',
      'Hạnh phúc không ở đâu xa — có thể chỉ là một cái ôm, một tách trà hay một lời hỏi thăm. Chúc bạn thật nhiều hạnh phúc.',
    ],
  },

  // ----- Dịp cá nhân hóa -----
  graduation: {
    default: [
      'Chúc mừng bạn đã tốt nghiệp! Những nỗ lực của bạn đã được đền đáp. Chúc bạn bước vào chặng đường mới thật vững vàng.',
      'Hôm nay là cột mốc đáng nhớ. Tự hào về bạn rất nhiều. Chúc bạn thành công trên con đường phía trước!',
    ],
    child: ['Ba mẹ rất tự hào về con. Chúc mừng con đã tốt nghiệp, mong con luôn vững vàng theo đuổi ước mơ.'],
    friend: ['Chúc mừng bạn tốt nghiệp! Từ giờ chính thức hết deadline rồi nhé. Chúc bạn tìm thấy công việc mơ ước!'],
  },
  promotion: {
    default: [
      'Chúc mừng bạn được thăng chức! Đây là thành quả xứng đáng cho sự nỗ lực của bạn.',
      'Vị trí mới, thử thách mới và cơ hội mới. Chúc bạn tiếp tục tỏa sáng và gặt hái nhiều thành công.',
    ],
    boss: ['Chúc mừng sếp được thăng chức! Thật xứng đáng. Chúng em rất vui và mong tiếp tục được làm việc cùng sếp.'],
    colleague: ['Chúc mừng bạn lên chức! Xứng đáng quá rồi. Nhớ nhớ tụi mình khi lên sếp nhé!'],
  },
  'grand-opening': {
    default: [
      'Chúc mừng khai trương! Chúc quý cửa hàng đông khách, buôn may bán đắt và phát triển bền vững.',
      'Khai trương hồng phát — mở hàng đại cát, tài lộc đầy nhà, ngày càng phát đạt!',
    ],
    partner: ['Nhân dịp khai trương, kính chúc quý đối tác kinh doanh thuận lợi, phát đạt. Rất mong được hợp tác lâu dài.'],
  },
  housewarming: {
    default: [
      'Chúc mừng tân gia! Chúc căn nhà mới luôn ấm áp, đầy ắp tiếng cười và hạnh phúc.',
      'Nhà mới, niềm vui mới. Chúc gia đình bạn thật nhiều sức khỏe, bình an và may mắn.',
    ],
  },
  newborn: {
    default: [
      'Chúc mừng gia đình đón thành viên mới! Chúc bé luôn khỏe mạnh, hay ăn chóng lớn và thật nhiều niềm vui.',
      'Chào mừng bé đến với thế giới này. Chúc ba mẹ thật nhiều sức khỏe và hạnh phúc trên hành trình mới.',
    ],
  },
  success: {
    default: [
      'Chúc mừng thành công của bạn! Mình luôn tin bạn sẽ làm được và bạn đã làm được điều đó.',
      'Mọi nỗ lực đều xứng đáng được ghi nhận. Chúc mừng bạn và chúc bạn tiếp tục chinh phục những mục tiêu mới.',
    ],
  },
  'thank-you': {
    default: [
      'Cảm ơn bạn rất nhiều! Sự giúp đỡ của bạn có ý nghĩa với mình hơn bạn nghĩ.',
      'Cảm ơn vì đã luôn ở bên cạnh và ủng hộ mình. Mình thật may mắn khi có bạn.',
    ],
    colleague: ['Cảm ơn bạn đã hỗ trợ mình trong dự án vừa rồi. Có bạn bên cạnh, công việc nhẹ nhàng hơn rất nhiều.'],
    teacher: ['Em xin gửi lời cảm ơn chân thành đến thầy cô vì đã tận tâm chỉ dạy và giúp đỡ em.'],
    partner: ['Chân thành cảm ơn quý đối tác đã tin tưởng và đồng hành cùng chúng tôi.'],
  },
  apology: {
    default: [
      'Mình xin lỗi. Mình nhận ra mình đã sai và rất mong bạn có thể tha thứ.',
      'Xin lỗi vì đã làm bạn buồn. Mình trân trọng bạn và sẽ cố gắng để điều đó không xảy ra nữa.',
    ],
    lover: ['Anh/em xin lỗi vì đã làm em/anh tổn thương. Cho mình một cơ hội để bù đắp nhé.'],
    friend: ['Mình xin lỗi vì chuyện vừa rồi. Tình bạn của tụi mình quan trọng hơn bất kỳ điều gì. Mình có thể gặp nhau nói chuyện được không?'],
  },
  'get-well': {
    default: [
      'Chúc bạn mau khỏe! Hãy nghỉ ngơi thật tốt, mọi người đều đang chờ bạn trở lại.',
      'Mong bạn sớm bình phục và tràn đầy năng lượng như trước. Có gì cần cứ nói mình nhé!',
    ],
    parents: ['Con chúc ba mẹ sớm khỏe lại. Ba mẹ nhớ ăn uống, nghỉ ngơi đầy đủ, con luôn ở bên.'],
    colleague: ['Chúc bạn sớm khỏe! Công việc đã có tụi mình lo, bạn cứ yên tâm nghỉ ngơi nhé.'],
  },
  'good-luck': {
    default: [
      'Chúc bạn may mắn! Hãy tự tin, vì bạn đã chuẩn bị rất tốt rồi.',
      'Chúc bạn mọi điều thuận lợi trong kỳ thi / cuộc phỏng vấn / chặng đường sắp tới. Mình tin ở bạn!',
    ],
    child: ['Chúc con yêu thi tốt nhé! Chỉ cần con cố gắng hết sức, ba mẹ đã tự hào lắm rồi.'],
    friend: ['Chúc bạn thi tốt, phỏng vấn thuận lợi và mọi việc đều như ý. Cố lên nhé!'],
  },
  'free-wish': {
    default: [
      'Gửi bạn một lời chúc nhỏ: mong hôm nay của bạn thật nhẹ nhàng và nhiều niềm vui.',
      'Chỉ muốn nói rằng mình luôn nghĩ đến bạn và chúc bạn mọi điều tốt đẹp.',
    ],
  },
});
