/* ============================================================
   THỰC ĐƠN ADMIN: căn lựa chọn và điều hướng thêm/sửa món
   ============================================================ */
(function () {
  "use strict";
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

  function handleAction(event, action) {
    const path = window.location.pathname.toLowerCase();
    if (!path.includes("admin-products")) return false;

    const label = action.textContent.trim().replace(/\s+/g, " ");
    if (action.matches(".admin-choice-button") || /^sửa món$|^sửa$/i.test(label)) {
      event.preventDefault();
      const productId = action.closest("tr") && action.closest("tr").dataset.productId;
      window.location.href = productId && productId !== "banh-trang"
        ? "admin-product-edit.html?productId=" + encodeURIComponent(productId)
        : "admin-product-edit.html";
      return true;
    }

    if (/^thêm món$/i.test(label)) {
      event.preventDefault();
      window.location.href = "admin-product-add.html";
      return true;
    }

    return false;
  }

  window.KatAdminProductList = {
    initialize: function () {
      alignProductChoiceButtons();
    },
    handleAction: handleAction
  };
})();
