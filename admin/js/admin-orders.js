/* ============================================================
   ĐƠN HÀNG ADMIN: danh sách, hiển thị món và chi tiết đơn
   ============================================================ */
(function () {
  "use strict";

  document.querySelectorAll(".order-item-list li > span").forEach(function (item) {
    const match = item.textContent.trim().match(/^(.*?)\s*[×x]\s*(\d+)$/i);
    if (!match) return;
    item.classList.add("order-item-description");
    item.textContent = "";
    const name = document.createElement("span");
    name.className = "order-item-name";
    name.textContent = match[1].trim();
    const quantity = document.createElement("small");
    quantity.className = "order-item-quantity";
    quantity.textContent = "× " + match[2];
    item.append(name, quantity);
  });

  document.querySelectorAll(".admin-order-table tbody tr").forEach(function (row) {
    const idCell = row.querySelector("td:first-child strong");
    const statusSelect = row.querySelector(".admin-order-status-select");
    const detailLink = row.querySelector(".report-order-button");
    if (!idCell || !statusSelect) return;

    const orderId = idCell.textContent.trim();
    if (detailLink) detailLink.href = "order-detail.html?id=KAT-061126-004";

    statusSelect.addEventListener("change", function () {
      if (typeof window.showToast === "function") {
        window.showToast("Đã cập nhật trạng thái đơn " + orderId + ".", "success");
      }
    });
  });
})();

