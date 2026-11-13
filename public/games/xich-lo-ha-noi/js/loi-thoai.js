/* ================================================================
   LỜI THOẠI GAME XÍCH LÔ HÀ NỘI 2000
   Sửa / thêm câu thoại ngay trong file này, KHÔNG cần sửa mã nguồn game.
   - Giữ nguyên dòng "window.LOI_THOAI = " ở đầu và dấu ";" ở cuối.
   - Mỗi câu là { "id": "...", "text": "..." } — id phải khác nhau.
   - Nhóm có tên bắt đầu bằng "tai_xe"  -> tài xế cà khịa (có thể thêm nhóm mới, vd "tai_xe_trend_2027")
     "npc"     -> NPC đáp trả
     "khach"   -> hành khách trên xe
     "nguoi"   -> người chứng kiến
   - show_seconds: số giây mỗi câu hiện; cooldown_seconds: thời gian chờ giữa 2 màn đấu khẩu;
     avoid_repeat_last: không lặp lại N câu vừa dùng.
   ================================================================ */
window.LOI_THOAI = {
  "game": "Xích Lô Hà Nội - GameHiHi",
  "description": "Lời thoại hư cấu, hài hước, cho va chạm hoạt hình nhẹ, không cổ vũ gây tai nạn thật. Các câu trend là biến tấu sáng tạo, không phải tất cả là trích dẫn meme chính thức.",
  "recommended_trigger": "minor_cartoon_collision",
  "show_seconds": 2.2,
  "cooldown_seconds": 8,
  "avoid_repeat_last": 8,
  "dialogues": {
    "tai_xe_ca_khia": [
      {
        "id": "tai_xe_ca_khia_001",
        "text": "Mắt mũi để ở gáy à?"
      },
      {
        "id": "tai_xe_ca_khia_002",
        "text": "Đi đứng kiểu gì đấy ông nội?"
      },
      {
        "id": "tai_xe_ca_khia_003",
        "text": "Ủa alo, không thấy xích lô à?"
      },
      {
        "id": "tai_xe_ca_khia_004",
        "text": "Đường rộng thế mà cứ thích lao vào xe tôi!"
      },
      {
        "id": "tai_xe_ca_khia_005",
        "text": "Có mắt như không thế?"
      },
      {
        "id": "tai_xe_ca_khia_006",
        "text": "Đi đứng thế này thì chịu rồi!"
      },
      {
        "id": "tai_xe_ca_khia_007",
        "text": "Ai cho ông đứng trước đầu xe tôi?"
      },
      {
        "id": "tai_xe_ca_khia_008",
        "text": "Né ra cho người ta làm ăn coi!"
      },
      {
        "id": "tai_xe_ca_khia_009",
        "text": "Ra đường quên mang mắt à?"
      },
      {
        "id": "tai_xe_ca_khia_010",
        "text": "Ông đi bộ hay đi tìm drama?"
      },
      {
        "id": "tai_xe_ca_khia_011",
        "text": "Đường của ông xây đấy à?"
      },
      {
        "id": "tai_xe_ca_khia_012",
        "text": "Mắt để ngắm cảnh chứ không nhìn đường à?"
      },
      {
        "id": "tai_xe_ca_khia_013",
        "text": "Ủa, ông đang đứng canh xe tôi à?"
      },
      {
        "id": "tai_xe_ca_khia_014",
        "text": "Nhìn đường hộ cái, ông tướng!"
      },
      {
        "id": "tai_xe_ca_khia_015",
        "text": "Đứng như trời trồng thế ai né kịp?"
      },
      {
        "id": "tai_xe_ca_khia_016",
        "text": "Tôi đi xích lô, có đi tìm ông đâu!"
      },
      {
        "id": "tai_xe_ca_khia_017",
        "text": "Ủa sao tự nhiên ông xuất hiện ở đây?"
      },
      {
        "id": "tai_xe_ca_khia_018",
        "text": "Chân đi trước hay mắt đi trước đấy?"
      },
      {
        "id": "tai_xe_ca_khia_019",
        "text": "Ông đứng đấy từ bao giờ thế?"
      },
      {
        "id": "tai_xe_ca_khia_020",
        "text": "Tôi bóp còi mà ông tưởng nhạc nền à?"
      },
      {
        "id": "tai_xe_ca_khia_021",
        "text": "Đang đi ngon lành, ông lại chen ngang!"
      },
      {
        "id": "tai_xe_ca_khia_022",
        "text": "Ông đợi xe hay đợi chuyện đấy?"
      },
      {
        "id": "tai_xe_ca_khia_023",
        "text": "Tôi đang chở khách, ông định đi ké à?"
      },
      {
        "id": "tai_xe_ca_khia_024",
        "text": "Trời ơi, tự nhiên có người hiện ra!"
      },
      {
        "id": "tai_xe_ca_khia_025",
        "text": "Rẽ trái rẽ phải không, sao đứng im?"
      },
      {
        "id": "tai_xe_ca_khia_026",
        "text": "Đã nhìn thấy xe chưa mà còn hỏi?"
      },
      {
        "id": "tai_xe_ca_khia_027",
        "text": "Ơ hay, tôi vừa gặp vật cản biết nói!"
      },
      {
        "id": "tai_xe_ca_khia_028",
        "text": "Bác ơi, nhường đường cho xích lô với!"
      },
      {
        "id": "tai_xe_ca_khia_029",
        "text": "Mới ra phố lần đầu à ông bạn?"
      },
      {
        "id": "tai_xe_ca_khia_030",
        "text": "Phố đông thế này phải nhìn trước ngó sau chứ!"
      }
    ],
    "tai_xe_game_meme": [
      {
        "id": "tai_xe_game_meme_001",
        "text": "NPC này bị lag à?"
      },
      {
        "id": "tai_xe_game_meme_002",
        "text": "Ông không có nút né hả?"
      },
      {
        "id": "tai_xe_game_meme_003",
        "text": "Đứng giữa đường làm NPC cản map à?"
      },
      {
        "id": "tai_xe_game_meme_004",
        "text": "Đi bộ mà không qua nổi màn hướng dẫn!"
      },
      {
        "id": "tai_xe_game_meme_005",
        "text": "Ông là NPC hay trùm cuối vậy?"
      },
      {
        "id": "tai_xe_game_meme_006",
        "text": "Tôi đang chơi game hay chơi vượt chướng ngại?"
      },
      {
        "id": "tai_xe_game_meme_007",
        "text": "Máy chủ vừa thả ông xuống giữa đường à?"
      },
      {
        "id": "tai_xe_game_meme_008",
        "text": "Phản xạ âm một trăm điểm rồi!"
      },
      {
        "id": "tai_xe_game_meme_009",
        "text": "Skin đẹp đấy, kỹ năng né đâu?"
      },
      {
        "id": "tai_xe_game_meme_010",
        "text": "Mắt ông có bật chế độ máy bay không?"
      },
      {
        "id": "tai_xe_game_meme_011",
        "text": "Chân đang loading à?"
      },
      {
        "id": "tai_xe_game_meme_012",
        "text": "Ông đứng hình từ nãy tới giờ à?"
      },
      {
        "id": "tai_xe_game_meme_013",
        "text": "Người hay nhiệm vụ phụ đấy?"
      },
      {
        "id": "tai_xe_game_meme_014",
        "text": "Tôi chưa mở khóa màn này mà!"
      },
      {
        "id": "tai_xe_game_meme_015",
        "text": "Trời đất, NPC chạy sai đường dẫn rồi!"
      },
      {
        "id": "tai_xe_game_meme_016",
        "text": "Có ai vá lỗi đi bộ giúp ông này không?"
      },
      {
        "id": "tai_xe_game_meme_017",
        "text": "Ông bị tụt FPS hay gì?"
      },
      {
        "id": "tai_xe_game_meme_018",
        "text": "Ủa, ai spawn ông ngay đầu xe?"
      },
      {
        "id": "tai_xe_game_meme_019",
        "text": "Xích lô tôi có nam châm hút NPC à?"
      },
      {
        "id": "tai_xe_game_meme_020",
        "text": "Tôi tưởng map này không có boss!"
      },
      {
        "id": "tai_xe_game_meme_021",
        "text": "Ông là nhiệm vụ hàng ngày à?"
      },
      {
        "id": "tai_xe_game_meme_022",
        "text": "Người chơi khác còn biết tránh xe đấy!"
      },
      {
        "id": "tai_xe_game_meme_023",
        "text": "Ông đang test hitbox của tôi à?"
      },
      {
        "id": "tai_xe_game_meme_024",
        "text": "Đầu xe không phải điểm hồi sinh đâu!"
      },
      {
        "id": "tai_xe_game_meme_025",
        "text": "Đi đường mà như mất kết nối máy chủ!"
      },
      {
        "id": "tai_xe_game_meme_026",
        "text": "Ông đang AFK giữa phố à?"
      },
      {
        "id": "tai_xe_game_meme_027",
        "text": "Hệ thống ơi, NPC này đứng sai chỗ!"
      },
      {
        "id": "tai_xe_game_meme_028",
        "text": "Chắc ông bật chế độ tự động đi bộ!"
      },
      {
        "id": "tai_xe_game_meme_029",
        "text": "Tôi lái xích lô chứ có lái tàu hỏa đâu!"
      },
      {
        "id": "tai_xe_game_meme_030",
        "text": "Bản đồ lỗi hay ông lỗi vậy?"
      }
    ],
    "tai_xe_trend_2026_bien_tau": [
      {
        "id": "tai_xe_trend_2026_bien_tau_001",
        "text": "Farm aura kiểu gì mà đứng ngay đầu xe?"
      },
      {
        "id": "tai_xe_trend_2026_bien_tau_002",
        "text": "Một cú né thôi cũng được cộng aura mà!"
      },
      {
        "id": "tai_xe_trend_2026_bien_tau_003",
        "text": "Trừ một nghìn aura vì không nhìn đường!"
      },
      {
        "id": "tai_xe_trend_2026_bien_tau_004",
        "text": "Ông đi bộ bá khí ghê nhỉ!"
      },
      {
        "id": "tai_xe_trend_2026_bien_tau_005",
        "text": "Bá khí tới mức xích lô cũng phải phanh!"
      },
      {
        "id": "tai_xe_trend_2026_bien_tau_006",
        "text": "Hồi chiều trời mưa, giờ tôi gặp ông!"
      },
      {
        "id": "tai_xe_trend_2026_bien_tau_007",
        "text": "Hồi chiều trời mưa, còn giờ trời ơi!"
      },
      {
        "id": "tai_xe_trend_2026_bien_tau_008",
        "text": "Dự án né xe của ông tới đâu rồi?"
      },
      {
        "id": "tai_xe_trend_2026_bien_tau_009",
        "text": "Kế hoạch nhìn đường đúng là dự án ma!"
      },
      {
        "id": "tai_xe_trend_2026_bien_tau_010",
        "text": "Pha xuất hiện này khá niche nha!"
      },
      {
        "id": "tai_xe_trend_2026_bien_tau_011",
        "text": "Ủa, đang farm aura hay farm drama?"
      },
      {
        "id": "tai_xe_trend_2026_bien_tau_012",
        "text": "Ông làm vậy bay sạch aura rồi!"
      },
      {
        "id": "tai_xe_trend_2026_bien_tau_013",
        "text": "Thần thái đủ rồi, nhìn đường hộ tôi!"
      },
      {
        "id": "tai_xe_trend_2026_bien_tau_014",
        "text": "Đúng là một pha xuất hiện bá khí!"
      },
      {
        "id": "tai_xe_trend_2026_bien_tau_015",
        "text": "Dạ gỗ xà cừ ạ... ủa tôi hỏi nhầm người!"
      },
      {
        "id": "tai_xe_trend_2026_bien_tau_016",
        "text": "Công chúa phòng trọ ra giữa đường làm gì?"
      },
      {
        "id": "tai_xe_trend_2026_bien_tau_017",
        "text": "Thế mà lại hay, gặp đúng một ông đứng chắn!"
      },
      {
        "id": "tai_xe_trend_2026_bien_tau_018",
        "text": "Hôm nay ông định làm content đường phố à?"
      },
      {
        "id": "tai_xe_trend_2026_bien_tau_019",
        "text": "Ông đi bộ mà aura phát sáng luôn!"
      },
      {
        "id": "tai_xe_trend_2026_bien_tau_020",
        "text": "Không cần bá khí, cần né xe cơ!"
      },
      {
        "id": "tai_xe_trend_2026_bien_tau_021",
        "text": "Hồi chiều trời mưa, giờ dép ông đâu?"
      },
      {
        "id": "tai_xe_trend_2026_bien_tau_022",
        "text": "Ông làm tôi mất hết aura tài xế!"
      },
      {
        "id": "tai_xe_trend_2026_bien_tau_023",
        "text": "Dự án đi thẳng sao tự nhiên rẽ vào xe?"
      },
      {
        "id": "tai_xe_trend_2026_bien_tau_024",
        "text": "Màn né xe này hơi khó nhằn nhỉ?"
      },
      {
        "id": "tai_xe_trend_2026_bien_tau_025",
        "text": "Ông cứ đứng vậy là tôi hết farm tiền!"
      },
      {
        "id": "tai_xe_trend_2026_bien_tau_026",
        "text": "Thấy tôi phanh mà ông vẫn chill à?"
      },
      {
        "id": "tai_xe_trend_2026_bien_tau_027",
        "text": "Pha này đúng kiểu aura âm vô cực!"
      },
      {
        "id": "tai_xe_trend_2026_bien_tau_028",
        "text": "Né xong hãy tạo dáng bá khí nhé!"
      },
      {
        "id": "tai_xe_trend_2026_bien_tau_029",
        "text": "Đứng giữa đường mà vẫn ung dung thật!"
      },
      {
        "id": "tai_xe_trend_2026_bien_tau_030",
        "text": "Meme mới: người đi bộ chặn xích lô!"
      }
    ],
    "tai_xe_pho_co_ha_noi": [
      {
        "id": "tai_xe_pho_co_ha_noi_001",
        "text": "Đây là phố cổ chứ có phải sân nhà ông đâu!"
      },
      {
        "id": "tai_xe_pho_co_ha_noi_002",
        "text": "Tôi đang đi Hồ Gươm mà ông chặn đường!"
      },
      {
        "id": "tai_xe_pho_co_ha_noi_003",
        "text": "Ơ kìa bác ơi, cho cháu xin lối!"
      },
      {
        "id": "tai_xe_pho_co_ha_noi_004",
        "text": "Đi dạo Bờ Hồ mà mơ màng thế bác?"
      },
      {
        "id": "tai_xe_pho_co_ha_noi_005",
        "text": "Phố Hàng Đào đông thế, nhìn đường giúp cháu!"
      },
      {
        "id": "tai_xe_pho_co_ha_noi_006",
        "text": "Tôi chở khách ra hồ, không chở drama nhé!"
      },
      {
        "id": "tai_xe_pho_co_ha_noi_007",
        "text": "Bác cứ đứng đây là tắc cả Hàng Ngang!"
      },
      {
        "id": "tai_xe_pho_co_ha_noi_008",
        "text": "Hà Nội băm sáu phố phường, sao gặp đúng ông?"
      },
      {
        "id": "tai_xe_pho_co_ha_noi_009",
        "text": "Đây là xích lô du lịch, không phải trò trốn tìm!"
      },
      {
        "id": "tai_xe_pho_co_ha_noi_010",
        "text": "Tưởng bác ngắm cảnh, hóa ra bác ngắm bánh xe!"
      },
      {
        "id": "tai_xe_pho_co_ha_noi_011",
        "text": "Ngã tư đông người, bác đứng như tượng!"
      },
      {
        "id": "tai_xe_pho_co_ha_noi_012",
        "text": "Đến đèn xanh rồi bác vẫn chill à?"
      },
      {
        "id": "tai_xe_pho_co_ha_noi_013",
        "text": "Tôi còn phải chở khách qua Tràng Tiền đấy!"
      },
      {
        "id": "tai_xe_pho_co_ha_noi_014",
        "text": "Đi chợ Đồng Xuân hay đi chặn xe thế?"
      },
      {
        "id": "tai_xe_pho_co_ha_noi_015",
        "text": "Xe tôi bé tí mà bác vẫn không thấy?"
      },
      {
        "id": "tai_xe_pho_co_ha_noi_016",
        "text": "Bác đứng thế, cả phố tưởng đang quay phim!"
      },
      {
        "id": "tai_xe_pho_co_ha_noi_017",
        "text": "Ngó xe một tí rồi ngắm Hồ Gươm tiếp nhé!"
      },
      {
        "id": "tai_xe_pho_co_ha_noi_018",
        "text": "Thủ đô nghìn năm, lần đầu gặp pha này!"
      },
      {
        "id": "tai_xe_pho_co_ha_noi_019",
        "text": "Xích lô chậm thế này mà cũng bất ngờ sao?"
      },
      {
        "id": "tai_xe_pho_co_ha_noi_020",
        "text": "Đường ra Bờ Hồ không phải lối đi trong mơ!"
      },
      {
        "id": "tai_xe_pho_co_ha_noi_021",
        "text": "Bác cứ đứng đây thì tôi bán vé thế nào?"
      },
      {
        "id": "tai_xe_pho_co_ha_noi_022",
        "text": "Mời bác qua bên đường, cháu còn chạy show!"
      },
      {
        "id": "tai_xe_pho_co_ha_noi_023",
        "text": "Người Hà Nội thanh lịch, đi đường cũng phải để ý!"
      },
      {
        "id": "tai_xe_pho_co_ha_noi_024",
        "text": "Bác đừng đứng cạnh bánh xe, cháu rén lắm!"
      },
      {
        "id": "tai_xe_pho_co_ha_noi_025",
        "text": "Khách đang chụp phố cổ, bác diễn sâu quá!"
      },
      {
        "id": "tai_xe_pho_co_ha_noi_026",
        "text": "Tôi đi từ Hàng Bạc mà bác vẫn chưa nhường!"
      },
      {
        "id": "tai_xe_pho_co_ha_noi_027",
        "text": "Đứng giữa đường thế này, phố cổ thành phố kẹt!"
      },
      {
        "id": "tai_xe_pho_co_ha_noi_028",
        "text": "Bác ngắm xích lô từ xa có phải đẹp hơn không?"
      },
      {
        "id": "tai_xe_pho_co_ha_noi_029",
        "text": "Cháu còn phải đưa khách về phố đi bộ!"
      },
      {
        "id": "tai_xe_pho_co_ha_noi_030",
        "text": "Lần sau bác nhìn xe, cháu nhìn đường, hòa nhé!"
      }
    ],
    "npc_dap_tra": [
      {
        "id": "npc_dap_tra_001",
        "text": "Ông đâm tôi mà còn hỏi à?!"
      },
      {
        "id": "npc_dap_tra_002",
        "text": "Mắt tôi ở mặt, còn phanh ông ở đâu?"
      },
      {
        "id": "npc_dap_tra_003",
        "text": "Xích lô của ông không có phanh chắc?"
      },
      {
        "id": "npc_dap_tra_004",
        "text": "Đường tôi đang đi, ông tự lao tới cơ mà!"
      },
      {
        "id": "npc_dap_tra_005",
        "text": "Ông xin lỗi trước rồi nói chuyện!"
      },
      {
        "id": "npc_dap_tra_006",
        "text": "Ủa ai mới là người cầm lái?"
      },
      {
        "id": "npc_dap_tra_007",
        "text": "Tôi đi bộ chứ có lái xe đâu!"
      },
      {
        "id": "npc_dap_tra_008",
        "text": "Đổ lỗi hay ghê, có ai tuyển ông không?"
      },
      {
        "id": "npc_dap_tra_009",
        "text": "Mắt tôi nhìn đường, ông nhìn đi đâu?"
      },
      {
        "id": "npc_dap_tra_010",
        "text": "Chạy thế này thì trả khách đi bộ luôn!"
      },
      {
        "id": "npc_dap_tra_011",
        "text": "Tôi có đứng trong túi áo ông đâu!"
      },
      {
        "id": "npc_dap_tra_012",
        "text": "Phanh đi bác tài, đừng phán xét!"
      },
      {
        "id": "npc_dap_tra_013",
        "text": "Dừng xe! Nhặt giúp tôi cái dép!"
      },
      {
        "id": "npc_dap_tra_014",
        "text": "Nói thêm câu nữa tôi gọi tổ dân phố!"
      },
      {
        "id": "npc_dap_tra_015",
        "text": "Xin lỗi một tiếng khó đến thế à?"
      },
      {
        "id": "npc_dap_tra_016",
        "text": "Tôi đang ngắm phố, ông cho ngắm gầm xe!"
      },
      {
        "id": "npc_dap_tra_017",
        "text": "Hài đấy, nhưng tôi không cười!"
      },
      {
        "id": "npc_dap_tra_018",
        "text": "Xích lô thì chậm mà miệng ông nhanh!"
      },
      {
        "id": "npc_dap_tra_019",
        "text": "Tôi đang đi đúng phần đường của tôi!"
      },
      {
        "id": "npc_dap_tra_020",
        "text": "Ông farm aura bằng cách đổ lỗi hả?"
      },
      {
        "id": "npc_dap_tra_021",
        "text": "Bác tài ơi, quay lại nói chuyện đàng hoàng!"
      },
      {
        "id": "npc_dap_tra_022",
        "text": "Ông lái thế này thì khách xuống hết!"
      },
      {
        "id": "npc_dap_tra_023",
        "text": "Tôi không phải nhiệm vụ phụ của ông!"
      },
      {
        "id": "npc_dap_tra_024",
        "text": "Lag là xe ông, không phải tôi nhé!"
      },
      {
        "id": "npc_dap_tra_025",
        "text": "Bác cho tôi xin một lời xin lỗi tử tế!"
      },
      {
        "id": "npc_dap_tra_026",
        "text": "Ông chạy xe mà tưởng đóng hài à?"
      },
      {
        "id": "npc_dap_tra_027",
        "text": "Người ta đang đi bộ bình thường mà!"
      },
      {
        "id": "npc_dap_tra_028",
        "text": "Cứ nhận lỗi đi, bớt làm content!"
      },
      {
        "id": "npc_dap_tra_029",
        "text": "Đừng nói chuyện aura, nói chuyện phanh xe!"
      },
      {
        "id": "npc_dap_tra_030",
        "text": "Lái cẩn thận đi, phố đông lắm!"
      }
    ],
    "khach_ngoi_xe": [
      {
        "id": "khach_ngoi_xe_001",
        "text": "Anh ơi, tôi đặt tour chứ không đặt drama!"
      },
      {
        "id": "khach_ngoi_xe_002",
        "text": "Tôi muốn tới Hồ Gươm, không muốn vào phim hài!"
      },
      {
        "id": "khach_ngoi_xe_003",
        "text": "Đây là xích lô hay tàu lượn thế?"
      },
      {
        "id": "khach_ngoi_xe_004",
        "text": "Anh ơi, chậm một chút cho tôi còn ngắm phố!"
      },
      {
        "id": "khach_ngoi_xe_005",
        "text": "Vé xe có kèm màn cà khịa miễn phí à?"
      },
      {
        "id": "khach_ngoi_xe_006",
        "text": "Tôi xuống đây, phần còn lại đi bộ!"
      },
      {
        "id": "khach_ngoi_xe_007",
        "text": "Anh xin lỗi người ta đi, tôi còn phải về!"
      },
      {
        "id": "khach_ngoi_xe_008",
        "text": "Hướng dẫn viên chưa giới thiệu tiết mục này!"
      },
      {
        "id": "khach_ngoi_xe_009",
        "text": "Tôi tưởng đây là chuyến du lịch chữa lành!"
      },
      {
        "id": "khach_ngoi_xe_010",
        "text": "Phanh xe trước, kể chuyện sau anh nhé!"
      },
      {
        "id": "khach_ngoi_xe_011",
        "text": "Khách đang ngắm phố, anh đang đấu khẩu!"
      },
      {
        "id": "khach_ngoi_xe_012",
        "text": "Trời ơi, trải nghiệm phố cổ dữ dội quá!"
      },
      {
        "id": "khach_ngoi_xe_013",
        "text": "Tôi trả tiền vé chứ không trả tiền xem cãi nhau!"
      },
      {
        "id": "khach_ngoi_xe_014",
        "text": "Cứ từ từ thôi, tôi chưa cần về nhanh!"
      },
      {
        "id": "khach_ngoi_xe_015",
        "text": "Anh tập trung lái xe giúp tôi với!"
      }
    ],
    "nguoi_chung_kien": [
      {
        "id": "nguoi_chung_kien_001",
        "text": "Khoan khoan, tôi đang check VAR!"
      },
      {
        "id": "nguoi_chung_kien_002",
        "text": "Có ai quay lại pha này không?"
      },
      {
        "id": "nguoi_chung_kien_003",
        "text": "Cả hai bình tĩnh, nhặt dép trước!"
      },
      {
        "id": "nguoi_chung_kien_004",
        "text": "Bác tài bớt cà khịa, xin lỗi đi!"
      },
      {
        "id": "nguoi_chung_kien_005",
        "text": "Mới sáng ra đã có drama phố cổ!"
      },
      {
        "id": "nguoi_chung_kien_006",
        "text": "Cho tôi xin lối, mọi người đứng kín đường rồi!"
      },
      {
        "id": "nguoi_chung_kien_007",
        "text": "Anh tài xế mất sạch aura rồi!"
      },
      {
        "id": "nguoi_chung_kien_008",
        "text": "Đường đông, đi chậm thôi các bác!"
      },
      {
        "id": "nguoi_chung_kien_009",
        "text": "Pha này phải tua chậm mới hiểu!"
      },
      {
        "id": "nguoi_chung_kien_010",
        "text": "Có chuyện gì từ từ nói, đừng cãi nhau!"
      },
      {
        "id": "nguoi_chung_kien_011",
        "text": "Một người mất dép, một người mất khách!"
      },
      {
        "id": "nguoi_chung_kien_012",
        "text": "Bác tài ơi, phanh còn không?"
      },
      {
        "id": "nguoi_chung_kien_013",
        "text": "Thôi nào, giúp người ta đứng dậy đi!"
      },
      {
        "id": "nguoi_chung_kien_014",
        "text": "Đừng dựng cả series ở giữa phố!"
      },
      {
        "id": "nguoi_chung_kien_015",
        "text": "Đây là phố đi bộ hay sân khấu hài?"
      }
    ]
  }
};
