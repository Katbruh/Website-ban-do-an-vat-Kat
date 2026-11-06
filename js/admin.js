(function () {
  const content = document.getElementById("admin-content");
  const modal = document.getElementById("admin-modal");
  const modalContent = document.getElementById("admin-modal-content");
  const title = document.getElementById("admin-view-title");
  const addButton = document.getElementById("admin-add-action");
  let activeView = "overview";
  let editingImage = "";
  let editingVariantImages = {};
  let variantImageReadPromises = {};
  let orderFilters = { status: "all", from: "", to: "", location: "" };
  let reportDateRange = { from: "", to: "" };
  const statuses = { pending: "Chờ xác nhận", preparing: "Đang chuẩn bị", shipping: "Đang giao", completed: "Hoàn thành", cancelled: "Đã hủy" };
  const statusOrder = ["pending", "preparing", "shipping", "completed"];
  const viewTitles = { overview: "Tổng quan", products: "Món ăn", categories: "Danh mục", orders: "Đơn hàng", combos: "Combo", vouchers: "Voucher", reviews: "Đánh giá", feedback: "Góp ý", users: "Tài khoản" };

  function money(value) { return formatCurrency(value); }
  function compressProductImage(file) {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = function () {
        const image = new Image();
        image.onerror = reject;
        image.onload = function () {
          const scale = Math.min(1, 1200 / Math.max(image.naturalWidth, image.naturalHeight));
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
          canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
          const context = canvas.getContext("2d");
          if (!context) { reject(new Error("Canvas is unavailable")); return; }
          context.fillStyle = "#ffffff";
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.68);
          if (dataUrl.length > 260000) { reject(new Error("The compressed image is still too large")); return; }
          resolve(dataUrl);
        };
        image.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }
  function variantImageKey(name) { return String(name || "").trim().toLocaleLowerCase("vi"); }
  function renderVariantImageFields(form) {
    const fields = form.querySelector("#variant-image-fields");
    if (!fields) return;
    const names = form.elements.variants.value.split(/\r?\n/).map(function (line) { return String(line.split("|")[0] || "").trim(); }).filter(Boolean);
    fields.hidden = names.length === 0;
    if (!names.length) { fields.innerHTML = ""; return; }
    fields.innerHTML = '<p class="helper-text">Ảnh riêng sẽ hiện khi khách chọn lựa chọn này. Bỏ trống để dùng ảnh chính của món.</p>' + names.map(function (name) {
      const image = editingVariantImages[variantImageKey(name)] || "";
      return '<div class="variant-image-row"><div><strong>' + escapeHTML(name) + '</strong><label class="variant-image-upload">Ảnh riêng (không bắt buộc)<input type="file" accept="image/*" data-variant-image-input data-variant-image-name="' + escapeHTML(name) + '"><span class="helper-text">Ảnh được nén khi lưu.</span></label></div><div class="variant-image-preview-wrap" data-variant-image-preview-wrap' + (image ? "" : " hidden") + '><img data-variant-image-preview src="' + escapeHTML(image) + '" alt="Ảnh xem trước: ' + escapeHTML(name) + '"></div></div>';
    }).join("");
  }

  function productOptionText(product) {
    return Array.isArray(product.variants) && product.variants.length ? '<small>' + product.variants.length + ' lựa chọn · từ ' + money(Math.min.apply(Math, product.variants.map(function (item) { return Number(item.price) || 0; }))) + '</small>' : money(product.price);
  }
  function setView(view) {
    activeView = view;
    document.querySelectorAll("[data-admin-view]").forEach(function (button) { button.classList.toggle("is-active", button.dataset.adminView === view); });
    title.textContent = viewTitles[view];
    addButton.hidden = !["products", "categories", "combos", "vouchers", "users"].includes(view);
    addButton.textContent = view === "products" ? "Thêm món" : view === "categories" ? "Thêm danh mục" : view === "combos" ? "Thêm combo" : view === "users" ? "Thêm tài khoản" : "Thêm voucher";
    renderView();
  }

  function statCard(label, value, detail) {
    return '<article class="stat-card"><span>' + label + '</span><strong>' + value + '</strong><small>' + detail + '</small></article>';
  }
  function renderOverview() {
    const orders = readStore("orders") || [];
    const products = readStore("products") || [];
    const completed = orders.filter(function (order) { return order.status === "completed"; });
    const revenue = completed.reduce(function (sum, order) { return sum + Number(order.finalAmount || 0); }, 0);
    const pending = orders.filter(function (order) { return order.status === "pending"; }).length;
    const sold = {};
    completed.forEach(function (order) { (order.items || []).forEach(function (item) { sold[item.productId] = (sold[item.productId] || 0) + Number(item.quantity || 0); }); });
    const best = Object.keys(sold).sort(function (a, b) { return sold[b] - sold[a]; })[0];
    const bestProduct = products.find(function (product) { return product.id === best; });
    const recent = orders.slice(0, 6);
    const reportOrders = orders.filter(function (order) { return order.status === "completed" && matchesDateRange(order, reportDateRange.from, reportDateRange.to); });
    const customers = {};
    reportOrders.forEach(function (order) {
      const key = order.userId && order.userId !== "USR_GUEST" ? order.userId : "guest:" + String(order.customerPhone || "").replace(/\D/g, "");
      if (!customers[key]) customers[key] = { key: key, name: order.customerName || "Khách hàng", phone: order.customerPhone || "", total: 0, orders: [] };
      customers[key].total += Number(order.finalAmount || 0);
      customers[key].orders.push(order);
    });
    const topCustomers = Object.keys(customers).map(function (key) { return customers[key]; }).sort(function (a, b) { return b.total - a.total; }).slice(0, 5);
    const reportRows = topCustomers.length ? topCustomers.map(function (customer, index) {
      const detailRows = customer.orders.slice().sort(function (a, b) { return orderDateKey(b).localeCompare(orderDateKey(a)); }).map(function (order) {
        const detailUrl = "orders.html?phone=" + encodeURIComponent(order.customerPhone || "") + "&order=" + encodeURIComponent(order.orderId);
        return '<li><span><strong>' + escapeHTML(order.orderId) + '</strong> · ' + escapeHTML(order.createdAt || "") + '</span><span>' + money(order.finalAmount) + ' · <a href="' + detailUrl + '">Chi tiết đơn</a></span></li>';
      }).join("");
      return '<tr><td>' + (index + 1) + '</td><td><strong>' + escapeHTML(customer.name) + '</strong><small>' + escapeHTML(customer.phone) + '</small></td><td>' + customer.orders.length + '</td><td><strong>' + money(customer.total) + '</strong></td><td><details class="report-order-details"><summary>Xem ' + customer.orders.length + ' đơn</summary><ul>' + detailRows + '</ul></details></td></tr>';
    }).join("") : '<tr><td colspan="5">Chưa có đơn hoàn thành trong khoảng thời gian này.</td></tr>';
    return '<section class="stats-grid" aria-label="4 số liệu tổng quan">' +
      statCard("Tổng doanh thu", money(revenue), "Từ đơn đã hoàn thành") +
      statCard("Tổng đơn hàng", orders.length, "Tất cả trạng thái") +
      statCard("Đơn chờ xác nhận", pending, "Cần được xử lý") +
      statCard("Món bán chạy nhất", bestProduct ? escapeHTML(bestProduct.name) : "Chưa có", bestProduct ? (sold[best] || 0) + " phần đã bán" : "Số liệu từ đơn hoàn thành") +
      '</section><section class="admin-section"><div class="admin-section-heading"><div><p class="eyebrow">Báo cáo doanh thu</p><h2>Top 5 khách hàng</h2><p class="helper-text">Tính theo đơn hoàn thành; sắp xếp từ tổng chi tiêu cao xuống thấp.</p></div></div><div class="admin-filter-grid report-date-filter"><label>Từ ngày<input type="date" data-report-date="from" value="' + escapeHTML(reportDateRange.from) + '"></label><label>Đến ngày<input type="date" data-report-date="to" value="' + escapeHTML(reportDateRange.to) + '"></label></div><div class="table-wrap"><table><thead><tr><th>Hạng</th><th>Khách hàng</th><th>Số đơn</th><th>Tổng mua</th><th>Chi tiết đơn đã nhóm</th></tr></thead><tbody>' + reportRows + '</tbody></table></div></section><section class="admin-section"><div class="admin-section-heading"><div><p class="eyebrow">Mới nhất</p><h2>Đơn hàng gần đây</h2></div><button class="text-button" type="button" data-jump="orders">Xem tất cả →</button></div>' + orderTable(recent, true) + '</section>';
  }

  function orderDateKey(order) {
    if (order.createdAtISO) {
      const timestamp = new Date(order.createdAtISO);
      if (!Number.isNaN(timestamp.getTime())) return [timestamp.getFullYear(), String(timestamp.getMonth() + 1).padStart(2, "0"), String(timestamp.getDate()).padStart(2, "0")].join("-");
    }
    const match = String(order.createdAt || "").match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (match) return match[3] + "-" + String(match[2]).padStart(2, "0") + "-" + String(match[1]).padStart(2, "0");
    const date = new Date(order.createdAt || "");
    return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
  }

  function matchesDateRange(order, from, to) {
    const date = orderDateKey(order);
    return (!from || (date && date >= from)) && (!to || (date && date <= to));
  }

  function orderTable(orders, compact) {
    if (!orders.length) return '<div class="admin-empty">Chưa có đơn hàng. Đơn mới sẽ hiển thị tại đây.</div>';
    return '<div class="table-wrap"><table><thead><tr><th>Mã đơn</th><th>Khách hàng</th><th>Nhận món</th><th>Tổng tiền</th><th>Trạng thái</th>' + (compact ? "" : "<th>Ngày tạo</th>") + '</tr></thead><tbody>' + orders.map(function (order) {
      const receive = order.orderType === "pickup" ? "Lấy tại quán" + (order.pickupBranch ? " · " + order.pickupBranch.shortLabel : "") : "Giao tận nơi";
      return '<tr><td><strong>' + escapeHTML(order.orderId) + '</strong></td><td>' + escapeHTML(order.customerName) + '<small>' + escapeHTML(order.customerPhone) + '</small></td><td>' + escapeHTML(receive) + '</td><td>' + money(order.finalAmount) + '</td><td><span class="status-badge status-' + escapeHTML(order.status) + '">' + escapeHTML(statuses[order.status] || order.status) + '</span></td>' + (compact ? "" : '<td>' + escapeHTML(order.createdAt) + '</td>') + '</tr>';
    }).join("") + '</tbody></table></div>';
  }

  function renderProducts() {
    const products = readStore("products") || [];
    const categories = readStore("categories") || [];
    if (!products.length) return '<div class="admin-empty">Chưa có món. Thêm món đầu tiên để mở bán.</div>';
    return '<div class="table-wrap"><table><thead><tr><th>Món</th><th>Danh mục</th><th>Giá</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>' + products.map(function (product) {
      const category = categories.find(function (item) { return item.id === product.categoryId; });
      return '<tr><td><div class="table-product"><img src="' + escapeHTML(product.image || "") + '" alt=""><strong>' + escapeHTML(product.name) + '</strong></div></td><td>' + escapeHTML(category ? category.name : "Chưa phân loại") + '</td><td>' + productOptionText(product) + '</td><td><button class="status-toggle ' + (product.status ? "is-available" : "is-unavailable") + '" type="button" data-toggle-product="' + escapeHTML(product.id) + '" aria-pressed="' + product.status + '">' + (product.status ? "Còn hàng" : "Tạm hết") + '</button><small>' + (product.isVisible === false ? "Đang ẩn với khách" : "Đang hiện với khách") + '</small></td><td><div class="table-actions"><button class="text-button" type="button" data-toggle-product-visibility="' + escapeHTML(product.id) + '">' + (product.isVisible === false ? "Hiện lại" : "Ẩn khỏi cửa hàng") + '</button><button class="text-button" type="button" data-edit-product="' + escapeHTML(product.id) + '">Sửa</button><button class="text-button danger-link" type="button" data-delete-product="' + escapeHTML(product.id) + '">Xóa</button></div></td></tr>';
    }).join("") + '</tbody></table></div>';
  }

  function renderCategories() {
    const categories = (readStore("categories") || []).filter(function (category) { return category.id !== "cat_all"; });
    const products = readStore("products") || [];
    if (!categories.length) return '<div class="admin-empty">Chưa có danh mục.</div>';
    return '<div class="category-admin-grid">' + categories.map(function (category) {
      const categoryProducts = products.filter(function (product) { return product.categoryId === category.id; });
      const productRows = categoryProducts.length ? categoryProducts.map(function (product) {
        return '<li><span>' + escapeHTML(product.name) + '</span><button class="text-button danger-link" type="button" data-remove-product-category="' + escapeHTML(product.id) + '">Gỡ khỏi danh mục</button></li>';
      }).join("") : '<li class="helper-text">Danh mục chưa có món.</li>';
      const availableProducts = products.filter(function (product) { return product.categoryId !== category.id; });
      const productOptions = availableProducts.map(function (product) { return '<option value="' + escapeHTML(product.id) + '">' + escapeHTML(product.name) + '</option>'; }).join("");
      return '<article class="category-admin-card"><div><span class="category-admin-icon" aria-hidden="true">' + escapeHTML(category.name.slice(0, 1)) + '</span><div><h2>' + escapeHTML(category.name) + '</h2><p>' + categoryProducts.length + ' món</p></div></div><div class="table-actions"><button class="text-button" type="button" data-add-category-product="' + escapeHTML(category.id) + '">Tạo món mới</button><button class="text-button" type="button" data-edit-category="' + escapeHTML(category.id) + '">Sửa</button><button class="text-button danger-link" type="button" data-delete-category="' + escapeHTML(category.id) + '">Xóa</button></div><details class="category-products-manager"><summary>Quản lý món trong danh mục</summary><ul>' + productRows + '</ul><div class="category-products-add"><label class="sr-only" for="category-add-' + escapeHTML(category.id) + '">Chọn món có sẵn để thêm</label><select id="category-add-' + escapeHTML(category.id) + '" data-category-product-select="' + escapeHTML(category.id) + '"><option value="">Chọn món có sẵn...</option>' + productOptions + '</select><button class="button button-secondary" type="button" data-assign-category-product="' + escapeHTML(category.id) + '"' + (!availableProducts.length ? ' disabled' : '') + '>Thêm món đã có</button></div></details></article>';
    }).join("") + '</div>';
  }

  function renderOrderResults() {
    const allOrders = readStore("orders") || [];
    const orders = allOrders.filter(function (order) {
      const matchesStatus = orderFilters.status === "all" || order.status === orderFilters.status;
      const address = order.orderType === "pickup" ? ((order.pickupBranch && order.pickupBranch.address) || "") : (order.shippingAddress || "");
      const matchesLocation = !orderFilters.location || address.toLocaleLowerCase("vi").includes(orderFilters.location.toLocaleLowerCase("vi"));
      return matchesStatus && matchesLocation && matchesDateRange(order, orderFilters.from, orderFilters.to);
    });
    if (!orders.length) return '<div class="admin-empty">Không có đơn hàng khớp bộ lọc.</div>';
    return '<div class="table-wrap"><table><thead><tr><th>Mã đơn & khách</th><th>Món</th><th>Nhận món</th><th>Thanh toán</th><th>Tổng tiền</th><th>Cập nhật trạng thái</th></tr></thead><tbody>' + orders.map(function (order) {
      const itemText = (order.items || []).map(function (item) { return escapeHTML(item.name) + " × " + Number(item.quantity); }).join("<br>");
      const receiveAddress = order.orderType === "pickup" ? (order.pickupBranch ? order.pickupBranch.address : "Lấy tại quán") : order.shippingAddress;
      const receiveLabel = order.orderType === "pickup" ? "Tại quán" : "Giao tận nơi";
      const currentIndex = statusOrder.indexOf(order.status);
      const allowedStatuses = Object.keys(statuses).filter(function (key) { return key === order.status || (key === "cancelled" && currentIndex >= 0 && currentIndex < 3) || (statusOrder.indexOf(key) >= currentIndex && currentIndex >= 0); });
      const locked = order.status === "completed" || order.status === "cancelled";
      return '<tr><td><strong>' + escapeHTML(order.orderId) + '</strong><small>' + escapeHTML(order.customerName) + ' · ' + escapeHTML(order.customerPhone) + '</small><small>' + escapeHTML(receiveAddress) + '</small><small>' + escapeHTML(order.createdAt || "") + '</small></td><td>' + itemText + '</td><td>' + receiveLabel + '</td><td>' + escapeHTML(order.paymentMethod === "qr" ? "Chuyển khoản qua QR" : "COD") + '</td><td>' + money(order.finalAmount) + '</td><td><label class="sr-only" for="status-' + escapeHTML(order.orderId) + '">Trạng thái ' + escapeHTML(order.orderId) + '</label><select class="status-select" id="status-' + escapeHTML(order.orderId) + '" data-order-status="' + escapeHTML(order.orderId) + '"' + (locked ? " disabled" : "") + '>' + allowedStatuses.map(function (key) { return '<option value="' + key + '"' + (order.status === key ? " selected" : "") + '>' + statuses[key] + '</option>'; }).join("") + '</select></td></tr>';
    }).join("") + '</tbody></table></div>';
  }

  function renderOrders() {
    const filterBar = '<div class="admin-filter-grid"><label>Lọc trạng thái<select data-order-filter="status"><option value="all">Tất cả trạng thái</option>' + Object.keys(statuses).map(function (key) { return '<option value="' + key + '"' + (orderFilters.status === key ? " selected" : "") + '>' + statuses[key] + '</option>'; }).join("") + '</select></label><label>Từ ngày<input type="date" data-order-filter="from" value="' + escapeHTML(orderFilters.from) + '"></label><label>Đến ngày<input type="date" data-order-filter="to" value="' + escapeHTML(orderFilters.to) + '"></label><label>Khu vực giao hoặc nhận<input type="search" data-order-filter="location" value="' + escapeHTML(orderFilters.location) + '" placeholder="Quận, thành phố hoặc địa chỉ"></label></div><div data-order-results>' + renderOrderResults() + '</div>';
    return filterBar;
  }

  function applyOrderFilter(input) {
    const filter = input.dataset.orderFilter;
    if (!filter) return;
    orderFilters[filter] = input.value;
    const results = content.querySelector("[data-order-results]");
    if (results) results.innerHTML = renderOrderResults();
  }

  function renderVouchers() {
    const vouchers = readStore("vouchers") || [];
    if (!vouchers.length) return '<div class="admin-empty">Chưa có mã giảm giá.</div>';
    return '<div class="voucher-admin-grid">' + vouchers.map(function (voucher) {
      const value = voucher.type === "percent" ? voucher.value + "%" + (voucher.maxDiscount ? " · tối đa " + money(voucher.maxDiscount) : "") : voucher.type === "shipping" ? "phí giao hàng · tối đa " + money(voucher.value) : money(voucher.value);
      const isPublic = voucher.isPublic !== false;
      return '<article class="voucher-admin-card"><div class="voucher-admin-top"><strong>' + escapeHTML(voucher.code) + '</strong><span class="status-badge ' + (voucher.isActive ? "status-completed" : "status-cancelled") + '">' + (voucher.isActive ? "Đang bật" : "Đang tắt") + '</span></div><h2>' + escapeHTML(voucher.name) + '</h2><p>' + escapeHTML(voucher.description) + '</p><small>Giảm ' + escapeHTML(value) + ' · Đơn tối thiểu ' + money(voucher.minOrder) + '</small><span class="voucher-visibility-badge">' + (isPublic ? "Đang công khai" : "Riêng tư") + '</span><div class="table-actions"><button class="text-button" type="button" data-toggle-voucher="' + escapeHTML(voucher.code) + '">' + (voucher.isActive ? "Tắt mã" : "Bật mã") + '</button><button class="text-button" type="button" data-toggle-voucher-visibility="' + escapeHTML(voucher.code) + '">' + (isPublic ? "Chuyển riêng tư" : "Công khai") + '</button><button class="text-button" type="button" data-edit-voucher="' + escapeHTML(voucher.code) + '">Sửa</button><button class="text-button danger-link" type="button" data-delete-voucher="' + escapeHTML(voucher.code) + '">Xóa</button></div></article>';
    }).join("") + '</div>';
  }

  function renderCombos() {
    const combos = readStore("combos") || [];
    if (!combos.length) return '<div class="admin-empty">Chưa có combo nào.</div>';
    const groups = { solo: "Một mình", friends: "Bè bạn", party: "Tiệc" };
    return '<div class="table-wrap"><table><thead><tr><th>Combo</th><th>Phần ăn</th><th>Thức uống</th><th>Giá bán</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>' + combos.map(function (combo) {
      const active = combo.isActive !== false;
      return '<tr><td><strong>' + escapeHTML(combo.name) + '</strong><small>' + escapeHTML(groups[combo.group] || combo.group) + (combo.serving ? ' · ' + escapeHTML(combo.serving) : '') + '</small><small>' + escapeHTML((combo.items || []).join(' · ')) + '</small></td><td>' + (combo.items || []).length + ' món</td><td>' + Number(combo.drinkCount || 0) + '</td><td><strong>' + money(combo.price) + '</strong><small>Giá lẻ ' + money(combo.originalPrice || 0) + '</small></td><td><span class="status-badge ' + (active ? 'status-completed' : 'status-cancelled') + '">' + (active ? 'Đang bán' : 'Đang ẩn') + '</span></td><td><div class="table-actions"><button class="text-button" type="button" data-edit-combo="' + escapeHTML(combo.id) + '">Sửa</button><button class="text-button" type="button" data-toggle-combo="' + escapeHTML(combo.id) + '">' + (active ? 'Ẩn' : 'Bật') + '</button><button class="text-button danger-link" type="button" data-delete-combo="' + escapeHTML(combo.id) + '">Xóa</button></div></td></tr>';
    }).join('') + '</tbody></table></div>';
  }

  function renderReviews() {
    const reviews = (readStore("reviews") || []).slice().reverse();
    const products = readStore("products") || [];
    if (!reviews.length) return '<div class="admin-empty">Chưa có đánh giá. Đánh giá mới sẽ được quản lý ở đây.</div>';
    return '<div class="review-admin-list">' + reviews.map(function (review) {
      const product = products.find(function (item) { return item.id === review.productId; });
      return '<article class="review-admin-card"><div class="review-admin-head"><div><strong>' + escapeHTML(review.username) + '</strong><span>' + escapeHTML(product ? product.name : "Món đã xóa") + '</span></div><span class="review-stars" aria-label="' + Number(review.rating) + ' sao">' + "★".repeat(Number(review.rating)) + '</span></div><p>' + (review.comment ? escapeHTML(review.comment) : '<span class="helper-text">Chỉ chấm sao</span>') + '</p><div class="review-admin-foot"><time>' + escapeHTML(review.createdAt) + '</time><span class="status-badge ' + (review.isHidden ? "status-cancelled" : "status-completed") + '">' + (review.isHidden ? "Đang ẩn" : "Đang hiện") + '</span><div class="table-actions"><button class="text-button" type="button" data-toggle-review="' + escapeHTML(review.id) + '">' + (review.isHidden ? "Hiện" : "Ẩn") + '</button><button class="text-button danger-link" type="button" data-delete-review="' + escapeHTML(review.id) + '">Xóa</button></div></div></article>';
    }).join("") + '</div>';
  }

  function renderUsers() {
    const users = readStore("users") || [];
    if (!users.length) return '<div class="admin-empty">Chưa có tài khoản khách hàng.</div>';
    return '<div class="table-wrap"><table><thead><tr><th>Số điện thoại đăng nhập</th><th>Họ và tên</th><th>Email</th><th>Vai trò</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>' + users.map(function (user) {
      const active = user.isActive !== false;
      const self = currentUser && currentUser.id === user.id;
      return '<tr><td><strong>' + escapeHTML(user.phone || '') + '</strong></td><td>' + escapeHTML(user.fullname || '') + '</td><td>' + escapeHTML(user.email || '') + '</td><td>' + (user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng') + '</td><td><span class="status-badge ' + (active ? 'status-completed' : 'status-cancelled') + '">' + (active ? 'Đang hoạt động' : 'Đã khóa') + '</span></td><td><div class="table-actions"><button class="text-button" type="button" data-edit-user="' + escapeHTML(user.id) + '">Sửa</button><button class="text-button" type="button" data-toggle-user="' + escapeHTML(user.id) + '"' + (self ? ' disabled title="Không thể khóa tài khoản đang đăng nhập"' : '') + '>' + (active ? 'Khóa' : 'Mở khóa') + '</button></div></td></tr>';
    }).join('') + '</tbody></table></div>';
  }

  function renderFeedback() {
    const feedback = (readStore("feedback") || []).slice().reverse();
    if (!feedback.length) return '<div class="admin-empty">Chưa có góp ý nào.</div>';
    const topics = { service: "Dịch vụ", food: "Món ăn", delivery: "Giao nhận", other: "Khác" };
    return '<div class="review-admin-list">' + feedback.map(function (item) {
      return '<article class="review-admin-card"><div class="review-admin-head"><div><strong>' + escapeHTML(item.name) + '</strong><span>' + escapeHTML(topics[item.topic] || topics.other) + (item.email ? ' · ' + escapeHTML(item.email) : '') + '</span></div><time>' + escapeHTML(item.createdAt || '') + '</time></div><p>' + escapeHTML(item.message) + '</p><div class="table-actions"><button class="text-button danger-link" type="button" data-delete-feedback="' + escapeHTML(item.id) + '">Xóa góp ý</button></div></article>';
    }).join('') + '</div>';
  }

  function renderView() {
    const renderers = { overview: renderOverview, products: renderProducts, categories: renderCategories, orders: renderOrders, combos: renderCombos, vouchers: renderVouchers, reviews: renderReviews, feedback: renderFeedback, users: renderUsers };
    content.innerHTML = renderers[activeView]();
  }

  function categoryOptions(selected) {
    const categories = (readStore("categories") || []).filter(function (category) { return category.id !== "cat_all"; }).map(function (category) { return '<option value="' + escapeHTML(category.id) + '"' + (category.id === selected ? " selected" : "") + '>' + escapeHTML(category.name) + '</option>'; }).join("");
    return categories + '<option value="cat_uncategorized"' + (selected === "cat_uncategorized" ? " selected" : "") + '>Chưa phân loại</option>';
  }

  function openProductForm(product) {
    const edit = !!product; editingImage = product ? product.image : "";
    editingVariantImages = {};
    variantImageReadPromises = {};
    if (product && Array.isArray(product.variants)) product.variants.forEach(function (variant) {
      if (variant.image) editingVariantImages[variantImageKey(variant.name)] = variant.image;
    });
    const variantsText = product && Array.isArray(product.variants) ? product.variants.map(function (variant) { return variant.name + " | " + Number(variant.price); }).join("\n") : "";
    modalContent.innerHTML = '<p class="eyebrow">' + (edit ? "Cập nhật thực đơn" : "Thêm vào thực đơn") + '</p><h2 id="admin-modal-title">' + (edit ? "Sửa món ăn" : "Thêm món mới") + '</h2><form id="product-form" class="form-stack admin-form"><label>Tên món<input name="name" required value="' + escapeHTML(product ? product.name : "") + '"></label><div class="form-columns"><label>Danh mục<select name="categoryId" required>' + categoryOptions(product ? product.categoryId : "") + '</select></label><label>Loại món<select name="categoryType"><option value="food"' + (!product || product.categoryType === "food" ? " selected" : "") + '>Đồ ăn</option><option value="drink"' + (product && product.categoryType === "drink" ? " selected" : "") + '>Đồ uống</option></select></label></div><div class="form-columns"><label>Giá bán hoặc giá thấp nhất (đ)<input name="price" type="number" min="0" step="1000" required value="' + (product ? Number(product.price) : "") + '"></label><label>Giá gốc (đ)<input name="originalPrice" type="number" min="0" step="1000" value="' + (product ? Number(product.originalPrice || 0) : "") + '"></label></div><label>Lựa chọn và giá<textarea name="variants" rows="4" placeholder="Ví dụ: Mẹt nhỏ | 35000&#10;Mẹt lớn | 55000">' + escapeHTML(variantsText) + '</textarea><span class="helper-text">Mỗi dòng một lựa chọn theo mẫu: tên | giá bằng đồng. Để trống nếu món chỉ có một giá.</span></label><div id="variant-image-fields" class="variant-image-fields" hidden></div><label>Tùy chỉnh món<select name="customization"><option value=""' + (!product || !product.customization ? " selected" : "") + '>Không có tùy chỉnh</option><option value="food"' + (product && product.customization === "food" ? " selected" : "") + '>Mức cay và topping món ăn</option><option value="drink"' + (product && product.customization === "drink" ? " selected" : "") + '>Độ ngọt, lượng đá và topping thức uống</option></select></label><label>Mô tả<textarea name="description" rows="3" required>' + escapeHTML(product ? product.description : "") + '</textarea></label><label>Ảnh món ăn<input name="imageFile" type="file" accept="image/*"><span class="helper-text">Ảnh sẽ được nén khi lưu. Chọn ảnh dưới 8 MB; có thể để trống khi sửa món.</span></label><div class="image-preview-wrap" id="image-preview-wrap"' + (editingImage ? "" : " hidden") + '><img id="image-preview" src="' + escapeHTML(editingImage) + '" alt="Xem trước ảnh món"></div><label class="checkbox-field"><input name="isHot" type="checkbox"' + (product && product.isHot ? " checked" : "") + '>Đánh dấu món được chọn</label><div class="dialog-actions"><button class="button button-secondary" type="button" data-close-admin>Hủy</button><button class="button button-primary" type="submit">' + (edit ? "Lưu thay đổi" : "Thêm món") + '</button></div></form>';
    const form = modalContent.querySelector("#product-form");
    form.dataset.editId = product ? product.id : "";
    modal.dataset.editId = product ? product.id : "";
    renderVariantImageFields(form);
    showModal();
  }

  function openCategoryForm(category) {
    const edit = !!category;
    modalContent.innerHTML = '<p class="eyebrow">Thực đơn Kat</p><h2 id="admin-modal-title">' + (edit ? "Sửa danh mục" : "Thêm danh mục") + '</h2><form id="category-form" class="form-stack admin-form"><label>Tên danh mục<input name="name" required value="' + escapeHTML(category ? category.name : "") + '"></label><div class="dialog-actions"><button class="button button-secondary" type="button" data-close-admin>Hủy</button><button class="button button-primary" type="submit">Lưu danh mục</button></div></form>';
    modal.dataset.editId = category ? category.id : ""; showModal();
  }

  function openVoucherForm(voucher) {
    const edit = !!voucher;
    modalContent.innerHTML = '<p class="eyebrow">Ưu đãi Kat</p><h2 id="admin-modal-title">' + (edit ? "Sửa voucher" : "Tạo voucher") + '</h2><form id="voucher-form" class="form-stack admin-form"><label>Mã voucher<input name="code" required maxlength="20" value="' + escapeHTML(voucher ? voucher.code : "") + '"' + (edit ? " readonly" : "") + '></label><label>Tên voucher<input name="name" required value="' + escapeHTML(voucher ? voucher.name : "") + '"></label><label>Loại giảm giá<select name="type"><option value="percent"' + (!voucher || voucher.type === "percent" ? " selected" : "") + '>Theo phần trăm (%)</option><option value="fixed"' + (voucher && voucher.type === "fixed" ? " selected" : "") + '>Số tiền cố định (đ)</option><option value="shipping"' + (voucher && voucher.type === "shipping" ? " selected" : "") + '>Phí giao hàng</option></select></label><div class="form-columns"><label>Giá trị / mức giảm tối đa (đ)<input name="value" type="number" min="1" required value="' + (voucher ? Number(voucher.value) : "") + '"></label><label>Giảm tối đa (đ)<input name="maxDiscount" type="number" min="0" value="' + (voucher ? Number(voucher.maxDiscount || 0) : "") + '"></label></div><label>Đơn tối thiểu (đ)<input name="minOrder" type="number" min="0" required value="' + (voucher ? Number(voucher.minOrder || 0) : "") + '"></label><label>Mô tả<input name="description" required value="' + escapeHTML(voucher ? voucher.description : "") + '"></label><label class="checkbox-field"><input name="isActive" type="checkbox"' + (!voucher || voucher.isActive ? " checked" : "") + '>Đang bật</label><label class="checkbox-field"><input name="isPublic" type="checkbox"' + (!voucher || voucher.isPublic !== false ? " checked" : "") + '>Công khai tại Voucher ưu đãi quán</label><div class="dialog-actions"><button class="button button-secondary" type="button" data-close-admin>Hủy</button><button class="button button-primary" type="submit">Lưu voucher</button></div></form>';
    modal.dataset.editCode = voucher ? voucher.code : ""; showModal();
  }

  function openComboForm(combo) {
    const edit = !!combo;
    const itemsText = combo && Array.isArray(combo.items) ? combo.items.join('\n') : '';
    modalContent.innerHTML = '<p class="eyebrow">Combo Kat</p><h2 id="admin-modal-title">' + (edit ? 'Sửa combo' : 'Thêm combo') + '</h2><form id="combo-form" class="form-stack admin-form"><label>Tên combo<input name="name" required maxlength="80" value="' + escapeHTML(combo ? combo.name : '') + '"></label><div class="form-columns"><label>Nhóm<select name="group"><option value="solo"' + (!combo || combo.group === 'solo' ? ' selected' : '') + '>Một mình</option><option value="friends"' + (combo && combo.group === 'friends' ? ' selected' : '') + '>Bè bạn</option><option value="party"' + (combo && combo.group === 'party' ? ' selected' : '') + '>Tiệc</option></select></label><label>Số nước chọn<input name="drinkCount" type="number" min="0" max="4" step="1" value="' + (combo ? Number(combo.drinkCount || 0) : 0) + '"></label></div><div class="form-columns"><label>Giá combo (đ)<input name="price" type="number" min="1" step="1000" required value="' + (combo ? Number(combo.price) : '') + '"></label><label>Giá mua lẻ (đ)<input name="originalPrice" type="number" min="1" step="1000" required value="' + (combo ? Number(combo.originalPrice || 0) : '') + '"></label></div><label>Phần ăn, mỗi dòng một món<textarea name="items" rows="5" required>' + escapeHTML(itemsText) + '</textarea></label><label>Khẩu phần<input name="serving" maxlength="40" value="' + escapeHTML(combo ? combo.serving || '' : '') + '"></label><label>Ảnh<select name="image"><option value="images/fried-snacks.jpg"' + (!combo || combo.image === 'images/fried-snacks.jpg' ? ' selected' : '') + '>Món chiên</option><option value="images/spring-rolls.jpg"' + (combo && combo.image === 'images/spring-rolls.jpg' ? ' selected' : '') + '>Nem cuốn</option><option value="images/milk-tea.jpg"' + (combo && combo.image === 'images/milk-tea.jpg' ? ' selected' : '') + '>Trà sữa</option></select></label><label class="checkbox-field"><input name="isActive" type="checkbox"' + (!combo || combo.isActive !== false ? ' checked' : '') + '>Đang bán</label><div class="dialog-actions"><button class="button button-secondary" type="button" data-close-admin>Hủy</button><button class="button button-primary" type="submit">Lưu combo</button></div></form>';
    modal.dataset.editComboId = combo ? combo.id : '';
    showModal();
  }

  function saveCombo(form) {
    const combos = readStore('combos') || [];
    const editId = modal.dataset.editComboId;
    const name = form.elements.name.value.trim();
    const price = Number(form.elements.price.value);
    const originalPrice = Number(form.elements.originalPrice.value);
    const drinkCount = Number(form.elements.drinkCount.value);
    const items = form.elements.items.value.split(/\r?\n/).map(function (item) { return item.trim(); }).filter(Boolean);
    if (combos.some(function (item) { return item.name.toLocaleLowerCase('vi') === name.toLocaleLowerCase('vi') && item.id !== editId; })) { showToast('Tên combo này đã tồn tại.', 'error'); return; }
    if (!Number.isInteger(drinkCount) || drinkCount < 0 || drinkCount > 4 || price <= 0 || originalPrice < price || !items.length) { showToast('Kiểm tra lại giá, số nước và danh sách món trong combo.', 'error'); return; }
    const combo = { id: editId || makeId('COMBO'), group: form.elements.group.value, name: name, price: price, originalPrice: originalPrice, drinkCount: drinkCount, image: form.elements.image.value, serving: form.elements.serving.value.trim(), items: items, isActive: form.elements.isActive.checked };
    const index = combos.findIndex(function (item) { return item.id === editId; });
    if (index >= 0) combos[index] = combo; else combos.unshift(combo);
    if (!writeStore('combos', combos)) { showToast('Không thể lưu combo vào bộ nhớ trình duyệt.', 'error'); return; }
    modal.dataset.editComboId = '';
    closeModal(); renderView(); showToast(editId ? 'Đã cập nhật combo.' : 'Đã thêm combo.', 'success');
  }

  function openUserForm(user) {
    const edit = !!user;
    modalContent.innerHTML = '<p class="eyebrow">Tài khoản Kat</p><h2 id="admin-modal-title">' + (edit ? "Sửa tài khoản" : "Thêm tài khoản") + '</h2><form id="user-form" class="form-stack admin-form"><label>Họ và tên<input name="fullname" autocomplete="name" required value="' + escapeHTML(user ? user.fullname : "") + '"></label><label>Số điện thoại đăng nhập<input name="phone" type="tel" autocomplete="tel" inputmode="tel" required pattern="[0-9+ .()-]{9,15}" value="' + escapeHTML(user ? user.phone : "") + '"></label><label>Email<input name="email" type="email" autocomplete="email" value="' + escapeHTML(user ? user.email || "" : "") + '"></label><label>Vai trò<select name="role"><option value="user"' + (!user || user.role !== "admin" ? " selected" : "") + '>Khách hàng</option><option value="admin"' + (user && user.role === "admin" ? " selected" : "") + '>Quản trị viên</option></select></label><label>Mật khẩu' + (edit ? ' <span class="optional-label">Để trống để giữ mật khẩu hiện tại</span>' : '') + '<input name="password" type="password" autocomplete="new-password" minlength="6"' + (edit ? "" : " required") + '></label><label>Địa chỉ đã lưu<input name="address" autocomplete="street-address" value="' + escapeHTML(user ? user.address || "" : "") + '"></label><div class="dialog-actions"><button class="button button-secondary" type="button" data-close-admin>Hủy</button><button class="button button-primary" type="submit">' + (edit ? "Lưu thay đổi" : "Tạo tài khoản") + '</button></div></form>';
    modal.dataset.editUserId = user ? user.id : "";
    showModal();
  }

  function showModal() { modal.hidden = false; modal.classList.add("is-open"); document.body.classList.add("modal-open"); modal.querySelector(".dialog").focus(); }
  function closeModal() { modal.hidden = true; modal.classList.remove("is-open"); document.body.classList.remove("modal-open"); modal.dataset.editId = ""; modal.dataset.editCode = ""; modal.dataset.editUserId = ""; modal.dataset.editComboId = ""; editingImage = ""; editingVariantImages = {}; variantImageReadPromises = {}; }
  function saveProduct(form) {
    const variantsText = form.elements.variants.value.trim();
    const variants = variantsText ? variantsText.split(/\r?\n/).map(function (line) {
      const parts = line.split("|");
      const name = String(parts[0] || "").trim();
      return { name: name, price: Number(String(parts[1] || "").trim()), image: editingVariantImages[variantImageKey(name)] || "" };
    }) : [];
    if (variants.some(function (variant) { return !variant.name || !Number.isFinite(variant.price) || variant.price <= 0; })) { showToast("Mỗi lựa chọn cần có tên và giá lớn hơn 0, theo mẫu tên | giá.", "error"); return; }
    const duplicateNames = variants.map(function (variant) { return variant.name.toLocaleLowerCase("vi"); });
    if (new Set(duplicateNames).size !== duplicateNames.length) { showToast("Tên lựa chọn trong cùng món không được trùng.", "error"); return; }
    const file = form.elements.imageFile.files[0];
    if (file && file.size >= 8 * 1024 * 1024) { showToast("Ảnh gốc phải nhỏ hơn 8 MB.", "error"); return; }
    const readImage = file ? compressProductImage(file) : Promise.resolve(editingImage);
    const pendingVariantImages = Object.keys(variantImageReadPromises).map(function (key) { return variantImageReadPromises[key]; });
    Promise.all([readImage].concat(pendingVariantImages)).then(function (imageResults) {
      let image = imageResults[0];
      variants.forEach(function (variant) {
        variant.image = editingVariantImages[variantImageKey(variant.name)] || variant.image || "";
      });
      if (!image && variants.length && variants[0].image) image = variants[0].image;
      if (!image) { showToast("Vui lòng chọn ảnh chính hoặc ảnh cho lựa chọn đầu tiên.", "error"); return; }
      const products = readStore("products") || [];
      const previousProducts = products.slice();
      const existing = form.dataset.editId && products.find(function (item) { return item.id === form.dataset.editId; });
      const lowestPrice = variants.length ? Math.min.apply(Math, variants.map(function (variant) { return variant.price; })) : Number(form.elements.price.value);
      const product = { id: existing ? existing.id : makeId("PROD"), name: form.elements.name.value.trim(), categoryId: form.elements.categoryId.value, categoryType: form.elements.categoryType.value, price: lowestPrice, originalPrice: Number(form.elements.originalPrice.value || 0), image: image, description: form.elements.description.value.trim(), rating: existing ? Number(existing.rating || 0) : 0, reviewsCount: existing ? Number(existing.reviewsCount || 0) : 0, status: existing ? existing.status : true, isVisible: existing ? existing.isVisible !== false : true, isHot: form.elements.isHot.checked, variants: variants, customization: form.elements.customization.value };
      if (existing) products[products.indexOf(existing)] = product; else products.unshift(product);
      const imageStorageSize = products.reduce(function (sum, item) {
        const images = [item.image].concat((item.variants || []).map(function (variant) { return variant.image; }));
        return sum + images.reduce(function (imageSum, value) { return imageSum + (String(value || "").startsWith("data:") ? String(value).length : 0); }, 0);
      }, 0);
      if (imageStorageSize > 2500000) { showToast("Tổng ảnh món và các lựa chọn vượt quá dung lượng lưu trữ. Hãy dùng ảnh nhỏ hơn.", "error"); return; }
      if (!writeStore("products", products)) { writeStore("products", previousProducts); showToast("Không lưu được món. Bộ nhớ trình duyệt có thể đã đầy; hãy dùng ảnh nhỏ hơn.", "error"); return; }
      closeModal(); renderView(); showToast(existing ? "Đã cập nhật món." : "Đã thêm món mới.", "success");
    }).catch(function () { showToast("Không đọc hoặc nén được ảnh. Hãy thử tệp nhỏ hơn.", "error"); });
  }

  function saveCategory(form) {
    const categories = readStore("categories") || [];
    const editId = modal.dataset.editId;
    const name = form.elements.name.value.trim();
    if (categories.some(function (item) { return item.name.toLowerCase() === name.toLowerCase() && item.id !== editId; })) { showToast("Tên danh mục đã tồn tại.", "error"); return; }
    if (editId) { const item = categories.find(function (category) { return category.id === editId; }); if (item) item.name = name; }
    else categories.push({ id: makeId("CAT"), name: name, icon: "mon-an" });
    writeStore("categories", categories); closeModal(); renderView(); showToast("Đã lưu danh mục.", "success");
  }

  function saveVoucher(form) {
    const vouchers = readStore("vouchers") || [];
    const editCode = modal.dataset.editCode;
    const code = form.elements.code.value.trim().toUpperCase();
    if (!editCode && vouchers.some(function (item) { return item.code.toUpperCase() === code; })) { showToast("Mã voucher đã tồn tại.", "error"); return; }
    if (form.elements.type.value === "percent" && Number(form.elements.value.value) > 100) { showToast("Phần trăm giảm giá không thể vượt quá 100%.", "error"); return; }
    const voucher = { code: code, name: form.elements.name.value.trim(), type: form.elements.type.value, value: Number(form.elements.value.value), maxDiscount: Number(form.elements.maxDiscount.value || 0), minOrder: Number(form.elements.minOrder.value || 0), description: form.elements.description.value.trim(), isActive: form.elements.isActive.checked, isPublic: form.elements.isPublic.checked };
    if (editCode) { const index = vouchers.findIndex(function (item) { return item.code === editCode; }); if (index >= 0) vouchers[index] = voucher; }
    else vouchers.push(voucher);
    writeStore("vouchers", vouchers); closeModal(); renderView(); showToast("Đã lưu voucher.", "success");
  }

  function saveUser(form) {
    const users = readStore("users") || [];
    const editId = modal.dataset.editUserId;
    const phone = form.elements.phone.value.trim();
    const phoneDigits = phone.replace(/\D/g, "");
    const email = form.elements.email.value.trim().toLocaleLowerCase("vi");
    const role = form.elements.role.value;
    if (phoneDigits.length < 9 || phoneDigits.length > 15) { showToast("Hãy nhập số điện thoại hợp lệ.", "error"); return; }
    if (users.some(function (user) { return phoneDigits && String(user.phone || "").replace(/\D/g, "") === phoneDigits && user.id !== editId; })) { showToast("Số điện thoại này đã được dùng cho tài khoản khác.", "error"); return; }
    if (email && users.some(function (user) { return String(user.email || "").toLocaleLowerCase("vi") === email && user.id !== editId; })) { showToast("Email này đã được dùng cho tài khoản khác.", "error"); return; }
    let user = editId ? users.find(function (item) { return item.id === editId; }) : null;
    if (editId && !user) { showToast("Không tìm thấy tài khoản cần sửa.", "error"); return; }
    if (!user) { user = { id: makeId("USR"), isActive: true }; users.push(user); }
    if (user.role === "admin" && role !== "admin" && users.filter(function (item) { return item.role === "admin" && item.isActive !== false; }).length <= 1) { showToast("Không thể đổi vai trò của quản trị viên hoạt động cuối cùng.", "error"); return; }
    user.fullname = form.elements.fullname.value.trim();
    user.phone = phone;
    user.email = email;
    user.username = phoneDigits;
    user.role = role;
    user.address = form.elements.address.value.trim();
    if (form.elements.password.value) user.password = form.elements.password.value;
    if (!writeStore("users", users)) { showToast("Không thể lưu tài khoản vào bộ nhớ trình duyệt.", "error"); return; }
    if (currentUser && currentUser.id === user.id) {
      currentUser.fullname = user.fullname; currentUser.phone = user.phone; currentUser.email = user.email; currentUser.address = user.address; currentUser.username = user.username; currentUser.role = user.role;
      writeStore("currentUser", currentUser);
    }
    closeModal(); renderView(); showToast(editId ? "Đã cập nhật tài khoản." : "Đã tạo tài khoản.", "success");
  }

  function toggleUserStatus(userId) {
    const users = readStore("users") || [];
    const user = users.find(function (item) { return item.id === userId; });
    if (!user) return;
    if (currentUser && currentUser.id === user.id) { showToast("Không thể khóa tài khoản đang đăng nhập.", "error"); return; }
    const nextActive = user.isActive === false;
    if (!nextActive && user.role === "admin" && users.filter(function (item) { return item.role === "admin" && item.isActive !== false; }).length <= 1) { showToast("Không thể khóa quản trị viên đang hoạt động cuối cùng.", "error"); return; }
    user.isActive = nextActive;
    writeStore("users", users); renderView(); showToast(nextActive ? "Đã mở khóa tài khoản." : "Đã khóa tài khoản.", "success");
  }

  function deleteById(key, idField, id, message, callback) {
    showConfirmModal(message, function () { const values = readStore(key) || []; writeStore(key, values.filter(function (item) { return item[idField] !== id; })); if (callback) callback(); renderView(); showToast("Đã xóa.", "success"); }, { title: "Xác nhận xóa", confirmText: "Xóa", danger: true });
  }

  addButton.addEventListener("click", function () {
    if (activeView === "products") openProductForm(null);
    if (activeView === "categories") openCategoryForm(null);
    if (activeView === "combos") openComboForm(null);
    if (activeView === "vouchers") openVoucherForm(null);
    if (activeView === "users") openUserForm(null);
  });
  document.querySelector(".admin-nav").addEventListener("click", function (event) { const button = event.target.closest("[data-admin-view]"); if (button) setView(button.dataset.adminView); });
  content.addEventListener("click", function (event) {
    const jump = event.target.closest("[data-jump]"); if (jump) { setView(jump.dataset.jump); return; }
    const addCategoryProduct = event.target.closest("[data-add-category-product]"); if (addCategoryProduct) { openProductForm(null); const categorySelect = modalContent.querySelector('[name="categoryId"]'); if (categorySelect) categorySelect.value = addCategoryProduct.dataset.addCategoryProduct; return; }
    const assignCategoryProduct = event.target.closest("[data-assign-category-product]"); if (assignCategoryProduct) { const categoryId = assignCategoryProduct.dataset.assignCategoryProduct; const select = content.querySelector('[data-category-product-select="' + categoryId + '"]'); const products = readStore("products") || []; const product = products.find(function (item) { return select && item.id === select.value; }); if (!product) { showToast("Chọn món cần thêm vào danh mục trước.", "error"); return; } product.categoryId = categoryId; writeStore("products", products); showToast("Đã thêm món vào danh mục.", "success"); return; }
    const removeProductCategory = event.target.closest("[data-remove-product-category]"); if (removeProductCategory) { const products = readStore("products") || []; const product = products.find(function (item) { return item.id === removeProductCategory.dataset.removeProductCategory; }); if (!product) return; product.categoryId = "cat_uncategorized"; writeStore("products", products); renderView(); showToast("Đã gỡ món khỏi danh mục. Bạn có thể phân loại lại trong mục Món ăn.", "success"); return; }
    const editProduct = event.target.closest("[data-edit-product]"); if (editProduct) { const product = (readStore("products") || []).find(function (item) { return item.id === editProduct.dataset.editProduct; }); if (product) openProductForm(product); return; }
    const toggleProduct = event.target.closest("[data-toggle-product]"); if (toggleProduct) { const products = readStore("products") || []; const product = products.find(function (item) { return item.id === toggleProduct.dataset.toggleProduct; }); product.status = !product.status; writeStore("products", products); renderView(); return; }
    const toggleVisibility = event.target.closest("[data-toggle-product-visibility]"); if (toggleVisibility) { const products = readStore("products") || []; const product = products.find(function (item) { return item.id === toggleVisibility.dataset.toggleProductVisibility; }); if (product) { product.isVisible = product.isVisible === false; writeStore("products", products); renderView(); } return; }
    const deleteProduct = event.target.closest("[data-delete-product]"); if (deleteProduct) { const id = deleteProduct.dataset.deleteProduct; const hasSales = (readStore("orders") || []).some(function (order) { return order.status !== "cancelled" && (order.items || []).some(function (item) { return item.productId === id; }); }); if (hasSales) { const products = readStore("products") || []; const product = products.find(function (item) { return item.id === id; }); if (product) { product.isVisible = false; writeStore("products", products); renderView(); showToast("Món đã có trong đơn hàng; món được ẩn khỏi cửa hàng và lịch sử đơn vẫn được giữ.", "info"); } return; } deleteById("products", "id", id, "Món chưa được bán. Xóa món này khỏi danh mục quản trị?", function () { const reviews = (readStore("reviews") || []).filter(function (review) { return review.productId !== id; }); writeStore("reviews", reviews); }); return; }
    const editCategory = event.target.closest("[data-edit-category]"); if (editCategory) { const item = (readStore("categories") || []).find(function (category) { return category.id === editCategory.dataset.editCategory; }); if (item) openCategoryForm(item); return; }
    const deleteCategory = event.target.closest("[data-delete-category]"); if (deleteCategory) { const id = deleteCategory.dataset.deleteCategory; if ((readStore("products") || []).some(function (product) { return product.categoryId === id; })) { showToast("Hãy chuyển món sang danh mục khác trước khi xóa.", "error"); return; } deleteById("categories", "id", id, "Danh mục này sẽ bị xóa khỏi thực đơn."); return; }
    const toggleCombo = event.target.closest("[data-toggle-combo]"); if (toggleCombo) { const combos = readStore("combos") || []; const combo = combos.find(function (item) { return item.id === toggleCombo.dataset.toggleCombo; }); if (!combo) return; combo.isActive = combo.isActive === false; writeStore("combos", combos); renderView(); return; }
    const editCombo = event.target.closest("[data-edit-combo]"); if (editCombo) { const combo = (readStore("combos") || []).find(function (item) { return item.id === editCombo.dataset.editCombo; }); if (combo) openComboForm(combo); return; }
    const deleteCombo = event.target.closest("[data-delete-combo]"); if (deleteCombo) { deleteById("combos", "id", deleteCombo.dataset.deleteCombo, "Combo này sẽ bị xóa khỏi ưu đãi."); return; }
    const toggleVoucher = event.target.closest("[data-toggle-voucher]"); if (toggleVoucher) { const vouchers = readStore("vouchers") || []; const item = vouchers.find(function (voucher) { return voucher.code === toggleVoucher.dataset.toggleVoucher; }); item.isActive = !item.isActive; writeStore("vouchers", vouchers); renderView(); return; }
    const toggleVoucherVisibility = event.target.closest("[data-toggle-voucher-visibility]"); if (toggleVoucherVisibility) { const vouchers = readStore("vouchers") || []; const item = vouchers.find(function (voucher) { return voucher.code === toggleVoucherVisibility.dataset.toggleVoucherVisibility; }); if (!item) return; item.isPublic = item.isPublic === false; writeStore("vouchers", vouchers); renderView(); return; }
    const editVoucher = event.target.closest("[data-edit-voucher]"); if (editVoucher) { const item = (readStore("vouchers") || []).find(function (voucher) { return voucher.code === editVoucher.dataset.editVoucher; }); if (item) openVoucherForm(item); return; }
    const deleteVoucher = event.target.closest("[data-delete-voucher]"); if (deleteVoucher) { deleteById("vouchers", "code", deleteVoucher.dataset.deleteVoucher, "Voucher này sẽ bị xóa."); return; }
    const toggleReview = event.target.closest("[data-toggle-review]"); if (toggleReview) { const reviews = readStore("reviews") || []; const review = reviews.find(function (item) { return item.id === toggleReview.dataset.toggleReview; }); review.isHidden = !review.isHidden; writeStore("reviews", reviews); recomputeRating(review.productId); renderView(); return; }
    const deleteReview = event.target.closest("[data-delete-review]"); if (deleteReview) { const reviews = readStore("reviews") || []; const review = reviews.find(function (item) { return item.id === deleteReview.dataset.deleteReview; }); deleteById("reviews", "id", review.id, "Đánh giá này sẽ bị xóa vĩnh viễn.", function () { recomputeRating(review.productId); }); }
    const deleteFeedback = event.target.closest("[data-delete-feedback]"); if (deleteFeedback) { deleteById("feedback", "id", deleteFeedback.dataset.deleteFeedback, "Góp ý này sẽ bị xóa."); return; }
    const editUser = event.target.closest("[data-edit-user]"); if (editUser) { const user = (readStore("users") || []).find(function (item) { return item.id === editUser.dataset.editUser; }); if (user) openUserForm(user); return; }
    const toggleUser = event.target.closest("[data-toggle-user]"); if (toggleUser) { toggleUserStatus(toggleUser.dataset.toggleUser); return; }
  });
  content.addEventListener("change", function (event) {
    const filter = event.target.dataset.orderFilter;
    if (filter) { applyOrderFilter(event.target); return; }
    const reportDate = event.target.dataset.reportDate;
    if (reportDate) { reportDateRange[reportDate] = event.target.value; renderView(); return; }
    if (event.target.matches("[data-order-status]")) {
      const orders = readStore("orders") || []; const order = orders.find(function (item) { return item.orderId === event.target.dataset.orderStatus; });
      if (!order) return;
      const currentIndex = statusOrder.indexOf(order.status); const nextIndex = statusOrder.indexOf(event.target.value);
      const canAdvance = order.status === "cancelled" || order.status === "completed" ? false : (event.target.value === "cancelled" ? currentIndex >= 0 && currentIndex < 3 : nextIndex > currentIndex);
      if (!canAdvance) { showToast("Trạng thái đơn chỉ được chuyển tiếp; đơn đã hoàn thành hoặc hủy không thể đổi.", "error"); renderView(); return; }
      order.status = event.target.value; writeStore("orders", orders); showToast("Đã cập nhật trạng thái đơn.", "success"); renderView();
    }
  });
  content.addEventListener("input", function (event) {
    if (event.target.dataset.orderFilter === "location" || event.target.dataset.orderFilter === "from" || event.target.dataset.orderFilter === "to") applyOrderFilter(event.target);
  });
  content.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && event.target.dataset.orderFilter === "location") { event.preventDefault(); applyOrderFilter(event.target); }
  });
  modal.addEventListener("input", function (event) {
    if (event.target.name === "variants") { renderVariantImageFields(event.target.form); return; }
    if (event.target.name !== "imageFile") return;
    const file = event.target.files[0]; if (!file) return;
    if (!file.type.startsWith("image/")) { showToast("Vui lòng chọn tệp ảnh.", "error"); event.target.value = ""; return; }
    if (file.size >= 8 * 1024 * 1024) { showToast("Ảnh gốc phải nhỏ hơn 8 MB.", "error"); event.target.value = ""; return; }
    const reader = new FileReader(); reader.onload = function () { editingImage = reader.result; document.getElementById("image-preview").src = reader.result; document.getElementById("image-preview-wrap").hidden = false; }; reader.readAsDataURL(file);
  });
  modal.addEventListener("change", function (event) {
    const input = event.target.closest("[data-variant-image-input]");
    if (!input) return;
    const file = input.files[0]; if (!file) return;
    if (!file.type.startsWith("image/")) { showToast("Vui lòng chọn tệp ảnh.", "error"); input.value = ""; return; }
    if (file.size >= 8 * 1024 * 1024) { showToast("Ảnh gốc phải nhỏ hơn 8 MB.", "error"); input.value = ""; return; }
    const name = input.dataset.variantImageName;
    const key = variantImageKey(name);
    let promise;
    promise = compressProductImage(file).then(function (image) {
      if (variantImageReadPromises[key] === promise) {
        editingVariantImages[key] = image;
        const row = input.closest(".variant-image-row");
        const preview = row && row.querySelector("[data-variant-image-preview]");
        const previewWrap = row && row.querySelector("[data-variant-image-preview-wrap]");
        if (preview && previewWrap) { preview.src = image; preview.alt = "Ảnh xem trước: " + name; previewWrap.hidden = false; }
      }
      return image;
    }).catch(function () {
      if (variantImageReadPromises[key] === promise) delete variantImageReadPromises[key];
      showToast("Không đọc hoặc nén được ảnh lựa chọn. Hãy thử tệp nhỏ hơn.", "error");
      return null;
    });
    variantImageReadPromises[key] = promise;
  });
  modal.addEventListener("submit", function (event) {
    event.preventDefault();
    if (event.target.id === "product-form") saveProduct(event.target);
    if (event.target.id === "category-form") saveCategory(event.target);
    if (event.target.id === "combo-form") saveCombo(event.target);
    if (event.target.id === "voucher-form") saveVoucher(event.target);
    if (event.target.id === "user-form") saveUser(event.target);
  });
  modal.addEventListener("click", function (event) { if (event.target === modal || event.target.closest("[data-close-admin]") || event.target.closest("[data-close-modal]")) closeModal(); });
  modal.addEventListener("keydown", function (event) { if (event.key === "Escape") closeModal(); });
  window.addEventListener("kat:storage", function () { renderView(); });

  function recomputeRating(productId) {
    const products = readStore("products") || [];
    const product = products.find(function (item) { return item.id === productId; }); if (!product) return;
    const visible = (readStore("reviews") || []).filter(function (review) { return review.productId === productId && !review.isHidden; });
    product.reviewsCount = visible.length; product.rating = visible.length ? visible.reduce(function (sum, review) { return sum + Number(review.rating); }, 0) / visible.length : 0;
    writeStore("products", products);
  }

  setView("overview");
})();
