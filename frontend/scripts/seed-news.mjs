import axios from "axios";

const API = "http://localhost:8080/api/v1";

const NEWS = [
  {
    title: "Khai trương hồng phát NEOCAFÉ",
    summary: "Tuần lễ khai trương giảm 20% toàn menu đồ uống.",
    content:
      "NEOCAFÉ chính thức chào đón khách hàng với tuần lễ khai trương đặc biệt. Giảm 20% cho mọi đồ uống từ thứ Hai đến Chủ Nhật. Hãy ghé quán để trải nghiệm không gian mới và hương vị cà phê đặc trưng của chúng tôi.",
  },
  {
    title: "Ra mắt Trà đào cam sả mùa hè",
    summary: "Thức uống giải nhiệt mới, vị chua ngọt dịu nhẹ.",
    content:
      "Trà đào cam sả là lựa chọn hoàn hảo cho những buổi chiều nóng. Được pha từ trà đen, đào tươi, cam và sả thơm. Thử ngay tại NEOCAFÉ và cảm nhận sự sảng khoái từng ngụm.",
  },
  {
    title: "Workshop pha chế cuối tuần",
    summary: "Học pha latte art cơ bản cùng barista của quán.",
    content:
      "Cuối tuần này, NEOCAFÉ tổ chức workshop pha chế dành cho khách yêu cà phê. Bạn sẽ được hướng dẫn kéo sữa, tạo hình trái tim và hoa tulip đơn giản. Số lượng có hạn — đăng ký tại quầy.",
  },
  {
    title: "Happy Hour 14h–16h mỗi ngày",
    summary: "Giảm 15% cho đơn mang đi trong khung giờ vàng.",
    content:
      "Từ 14h đến 16h hằng ngày, khách mang đi được giảm 15% trên tổng hóa đơn đồ uống. Áp dụng tại quầy và khi gọi món qua ứng dụng Smart Cafe. Không áp dụng đồng thời với voucher khác.",
  },
  {
    title: "Không gian làm việc yên tĩnh",
    summary: "Wifi mạnh, ổ cắm đầy đủ, đồ uống refill buổi sáng.",
    content:
      "NEOCAFÉ dành khu vực yên tĩnh cho khách làm việc và học tập. Wifi tốc độ cao, nhiều ổ sạc và menu đồ uống phù hợp làm việc dài. Đến sớm để chọn chỗ ngồi ưng ý nhất.",
  },
];

async function main() {
  const login = await axios.post(`${API}/auth/login`, {
    username: "admin",
    password: "123456",
  });
  const token = login.data.token;
  console.log("LOGIN_OK", login.data.roleName);

  for (const n of NEWS) {
    const form = new FormData();
    form.append("title", n.title);
    form.append("summary", n.summary);
    form.append("content", n.content);
    try {
      const res = await axios.post(`${API}/news`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("CREATED", res.data.newsId, res.data.status, res.data.title);
    } catch (err) {
      console.error(
        "FAIL",
        n.title,
        err.response?.data || err.message
      );
    }
  }

  const list = await axios.get(`${API}/news`, { params: { page: 0, size: 20 } });
  console.log("PUBLIC_COUNT", list.data.totalElements);
  for (const item of list.data.content || []) {
    console.log("-", item.newsId, item.title);
  }
}

main().catch((err) => {
  console.error("ERR", err.response?.data || err.message);
  process.exit(1);
});
