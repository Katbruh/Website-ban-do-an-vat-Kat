(function () {
  const form = document.getElementById("order-lookup-form");
  if (!form) return;
  const result = document.getElementById("order-result");
  const error = document.getElementById("order-lookup-error");
  const historySection = document.getElementById("purchase-history");
  const historyList = document.getElementById("purchase-history-list");
  const statusLabels = { pending: "Chờ xác nhận", preparing: "Đang chuẩn bị", shipping: "Đang giao", completed: "Hoàn thành", cancelled: "Đã hủy" };
  const progress = ["pending", "preparing", "shipping", "completed"];

  function digits(value) { return String(value || "").replace(/\D/g, ""); }

  function statusText(order) {
    if (order.status === "shipping" && order.orderType === "pickup") return "Sẵn sàng nhận tại quán";
    return statusLabels[order.status] || "Đang cập nhật";
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
    if (!currentUser) {
      historyList.innerHTML = '<div class="purchase-order-empty">Đăng nhập để xem các đơn hàng của bạn. <a class="text-link" href="login.html?returnTo=orders.html">Đăng nhập</a></div>';
      return;
    }
    const orders = (readStore("orders") || []).filter(function (order) { return order.userId === currentUser.id; });
    historyList.innerHTML = orders.length ? orders.map(function (order) {
      const items = (order.items || []).map(function (item) { return '<li><span>' + escapeHTML(item.name) + ' × ' + Number(item.quantity) + '</span><strong>' + formatCurrency(Number(item.unitPrice || item.basePrice || 0) * Number(item.quantity || 0)) + '</strong></li>'; }).join("");
      const destination = order.orderType === "pickup" ? ((order.pickupBranch && order.pickupBranch.name) || "Lấy tại quán") : (order.shippingAddress || "Địa chỉ giao hàng");
      const detailsUrl = "orders.html?phone=" + encodeURIComponent(order.customerPhone || "");
      return '<article class="purchase-order-card"><div class="purchase-order-heading"><div><p class="eyebrow">Đơn hàng</p><h3>' + escapeHTML(order.orderId) + '</h3><p class="helper-text">Đặt lúc ' + escapeHTML(order.createdAt) + '</p></div><span class="status-badge status-' + escapeHTML(order.status) + '">' + escapeHTML(statusText(order)) + '</span></div><ul class="purchase-order-items">' + items + '</ul><div class="purchase-order-summary"><span>' + escapeHTML(destination) + '</span><strong>' + formatCurrency(order.finalAmount) + '</strong></div><a class="text-link" href="' + detailsUrl + '">Xem chi tiết đơn hàng →</a></article>';
    }).join("") : '<div class="purchase-order-empty">Bạn chưa có đơn hàng nào.</div>';
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const data = new FormData(form);
    const phone = digits(data.get("phone"));
    const linkedOrderId = new URLSearchParams(location.search).get("order");
    const matchingOrders = (readStore("orders") || []).filter(function (item) { return digits(item.customerPhone) === phone; });
    const orders = linkedOrderId ? matchingOrders.filter(function (item) { return String(item.orderId).toUpperCase() === linkedOrderId.toUpperCase(); }) : matchingOrders;
    error.hidden = orders.length > 0;
    result.hidden = orders.length === 0;
    result.innerHTML = orders.map(render).join("");
    if (linkedOrderId) history.replaceState(null, "", "orders.html?phone=" + encodeURIComponent(form.elements.phone.value));
  });

  renderPurchaseHistory();
  const query = new URLSearchParams(location.search);
  if (query.has("phone")) {
    form.elements.phone.value = query.get("phone");
    form.requestSubmit();
  }
})();
