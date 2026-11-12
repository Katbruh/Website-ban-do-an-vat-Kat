/* ============================================================
   QUẢN TRỊ: điều hướng, thao tác mẫu, form thêm/sửa và đăng nhập
   ============================================================ */
(function () {
  "use strict";

  function toast(message, tone) {
    if (typeof window.showToast === "function") window.showToast(message, tone || "info");
  }

  function pageEntity() {
    const path = window.location.pathname.toLowerCase();
    if (path.includes("admin-products")) return "món ăn";
    if (path.includes("admin-categories")) return "danh mục";
    if (path.includes("admin-vouchers")) return "voucher";
    if (path.includes("admin-reviews")) return "đánh giá";
    if (path.includes("admin-feedback")) return "góp ý";
    if (path.includes("admin-users")) return "khách hàng";
    if (path.includes("admin-orders")) return "đơn hàng";
    return "thống kê";
  }

  function itemContainer(action) {
    return action.closest("tr, .category-admin-card, .voucher-admin-card, .review-admin-card");
  }

  function itemName(container) {
    if (!container) return "";
    const title = container.querySelector(".voucher-admin-top > strong, .table-product strong, h2, .review-admin-head strong, td strong");
    if (title) return title.textContent.trim();
    if (container.matches("tr")) {
      const table = container.closest("table");
      if (table && table.classList.contains("admin-users-table") && container.cells[1]) return container.cells[1].textContent.trim();
    }
    return "";
  }

  function addCategoryVisibilityControls() {
    if (!window.location.pathname.toLowerCase().includes("admin-categories")) return;
    document.querySelectorAll(".category-admin-card").forEach(function (card) {
      const titleBlock = card.querySelector(".category-admin-card > div:first-child > div");
      const actions = card.querySelector(".table-actions");
      if (!titleBlock || !actions || actions.querySelector('[data-admin-toggle]')) return;
      const isHidden = card.dataset.initialHidden === "true";
      const badge = document.createElement("span");
      badge.className = "status-badge " + (isHidden ? "status-cancelled" : "status-completed");
      badge.textContent = isHidden ? "Đã ẩn" : "Đang hiển thị";
      titleBlock.appendChild(badge);
      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "text-button";
      toggle.dataset.demoAction = "";
      toggle.dataset.adminToggle = "";
      toggle.textContent = "Ẩn/Hiện";
      actions.prepend(toggle);
    });
  }

  function contextualMessage(action) {
    const message = action.dataset.message;
    if (message && !/đã bấm nút/i.test(message)) return message;

    const label = action.textContent.trim().replace(/\s+/g, " ");
    const entity = pageEntity();
    const container = itemContainer(action);
    const name = itemName(container);
    if (/^\d+$/.test(label)) return "Đã chuyển đến trang " + label + " của danh sách " + entity + ".";
    if (/trước|sau/i.test(label)) return "Đã chuyển trang danh sách " + entity + ".";
    if (/xem thống kê/i.test(label)) return "Đã hiển thị thống kê theo khoảng ngày đã chọn.";
    if (/thêm voucher/i.test(label)) return "Đã thêm voucher mới.";
    if (/thêm tài khoản/i.test(label)) return "Đã thêm tài khoản mới.";
    if (/sửa tài khoản/i.test(label)) return "Đã cập nhật tài khoản.";
    if (/thêm món/i.test(label)) return "Đã thêm món ăn mới.";
    if (/xóa/i.test(label)) return "Đã xóa " + entity + (name ? " “" + name + "”" : "") + ".";
    if (/sửa/i.test(label)) return "Đã cập nhật " + entity + (name ? " “" + name + "”" : "") + ".";
    if (/xem đơn hàng/i.test(label)) return "Đã xem chi tiết đơn hàng.";
    if (/thêm/i.test(label)) return "Đã thêm " + entity + (name ? " “" + name + "”" : "") + ".";
    if (/xem/i.test(label)) return "Đã xem " + entity + (name ? " “" + name + "”" : "") + ".";
    return "Đã " + label.toLowerCase() + (entity ? " " + entity : "") + (name ? " “" + name + "”" : "") + ".";
  }

  function statusActionMessage(action, label) {
    const container = itemContainer(action);
    const badge = container && container.querySelector(".status-badge");
    const status = badge ? badge.textContent.trim().toLowerCase() : "";
    const name = itemName(container);
    const suffix = name ? " “" + name + "”" : "";

    if (label.toLowerCase() === "ẩn/hiện") {
      const isHidden = /đã ẩn|đã khóa/.test(status);
      const entity = pageEntity();
      if (entity === "voucher") return "Đã " + (isHidden ? "bật" : "tắt") + " voucher" + suffix + ".";
      return "Đã " + (isHidden ? "hiện" : "ẩn") + " " + entity + suffix + ".";
    }

    const isLocked = /đã khóa/.test(status);
    return "Đã " + (isLocked ? "mở khóa" : "khóa") + " " + pageEntity() + suffix + ".";
  }

  document.addEventListener("submit", function (event) {
    const form = event.target.closest("[data-demo-form]");
    if (!form) return;
    event.preventDefault();
    toast(form.classList.contains("admin-order-filter") ? "Đã áp dụng bộ lọc đơn hàng." : "Đã lưu thay đổi.", "success");
  });

  document.addEventListener("click", function (event) {
    const resetButton = event.target.closest("[data-admin-reset-message]");
    if (resetButton) {
      const form = resetButton.closest("form");
      if (form) form.reset();
      toast(resetButton.dataset.adminResetMessage || "Đã đặt lại các điều kiện lọc.", "info");
      return;
    }

    const action = event.target.closest("[data-demo-action]");
    if (!action) return;
    const label = action.textContent.trim().replace(/\s+/g, " ");
    const entity = pageEntity();
    const container = itemContainer(action);
    const name = itemName(container);

    if (label.toLowerCase() === "ẩn/hiện") {
      event.preventDefault();
      toast(statusActionMessage(action, label), "info");
      return;
    }

    if (label.toLowerCase() === "khóa/mở khóa") {
      event.preventDefault();
      toast(statusActionMessage(action, label), "info");
      return;
    }

    if (/^xóa/.test(label.toLowerCase())) {
      event.preventDefault();
      toast("Đã xóa " + entity + (name ? " “" + name + "”" : "") + ".", "error");
      return;
    }

    if (window.KatAdminProductList && window.KatAdminProductList.handleAction(event, action)) return;

    const adminPath = window.location.pathname.toLowerCase();
    if (/^sửa$/i.test(label) && adminPath.includes("admin-categories")) {
      event.preventDefault();
      window.location.href = "admin-category-edit.html";
      return;
    }
    if (/^sửa$/i.test(label) && adminPath.includes("admin-vouchers")) {
      event.preventDefault();
      window.location.href = "admin-voucher-edit.html";
      return;
    }
    if (/^thêm voucher$/i.test(label) && adminPath.includes("admin-vouchers")) {
      event.preventDefault();
      window.location.href = "admin-voucher-add.html";
      return;
    }
    if (/^thêm tài khoản$/i.test(label) && adminPath.includes("admin-users")) {
      event.preventDefault();
      window.location.href = "admin-account-add.html";
      return;
    }
    if (/thêm danh mục/i.test(label) && window.location.pathname.toLowerCase().includes("admin-categories")) {
      event.preventDefault();
      window.location.href = "admin-category-add.html";
      return;
    }

    if (/xem đơn hàng/i.test(label)) {
      event.preventDefault();
      window.location.href = "order-detail.html?id=KAT-061126-004";
      return;
    }

    toast(contextualMessage(action), "info");
  });

  document.addEventListener("change", function (event) {
    const field = event.target.closest("[data-demo-change-message]");
    if (!field) return;
    const message = field.dataset.demoChangeMessage;
    if (message && !/đã bấm nút/i.test(message)) toast(message, "info");
  });

  document.addEventListener("DOMContentLoaded", function () {
    addCategoryVisibilityControls();
    if (window.KatAdminProductList) window.KatAdminProductList.initialize();
    try {
      const flash = window.sessionStorage.getItem("katAdminFlash");
      if (flash) {
        window.sessionStorage.removeItem("katAdminFlash");
        toast(flash, "success");
      }
    } catch (error) {}
  });
})();

