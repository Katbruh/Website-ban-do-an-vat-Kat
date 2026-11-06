(function () {
    const form = document.getElementById("order-lookup-form");
    const error = document.getElementById("order-lookup-error");
    const historySection = document.getElementById("purchase-history");

    // Luôn hiển thị phần Lịch sử mua hàng tĩnh đã viết trong orders.html (không bắt đăng nhập)
    if (historySection) {
        historySection.hidden = false;
    }
    if (error) {
        error.hidden = true;
    }

    if (!form) return;

    // Khi bấm "Xem tình trạng đơn", chỉ hiện toast mô phỏng và giữ nguyên danh sách đơn mẫu
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        if (typeof showToast === "function") {
            showToast("Đã tra cứu tình trạng đơn hàng (mô phỏng).");
        } else {
            alert("Đã tra cứu tình trạng đơn hàng (mô phỏng).");
        }
    });
})();