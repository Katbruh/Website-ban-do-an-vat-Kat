(function () {
  "use strict";

  const statusClasses = ["status-pending", "status-preparing", "status-shipping", "status-completed", "status-cancelled"];
  function toast(message, tone) {
    if (typeof window.showToast === "function") window.showToast(message, tone || "info");
  }

  function pageEntity() {
    const path = window.location.pathname.toLowerCase();
    if (path.includes("admin-products")) return "món ăn";
    if (path.includes("admin-categories")) return "danh mục";
    if (path.includes("admin-combos")) return "combo";
    if (path.includes("admin-vouchers")) return "voucher";
    if (path.includes("admin-reviews")) return "đánh giá";
    if (path.includes("admin-feedback")) return "góp ý";
    if (path.includes("admin-users")) return "tài khoản";
    if (path.includes("admin-orders")) return "đơn hàng";
    return "thống kê";
  }

  function itemContainer(action) {
    return action.closest("tr, .category-admin-card, .voucher-admin-card, .review-admin-card");
  }

  function itemName(container) {
    if (!container) return "";
    const title = container.querySelector(".table-product strong, h2, .review-admin-head strong, td strong");
    if (title) return title.textContent.trim();
    if (container.matches("tr")) {
      const table = container.closest("table");
      if (table && table.classList.contains("admin-users-table") && container.cells[1]) return container.cells[1].textContent.trim();
    }
    return "";
  }

  function actionKey(container, entity) {
    return "katAdminAction_" + window.location.pathname + "_" + entity + "_" + itemName(container);
  }

  function statusBadge(container) {
    return container && container.querySelector(".status-badge");
  }

  function setVisibility(container, entity, isVisible) {
    if (!container) return;
    container.querySelectorAll(".status-badge").forEach(function (badge) {
      badge.textContent = isVisible ? (entity === "món ăn" ? "Đang bán" : entity === "voucher" ? "Đang bật" : "Đang hiển thị") : "Đã ẩn";
      badge.classList.remove.apply(badge.classList, statusClasses);
      badge.classList.add(isVisible ? "status-completed" : "status-cancelled");
    });
    const toggle = container.querySelector('[data-demo-action][data-admin-toggle]');
    if (toggle) toggle.setAttribute("aria-pressed", isVisible ? "false" : "true");
    container.classList.toggle("admin-item-hidden", !isVisible);
  }

  function initialVisibility(container) {
    const badge = statusBadge(container);
    if (!badge) return true;
    return !/ẩn|khóa|ngừng/i.test(badge.textContent);
  }

  function restoreActionStates() {
    document.querySelectorAll('[data-demo-action]').forEach(function (action) {
      const label = action.textContent.trim().toLowerCase();
      const container = itemContainer(action);
      if (!container) return;
      if (label === "ẩn/hiện") {
        action.dataset.adminToggle = "";
        const entity = pageEntity();
        if (entity === "đánh giá" && !statusBadge(container)) {
          const actions = container.querySelector(".table-actions");
          if (actions) {
            const badge = document.createElement("span");
            badge.className = "status-badge status-completed";
            badge.textContent = "Đang hiển thị";
            actions.prepend(badge);
          }
        }
        const key = actionKey(container, entity);
        try {
          const saved = window.localStorage.getItem(key);
          if (saved !== null) setVisibility(container, entity, saved === "true");
        } catch (error) {}
      }
      if (label === "khóa/mở khóa") {
        action.dataset.adminLockToggle = "";
        const key = actionKey(container, "account-lock");
        try {
          const saved = window.localStorage.getItem(key);
          const badge = statusBadge(container);
          if (saved !== null && badge) {
            const active = saved === "true";
            badge.textContent = active ? "Đang hoạt động" : "Đã khóa";
            badge.classList.remove.apply(badge.classList, statusClasses);
            badge.classList.add(active ? "status-completed" : "status-cancelled");
          }
        } catch (error) {}
      }
    });
  }

  function addCategoryVisibilityControls() {
    if (!window.location.pathname.toLowerCase().includes("admin-categories")) return;
    document.querySelectorAll(".category-admin-card").forEach(function (card) {
      const titleBlock = card.querySelector(".category-admin-card > div:first-child > div");
      const actions = card.querySelector(".table-actions");
      if (!titleBlock || !actions || actions.querySelector('[data-admin-toggle]')) return;
      const badge = document.createElement("span");
      badge.className = "status-badge status-completed";
      badge.textContent = "Đang hiển thị";
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

  function applySavedProductOptions() {
    if (!window.location.pathname.toLowerCase().includes("admin-products")) return;
    try {
      const saved = JSON.parse(window.localStorage.getItem("katAdminProductOptions_banh-trang") || "null");
      if (!saved) return;
      const row = document.querySelector('.admin-products-table tbody tr[data-product-id="banh-trang"]');
      if (!row) return;
      const title = row.querySelector(".table-product strong");
      const image = row.querySelector(".table-product img");
      const category = row.querySelector("td:nth-child(2)");
      const priceCell = row.querySelector("td:nth-child(3)");
      const price = priceCell && priceCell.querySelector("strong");
      if (title) title.textContent = saved.name || "Bánh tráng";
      if (category) category.textContent = saved.category || "Bánh tráng & món trộn";
      row.dataset.productType = saved.productType || "food";
      if (image) {
        if (saved.image) {
          image.src = saved.image.startsWith("data:") ? saved.image : "../" + saved.image.replace(/^\.\.\//, "");
          image.alt = saved.name || "Bánh tráng";
        } else {
          image.removeAttribute("src");
          image.alt = "";
        }
      }
      if (!price || !priceCell) return;
      const prices = (saved.hasVariants && Array.isArray(saved.variants) ? saved.variants : [])
        .map(function (variant) { return Number(variant.price); })
        .filter(function (value) { return Number.isFinite(value) && value >= 0; });
      const formatter = new Intl.NumberFormat("vi-VN");
      if (prices.length) {
        const lowest = Math.min.apply(Math, prices);
        const highest = Math.max.apply(Math, prices);
        price.textContent = formatter.format(lowest) + "đ" + (lowest === highest ? "" : "–" + formatter.format(highest) + "đ");
      } else {
        price.textContent = formatter.format(Number(saved.sellingPrice) || 0) + "đ";
      }
      const choiceButton = priceCell.querySelector(".admin-choice-button");
      if (choiceButton) {
        if (prices.length) {
          choiceButton.textContent = prices.length + " lựa chọn";
          choiceButton.hidden = false;
        } else {
          choiceButton.hidden = true;
        }
      }
      let originalPrice = priceCell.querySelector("[data-original-price]");
      if (Number(saved.originalPrice) > 0) {
        if (!originalPrice) {
          originalPrice = document.createElement("small");
          originalPrice.dataset.originalPrice = "";
          const del = document.createElement("del");
          originalPrice.appendChild(del);
          const priceCopy = priceCell.querySelector(".admin-product-price-copy");
          if (priceCopy) priceCopy.appendChild(originalPrice);
          else priceCell.insertBefore(originalPrice, choiceButton || null);
        }
        originalPrice.querySelector("del").textContent = formatter.format(Number(saved.originalPrice)) + "đ";
      } else if (originalPrice) {
        originalPrice.remove();
      }
    } catch (error) {}
  }

  function appendAddedProducts() {
    if (!window.location.pathname.toLowerCase().includes("admin-products")) return;
    const tbody = document.querySelector(".admin-products-table tbody");
    if (!tbody) return;
    let products = [];
    try {
      const stored = JSON.parse(window.localStorage.getItem("katAdminAddedProducts") || "[]");
      products = Array.isArray(stored) ? stored : [];
    } catch (error) { return; }
    const formatter = new Intl.NumberFormat("vi-VN");
    products.forEach(function (product) {
      if (!product || !product.id || Array.from(tbody.querySelectorAll("[data-product-id]")).some(function (row) { return row.dataset.productId === product.id; })) return;
      const row = document.createElement("tr");
      row.dataset.productId = product.id;

      const productCell = document.createElement("td");
      const productWrap = document.createElement("div");
      productWrap.className = "table-product";
      const image = document.createElement("img");
      image.alt = product.name || "";
      image.loading = "lazy";
      image.hidden = !product.image;
      if (product.image) image.src = product.image.startsWith("data:") ? product.image : "../" + product.image.replace(/^\.\.\//, "");
      const name = document.createElement("strong");
      name.textContent = product.name || "Món mới";
      productWrap.append(image, name);
      productCell.appendChild(productWrap);

      const categoryCell = document.createElement("td");
      categoryCell.textContent = product.category || "";

      const priceCell = document.createElement("td");
      const price = document.createElement("strong");
      const prices = product.hasVariants && Array.isArray(product.variants) ? product.variants.map(function (variant) { return Number(variant.price); }).filter(function (value) { return Number.isFinite(value) && value >= 0; }) : [];
      if (prices.length) {
        const low = Math.min.apply(Math, prices);
        const high = Math.max.apply(Math, prices);
        price.textContent = formatter.format(low) + "đ" + (low === high ? "" : "–" + formatter.format(high) + "đ");
      } else {
        price.textContent = formatter.format(Number(product.sellingPrice) || 0) + "đ";
      }
      priceCell.appendChild(price);
      if (Number(product.originalPrice) > 0) {
        const original = document.createElement("small");
        const del = document.createElement("del");
        del.textContent = formatter.format(Number(product.originalPrice)) + "đ";
        original.appendChild(del);
        priceCell.appendChild(original);
      }
      if (prices.length) {
        const choices = document.createElement("button");
        choices.type = "button";
        choices.className = "text-button admin-choice-button";
        choices.dataset.demoAction = "";
        choices.dataset.message = "Đã hiển thị các lựa chọn.";
        choices.textContent = prices.length + " lựa chọn";
        priceCell.appendChild(choices);
      }

      const statusCell = document.createElement("td");
      const badge = document.createElement("span");
      badge.className = "status-badge status-completed";
      badge.textContent = "Đang bán";
      statusCell.appendChild(badge);

      const actionsCell = document.createElement("td");
      const actions = document.createElement("div");
      actions.className = "table-actions";
      ["Ẩn/Hiện", "Sửa", "Xóa"].forEach(function (label) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "text-button" + (label === "Xóa" ? " danger-link" : "");
        button.dataset.demoAction = "";
        button.textContent = label;
        actions.appendChild(button);
      });
      actionsCell.appendChild(actions);
      row.append(productCell, categoryCell, priceCell, statusCell, actionsCell);
      tbody.appendChild(row);
    });
    const count = document.querySelector("[data-product-count]");
    if (count) {
      const baseCount = Number(count.dataset.baseCount) || 0;
      count.textContent = "Danh mục · " + (baseCount + products.length) + " món";
    }
  }

  function applySavedOrderStatuses() {
    document.querySelectorAll("tr, .customer-order-entry").forEach(function (container) {
      const id = container.querySelector("td:first-child strong, h3");
      if (!id || !/^KAT-\d{6}-\d{3}$/.test(id.textContent.trim())) return;
      const badge = container.querySelector(".status-badge");
      if (!badge) return;
      let status;
      try { status = window.localStorage.getItem("katAdminOrderStatus_" + id.textContent.trim()); } catch (error) { return; }
      if (!status) return;
      badge.textContent = status;
      badge.classList.remove.apply(badge.classList, statusClasses);
      const statusClass = {
        "Chờ xác nhận": "status-pending",
        "Đang chuẩn bị": "status-preparing",
        "Đang giao": "status-shipping",
        "Hoàn thành": "status-completed"
      }[status];
      if (statusClass) badge.classList.add(statusClass);
    });
  }

  function alignProductChoiceButtons() {
    document.querySelectorAll(".admin-products-table tbody tr").forEach(function (row) {
      const priceCell = row.querySelector("td:nth-child(3)");
      const choiceButton = priceCell && priceCell.querySelector(".admin-choice-button");
      const price = priceCell && priceCell.querySelector("strong");
      if (!priceCell || !choiceButton || !price || priceCell.querySelector(".admin-product-price-layout")) return;

      const layout = document.createElement("div");
      layout.className = "admin-product-price-layout";
      const priceCopy = document.createElement("div");
      priceCopy.className = "admin-product-price-copy";
      const originalPrice = priceCell.querySelector("small");
      priceCell.insertBefore(layout, priceCell.firstChild);
      layout.appendChild(priceCopy);
      priceCopy.appendChild(price);
      if (originalPrice) priceCopy.appendChild(originalPrice);
      layout.appendChild(choiceButton);
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
    if (/thêm combo/i.test(label)) return "Đã thêm combo mới.";
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

  document.addEventListener("submit", function (event) {
    const form = event.target.closest("[data-demo-form]");
    if (!form) return;
    event.preventDefault();
    toast(form.classList.contains("admin-order-filter") ? "Đã áp dụng bộ lọc đơn hàng." : "Đã lưu thay đổi.", "success");
  });

  document.addEventListener("click", function (event) {
    const action = event.target.closest("[data-demo-action]");
    if (!action) return;
    const label = action.textContent.trim().replace(/\s+/g, " ");
    const entity = pageEntity();
    const container = itemContainer(action);
    const name = itemName(container);

    if (label.toLowerCase() === "ẩn/hiện" && container) {
      event.preventDefault();
      const key = actionKey(container, entity);
      let visible = initialVisibility(container);
      try {
        const saved = window.localStorage.getItem(key);
        if (saved !== null) visible = saved === "true";
      } catch (error) {}
      visible = !visible;
      try { window.localStorage.setItem(key, String(visible)); } catch (error) {}
      setVisibility(container, entity, visible);
      toast("Đã " + (visible ? "hiện " : "ẩn ") + entity + (name ? " “" + name + "”" : "") + ".", "success");
      return;
    }

    if (label.toLowerCase() === "khóa/mở khóa" && container) {
      event.preventDefault();
      const badge = statusBadge(container);
      const key = actionKey(container, "account-lock");
      let active = !badge || !/khóa/i.test(badge.textContent);
      try {
        const saved = window.localStorage.getItem(key);
        if (saved !== null) active = saved === "true";
      } catch (error) {}
      active = !active;
      try { window.localStorage.setItem(key, String(active)); } catch (error) {}
      if (badge) {
        badge.textContent = active ? "Đang hoạt động" : "Đã khóa";
        badge.classList.remove.apply(badge.classList, statusClasses);
        badge.classList.add(active ? "status-completed" : "status-cancelled");
      }
      toast("Đã " + (active ? "mở khóa" : "khóa") + " tài khoản" + (name ? " “" + name + "”" : "") + ".", "success");
      return;
    }

    if (/^xóa/.test(label.toLowerCase())) {
      event.preventDefault();
      toast("Đã xóa " + entity + (name ? " “" + name + "”" : "") + ".", "error");
      return;
    }

    if (action.matches(".admin-choice-button") && window.location.pathname.toLowerCase().includes("admin-products")) {
      event.preventDefault();
      const productId = action.closest("tr") && action.closest("tr").dataset.productId;
      window.location.href = productId && productId !== "banh-trang" ? "admin-product-edit.html?productId=" + encodeURIComponent(productId) : "admin-product-edit.html";
      return;
    }

    if (/^sửa món$|^sửa$/.test(label.toLowerCase()) && window.location.pathname.toLowerCase().includes("admin-products")) {
      event.preventDefault();
      const productId = action.closest("tr") && action.closest("tr").dataset.productId;
      window.location.href = productId && productId !== "banh-trang" ? "admin-product-edit.html?productId=" + encodeURIComponent(productId) : "admin-product-edit.html";
      return;
    }

    if (/^thêm món$/i.test(label) && window.location.pathname.toLowerCase().includes("admin-products")) {
      event.preventDefault();
      window.location.href = "admin-product-add.html";
      return;
    }

    const adminPath = window.location.pathname.toLowerCase();
    if (/^thêm combo$/i.test(label) && adminPath.includes("admin-combos")) {
      event.preventDefault();
      window.location.href = "admin-combo-add.html";
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
    appendAddedProducts();
    alignProductChoiceButtons();
    restoreActionStates();
    applySavedProductOptions();
    applySavedOrderStatuses();
    try {
      const flash = window.sessionStorage.getItem("katAdminFlash");
      if (flash) {
        window.sessionStorage.removeItem("katAdminFlash");
        toast(flash, "success");
      }
    } catch (error) {}
  });
})();
