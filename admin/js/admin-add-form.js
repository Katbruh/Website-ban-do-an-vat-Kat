(function () {
  "use strict";

  document.querySelectorAll("[data-admin-add-form]").forEach(function (form) {
    const comboProducts = Array.from(form.querySelectorAll("[data-combo-product]"));
    const originalPrice = form.querySelector("[data-combo-original-price]");
    const comboSearch = form.querySelector("[data-combo-search]");
    const selectionCount = form.querySelector("[data-combo-selection-count]");
    const money = new Intl.NumberFormat("vi-VN");

    function updateComboPrice() {
      if (!originalPrice) return;
      const selectedProducts = comboProducts.filter(function (checkbox) { return checkbox.checked; });
      const total = selectedProducts.reduce(function (sum, checkbox) {
        const row = checkbox.closest("[data-combo-item]");
        const quantity = row && row.querySelector("[data-combo-quantity]");
        return sum + Number(checkbox.dataset.price || 0) * Math.max(1, Number(quantity && quantity.value) || 1);
      }, 0);
      if (originalPrice) originalPrice.value = money.format(total) + "đ";
      if (selectionCount) selectionCount.textContent = selectedProducts.length + " món được chọn";
    }

    comboProducts.forEach(function (checkbox) {
      checkbox.addEventListener("change", function () {
        const row = checkbox.closest("[data-combo-item]");
        const quantity = row && row.querySelector("[data-combo-quantity]");
        if (quantity) quantity.disabled = !checkbox.checked;
        updateComboPrice();
      });
    });
    form.querySelectorAll("[data-combo-quantity]").forEach(function (field) {
      field.addEventListener("input", updateComboPrice);
    });
    if (comboSearch) {
      comboSearch.addEventListener("input", function () {
        const query = comboSearch.value.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").toLocaleLowerCase("vi");
        form.querySelectorAll("[data-combo-item]").forEach(function (row) {
          const name = row.textContent.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").toLocaleLowerCase("vi");
          row.hidden = Boolean(query) && !name.includes(query);
        });
      });
    }
    updateComboPrice();

    const discountType = form.querySelector("[data-voucher-discount-type]");
    if (discountType) {
      discountType.addEventListener("change", function () {
        const label = form.querySelector("[data-voucher-discount-label]");
        const amount = form.querySelector("[data-voucher-discount-value]");
        const configs = {
          fixed: { label: "Số tiền giảm (đ)", step: "1000", max: "" },
          percent: { label: "Mức giảm (%)", step: "1", max: "100" },
          shipping: { label: "Mức giảm phí ship tối đa (đ)", step: "1000", max: "" }
        };
        const config = configs[discountType.value];
        if (!config) return;
        if (label) label.textContent = config.label;
        if (amount) {
          amount.step = config.step;
          if (config.max) amount.max = config.max;
          else amount.removeAttribute("max");
        }
      });
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (comboProducts.length && !comboProducts.some(function (checkbox) { return checkbox.checked; })) {
        if (typeof window.showToast === "function") window.showToast("Chọn ít nhất một món làm thành phần combo.", "error");
        return;
      }
      const name = form.querySelector('[name="name"]');
      const code = form.querySelector('[name="code"]');
      const identity = code && code.value.trim() ? code.value.trim().toUpperCase() : name && name.value.trim();
      const kind = form.dataset.addKind || "mục";
      const message = "Đã thêm " + kind + (identity ? " “" + identity + "”" : "") + " thành công.";
      try { window.sessionStorage.setItem("katAdminFlash", message); } catch (error) {}
      window.location.href = form.dataset.returnTo;
    });
  });
})();
