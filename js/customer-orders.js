/* ============================================================
   TRA CỨU ĐƠN HÀNG: lịch sử mẫu theo số điện thoại
   ============================================================ */
(function () {
  const form = document.getElementById("order-lookup-form");
  const history = document.getElementById("purchase-history");
  if (!form || !history) return;

  const phoneInput = form.elements.namedItem("phone");
  const samplePhone = "0908345612";

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const enteredPhone = phoneInput.value.replace(/\D/g, "");
    history.hidden = true;

    if (!enteredPhone) {
      showToast("Nhập số điện thoại để tra cứu đơn hàng.", "info");
      return;
    }

    if (enteredPhone !== samplePhone) {
      showToast("Không tìm thấy lịch sử đơn hàng cho số điện thoại này.", "info");
      return;
    }

    history.hidden = false;
  });
})();

/* ============================================================
   CHI TIẾT ĐƠN KHÁCH: ba đơn mẫu theo mã trên URL
   ============================================================ */
(function () {
  if (!document.querySelector("[data-order-items]")) return;

  const orders = {
    "KAT-061126-003": {
      date: "06/11/2026 · 11:05",
      customer: "Nguyễn Thị Lan Anh · 0908 345 612",
      receive: "Giao tận nơi",
      address: "Số 215/42 Nguyễn Trãi, Phường Chợ Quán, Quận 5, TP. Hồ Chí Minh",
      payment: "Tiền mặt khi nhận",
      status: "Chờ xác nhận",
      total: 82000,
      items: [["Mẹt viên chiên nhỏ", 1, 35000], ["Trà sữa truyền thống", 1, 20000], ["Bánh flan cốt dừa", 1, 12000]]
    },
    "KAT-051126-003": {
      date: "05/11/2026 · 17:25",
      customer: "Nguyễn Thị Lan Anh · 0908 345 612",
      receive: "Giao tận nơi",
      address: "Số 84/12 Bình Thới, Phường Bình Thới, Quận 11, TP. Hồ Chí Minh",
      payment: "Tiền mặt khi nhận",
      status: "Hoàn thành",
      total: 52000,
      items: [["Trà sữa truyền thống", 1, 20000], ["Bánh flan cốt dừa", 1, 12000], ["Chè khúc bạch", 1, 20000]]
    },
    "KAT-041126-001": {
      date: "04/11/2026 · 18:12",
      customer: "Nguyễn Thị Lan Anh · 0908 345 612",
      receive: "Giao tận nơi",
      address: "Số 215/42 Nguyễn Trãi, Phường Chợ Quán, Quận 5, TP. Hồ Chí Minh",
      payment: "Tiền mặt khi nhận",
      status: "Hoàn thành",
      total: 77000,
      items: [["Chân gà sả tắc", 1, 45000], ["Nước giải khát", 1, 12000], ["Trà sữa truyền thống", 1, 20000]]
    }
  };

  const params = new URLSearchParams(window.location.search);
  const requestedId = params.get("id");
  const orderId = Object.prototype.hasOwnProperty.call(orders, requestedId) ? requestedId : "KAT-061126-003";
  const order = orders[orderId];
  const statusClasses = {
    "Chờ xác nhận": "status-pending",
    "Hoàn thành": "status-completed"
  };

  function setText(selector, value) {
    const element = document.querySelector(selector);
    if (element) element.textContent = value;
  }

  function money(amount) {
    return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
  }

  setText("[data-order-id]", orderId);
  setText("[data-order-date]", order.date);
  setText("[data-order-customer]", order.customer);
  setText("[data-order-receive]", order.receive);
  setText("[data-order-address]", order.address);
  setText("[data-order-payment]", order.payment);
  document.title = orderId + " · Chi tiết đơn hàng — Kat";

  const status = document.querySelector("[data-order-status]");
  if (status) {
    status.textContent = order.status;
    status.classList.remove("status-pending", "status-completed");
    status.classList.add(statusClasses[order.status] || "status-pending");
  }

  const itemsList = document.querySelector("[data-order-items]");
  let subtotal = 0;
  order.items.forEach(function (item) {
    const lineTotal = item[1] * item[2];
    subtotal += lineTotal;
    const row = document.createElement("li");
    const name = document.createElement("span");
    const price = document.createElement("strong");
    name.textContent = item[0] + " × " + item[1];
    price.textContent = money(lineTotal);
    row.append(name, price);
    itemsList.appendChild(row);
  });

  setText("[data-order-subtotal]", money(subtotal));
  setText("[data-order-delivery]", money(Math.max(0, order.total - subtotal)));
  setText("[data-order-total]", money(order.total));
})();