/* ---------- Trang chi tiết đơn hàng ---------- */
(function () {
  "use strict";

  const statuses = ["Chờ xác nhận", "Đang chuẩn bị", "Đang giao", "Hoàn thành"];
  const orders = {
    "KAT-061126-004": { customer: "Nguyễn Văn An", phone: "0912345601", date: "06/11/2026 · 11:20", receive: "Giao tận nơi", address: "Quận 5, TP. Hồ Chí Minh", payment: "Tiền mặt", status: "Hoàn thành", total: 55000, items: [["Mẹt viên chiên nhỏ", 1, 35000], ["Trà sữa truyền thống", 1, 20000]] },
    "KAT-061126-003": { customer: "Nguyễn Thị Lan Anh", phone: "0908 345 612", date: "06/11/2026 · 11:05", receive: "Giao tận nơi", address: "Số 215/42 Nguyễn Trãi, Phường Chợ Quán, Quận 5, TP. Hồ Chí Minh", payment: "Tiền mặt khi nhận", status: "Chờ xác nhận", total: 82000, items: [["Mẹt viên chiên nhỏ", 1, 35000], ["Trà sữa truyền thống", 1, 20000], ["Bánh flan cốt dừa", 1, 12000]] },
    "KAT-061126-002": { customer: "Lê Minh Tâm", phone: "0938765403", date: "06/11/2026 · 10:48", receive: "Giao tận nơi", address: "Quận 3, TP. Hồ Chí Minh", payment: "Tiền mặt", status: "Chờ xác nhận", total: 72000, items: [["Mẹt viên chiên nhỏ", 1, 35000], ["Gà viên lắc phô mai", 1, 25000], ["Nước giải khát", 1, 12000]] },
    "KAT-061126-001": { customer: "Phạm Gia Hân", phone: "0917654304", date: "06/11/2026 · 10:32", receive: "Giao tận nơi", address: "Quận 3, TP. Hồ Chí Minh", payment: "Chuyển khoản QR", status: "Đang giao", total: 52000, items: [["Gà rán truyền thống", 1, 30000], ["Bánh flan cốt dừa", 1, 12000], ["Sữa chua phô mai", 1, 10000]] },
    "KAT-051126-005": { customer: "Võ Khánh Linh", phone: "0988123405", date: "05/11/2026 · 19:10", receive: "Giao tận nơi", address: "Quận 10, TP. Hồ Chí Minh", payment: "Tiền mặt", status: "Hoàn thành", total: 80000, items: [["Chân gà sả tắc", 1, 45000], ["Mẹt viên chiên nhỏ", 1, 35000]] },
    "KAT-051126-004": { customer: "Nguyễn Văn An", phone: "0912345601", date: "05/11/2026 · 18:42", receive: "Lấy tại quán", address: "Cơ sở chính · Quận 5", payment: "Chuyển khoản QR", status: "Hoàn thành", total: 75000, items: [["Mẹt viên chiên lớn", 1, 55000], ["Trà đào cam sả", 1, 20000]] },
    "KAT-051126-003": { customer: "Nguyễn Thị Lan Anh", phone: "0908 345 612", date: "05/11/2026 · 17:25", receive: "Giao tận nơi", address: "Số 84/12 Bình Thới, Phường Bình Thới, Quận 11, TP. Hồ Chí Minh", payment: "Tiền mặt khi nhận", status: "Hoàn thành", total: 52000, items: [["Trà sữa truyền thống", 1, 20000], ["Bánh flan cốt dừa", 1, 12000], ["Chè khúc bạch", 1, 20000]] },
    "KAT-051126-002": { customer: "Lê Minh Tâm", phone: "0938765403", date: "05/11/2026 · 16:15", receive: "Lấy tại quán", address: "Cơ sở chính · Quận 3", payment: "Chuyển khoản QR", status: "Hoàn thành", total: 72000, items: [["Gà rán truyền thống", 1, 30000], ["Nem chua rán", 1, 30000], ["Coca Cola vị nguyên bản", 1, 12000]] },
    "KAT-051126-001": { customer: "Phạm Gia Hân", phone: "0917654304", date: "05/11/2026 · 15:34", receive: "Giao tận nơi", address: "Quận 3, TP. Hồ Chí Minh", payment: "Chuyển khoản QR", status: "Hoàn thành", total: 50000, items: [["Trà sữa truyền thống", 1, 20000], ["Chè khúc bạch", 1, 20000], ["Sữa chua phô mai", 1, 10000]] },
    "KAT-041126-003": { customer: "Võ Khánh Linh", phone: "0988123405", date: "04/11/2026 · 20:05", receive: "Giao tận nơi", address: "Quận 10, TP. Hồ Chí Minh", payment: "Tiền mặt", status: "Hoàn thành", total: 45000, items: [["Mì trộn tóp mỡ lòng đào", 1, 25000], ["Trà đào cam sả", 1, 20000]] },
    "KAT-041126-002": { customer: "Nguyễn Văn An", phone: "0912345601", date: "04/11/2026 · 19:30", receive: "Giao tận nơi", address: "Quận 5, TP. Hồ Chí Minh", payment: "Tiền mặt", status: "Hoàn thành", total: 72000, items: [["Phá lấu tai heo kèm bánh mì", 1, 35000], ["Bánh tráng trộn", 1, 25000], ["Pepsi vị nguyên bản", 1, 12000]] },
    "KAT-041126-001": { customer: "Nguyễn Thị Lan Anh", phone: "0908 345 612", date: "04/11/2026 · 18:12", receive: "Giao tận nơi", address: "Số 215/42 Nguyễn Trãi, Phường Chợ Quán, Quận 5, TP. Hồ Chí Minh", payment: "Tiền mặt khi nhận", status: "Hoàn thành", total: 77000, items: [["Chân gà sả tắc", 1, 45000], ["Nước giải khát", 1, 12000], ["Trà sữa truyền thống", 1, 20000]] }
  };

  const params = new URLSearchParams(window.location.search);
  const requestedId = params.get("id") || "KAT-061126-004";
  const orderId = Object.prototype.hasOwnProperty.call(orders, requestedId) ? requestedId : "KAT-061126-004";
  const order = orders[orderId];
  const statusSelect = document.querySelector("[data-order-status]");
  const saveButton = document.querySelector("[data-order-status-save]");
  if (!statusSelect || !saveButton) return;

  const moneyLabels = {
    0: "0đ",
    10000: "10.000đ",
    12000: "12.000đ",
    15000: "15.000đ",
    20000: "20.000đ",
    25000: "25.000đ",
    30000: "30.000đ",
    32000: "32.000đ",
    35000: "35.000đ",
    40000: "40.000đ",
    45000: "45.000đ",
    50000: "50.000đ",
    52000: "52.000đ",
    55000: "55.000đ",
    58000: "58.000đ",
    67000: "67.000đ",
    72000: "72.000đ",
    75000: "75.000đ",
    77000: "77.000đ",
    78000: "78.000đ",
    80000: "80.000đ",
    82000: "82.000đ"
  };

  function formatMoney(amount) {
    return moneyLabels[amount] || String(amount) + "đ";
  }

  function setText(selector, value) {
    const element = document.querySelector(selector);
    if (element) element.textContent = value;
  }

  setText("[data-order-id]", orderId);
  setText("[data-order-date]", order.date);
  setText("[data-order-customer]", "Đơn hàng của " + order.customer);
  setText("[data-order-recipient]", order.customer);
  setText("[data-order-phone]", order.phone);
  setText("[data-order-receive]", order.receive);
  setText("[data-order-address]", order.address);
  setText("[data-order-payment]", order.payment);

  const itemsBody = document.querySelector("[data-order-items]");
  let subtotal = 0;
  if (itemsBody) {
    order.items.forEach(function (item) {
      const row = document.createElement("tr");
      const name = document.createElement("td");
      const quantity = document.createElement("td");
      const amount = document.createElement("td");
      name.textContent = item[0];
      quantity.textContent = String(item[1]);
      amount.textContent = formatMoney(item[2] * item[1]);
      subtotal += item[2] * item[1];
      row.append(name, quantity, amount);
      itemsBody.appendChild(row);
    });
  }

  setText("[data-order-subtotal]", formatMoney(subtotal));
  setText("[data-order-delivery]", formatMoney(Math.max(0, order.total - subtotal)));
  setText("[data-order-total]", formatMoney(order.total));
  document.title = orderId + " · Chi tiết đơn hàng";

  statuses.forEach(function (status) {
    const option = document.createElement("option");
    option.value = status;
    option.textContent = status;
    statusSelect.appendChild(option);
  });

  statusSelect.value = statuses.includes(order.status) ? order.status : "Hoàn thành";

  saveButton.addEventListener("click", function () {
    if (typeof window.showToast === "function") {
      window.showToast("Đã cập nhật trạng thái đơn " + orderId + ".", "success");
    }
  });
})();