/* ---------- Form thêm/sửa voucher và tài khoản ---------- */
(function () {
  "use strict";

  document.querySelectorAll("[data-admin-add-form]").forEach(function (form) {
    const discountType = form.querySelector("[data-voucher-discount-type]");
    if (discountType) {
      function updateDiscountFields() {
        const label = form.querySelector("[data-voucher-discount-label]");
        const amount = form.querySelector("[data-voucher-discount-value]");
        const capField = form.querySelector("[data-voucher-cap-field]");
        const configs = {
          fixed: { label: "Số tiền giảm (đ)", type: "text", inputMode: "numeric", placeholder: "Ví dụ: 20.000", step: "", max: "", showCap: false },
          percent: { label: "Mức giảm (%)", type: "number", inputMode: "numeric", placeholder: "Ví dụ: 10", step: "1", max: "100", showCap: true },
          shipping: { label: "Mức giảm phí ship tối đa (đ)", type: "text", inputMode: "numeric", placeholder: "Ví dụ: 15.000", step: "", max: "", showCap: false }
        };
        const config = configs[discountType.value];
        if (!config) return;
        if (label) label.textContent = config.label;
        if (capField) {
          capField.hidden = !config.showCap;
          const capInput = capField.querySelector("input");
          if (capInput) capInput.required = config.showCap;
        }
        if (amount) {
          amount.type = config.type;
          amount.inputMode = config.inputMode;
          amount.placeholder = config.placeholder;
          if (config.step) amount.step = config.step;
          else amount.removeAttribute("step");
          if (config.type === "number") amount.min = "1";
          else amount.removeAttribute("min");
          if (config.max) amount.max = config.max;
          else amount.removeAttribute("max");
        }
      }

      discountType.addEventListener("change", updateDiscountFields);
      updateDiscountFields();
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const name = form.querySelector('[name="name"]');
      const code = form.querySelector('[name="code"]');
      const identity = code && code.value.trim() ? code.value.trim().toUpperCase() : name && name.value.trim();
      const kind = form.dataset.addKind || "mục";
      const message = form.dataset.formMode === "edit"
        ? "Đã lưu thay đổi."
        : kind === "voucher"
          ? "Đã thêm voucher thành công."
          : "Đã thêm " + kind + (identity ? " “" + identity + "”" : "") + " thành công.";
      try { window.sessionStorage.setItem("katAdminFlash", message); } catch (error) {}
      window.location.href = form.dataset.returnTo;
    });
  });
})();

/* ---------- Form thêm/sửa danh mục ---------- */
(function () {
  "use strict";
  const form = document.querySelector("[data-category-form], [data-category-edit-form]");
  if (!form) return;
  const isEdit = form.hasAttribute("data-category-edit-form");

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    try {
      window.sessionStorage.setItem("katAdminFlash", isEdit ? "Đã lưu thay đổi." : "Đã thêm danh mục thành công.");
    } catch (error) {}
    window.location.href = form.dataset.returnTo || "admin-categories.html";
  });
})();

/* ---------- Đăng nhập quản trị ---------- */
(function () {
  const form = document.getElementById("admin-login-form");
  if (!form) return;
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const values = new FormData(form);
    if (window.KatAccount) window.KatAccount.setSession({
      role: "admin",
      fullName: "Quản trị viên",
      phone: String(values.get("phone") || "").trim(),
      email: ""
    });
    window.location.replace("admin.html");
  });
})();