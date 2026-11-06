# Kat — website đặt món ăn vặt

Website nhiều trang cho quán ăn vặt Kat, viết bằng HTML, CSS và JavaScript thuần. Các trang hiện dùng nội dung tĩnh để minh họa luồng xem món, đặt hàng và quản trị; website chưa kết nối máy chủ hay cơ sở dữ liệu.

## Mở website

Mở `index.html` trực tiếp trong trình duyệt, hoặc chạy máy chủ tĩnh tại thư mục dự án:

```powershell
py -m http.server 8000
```

Sau đó truy cập `http://localhost:8000`.

## Các trang

| Trang | Nội dung |
| --- | --- |
| `index.html` | Trang chủ, carousel chuyển thủ công, bốn món bán chạy và thông tin cửa hàng |
| `menu.html` | Danh mục, form tìm kiếm và lọc, 12 thẻ món tĩnh, phân trang minh họa |
| `product-detail.html` | Chi tiết tĩnh món Mẹt viên chiên, lựa chọn món và đánh giá |
| `offers.html` | Voucher và combo |
| `cart.html` | Giỏ hàng, thông tin giao nhận và hình thức thanh toán tĩnh |
| `order-success.html` | Trang xác nhận đơn hàng |
| `orders.html` | Tra cứu và ba đơn hàng tĩnh |
| `stores.html`, `feedback.html` | Thông tin cửa hàng và form góp ý |
| `login.html`, `admin-login.html` | Form đăng nhập và đăng ký minh họa |
| `admin.html`, `admin-*.html` | Dashboard và các trang quản trị riêng |

`css/style.css` chứa giao diện khách hàng; `css/admin.css` chứa giao diện quản trị. Thư mục `images/` lưu logo và ảnh món ăn, còn `js/` xử lý tương tác đơn giản như chuyển tab, thông báo, carousel thủ công và điều hướng giữa các trang.

## Giới hạn hiện tại

Nội dung, giỏ hàng và đơn hàng được viết sẵn trong HTML. Các form và nút minh họa chỉ hiện thông báo hoặc chuyển trang theo luồng đã định; đăng nhập không xác thực, đặt hàng không tạo giao dịch và thay đổi không được lưu lại. Muốn vận hành thực tế cần bổ sung máy chủ, cơ sở dữ liệu và tích hợp thanh toán.
