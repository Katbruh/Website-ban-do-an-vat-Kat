# Kat — website đặt món ăn vặt

Website nhiều trang cho quán ăn vặt Kat, xây dựng bằng HTML, CSS và JavaScript thuần. Đây là bản demo giao diện và luồng thao tác, chưa kết nối máy chủ, cơ sở dữ liệu hay cổng thanh toán.

## Mở website

Mở `index.html` trực tiếp trong trình duyệt, hoặc chạy máy chủ tĩnh tại thư mục dự án:

```powershell
py -m http.server 8000
```

Sau đó truy cập `http://localhost:8000`.

## Các trang khách hàng

| Trang | Nội dung |
| --- | --- |
| `index.html` | Trang chủ, carousel tự chuyển mỗi 5 giây, nút chuyển slide và món bán chạy |
| `menu.html` | 12 thẻ món tĩnh; nút danh mục chỉ đổi trạng thái chọn; nút tìm kiếm mở trang kết quả |
| `menu-results.html` | Kết quả mẫu hardcode cho danh mục Gà rán & đồ chiên và mức giá trên 30.000đ; không thực hiện lọc thật |
| `product-detail.html` | Trang chi tiết mẫu của Mẹt viên chiên, tùy chọn món và đánh giá |
| `offers.html` | Ba voucher mẫu |
| `cart.html`, `order-success.html` | Giỏ hàng mẫu, thông tin nhận món và trang xác nhận đặt hàng |
| `orders.html`, `order-detail.html` | Tra cứu bằng số điện thoại mẫu, lịch sử ba đơn và chi tiết đơn khách hàng |
| `account-settings.html`, `account-addresses.html`, `account-orders.html` | Cài đặt tài khoản, sổ địa chỉ và lịch sử đơn hàng |
| `login.html`, `forgot-password.html`, `reset-password.html` | Đăng nhập/đăng ký và luồng đổi mật khẩu mô phỏng |
| `stores.html`, `feedback.html` | Thông tin cửa hàng và góp ý |

## Khu vực quản trị

Mở `admin/admin-login.html` để vào luồng quản trị. Các trang quản trị nằm trong `admin/`, gồm dashboard, khách hàng, đơn hàng, thực đơn, danh mục, voucher, đánh giá và góp ý. Trang chi tiết đơn hàng và khách hàng có tệp HTML riêng; các biểu mẫu thêm/sửa cũng dùng trang riêng.

## Tổ chức mã nguồn

- `css/` chứa CSS giao diện khách hàng; `css/style.css` nạp các tệp CSS theo từng nhóm trang.
- `admin/css/` chứa CSS quản trị; `admin/css/admin.css` nạp các tệp CSS quản trị theo chức năng.
- `js/` chứa JavaScript dùng chung và các luồng khách hàng.
- `admin/js/` chứa JavaScript riêng của các trang quản trị.
- `images/` chứa logo và ảnh minh họa món ăn.

## Giới hạn của bản demo

- Các món, voucher, khách hàng và đơn hàng là dữ liệu mẫu viết sẵn. Trang kết quả thực đơn không đọc từ khóa hay bộ lọc để tạo kết quả.
- Các thao tác thêm/sửa/xóa và ẩn/hiện trong admin chỉ minh họa bằng thông báo; không cập nhật dữ liệu và không đồng bộ với thực đơn khách hàng.
- Đăng nhập không xác thực tài khoản thật. Luồng quên mật khẩu không gửi SMS; OTP và đổi mật khẩu chỉ mô phỏng.
- Đặt hàng không tạo giao dịch thật; các trang xác nhận, tra cứu và lịch sử đơn dùng dữ liệu mẫu.
