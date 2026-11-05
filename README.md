# Kat — website đặt món ăn vặt

Kat là website nhiều trang cho một quán ăn vặt nhỏ do bốn sinh viên cùng tạo nên. Khách có thể xem món, chọn loại và giá, đặt giao hàng hoặc đến lấy tại quán, rồi theo dõi đơn hàng. Website được xây bằng HTML, CSS và JavaScript thuần, với sự hỗ trợ của AI qua Codex.

## Mở website

Cách nhanh nhất là mở thư mục dự án rồi bấm đúp vào index.html. Chrome sẽ mở trang chủ trực tiếp từ máy tính. Không cần cài Python, thư viện hay chạy bước build.

Nếu muốn mở website qua địa chỉ localhost, mở PowerShell tại thư mục dự án và chạy:

    py -m http.server 8000

Sau đó mở http://localhost:8000. Nếu máy không nhận lệnh py, thử python -m http.server 8000. Dừng máy chủ bằng Ctrl+C.

## Cấu trúc website

Các trang HTML ở thư mục gốc, dùng chung giao diện và các đoạn xử lý JavaScript:

| Trang | Nội dung |
| --- | --- |
| index.html | Trang chủ, ảnh món gợi ý, lời giới thiệu Kat, món bán chạy và liên kết tới các phần chính |
| menu.html | Danh mục, tìm kiếm, lọc khoảng giá, sắp xếp và danh sách món |
| offers.html | Voucher được công khai và các combo ưu đãi |
| stores.html | Địa chỉ và giờ mở cửa của hai cơ sở |
| cart.html | Giỏ hàng, chọn giao hàng hoặc đến lấy, áp dụng voucher và đặt hàng |
| orders.html | Theo dõi đơn và xem các đơn gắn với tài khoản đã đăng nhập |
| feedback.html | Gửi góp ý về món ăn và dịch vụ |
| login.html | Đăng nhập hoặc tạo tài khoản khách bằng số điện thoại |
| admin-login.html, admin.html | Đăng nhập quản trị riêng và dashboard quản lý cửa hàng |

Các tài nguyên dùng chung:

- css/style.css chứa kiểu dáng và bố cục của khu vực khách hàng.
- css/admin.css chứa kiểu dáng của dashboard quản trị.
- js/ chứa xử lý trang chủ, thực đơn, giỏ hàng, đăng nhập, đơn hàng, góp ý và quản trị.
- images/ chứa logo và ảnh món ăn.

## Bố cục và trải nghiệm

- Thanh điều hướng ghim ở đầu màn hình khi cuộn. Logo Kat nằm bên trái và đưa khách về trang chủ; năm liên kết chính nằm giữa; giỏ hàng và tài khoản nằm bên phải.
- Các trang dùng chung một footer để giữ thông tin liên hệ và chi nhánh nhất quán. Trang Thực đơn và Ưu đãi hôm nay không có footer nhằm dành không gian cho món ăn và combo.
- Trang chủ mở đầu bằng ảnh món ăn tràn chiều ngang, không bo góc. Ảnh tự đổi mỗi 5 giây bằng hiệu ứng mờ dần. Khi người dùng chuyển ảnh bằng nút, ảnh trượt; vòng từ ảnh cuối về ảnh đầu dùng hiệu ứng mờ. Nút mũi tên hiện khi di chuột hoặc dùng bàn phím, rồi mờ dần sau 3 giây không tương tác.
- Phần tiếp theo trên trang chủ giới thiệu món bán chạy, dẫn vào thực đơn, kể ngắn về quán Kat và giới thiệu hai cơ sở.
- Thực đơn ưu tiên ảnh và thẻ món gọn. Trên màn hình desktop, lưới hiển thị sáu món mỗi hàng. Những món cùng loại được gom trong một thẻ; bấm thẻ để mở popup, chọn phiên bản, khẩu vị hoặc topping và xem giá trước khi thêm vào giỏ. Ảnh popup đổi theo lựa chọn nếu lựa chọn đó có ảnh riêng.
- Thực đơn nạp thêm món khi khách cuộn xuống, không chia thành trang. Bộ lọc giá gồm dưới 15.000đ, từ 15.000đ đến 30.000đ và trên 30.000đ.
- Ưu đãi tập trung vào voucher công khai và combo. Dashboard quản trị cho phép quản lý món, danh mục, đơn hàng, combo, voucher, đánh giá, góp ý và tài khoản.
- Laptop và Chrome là mục tiêu trình bày chính; giao diện cũng có quy tắc co giãn cho màn hình nhỏ hơn.

