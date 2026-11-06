(function () {
  "use strict";

  const card = document.querySelector('[data-menu-product="banh-trang"]');
  if (!card) return;

  try {
    const product = JSON.parse(window.localStorage.getItem("katAdminProductOptions_banh-trang") || "null");
    if (!product) return;
    const name = product.name || "Bánh tráng";
    const heading = card.querySelector("h3");
    const image = card.querySelector("img");
    const priceGroup = card.querySelector(".price-group");
    const price = priceGroup && priceGroup.querySelector("strong");
    const choiceCount = priceGroup && priceGroup.querySelector("small");
    if (heading) heading.textContent = name;
    if (image) {
      if (product.image) {
        image.src = product.image.startsWith("data:") ? product.image : product.image.replace(/^\.\.\//, "");
        image.alt = name;
      } else {
        image.removeAttribute("src");
        image.alt = "";
      }
    }
    card.dataset.productCategory = product.category || "Bánh tráng & món trộn";
    card.dataset.productType = product.productType || "food";

    const prices = (product.hasVariants && Array.isArray(product.variants) ? product.variants : [])
      .map(function (variant) { return Number(variant.price); })
      .filter(function (value) { return Number.isFinite(value) && value >= 0; });
    const formatter = new Intl.NumberFormat("vi-VN");
    if (price) {
      if (prices.length) {
        const lowest = Math.min.apply(Math, prices);
        const highest = Math.max.apply(Math, prices);
        price.textContent = formatter.format(lowest) + "đ" + (lowest === highest ? "" : "–" + formatter.format(highest) + "đ");
      } else {
        price.textContent = formatter.format(Number(product.sellingPrice) || 0) + "đ";
      }
    }
    if (choiceCount) {
      if (prices.length) {
        choiceCount.hidden = false;
        choiceCount.textContent = prices.length + " lựa chọn";
      } else {
        choiceCount.hidden = true;
      }
    }

    let originalPrice = priceGroup && priceGroup.querySelector("del");
    if (Number(product.originalPrice) > 0 && priceGroup) {
      if (!originalPrice) {
        originalPrice = document.createElement("del");
        priceGroup.insertBefore(originalPrice, choiceCount || null);
      }
      originalPrice.textContent = formatter.format(Number(product.originalPrice)) + "đ";
    } else if (originalPrice) {
      originalPrice.remove();
    }
  } catch (error) {}

  try {
    const addedProducts = JSON.parse(window.localStorage.getItem("katAdminAddedProducts") || "[]");
    const grid = document.querySelector("#product-grid");
    if (!grid || !Array.isArray(addedProducts)) return;
    const formatter = new Intl.NumberFormat("vi-VN");
    addedProducts.forEach(function (product) {
      if (!product || !product.id || grid.querySelector('[data-menu-product="' + product.id + '"]')) return;
      const card = document.createElement("article");
      card.className = "product-card";
      card.dataset.menuProduct = product.id;
      card.dataset.productCategory = product.category || "";
      card.dataset.productType = product.productType || "food";
      const link = document.createElement("a");
      link.className = "product-card-link";
      link.href = "product-detail.html?productId=" + encodeURIComponent(product.id);
      const image = document.createElement("img");
      image.alt = product.name || "";
      image.loading = "lazy";
      image.hidden = !product.image;
      if (product.image) image.src = product.image;
      const content = document.createElement("div");
      content.className = "product-card-content";
      const meta = document.createElement("div");
      meta.className = "product-card-meta";
      const rating = document.createElement("span");
      rating.className = "review-stars";
      rating.setAttribute("aria-label", "Món mới");
      rating.textContent = "Món mới";
      meta.appendChild(rating);
      const heading = document.createElement("h3");
      heading.textContent = product.name || "Món mới";
      const bottom = document.createElement("div");
      bottom.className = "product-card-bottom";
      const priceGroup = document.createElement("div");
      priceGroup.className = "price-group";
      const price = document.createElement("strong");
      const prices = product.hasVariants && Array.isArray(product.variants) ? product.variants.map(function (variant) { return Number(variant.price); }).filter(function (value) { return Number.isFinite(value) && value >= 0; }) : [];
      if (prices.length) {
        const low = Math.min.apply(Math, prices);
        const high = Math.max.apply(Math, prices);
        price.textContent = formatter.format(low) + "đ" + (low === high ? "" : "–" + formatter.format(high) + "đ");
      } else {
        price.textContent = formatter.format(Number(product.sellingPrice) || 0) + "đ";
      }
      priceGroup.appendChild(price);
      if (Number(product.originalPrice) > 0) {
        const original = document.createElement("del");
        original.textContent = formatter.format(Number(product.originalPrice)) + "đ";
        priceGroup.appendChild(original);
      }
      if (prices.length) {
        const count = document.createElement("small");
        count.textContent = prices.length + " lựa chọn";
        priceGroup.appendChild(count);
      }
      bottom.appendChild(priceGroup);
      content.append(meta, heading, bottom);
      link.append(image, content);
      card.appendChild(link);
      grid.appendChild(card);
    });
    const countLabel = document.querySelector("#result-count");
    if (countLabel) countLabel.textContent = grid.children.length + " món trong thực đơn";
  } catch (error) {}
})();
