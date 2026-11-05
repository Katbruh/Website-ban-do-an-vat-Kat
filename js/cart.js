(function () {
  const list = document.getElementById("cart-items");
  const form = document.getElementById("checkout-form");
  if (!list || !form) return;
  const fee = 15000;
  let activeVoucher = null;
  let pendingOrder = null;
  const modal = document.getElementById("checkout-modal");
  const modalContent = document.getElementById("checkout-modal-content");
  const stores = window.KAT_STORES || [];
  const addressChoice = document.getElementById("saved-address-choice");
  const placeOrderButton = document.getElementById("place-order");
  const checkoutLoginButton = document.getElementById("checkout-login-button");
  const checkoutHelp = document.getElementById("checkout-help");

  function cartItems() { return readStore("cart") || []; }
  function subtotal() { return cartItems().reduce(function (sum, item) { return sum + Number(item.unitPrice || item.basePrice || 0) * Number(item.quantity || 0); }, 0); }
  function shippingFee() { return document.querySelector('input[name="orderType"]:checked').value === "delivery" ? fee : 0; }
  function normalizedPhone(phone) { return String(phone || "").replace(/\D/g, ""); }
  function voucherAlreadyUsed(voucher, phone, userId) {
    const code = typeof voucher === "string" ? voucher : voucher && voucher.code;
    const candidateId = userId || (currentUser && currentUser.id) || "";
    const identityId = candidateId === "USR_GUEST" ? "" : candidateId;
    const identityPhone = normalizedPhone(phone || form.elements.customerPhone.value || (currentUser && currentUser.phone));
    if (!code) return false;
    return (readStore("orders") || []).some(function (order) {
      if (String(order.voucherCode || "").toUpperCase() !== String(code).toUpperCase()) return false;
      const sameAccount = identityId && order.userId === identityId;
      const samePhone = identityPhone && normalizedPhone(order.customerPhone) === identityPhone;
      return Boolean(sameAccount || samePhone);
    });
  }
  function voucherUsedMessage() { return "Mỗi khách chỉ được dùng voucher này một lần; số điện thoại hoặc tài khoản này đã dùng mã."; }
  function discountValue(voucher, sum, shipping) {
    if (!voucher || !voucher.isActive || sum < Number(voucher.minOrder || 0)) return 0;
    if (voucher.type === "shipping") return Math.min(Number(voucher.value) || Number.MAX_SAFE_INTEGER, Number(shipping) || 0);
    return voucher.type === "percent" ? Math.min(Math.round(sum * Number(voucher.value) / 100), Number(voucher.maxDiscount || Number.MAX_SAFE_INTEGER)) : Math.min(Number(voucher.value), sum);
  }
  function validVoucher() {
    if (!activeVoucher) return;
    if (voucherAlreadyUsed(activeVoucher)) {
      const code = activeVoucher.code; activeVoucher = null; document.getElementById("voucher-code").value = "";
      setVoucherFeedback("Đã gỡ mã " + code + ". " + voucherUsedMessage(), "error");
      return;
    }
    if (subtotal() < Number(activeVoucher.minOrder || 0)) {
      const code = activeVoucher.code; activeVoucher = null; document.getElementById("voucher-code").value = "";
      setVoucherFeedback("Đã gỡ mã " + code + " vì tạm tính thấp hơn mức tối thiểu.", "error");
    }
  }
  function setVoucherFeedback(message, state) {
    const feedback = document.getElementById("voucher-feedback");
    feedback.textContent = message; feedback.className = "voucher-feedback" + (state ? " is-" + state : "");
  }
  function renderCart() {
    validVoucher();
    const items = cartItems();
    const hasItems = items.length > 0;
    const availableVoucherButton = document.getElementById("show-vouchers");
    if (availableVoucherButton) availableVoucherButton.hidden = !(readStore("vouchers") || []).some(function (voucher) { return voucher.isActive; });
    document.getElementById("cart-empty").hidden = hasItems;
    document.getElementById("cart-layout").hidden = !hasItems;
    const addMoreLink = document.getElementById("cart-add-more-link");
    if (addMoreLink) addMoreLink.hidden = !hasItems;
    document.getElementById("cart-title-count").textContent = "(" + items.reduce(function (sum, item) { return sum + item.quantity; }, 0) + ")";
    document.getElementById("cart-item-count").textContent = items.length + (items.length === 1 ? " món" : " món");
    list.innerHTML = items.map(function (item) {
      const optionText = [item.selectedOptions, (item.selectedToppings || []).map(function (topping) { return topping.name; }).join(", ")].filter(Boolean).join(" · ");
      return '<article class="cart-item" data-cart-item="' + escapeHTML(item.cartItemId) + '"><img src="' + escapeHTML(item.image || "") + '" alt="' + escapeHTML(item.name) + '" loading="lazy"><div><h3>' + escapeHTML(item.name) + '</h3><p class="cart-item-options">' + escapeHTML(optionText || "Món tiêu chuẩn") + '</p><div class="cart-item-actions"><div class="quantity-control" aria-label="Số lượng ' + escapeHTML(item.name) + '"><button type="button" data-quantity="minus" aria-label="Giảm số lượng">−</button><span>' + Number(item.quantity) + '</span><button type="button" data-quantity="plus" aria-label="Tăng số lượng">+</button></div><button class="remove-item" type="button" data-remove-item>Xóa</button></div></div><strong class="cart-item-price">' + formatCurrency(Number(item.unitPrice || item.basePrice) * Number(item.quantity)) + '</strong></article>';
    }).join("");
    const sum = subtotal();
    const ship = shippingFee();
    const discount = discountValue(activeVoucher, sum, ship);
    document.getElementById("summary-subtotal").textContent = formatCurrency(sum);
    document.getElementById("summary-discount").textContent = "−" + formatCurrency(discount);
    document.getElementById("summary-shipping").textContent = ship ? formatCurrency(ship) : "Miễn phí";
    document.getElementById("summary-total").textContent = formatCurrency(Math.max(0, sum - discount + ship));
    renderPickupBranch();
    updateCartBadges();
  }

  function renderPickupBranch() {
    const select = document.getElementById("pickup-branch-select");
    const address = document.getElementById("pickup-branch-address");
    if (!select || !stores.length) return;
    const selected = select.value || sessionValue("katPickupBranch") || sessionValue("maikaPickupBranch") || stores[0].id;
    select.innerHTML = stores.map(function (store) { return '<option value="' + escapeHTML(store.id) + '">' + escapeHTML(store.name) + '</option>'; }).join("");
    select.value = stores.some(function (store) { return store.id === selected; }) ? selected : stores[0].id;
    const store = stores.find(function (item) { return item.id === select.value; }) || stores[0];
    address.textContent = store.address + " · Mỗi ngày " + store.hours;
    sessionWrite("katPickupBranch", store.id);
  }

  function sessionValue(key) { try { return window.sessionStorage.getItem(key) || ""; } catch (error) { return ""; } }
  function sessionWrite(key, value) { try { window.sessionStorage.setItem(key, value); } catch (error) { /* Session preferences are optional. */ } }

  function updateOrderType() {
    const pickup = document.querySelector('input[name="orderType"]:checked').value === "pickup";
    if (pickup && activeVoucher && activeVoucher.type === "shipping") {
      const code = activeVoucher.code; activeVoucher = null; document.getElementById("voucher-code").value = "";
      setVoucherFeedback("Đã gỡ mã " + code + " vì mã này chỉ dùng cho đơn giao hàng.", "info");
    }
    const address = form.elements.shippingAddress;
    const useSavedAddress = !pickup && addressChoice && currentUser && currentUser.address && form.elements.addressChoice.value === "saved";
    address.required = !pickup && !useSavedAddress;
    document.getElementById("address-field").hidden = pickup || useSavedAddress;
    if (addressChoice) addressChoice.hidden = pickup || !currentUser || !currentUser.address;
    document.getElementById("pickup-address").hidden = !pickup;
    if (pickup) renderPickupBranch();
    renderCart();
  }

  function applyVoucher(code) {
    const normalized = String(code || "").trim().toUpperCase();
    const voucher = (readStore("vouchers") || []).find(function (item) { return item.code.toUpperCase() === normalized && item.isActive; });
    if (!voucher) { activeVoucher = null; setVoucherFeedback("Mã không hợp lệ hoặc đã ngừng hoạt động.", "error"); renderCart(); return false; }
    if (voucherAlreadyUsed(voucher)) { activeVoucher = null; setVoucherFeedback(voucherUsedMessage(), "error"); renderCart(); return false; }
    if (subtotal() < Number(voucher.minOrder || 0)) { activeVoucher = null; setVoucherFeedback("Đơn cần từ " + formatCurrency(voucher.minOrder) + " để dùng mã này.", "error"); renderCart(); return false; }
    if (voucher.type === "shipping" && shippingFee() === 0) { activeVoucher = null; setVoucherFeedback("Mã này chỉ dùng cho đơn giao hàng.", "error"); renderCart(); return false; }
    activeVoucher = voucher; document.getElementById("voucher-code").value = voucher.code;
    setVoucherFeedback(voucher.description, "success"); renderCart(); return true;
  }

  function openVoucherList() {
    const active = (readStore("vouchers") || []).filter(function (voucher) { return voucher.isActive; });
    modalContent.innerHTML = '<p class="eyebrow">Ưu đãi Kat</p><h2 id="checkout-modal-title">Mã có thể dùng</h2><div class="voucher-list">' + (active.length ? active.map(function (voucher) {
      const alreadyUsed = voucherAlreadyUsed(voucher);
      const canUse = !alreadyUsed && subtotal() >= Number(voucher.minOrder || 0) && (voucher.type !== "shipping" || shippingFee() > 0);
      const actionLabel = alreadyUsed ? "Đã dùng" : canUse ? "Dùng mã" : "Chưa đủ đơn";
      return '<article class="voucher-card"><div><strong>' + escapeHTML(voucher.name) + '</strong><p>' + escapeHTML(voucher.description) + '</p><small>Mã <b>' + escapeHTML(voucher.code) + '</b> · Mỗi khách dùng 1 lần</small></div><button class="button button-secondary" type="button" data-use-voucher="' + escapeHTML(voucher.code) + '"' + (!canUse ? " disabled" : "") + '>' + actionLabel + '</button></article>';
    }).join("") : '<p>Hiện chưa có mã ưu đãi.</p>') + '</div>';
    showModal();
  }

  function showModal() { modal.hidden = false; modal.classList.add("is-open"); document.body.classList.add("modal-open"); modal.querySelector(".dialog").focus(); }
  function closeModal() { modal.hidden = true; modal.classList.remove("is-open"); document.body.classList.remove("modal-open"); pendingOrder = null; }

  function createOrder() {
    const sum = subtotal();
    const orderType = document.querySelector('input[name="orderType"]:checked').value;
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    const shipping = shippingFee();
    const discount = discountValue(activeVoucher, sum, shipping);
    const now = new Date();
    const dateCode = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("");
    const orderId = "DH_" + dateCode + "_" + Math.random().toString(36).slice(2, 6).toUpperCase();
    return {
      orderId: orderId,
      userId: currentUser ? currentUser.id : "USR_GUEST",
      customerName: form.elements.customerName.value.trim(),
      customerPhone: form.elements.customerPhone.value.trim(),
      orderType: orderType,
      shippingAddress: orderType === "delivery" ? (addressChoice && !addressChoice.hidden && form.elements.addressChoice.value === "saved" ? currentUser.address : form.elements.shippingAddress.value.trim()) : "",
      pickupBranch: orderType === "pickup" ? (stores.find(function (store) { return store.id === form.elements.pickupBranch.value; }) || stores[0]) : null,
      note: form.elements.note.value.trim(),
      paymentMethod: paymentMethod,
      items: cartItems(),
      subtotalAmount: sum,
      discountAmount: discount,
      voucherCode: activeVoucher ? activeVoucher.code : "",
      shippingFee: shipping,
      finalAmount: Math.max(0, sum - discount + shipping),
      status: "preparing",
      createdAtISO: now.toISOString(),
      createdAt: new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(now)
    };
  }

  function saveOrder(order) {
    if (order.voucherCode && voucherAlreadyUsed(order.voucherCode, order.customerPhone, order.userId)) {
      activeVoucher = null; pendingOrder = null; closeModal();
      document.getElementById("voucher-code").value = "";
      setVoucherFeedback(voucherUsedMessage(), "error");
      renderCart();
      showToast(voucherUsedMessage(), "error");
      return null;
    }
    const orders = readStore("orders") || [];
    const previousOrders = orders.slice();
    orders.unshift(order);
    if (!writeStore("orders", orders)) { writeStore("orders", previousOrders); showToast("Không lưu được đơn hàng. Giỏ hàng vẫn còn để bạn thử lại.", "error"); return null; }
    writeStore("cart", []); activeVoucher = null;
    form.reset(); document.querySelector('input[name="orderType"][value="delivery"]').checked = true; sessionWrite("katOrderType", "delivery"); updateOrderType();
    document.getElementById("voucher-code").value = ""; setVoucherFeedback("", "");
    const users = readStore("users") || [];
    const user = currentUser && users.find(function (item) { return item.id === currentUser.id; });
    if (user) {
      if (order.orderType === "delivery" && order.shippingAddress) user.address = order.shippingAddress;
      writeStore("users", users);
      currentUser.address = user.address; writeStore("currentUser", currentUser);
    }
    renderCart();
    return order;
  }

  function successContent(order) {
    const trackingUrl = "orders.html?phone=" + encodeURIComponent(order.customerPhone || "") + "&order=" + encodeURIComponent(order.orderId);
    modalContent.innerHTML = '<div class="order-success"><p class="eyebrow">Kat đã nhận đơn</p><h2 id="checkout-modal-title">Đặt hàng thành công</h2><p>Mã đơn hàng của bạn</p><strong class="order-id">' + escapeHTML(order.orderId) + '</strong><p>Đơn đang được quán chuẩn bị.</p><a class="button button-secondary button-wide" href="' + trackingUrl + '">Theo dõi đơn hàng</a><button class="button button-primary button-wide" type="button" data-finish-order>Hoàn tất</button></div>';
    showModal();
  }

  function qrSvg() {
    let cells = "";
    const size = 21;
    function inFinder(x, y, ox, oy) { return x >= ox && x < ox + 7 && y >= oy && y < oy + 7; }
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      let on = ((x * 13 + y * 7 + x * y) % 5) < 2;
      [[0, 0], [14, 0], [0, 14]].forEach(function (pos) {
        if (inFinder(x, y, pos[0], pos[1])) {
          const dx = x - pos[0], dy = y - pos[1];
          on = dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4);
        }
      });
      if (on) cells += '<rect x="' + (x + 2) + '" y="' + (y + 2) + '" width="1" height="1"/>';
    }
    return '<svg class="qr-demo-svg" viewBox="0 0 25 25" role="img" aria-label="Mã QR chưa kết nối thanh toán"><rect width="25" height="25"/><g>' + cells + '</g></svg>';
  }

  function openQr(order) {
    pendingOrder = order;
    const transferText = order.orderId + " - " + order.customerPhone;
    modalContent.innerHTML = '<p class="eyebrow">Chuyển khoản qua QR</p><h2 id="checkout-modal-title">Thông tin thanh toán</h2><div class="qr-payment">' + qrSvg() + '<div><p class="qr-demo-warning">QR chưa kết nối ngân hàng, không dùng để chuyển tiền thật.</p><p>Số tiền</p><strong class="qr-amount">' + formatCurrency(order.finalAmount) + '</strong><p>Nội dung chuyển khoản</p><code class="transfer-note">' + escapeHTML(transferText) + '</code></div></div><button class="button button-primary button-wide" type="button" data-confirm-transfer>Tôi đã chuyển khoản thành công</button><button class="text-button button-wide" type="button" data-cancel-transfer>Hủy thao tác</button>';
    showModal();
  }

  function placeOrder() {
    if (!currentUser) {
      location.href = "login.html?returnTo=cart.html";
      return;
    }
    if (!cartItems().length) { showToast("Giỏ hàng đang trống.", "error"); return; }
    if (!form.reportValidity()) return;
    const order = createOrder();
    if (order.paymentMethod === "qr") { openQr(order); return; }
    const savedOrder = saveOrder(order); if (savedOrder) successContent(savedOrder);
  }

  list.addEventListener("click", function (event) {
    const row = event.target.closest("[data-cart-item]"); if (!row) return;
    const itemId = row.dataset.cartItem; const items = cartItems(); const index = items.findIndex(function (item) { return item.cartItemId === itemId; });
    if (index < 0) return;
    if (event.target.closest("[data-remove-item]")) {
      showConfirmModal("Món này sẽ được xóa khỏi giỏ hàng.", function () { items.splice(index, 1); writeStore("cart", items); renderCart(); }, { title: "Xóa món khỏi giỏ?", confirmText: "Xóa món", danger: true }); return;
    }
    const quantityButton = event.target.closest("[data-quantity]"); if (!quantityButton) return;
    if (quantityButton.dataset.quantity === "plus") items[index].quantity = Math.min(20, Number(items[index].quantity) + 1);
    else if (Number(items[index].quantity) > 1) items[index].quantity = Number(items[index].quantity) - 1;
    else { showConfirmModal("Số lượng đang là 1. Bạn muốn xóa món này?", function () { items.splice(index, 1); writeStore("cart", items); renderCart(); }, { title: "Xóa món khỏi giỏ?", confirmText: "Xóa món", danger: true }); return; }
    items[index].subtotal = items[index].unitPrice * items[index].quantity; writeStore("cart", items); renderCart();
  });
  document.querySelectorAll('input[name="orderType"]').forEach(function (input) { input.addEventListener("change", updateOrderType); });
  document.querySelectorAll('input[name="addressChoice"]').forEach(function (input) { input.addEventListener("change", updateOrderType); });
  document.getElementById("pickup-branch-select").addEventListener("change", function (event) { sessionWrite("katPickupBranch", event.currentTarget.value); renderPickupBranch(); });
  document.getElementById("apply-voucher").addEventListener("click", function () { applyVoucher(document.getElementById("voucher-code").value); });
  document.getElementById("voucher-code").addEventListener("keydown", function (event) { if (event.key === "Enter") { event.preventDefault(); applyVoucher(event.currentTarget.value); } });
  form.elements.customerPhone.addEventListener("input", function () { if (activeVoucher) renderCart(); });
  document.getElementById("show-vouchers").addEventListener("click", openVoucherList);
  document.querySelectorAll('input[name="paymentMethod"]').forEach(function (input) { input.addEventListener("change", function () { document.getElementById("place-order").textContent = input.value === "qr" ? "Tiếp tục thanh toán QR" : "Đặt hàng"; }); });
  document.getElementById("place-order").addEventListener("click", placeOrder);
  modal.addEventListener("click", function (event) {
    if (event.target === modal || event.target.closest("[data-close-modal]")) { closeModal(); return; }
    const useVoucher = event.target.closest("[data-use-voucher]");
    if (useVoucher && applyVoucher(useVoucher.dataset.useVoucher)) closeModal();
    if (event.target.closest("[data-confirm-transfer]") && pendingOrder) { const order = pendingOrder; const savedOrder = saveOrder(order); if (savedOrder) successContent(savedOrder); }
    if (event.target.closest("[data-cancel-transfer]")) closeModal();
    if (event.target.closest("[data-finish-order]")) { closeModal(); showToast("Cảm ơn bạn đã đặt món tại Kat.", "success"); }
  });
  modal.addEventListener("keydown", function (event) { if (event.key === "Escape") closeModal(); });
  window.addEventListener("kat:storage", function (event) { if (event.detail && ["cart", "vouchers"].includes(event.detail.key)) renderCart(); });
  const savedOrderType = sessionValue("katOrderType") || sessionValue("maikaOrderType");
  if (savedOrderType === "pickup") document.querySelector('input[name="orderType"][value="pickup"]').checked = true;
  if (form.elements.shippingAddress && !form.elements.shippingAddress.value) form.elements.shippingAddress.value = sessionValue("katDeliveryAddress") || sessionValue("maikaDeliveryAddress");
  const savedBranch = sessionValue("katPickupBranch") || sessionValue("maikaPickupBranch");
  if (savedBranch) document.getElementById("pickup-branch-select").value = savedBranch;
  form.hidden = !currentUser;
  placeOrderButton.hidden = !currentUser;
  checkoutLoginButton.hidden = Boolean(currentUser);
  checkoutHelp.textContent = currentUser ? "Thông tin tài khoản đã được điền sẵn. Bạn có thể chọn địa chỉ đã lưu hoặc nhập địa chỉ mới." : "Đăng nhập để điền thông tin tài khoản và hoàn tất đơn hàng.";
  if (currentUser) {
    form.elements.customerName.value = currentUser.fullname || "";
    form.elements.customerPhone.value = currentUser.phone || "";
    if (currentUser.address) {
      document.getElementById("saved-address-label").textContent = currentUser.address;
      addressChoice.hidden = false;
      form.elements.addressChoice.value = "saved";
      form.elements.shippingAddress.value = currentUser.address;
    }
  }
  renderPickupBranch(); updateOrderType(); renderCart();
})();