## Màu sắc và kiểu chữ

Kat dùng bảng màu sáng dựa trên bảng màu gốc của Maika mà người dùng đã chọn. Màu đỏ rượu vang tạo nhận diện quán ăn và làm nổi các nút hành động; nền trắng giữ ảnh món ăn rõ và dễ nhìn.

| Vai trò | Màu |
| --- | --- |
| Màu thương hiệu, nút chính, trạng thái chọn | #8C2224 |
| Hover của nút chính | #6E1B1C |
| Nền trang và vùng nội dung chính | #FFFFFF |
| Tiêu đề | #111111 |
| Nội dung và điều hướng | #252525 |
| Chữ phụ | #666666 |
| Đường viền và phân cách | #E5E5E5 |
| Điểm nhấn vàng kem | #F1D0A5 |
| Chữ phụ trong footer đỏ | #E0E0E0 |

Website chỉ dùng giao diện sáng. Thanh điều hướng và nút chính dùng đỏ thương hiệu để dễ nhận biết; nền, thẻ và khoảng trắng phân tách nội dung. Font Be Vietnam Pro được dùng xuyên suốt để tiếng Việt dễ đọc và các trang có kiểu chữ thống nhất.

## Hệ thống giao diện

`css/style.css` chứa cả token giao diện dùng chung như màu sắc, kiểu chữ, khoảng cách, bo góc và chuyển động lẫn kiểu dáng website. Dashboard quản trị tải thêm `css/admin.css`. Mọi giá trị cần để dựng giao diện nằm trong mã nguồn website; không cần cài công cụ thiết kế hay chạy bước tạo file trước khi mở trang.

Kat dùng màu đỏ rượu vang `#8C2224`, nền sáng, font Be Vietnam Pro và bố cục thoáng. Các quyết định hình ảnh tham khảo Maika và Popeyes, sau đó được điều chỉnh theo tên Kat và mô hình quán ăn vặt.

## Thêm món và lựa chọn trong quản trị

Trong form món ăn:

- Giá bán hoặc giá thấp nhất là giá của món không có lựa chọn. Nếu món có các lựa chọn với giá riêng, khách sẽ thấy giá tương ứng sau khi chọn.
- Giá gốc là giá tham khảo hiển thị gạch ngang; nhập 0 nếu không áp dụng.
- Mỗi lựa chọn nằm trên một dòng theo mẫu Tên lựa chọn | giá bằng đồng. Ví dụ:

      Mẹt viên chiên nhỏ | 35000
      Mẹt viên chiên lớn | 55000

- Có thể tải ảnh chính cho món và ảnh riêng cho từng lựa chọn. Nếu chưa có ảnh riêng, popup dùng ảnh chính của món.
- Danh mục quản lý riêng trong dashboard. Thêm hoặc gỡ món khỏi danh mục để cập nhật cách khách duyệt thực đơn.

## Chi nhánh

- Cơ sở chính: 273 An Dương Vương, Phường Chợ Quán (Quận 5 cũ), TP. HCM.
- Cơ sở 1: 105 Bà Huyện Thanh Quan, Phường Xuân Hòa (Quận 3 cũ), TP. HCM.
- Cả hai cơ sở mở cửa từ 8:00 đến 18:00.

## Dữ liệu và giới hạn của bản hiện tại

Tài khoản, thực đơn, giỏ hàng, voucher, đánh giá và đơn hàng được lưu trong bộ nhớ cục bộ của trình duyệt. Dữ liệu không tự đồng bộ giữa các thiết bị hoặc trình duyệt. Phiên bản hiện tại chưa có máy chủ, cơ sở dữ liệu dùng chung, xác thực an toàn hay cổng thanh toán thật. Màn hình thanh toán QR chỉ minh họa quy trình và không tạo giao dịch ngân hàng.

Số điện thoại, email và liên kết mạng xã hội trong giao diện là thông tin mẫu.
