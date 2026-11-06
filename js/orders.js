(function () {
  const form = document.getElementById("order-lookup-form");
  const result = document.getElementById("order-result");
  const error = document.getElementById("order-lookup-error");
  const historySection = document.getElementById("purchase-history");
  const historyList = document.getElementById("purchase-history-list");
  const demoOrders = [
    { orderId: "KAT-DEMO-2401", customerName: "Nguyễn Minh Anh", customerPhone: "0901 234 567", orderType: "delivery", shippingAddress: "273 An Dương Vương, Quận 5, TP. HCM", paymentMethod: "cash", status: "shipping", createdAt: "12/06/2026, 11:30", finalAmount: 85000, items: [{ name: "Bánh tráng trộn", quantity: 2, unitPrice: 25000 }, { name: "Trà đào cam sả", quantity: 1, unitPrice: 35000 }] },
    { orderId: "KAT-DEMO-2402", customerName: "Trần Hoàng Nam", customerPhone: "0987 654 321", orderType: "pickup", pickupBranch: { name: "Cơ sở chính", address: "273 An Dương Vương, Quận 5, TP. HCM" }, paymentMethod: "qr", status: "completed", createdAt: "10/06/2026, 16:45", finalAmount: 75000, items: [{ name: "Gà rán", quantity: 1, unitPrice: 30000 }, { name: "Khoai tây lắc phô mai", quantity: 1, unitPrice: 18000 }, { name: "Chân gà sả tắc", quantity: 1, unitPrice: 27000 }] },
    { orderId: "KAT-DEMO-2403", customerName: "Lê Ngọc Hà", customerPhone: "0912 345 678", orderType: "delivery", shippingAddress: "105 Bà Huyện Thanh Quan, Quận 3, TP. HCM", paymentMethod: "cash", status: "preparing", createdAt: "13/06/2026, 09:15", finalAmount: 60000, items: [{ name: "Mẹt viên chiên", quantity: 1, unitPrice: 35000 }, { name: "Trà sữa truyền thống", quantity: 1, unitPrice: 25000 }] }
  ];
  const statusLabels = { pending: "Chờ xác nhận", preparing: "Đang chuẩn bị", shipping: "Đang giao", completed: "Hoàn thành", cancelled: "Đã hủy" };
  const progress = ["pending", "preparing", "shipping", "completed"];

  function digits(value) { return String(value || "").replace(/\D/g, ""); }

  function statusText(order) {
    if (order.status === "shipping" && order.orderType === "pickup") return "Sẵn sàng nhận tại quán";
    return statusLabels[order.status] || "Đang cập nhật";
  }

  function allOrders() {
    const storedOrders = readStore("orders") || [];
    const storedIds = storedOrders.map(function (order) { return String(order.orderId); });
    return demoOrders.filter(function (order) { return storedIds.indexOf(order.orderId) === -1; }).concat(storedOrders);
  }

  function render(order) {
    const items = (order.items || []).map(function (item) {
      const options = [item.selectedOptions, (item.selectedToppings || []).map(function (topping) { return topping.name; }).join(", ")].filter(Boolean).join(" · ");
      return '<li><div><strong>' + escapeHTML(item.name) + ' <span>× ' + Number(item.quantity) + '</span></strong>' + (options ? '<small>' + escapeHTML(options) + '</small>' : "") + '</div><strong>' + formatCurrency(Number(item.unitPrice || item.basePrice || 0) * Number(item.quantity || 0)) + '</strong></li>';
    }).join("");
    const current = progress.indexOf(order.status);
    const timeline = order.status === "cancelled" ? '<p class="order-cancelled">Đơn hàng đã được hủy. Nếu bạn cần hỗ trợ, hãy liên hệ Kat.</p>' : '<ol class="order-timeline">' + progress.map(function (status, index) {
      const state = index < current ? "is-done" : (index === current ? "is-current" : "");
      let label = statusLabels[status];
      if (status === "shipping" && order.orderType === "pickup") label = "Sẵn sàng nhận";
      return '<li class="' + state + '"><span class="timeline-dot" aria-hidden="true"></span><span>' + label + '</span></li>';
    }).join("") + '</ol>';
    const destination = order.orderType === "pickup" ? ((order.pickupBranch && order.pickupBranch.address) || "Lấy tại chi nhánh Kat đã chọn") : order.shippingAddress;
    return '<article class="order-result-card"><div class="order-result-heading"><div><p class="eyebrow">Mã đơn</p><h2>' + escapeHTML(order.orderId) + '</h2><p class="helper-text">Đặt lúc ' + escapeHTML(order.createdAt) + '</p></div><span class="status-badge status-' + escapeHTML(order.status) + '">' + escapeHTML(statusText(order)) + '</span></div>' + timeline + '<div class="order-result-meta"><div><span>Người nhận</span><strong>' + escapeHTML(order.customerName) + ' · ' + escapeHTML(order.customerPhone) + '</strong></div><div><span>Hình thức</span><strong>' + (order.orderType === "pickup" ? "Đến lấy tại quán" : "Giao tận nơi") + '</strong></div><div><span>Địa điểm</span><strong>' + escapeHTML(destination || "Chưa có địa chỉ") + '</strong></div><div><span>Thanh toán</span><strong>' + (order.paymentMethod === "qr" ? "Chuyển khoản qua QR" : "Tiền mặt khi nhận") + '</strong></div></div><div class="order-result-items"><h3>Món đã đặt</h3><ul>' + items + '</ul><div class="order-result-total"><span>Tổng thanh toán</span><strong>' + formatCurrency(order.finalAmount) + '</strong></div></div></article>';
  }

  function renderPurchaseHistory() {
    if (!historySection || !historyList) return;
    historySection.hidden = false;
    const orders = allOrders().filter(function (order) { return !order.userId || (currentUser && order.userId === currentUser.id); });
    historyList.innerHTML = orders.length ? orders.map(function (order) {
      const items = (order.items || []).map(function (item) { return '<li><span>' + escapeHTML(item.name) + ' × ' + Number(item.quantity) + '</span><strong>' + formatCurrency(Number(item.unitPrice || item.basePrice || 0) * Number(item.quantity || 0)) + '</strong></li>'; }).join("");
      const destination = order.orderType === "pickup" ? ((order.pickupBranch && order.pickupBranch.name) || "Lấy tại quán") : (order.shippingAddress || "Địa chỉ giao hàng");
      const detailsUrl = "order-detail.html?order=" + encodeURIComponent(order.orderId);
      return '<article class="purchase-order-card"><div class="purchase-order-heading"><div><p class="eyebrow">Đơn hàng</p><h3>' + escapeHTML(order.orderId) + '</h3><p class="helper-text">Đặt lúc ' + escapeHTML(order.createdAt) + '</p></div><span class="status-badge status-' + escapeHTML(order.status) + '">' + escapeHTML(statusText(order)) + '</span></div><ul class="purchase-order-items">' + items + '</ul><div class="purchase-order-summary"><span>' + escapeHTML(destination) + '</span><strong>' + formatCurrency(order.finalAmount) + '</strong></div><a class="button button-secondary" href="' + detailsUrl + '">Xem chi tiết đơn hàng</a></article>';
    }).join("") : '<div class="purchase-order-empty">Bạn chưa có đơn hàng nào.</div>';
  }

  function showOrders(orders) {
    if (!result) return;
    if (error) error.hidden = orders.length > 0;
    result.hidden = orders.length === 0;
    result.innerHTML = orders.map(render).join("");
  }

  if (form) form.addEventListener("submit", function (event) {
    event.preventDefault();
    const phone = digits(new FormData(form).get("phone"));
    showOrders(allOrders().filter(function (item) { return digits(item.customerPhone) === phone; }));
  });

  renderPurchaseHistory();
  const query = new URLSearchParams(location.search);
  if (form && query.has("phone")) {
    form.elements.phone.value = query.get("phone");
    form.requestSubmit();
  }
  if (result && query.has("order")) {
    const orderId = query.get("order");
    const order = allOrders().find(function (item) { return String(item.orderId).toUpperCase() === String(orderId).toUpperCase(); });
    showOrders(order ? [order] : []);
  }
})();
