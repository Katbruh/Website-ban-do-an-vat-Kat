(function () {
  const grid = document.getElementById("product-grid");
  const modal = document.getElementById("product-modal");
  const modalContent = document.getElementById("product-modal-content");
  const categories = readStore("categories") || [];
  const featuredGrid = document.getElementById("featured-grid");
  const offerGrid = document.getElementById("offer-grid");
  const locationGrid = document.getElementById("location-grid");
  let activeCategory = "cat_all";
  let visibleProductCount = 0;
  let filteredProducts = [];
  const productsPerBatch = 8;
  let productLoadObserver = null;
  let activeProduct = null;
  let activeCombo = null;
  let lastFocus = null;

  function getProductVariants(product) {
    return Array.isArray(product.variants) ? product.variants : [];
  }

  function productPriceLabel(product) {
    const variants = getProductVariants(product);
    if (!variants.length) return formatCurrency(product.price);
    const prices = variants.map(function (variant) { return Number(variant.price) || 0; });
    const minPrice = Math.min.apply(Math, prices);
    const maxPrice = Math.max.apply(Math, prices);
    return minPrice === maxPrice ? formatCurrency(minPrice) : formatCurrency(minPrice) + "–" + formatCurrency(maxPrice);
  }

  function renderCategories() {
    const categoryList = document.getElementById("category-list");
    if (!categoryList) return;
    categoryList.innerHTML = categories.map(function (category) {
      const active = category.id === activeCategory;
      return '<button class="category-chip' + (active ? " is-active" : "") + '" type="button" data-category="' + escapeHTML(category.id) + '" aria-pressed="' + active + '">' + escapeHTML(category.name) + '</button>';
    }).join("");
  }

  function productCard(product) {
    const variants = getProductVariants(product);
    const hasVariants = variants.length > 0;
    const rating = product.reviewsCount ? '<span class="rating-mark" aria-label="' + Number(product.rating).toFixed(1) + ' trên 5 sao">★ ' + Number(product.rating).toFixed(1) + ' <small>(' + product.reviewsCount + ')</small></span>' : "";
    return '<article class="product-card' + (product.status ? "" : " is-sold-out") + '" role="button" tabindex="0" data-open-product="' + escapeHTML(product.id) + '" aria-label="Xem món ' + escapeHTML(product.name) + (product.status ? "" : ", hiện tạm hết") + '">' +
      '<div class="product-visual"><img src="' + escapeHTML(product.image || "") + '" alt="' + escapeHTML(product.name) + '" loading="lazy">' + (product.isHot && product.status ? '<span class="product-tag">Best Seller</span>' : "") + (!product.status ? '<span class="sold-out-tag">Tạm hết món</span>' : "") + '</div>' +
      '<div class="product-card-content"><div class="product-card-meta">' + rating + '</div>' +
      '<h3>' + escapeHTML(product.name) + '</h3><p class="product-description">' + escapeHTML(product.description) + '</p>' +
      '<div class="product-card-bottom"><div class="price-group"><strong>' + productPriceLabel(product) + '</strong>' + (product.originalPrice ? '<del>' + formatCurrency(product.originalPrice) + '</del>' : "") + (hasVariants ? '<small>' + variants.length + ' lựa chọn</small>' : "") + '</div></div></div></article>';
  }

  function getVisibleProducts() {
    const query = document.getElementById("product-search").value.trim().toLocaleLowerCase("vi");
    const price = document.getElementById("price-select").value;
    const sort = document.getElementById("sort-select").value;
    let products = (readStore("products") || []).filter(function (product) {
      if (product.isVisible === false) return false;
      const matchesCategory = activeCategory === "cat_all" || product.categoryId === activeCategory;
      const variantText = getProductVariants(product).map(function (variant) { return variant.name; }).join(" ");
      const matchesSearch = !query || (product.name + " " + product.description + " " + variantText).toLocaleLowerCase("vi").includes(query);
      const prices = getProductVariants(product).map(function (variant) { return Number(variant.price) || 0; });
      if (!prices.length) prices.push(Number(product.price) || 0);
      const matchesPrice = price === "all" || prices.some(function (itemPrice) { return (price === "under15" && itemPrice < 15000) || (price === "15to30" && itemPrice >= 15000 && itemPrice <= 30000) || (price === "over30" && itemPrice > 30000); });
      return matchesCategory && matchesSearch && matchesPrice;
    });
    function priceBounds(product) {
      const prices = getProductVariants(product).map(function (variant) { return Number(variant.price) || 0; });
      if (!prices.length) prices.push(Number(product.price) || 0);
      return { min: Math.min.apply(Math, prices), max: Math.max.apply(Math, prices) };
    }
    if (sort === "price-asc") products.sort(function (a, b) { return priceBounds(a).min - priceBounds(b).min; });
    if (sort === "price-desc") products.sort(function (a, b) { return priceBounds(b).max - priceBounds(a).max; });
    if (sort === "rating") products.sort(function (a, b) { return (b.rating || 0) - (a.rating || 0); });
    return products;
  }

  function loadMoreProducts() {
    if (!grid || visibleProductCount >= filteredProducts.length) return;
    const nextProducts = filteredProducts.slice(visibleProductCount, visibleProductCount + productsPerBatch);
    grid.insertAdjacentHTML("beforeend", nextProducts.map(productCard).join(""));
    visibleProductCount += nextProducts.length;
    const sentinel = document.getElementById("product-load-sentinel");
    if (sentinel) {
      sentinel.hidden = visibleProductCount >= filteredProducts.length;
    }
  }

  function renderProducts() {
    if (grid) {
      filteredProducts = getVisibleProducts();
      visibleProductCount = 0;
      grid.innerHTML = "";
      const emptyState = document.getElementById("empty-state");
      if (emptyState) emptyState.hidden = filteredProducts.length > 0;
      const resultCount = document.getElementById("result-count");
      if (resultCount) resultCount.textContent = filteredProducts.length + " món";
      loadMoreProducts();
    }
    if (featuredGrid) featuredGrid.innerHTML = (readStore("products") || []).filter(function (product) { return product.isVisible !== false && product.isHot && product.status; }).slice(0, 4).map(productCard).join("");
    renderOffers();
    renderLocations();
    updateCartBadges();
  }

  function renderOffers() {
    const publicVoucherGrid = document.getElementById("public-voucher-grid");
    const publicVouchers = (readStore("vouchers") || []).filter(function (voucher) { return voucher.isActive !== false && voucher.isPublic !== false; });
    if (publicVoucherGrid && publicVoucherGrid.dataset.staticContent !== "true") {
      publicVoucherGrid.innerHTML = publicVouchers.map(function (voucher) {
        const reward = voucher.type === "percent" ? "Giảm " + Number(voucher.value) + "%" + (voucher.maxDiscount ? " · tối đa " + formatCurrency(voucher.maxDiscount) : "") : voucher.type === "shipping" ? "Hỗ trợ phí giao hàng đến " + formatCurrency(voucher.value) : "Giảm " + formatCurrency(voucher.value);
        return '<article class="public-voucher-card"><span>Ưu đãi khai trương</span><h2>' + escapeHTML(voucher.name) + '</h2><p>' + escapeHTML(voucher.description || reward) + '</p><code>' + escapeHTML(voucher.code) + '</code><small>' + escapeHTML(reward) + ' · Đơn từ ' + formatCurrency(voucher.minOrder) + ' · Mỗi khách dùng 1 lần</small></article>';
      }).join("");
      const emptyVouchers = document.getElementById("empty-vouchers");
      if (emptyVouchers) emptyVouchers.hidden = publicVouchers.length > 0;
    }
    if (!offerGrid || offerGrid.dataset.staticContent === "true") return;
    const eligibleDrinks = eligibleComboDrinks();
    const combos = (readStore("combos") || []).filter(function (combo) { return combo.isActive !== false && (!Number(combo.drinkCount) || eligibleDrinks.length > 0); });
    const groups = [
      { id: "solo", title: "Một mình vẫn vui" },
      { id: "friends", title: "Bè bạn ăn vui" },
      { id: "party", title: "Tiệc ăn vặt" }
    ];
    offerGrid.innerHTML = groups.map(function (group) {
      const groupCombos = combos.filter(function (combo) { return combo.group === group.id; });
      if (!groupCombos.length) return "";
      const cards = groupCombos.map(function (combo) {
        const savings = Math.max(0, Number(combo.originalPrice || 0) - Number(combo.price || 0));
        return '<article class="combo-card"><img class="combo-image" src="' + escapeHTML(combo.image || "images/met-vien-chien-nho.jpg") + '" alt="Gợi ý món ăn trong ' + escapeHTML(combo.name) + '" loading="lazy"><div class="combo-card-content"><div class="combo-card-meta">' + (combo.serving ? '<span class="offer-kicker">' + escapeHTML(combo.serving) + '</span>' : '<span></span>') + (savings ? '<span class="combo-savings">Tiết kiệm ' + formatCurrency(savings) + '</span>' : "") + '</div><h3>' + escapeHTML(combo.name) + '</h3><ul>' + combo.items.map(function (item) { return '<li>' + escapeHTML(item) + '</li>'; }).join("") + '</ul><div class="combo-card-bottom"><div class="price-group"><strong>' + formatCurrency(combo.price) + '</strong>' + (combo.originalPrice ? '<del>' + formatCurrency(combo.originalPrice) + '</del>' : "") + '</div><button class="button button-primary" type="button" data-open-combo="' + escapeHTML(combo.id) + '">Chọn combo</button></div></div></article>';
      }).join("");
      return '<section class="combo-group" aria-labelledby="combo-' + escapeHTML(group.id) + '"><div class="combo-group-heading"><h2 id="combo-' + escapeHTML(group.id) + '">' + escapeHTML(group.title) + '</h2></div><div class="combo-card-grid">' + cards + '</div></section>';
    }).join("");
    const empty = document.getElementById("empty-offers");
    if (empty) empty.hidden = combos.length > 0;
  }

  function renderLocations() {
    if (!locationGrid || !window.KAT_STORES || locationGrid.dataset.staticContent === "true") return;
    locationGrid.innerHTML = window.KAT_STORES.map(function (store) {
      const mapAction = store.mapUrl ? '<a class="text-link" href="' + escapeHTML(store.mapUrl) + '" target="_blank" rel="noopener">Mở bản đồ <span aria-hidden="true">↗</span></a>' : '<span class="helper-text">Cập nhật địa chỉ để thêm liên kết bản đồ.</span>';
      return '<article class="location-card"><span class="location-number">' + escapeHTML(store.shortLabel) + '</span><div><p class="eyebrow">Cửa hàng Kat</p><h3>' + escapeHTML(store.name) + '</h3><p>' + escapeHTML(store.address) + '</p><span class="location-hours">' + escapeHTML(store.hours) + '</span></div>' + mapAction + '</article>';
    }).join("");
  }

  function setupHomeShowcase() {
    const carousel = document.getElementById("masthead-carousel");
    if (!carousel) return;
    const slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(carousel.querySelectorAll("[data-hero-to]"));
    if (!slides.length) return;
    let activeIndex = slides.findIndex(function (slide) { return slide.classList.contains("is-active"); });
    if (activeIndex < 0) activeIndex = 0;
    let autoplayTimer = null;
    let controlsTimer = null;
    let slideCleanupTimer = null;

    function updateDots() {
      dots.forEach(function (dot, dotIndex) { dot.setAttribute("aria-pressed", String(dotIndex === activeIndex)); });
    }

    function showSlide(index, transition, direction) {
      const nextIndex = (index + slides.length) % slides.length;
      if (nextIndex === activeIndex) return;
      const previousIndex = activeIndex;
      const previous = slides[previousIndex];
      const next = slides[nextIndex];
      activeIndex = nextIndex;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.remove("is-entering-left", "is-entering-right", "is-exiting-left", "is-exiting-right");
        slide.setAttribute("aria-hidden", String(slideIndex !== activeIndex));
      });
      updateDots();

      if (slideCleanupTimer) window.clearTimeout(slideCleanupTimer);
      if (transition === "fade") {
        carousel.classList.add("is-fading");
        window.requestAnimationFrame(function () {
          next.classList.add("is-active");
          previous.classList.remove("is-active");
        });
        slideCleanupTimer = window.setTimeout(function () { carousel.classList.remove("is-fading"); }, 950);
        return;
      }

      carousel.classList.remove("is-fading");
      const enteringClass = direction < 0 ? "is-entering-left" : "is-entering-right";
      const exitingClass = direction < 0 ? "is-exiting-right" : "is-exiting-left";
      next.classList.add(enteringClass);
      void next.offsetWidth;
      window.requestAnimationFrame(function () {
        next.classList.remove(enteringClass);
        next.classList.add("is-active");
        previous.classList.remove("is-active");
        previous.classList.add(exitingClass);
      });
      slideCleanupTimer = window.setTimeout(function () { previous.classList.remove(exitingClass); }, 650);
    }

    function revealControls() {
      carousel.classList.add("is-controls-visible");
      if (controlsTimer) window.clearTimeout(controlsTimer);
      controlsTimer = window.setTimeout(function () { carousel.classList.remove("is-controls-visible"); }, 3000);
    }

    function startAutoplay() {
      if (autoplayTimer) window.clearInterval(autoplayTimer);
      if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      autoplayTimer = window.setInterval(function () { showSlide(activeIndex + 1, "fade", 1); }, 5000);
    }

    carousel.querySelector("[data-hero-prev]").addEventListener("click", function () {
      showSlide(activeIndex - 1, "slide", -1);
      startAutoplay(); revealControls();
    });
    carousel.querySelector("[data-hero-next]").addEventListener("click", function () {
      const wrapsToFirst = activeIndex === slides.length - 1;
      showSlide(activeIndex + 1, wrapsToFirst ? "fade" : "slide", 1);
      startAutoplay(); revealControls();
    });
    dots.forEach(function (dot) { dot.addEventListener("click", function () {
      const next = Number(dot.dataset.heroTo);
      const wrapsToFirst = activeIndex === slides.length - 1 && next === 0;
      showSlide(next, wrapsToFirst ? "fade" : "slide", next < activeIndex ? -1 : 1);
      startAutoplay();
    }); });
    carousel.addEventListener("pointerenter", revealControls);
    carousel.addEventListener("pointermove", revealControls);
    carousel.addEventListener("focusin", revealControls);
    carousel.addEventListener("focusout", function (event) { if (!carousel.contains(event.relatedTarget)) revealControls(); });
    slides.forEach(function (slide, index) { slide.setAttribute("aria-hidden", String(index !== activeIndex)); });
    updateDots();
    startAutoplay();
  }

  function optionGroup(title, name, choices, defaultIndex, isCheckbox) {
    return '<fieldset class="option-group"><legend>' + escapeHTML(title) + (isCheckbox ? '<span class="optional-label">Chọn tùy thích</span>' : '<span class="optional-label">Chọn 1</span>') + '</legend><div class="option-list">' + choices.map(function (choice, index) {
      const value = typeof choice === "string" ? choice : choice.name;
      const price = typeof choice === "string" ? 0 : choice.price;
      const checked = isCheckbox ? "" : (index === defaultIndex ? " checked" : "");
      return '<label class="option-row"><input type="' + (isCheckbox ? "checkbox" : "radio") + '" name="' + escapeHTML(name) + '" value="' + escapeHTML(value) + '" data-option-price="' + price + '"' + checked + '><span>' + escapeHTML(value) + '</span>' + (price ? '<strong>+' + formatCurrency(price) + '</strong>' : "") + '</label>';
    }).join("") + '</div></fieldset>';
  }

  function visibleReviews(productId) {
    return (readStore("reviews") || []).filter(function (review) { return review.productId === productId && !review.isHidden; });
  }

  function renderReviews(product) {
    const reviews = visibleReviews(product.id);
    const userReviews = readStore("reviews") || [];
    const orders = readStore("orders") || [];
    const purchased = currentUser && orders.some(function (order) { return order.userId === currentUser.id && order.status === "completed" && (order.items || []).some(function (item) { return item.productId === product.id; }); });
    const alreadyReviewed = currentUser && userReviews.some(function (review) { return review.productId === product.id && review.userId === currentUser.id; });
    const list = reviews.length ? '<div class="review-list">' + reviews.slice().reverse().map(function (review) {
      const stars = "★".repeat(Number(review.rating)) + "☆".repeat(5 - Number(review.rating));
      const rawComment = String(review.comment || "");
      const reviewComment = String(review.id || "").startsWith("REV_SEED_") ? rawComment.replace(/^Món\s+[^:]+:\s*/, "") : rawComment;
      return '<article class="review-item"><div class="review-heading"><strong>' + escapeHTML(review.username) + '</strong><span class="review-stars" aria-label="' + review.rating + ' sao">' + stars + '</span></div><p>' + (reviewComment ? escapeHTML(reviewComment) : '<span class="helper-text">Khách chỉ để lại số sao.</span>') + '</p><time>' + escapeHTML(review.createdAt) + '</time></article>';
    }).join("") + '</div>' : '<p class="helper-text">Món này chưa có đánh giá. Hãy là người đầu tiên chia sẻ nhé.</p>';
    const form = !currentUser ? '<p class="review-login-note"><a href="login.html">Đăng nhập</a> để gửi đánh giá.</p>' : alreadyReviewed ? '<p class="helper-text">Bạn đã đánh giá món này.</p>' : !purchased ? '<p class="helper-text">Đánh giá sẽ mở sau khi đơn có món này được hoàn thành.</p>' : '<form class="review-form" id="review-form"><fieldset class="star-picker"><legend>Chọn số sao <span class="required-mark">*</span></legend><div class="star-options">' + [5, 4, 3, 2, 1].map(function (rating, index) { return '<label><input type="radio" name="rating" value="' + rating + '"' + (index === 0 ? " checked" : "") + ' required><span aria-hidden="true">' + "★".repeat(rating) + '</span><span class="sr-only">' + rating + ' sao</span></label>'; }).join("") + '</div></fieldset><label>Nhận xét <span class="optional-label">Không bắt buộc</span><textarea name="comment" rows="2" maxlength="500" placeholder="Bạn thích điều gì ở món này?"></textarea></label><button class="button button-secondary" type="submit">Gửi đánh giá</button></form>';
    return '<section class="reviews-section" aria-labelledby="product-reviews-title"><div class="reviews-heading"><h3 id="product-reviews-title">Đánh giá món</h3><span class="helper-text">' + reviews.length + ' lượt</span></div>' + list + form + '</section>';
  }

  function openProductModal(productId, trigger) {
    const product = (readStore("products") || []).find(function (item) { return item.id === productId; });
    if (!product) return;
    activeProduct = product; activeCombo = null; lastFocus = trigger || document.activeElement;
    const variants = getProductVariants(product);
    const options = product.categoryType === "drink" ? readStore("drinkOptions") : readStore("foodOptions");
    let optionMarkup = "";
    if (variants.length) {
      optionMarkup += '<fieldset class="option-group"><legend>Chọn loại <span class="optional-label">' + variants.length + ' lựa chọn</span></legend><div class="option-list">' + variants.map(function (variant, index) {
        return '<label class="option-row"><input type="radio" name="variant" value="' + escapeHTML(variant.id || variant.name) + '" data-variant-price="' + Number(variant.price) + '" data-variant-name="' + escapeHTML(variant.name) + '" data-variant-image="' + escapeHTML(variant.image || product.image || "") + '"' + (index === 0 ? " checked" : "") + ' required><span>' + escapeHTML(variant.name) + '</span><strong>' + formatCurrency(variant.price) + '</strong></label>';
      }).join("") + '</div></fieldset>';
    }
    if (product.customization === "drink") {
      optionMarkup += optionGroup("Độ ngọt", "sweetness", options.sweetness, 1, false) + optionGroup("Lượng đá", "ice", options.ice, 1, false) + optionGroup("Topping thêm", "toppings", options.toppings, 0, true);
    } else if (product.customization === "food") {
      optionMarkup += optionGroup("Mức độ cay", "spice", options.spice, 1, false) + optionGroup("Topping thêm", "toppings", options.toppings, 0, true);
    }
    const initialVariant = variants[0];
    const initialImage = initialVariant && initialVariant.image ? initialVariant.image : (product.image || "");
    const initialImageAlt = initialVariant ? initialVariant.name : product.name;
    const initialPrice = variants.length ? Number(variants[0].price) : Number(product.price);
    modalContent.innerHTML = '<div class="product-detail"><img class="detail-image" data-detail-image src="' + escapeHTML(initialImage) + '" alt="' + escapeHTML(initialImageAlt) + '"><div class="detail-copy"><p class="eyebrow">' + (product.categoryType === "drink" ? "Pha tại quán" : "Làm mới mỗi ngày") + '</p><h2 id="product-modal-title">' + escapeHTML(product.name) + '</h2><p class="detail-description">' + escapeHTML(product.description) + '</p><strong class="detail-price" data-detail-price>' + formatCurrency(initialPrice) + '</strong>' +
      (product.status ? '<form id="add-to-cart-form"><div class="detail-options">' + optionMarkup + '</div><label class="quantity-field">Số lượng<input name="quantity" type="number" min="1" max="20" value="1" inputmode="numeric" required></label><button class="button button-primary button-wide" type="submit" id="add-to-cart-button">Thêm vào giỏ · ' + formatCurrency(product.price) + '</button></form>' : '<p class="status-message">Món hiện tạm hết. Bạn có thể chọn món khác trong thực đơn.</p>') +
      '</div></div>' + renderReviews(product);
    modal.hidden = false; modal.classList.add("is-open"); document.body.classList.add("modal-open");
    modal.querySelector(".dialog").focus();
    updateModalPrice();
  }

  function updateModalPrice() {
    const form = document.getElementById(activeCombo ? "add-combo-form" : "add-to-cart-form");
    if (!form) return;
    if (activeCombo) {
      const comboQuantity = Math.max(1, Math.min(20, Number(form.elements.quantity.value) || 1));
      const wantsDrinks = form.querySelector('input[name="comboDrinkChoice"]:checked')?.value === "with";
      const drinkFields = form.querySelector("[data-combo-drink-fields]");
      const drinkSelects = Array.from(form.querySelectorAll('select[name^="comboDrink"]'));
      if (drinkFields) drinkFields.hidden = !wantsDrinks;
      drinkSelects.forEach(function (select) { select.disabled = !wantsDrinks; select.required = wantsDrinks; });
      const drinkTotal = wantsDrinks ? drinkSelects.reduce(function (sum, select) {
        const option = select.selectedOptions[0];
        return sum + (option && option.value ? Number(option.dataset.price || 0) : 0);
      }, 0) : 0;
      const unitPrice = Number(activeCombo.price) + drinkTotal;
      const price = document.querySelector("[data-combo-price]");
      if (price) price.textContent = formatCurrency(unitPrice);
      document.getElementById("add-to-cart-button").textContent = "Thêm vào giỏ · " + formatCurrency(unitPrice * comboQuantity);
      return;
    }
    if (!activeProduct) return;
    const toppings = Array.from(form.querySelectorAll('input[type="checkbox"]:checked'));
    const extras = toppings.reduce(function (sum, input) { return sum + Number(input.dataset.optionPrice || 0); }, 0);
    const selectedVariant = form.querySelector('input[name="variant"]:checked');
    const basePrice = selectedVariant ? Number(selectedVariant.dataset.variantPrice) : Number(activeProduct.price);
    const detailImage = modalContent.querySelector("[data-detail-image]");
    if (detailImage) {
      detailImage.src = selectedVariant && selectedVariant.dataset.variantImage ? selectedVariant.dataset.variantImage : (activeProduct.image || "");
      detailImage.alt = selectedVariant ? selectedVariant.dataset.variantName : activeProduct.name;
    }
    const quantity = Math.max(1, Math.min(20, Number(form.elements.quantity.value) || 1));
    const detailPrice = document.querySelector("[data-detail-price]");
    if (detailPrice) detailPrice.textContent = formatCurrency(basePrice + extras);
    document.getElementById("add-to-cart-button").textContent = "Thêm vào giỏ · " + formatCurrency((basePrice + extras) * quantity);
  }

  function closeModal() {
    if (modal.hidden) return;
    modal.hidden = true; modal.classList.remove("is-open"); document.body.classList.remove("modal-open");
    if (lastFocus && lastFocus.focus) lastFocus.focus(); activeProduct = null; activeCombo = null;
  }

  function addCartItem(product, selectedOptions, toppings, quantity, selectedPrice) {
    const basePrice = selectedPrice == null ? Number(product.price) : Number(selectedPrice);
    const unitPrice = basePrice + toppings.reduce(function (sum, item) { return sum + item.price; }, 0);
    const cart = readStore("cart") || [];
    const item = { cartItemId: makeId("ITEM"), productId: product.id, name: product.name, image: product.image, basePrice: basePrice, unitPrice: unitPrice, quantity: Math.min(20, quantity), selectedToppings: toppings, selectedOptions: selectedOptions, subtotal: unitPrice * Math.min(20, quantity) };
    const same = cart.find(function (entry) {
      const entryToppings = JSON.stringify((entry.selectedToppings || []).map(function (topping) { return [topping.name, Number(topping.price)]; }).sort());
      const itemToppings = JSON.stringify(item.selectedToppings.map(function (topping) { return [topping.name, Number(topping.price)]; }).sort());
      return entry.productId === item.productId && String(entry.selectedOptions || "") === item.selectedOptions && entryToppings === itemToppings && Number(entry.unitPrice || entry.basePrice) === item.unitPrice;
    });
    if (same && Number(same.quantity) >= 20) { showToast("Mỗi món trong giỏ tối đa 20 phần.", "error"); return; }
    if (same) same.quantity = Math.min(20, Number(same.quantity || 0) + item.quantity);
    else cart.push(item);
    const saved = same || item;
    saved.subtotal = Number(saved.unitPrice || saved.basePrice) * Number(saved.quantity);
    writeStore("cart", cart); showToast("Đã thêm " + product.name + " vào giỏ hàng.", "success"); updateCartBadges();
  }

  function addProductToCart(form) {
    const products = readStore("products") || [];
    const product = activeProduct && products.find(function (item) { return item.id === activeProduct.id; });
    if (!product || !product.status) return;
    const toppings = Array.from(form.querySelectorAll('input[type="checkbox"]:checked')).map(function (input) { return { name: input.value, price: Number(input.dataset.optionPrice || 0) }; });
    const selectedVariant = form.querySelector('input[name="variant"]:checked');
    const options = Array.from(form.querySelectorAll('input[type="radio"]:checked')).filter(function (input) { return input.name !== "variant"; }).map(function (input) { return input.value; });
    if (selectedVariant) options.unshift(selectedVariant.dataset.variantName);
    const selectedOptions = options.join(" · ");
    const quantity = Math.max(1, Math.min(20, Number(form.elements.quantity.value) || 1));
    addCartItem(product, selectedOptions, toppings, quantity, selectedVariant ? Number(selectedVariant.dataset.variantPrice) : product.price);
    closeModal();
  }

  function eligibleComboDrinks() {
    return (readStore("products") || []).filter(function (product) { return product.isVisible !== false && product.status && (product.categoryId === "cat_drink" || product.categoryId === "cat_soda"); }).reduce(function (items, product) {
      const variants = getProductVariants(product);
      if (variants.length) {
        variants.forEach(function (variant) {
          if (Number(variant.price) <= 15000) items.push({ value: product.id + "|" + (variant.id || variant.name), name: variant.name, price: Number(variant.price) });
        });
      } else if (Number(product.price) <= 15000) items.push({ value: product.id, name: product.name, price: Number(product.price) });
      return items;
    }, []);
  }

  function openComboModal(comboId, trigger) {
    const combo = (readStore("combos") || []).find(function (item) { return item.id === comboId; });
    if (!combo || combo.isActive === false || !modal || !modalContent) return;
    if (Number(combo.drinkCount) > 0 && !eligibleComboDrinks().length) { showToast("Hiện chưa có thức uống phù hợp với combo này.", "error"); return; }
    activeCombo = combo; activeProduct = null; lastFocus = trigger || document.activeElement;
    const drinks = eligibleComboDrinks();
    const drinkFields = Array.from({ length: Number(combo.drinkCount) || 0 }, function (_, index) {
      const choices = drinks.map(function (drink) { return '<option value="' + escapeHTML(drink.value) + '" data-price="' + Number(drink.price) + '">' + escapeHTML(drink.name) + ' · ' + formatCurrency(drink.price) + '</option>'; }).join("");
      return '<label>Nước tự chọn ' + (index + 1) + '<select name="comboDrink' + index + '"><option value="" selected disabled>Chọn thức uống (tối đa 15.000đ)</option>' + choices + '</select></label>';
    }).join("");
    const selectionMarkup = drinkFields ? '<fieldset class="combo-drink-selection"><legend>Thức uống tự chọn</legend><label class="combo-drink-choice"><input type="radio" name="comboDrinkChoice" value="with" checked> Lấy ' + combo.drinkCount + ' thức uống</label><label class="combo-drink-choice"><input type="radio" name="comboDrinkChoice" value="without"> Không lấy kèm nước uống</label><div data-combo-drink-fields>' + drinkFields + '</div></fieldset>' : '<p class="helper-text">Combo này không kèm thức uống.</p>';
    modalContent.innerHTML = '<div class="product-detail"><img class="detail-image" src="' + escapeHTML(combo.image || "images/met-vien-chien-nho.jpg") + '" alt="Gợi ý món ăn trong ' + escapeHTML(combo.name) + '"><div class="detail-copy"><p class="eyebrow">' + escapeHTML(combo.serving || "Combo tiết kiệm") + '</p><h2 id="product-modal-title">' + escapeHTML(combo.name) + '</h2><ul class="combo-modal-items">' + combo.items.map(function (item) { return '<li>' + escapeHTML(item) + '</li>'; }).join("") + '</ul><strong class="detail-price" data-combo-price>' + formatCurrency(combo.price) + '</strong><form id="add-combo-form">' + selectionMarkup + '<label class="quantity-field">Số lượng<input name="quantity" type="number" min="1" max="20" value="1" inputmode="numeric" required></label><button class="button button-primary button-wide" type="submit" id="add-to-cart-button">Thêm vào giỏ · ' + formatCurrency(combo.price) + '</button></form></div></div>';
    modal.hidden = false; modal.classList.add("is-open"); document.body.classList.add("modal-open");
    modal.querySelector(".dialog").focus();
    updateModalPrice();
  }

  function addComboToCart(form) {
    if (!activeCombo) return;
    const drinks = eligibleComboDrinks();
    const wantsDrinks = form.querySelector('input[name="comboDrinkChoice"]:checked')?.value === "with";
    const selected = wantsDrinks ? Array.from(form.querySelectorAll('select[name^="comboDrink"]')).map(function (select) {
      return drinks.find(function (drink) { return drink.value === select.value; });
    }).filter(Boolean) : [];
    if (wantsDrinks && selected.length !== Number(activeCombo.drinkCount || 0)) { showToast("Hãy chọn đủ thức uống cho combo hoặc chọn không lấy nước.", "error"); return; }
    const quantity = Math.max(1, Math.min(20, Number(form.elements.quantity.value) || 1));
    const selectedOptions = selected.length ? "Nước tự chọn: " + selected.map(function (drink) { return drink.name; }).join(", ") : (Number(activeCombo.drinkCount) ? "Không lấy kèm nước uống" : "Không kèm nước");
    const unitPrice = Number(activeCombo.price) + selected.reduce(function (sum, drink) { return sum + drink.price; }, 0);
    const cart = readStore("cart") || [];
    const existing = cart.find(function (item) { return item.productId === activeCombo.id && item.selectedOptions === selectedOptions && Number(item.unitPrice || item.basePrice) === unitPrice; });
    if (existing && Number(existing.quantity) >= 20) { showToast("Mỗi combo trong giỏ tối đa 20 phần.", "error"); return; }
    if (existing) existing.quantity = Math.min(20, Number(existing.quantity || 0) + quantity);
    else cart.push({ cartItemId: makeId("ITEM"), productId: activeCombo.id, name: activeCombo.name, image: activeCombo.image, basePrice: Number(activeCombo.price), unitPrice: unitPrice, quantity: quantity, selectedToppings: [], selectedOptions: selectedOptions, subtotal: unitPrice * quantity });
    const saved = existing || cart[cart.length - 1];
    saved.subtotal = Number(saved.unitPrice || saved.basePrice) * Number(saved.quantity);
    writeStore("cart", cart); showToast("Đã thêm " + activeCombo.name + " vào giỏ hàng.", "success"); updateCartBadges(); closeModal();
  }

  function handleProductGridClick(event) {
    const card = event.target.closest(".product-card[data-open-product]");
    if (card) openProductModal(card.dataset.openProduct, card);
  }

  function handleProductGridKeydown(event) {
    const card = event.target.closest(".product-card[data-open-product]");
    if (card && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      openProductModal(card.dataset.openProduct, card);
    }
  }

  function saveReview(form) {
    if (!currentUser || !activeProduct) return;
    const rating = Number(new FormData(form).get("rating"));
    const comment = String(new FormData(form).get("comment") || "").trim();
    const orders = readStore("orders") || [];
    const purchased = orders.some(function (order) { return order.userId === currentUser.id && order.status === "completed" && (order.items || []).some(function (item) { return item.productId === activeProduct.id; }); });
    if (!purchased) { showToast("Bạn có thể đánh giá món sau khi đơn chứa món này hoàn tất.", "error"); return; }
    const reviews = readStore("reviews") || [];
    if (reviews.some(function (review) { return review.productId === activeProduct.id && review.userId === currentUser.id; })) { showToast("Bạn đã đánh giá món này rồi.", "error"); return; }
    reviews.push({ id: makeId("REV"), productId: activeProduct.id, userId: currentUser.id, username: currentUser.fullname || currentUser.username, rating: rating, comment: comment, createdAt: new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date()), isHidden: false });
    writeStore("reviews", reviews);
    const products = readStore("products") || [];
    const product = products.find(function (item) { return item.id === activeProduct.id; });
    const visible = reviews.filter(function (review) { return review.productId === product.id && !review.isHidden; });
    product.reviewsCount = visible.length;
    product.rating = visible.reduce(function (sum, review) { return sum + Number(review.rating); }, 0) / visible.length;
    writeStore("products", products); showToast("Cảm ơn bạn đã đánh giá món.", "success");
    openProductModal(product.id, lastFocus); renderProducts();
  }

  if (grid) {
    const sentinel = document.getElementById("product-load-sentinel");
    if (sentinel && "IntersectionObserver" in window) {
      productLoadObserver = new IntersectionObserver(function (entries) {
        if (entries.some(function (entry) { return entry.isIntersecting; })) loadMoreProducts();
      }, { rootMargin: "360px 0px" });
      productLoadObserver.observe(sentinel);
    } else if (sentinel) {
      window.addEventListener("scroll", function () {
        if (!sentinel.hidden && sentinel.getBoundingClientRect().top < window.innerHeight + 360) loadMoreProducts();
      }, { passive: true });
    }
    const categoryList = document.getElementById("category-list");
    if (categoryList) categoryList.addEventListener("click", function (event) {
      const button = event.target.closest("[data-category]"); if (!button) return;
      activeCategory = button.dataset.category; renderCategories(); renderProducts();
    });
    ["product-search", "price-select", "sort-select"].forEach(function (id) {
      const control = document.getElementById(id);
      if (control) control.addEventListener(id === "product-search" ? "input" : "change", renderProducts);
    });
    grid.addEventListener("click", handleProductGridClick);
    grid.addEventListener("keydown", handleProductGridKeydown);
  }
  if (featuredGrid) { featuredGrid.addEventListener("click", handleProductGridClick); featuredGrid.addEventListener("keydown", handleProductGridKeydown); }
  if (offerGrid) offerGrid.addEventListener("click", function (event) {
    const demoButton = event.target.closest("[data-demo-add-combo]");
    if (demoButton) { showToast("Đã thêm combo vào giỏ hàng", "success"); return; }
    const button = event.target.closest("[data-open-combo]");
    if (button) openComboModal(button.dataset.openCombo, button);
  });
  if (locationGrid) locationGrid.addEventListener("click", function (event) {
    if (event.target.closest("[data-demo-map]")) showToast("Đã mở bản đồ chỉ đường (mô phỏng)");
  });
  if (modal && modalContent) {
    modal.addEventListener("click", function (event) { if (event.target === modal || event.target.closest("[data-close-modal]")) closeModal(); });
    modal.addEventListener("keydown", function (event) { if (event.key === "Escape") closeModal(); });
    modalContent.addEventListener("input", function (event) { if (event.target.form && ["add-to-cart-form", "add-combo-form"].includes(event.target.form.id)) updateModalPrice(); });
    modalContent.addEventListener("change", function (event) { if (event.target.form && ["add-to-cart-form", "add-combo-form"].includes(event.target.form.id)) updateModalPrice(); });
    modalContent.addEventListener("submit", function (event) {
    if (event.target.id === "add-to-cart-form") { event.preventDefault(); addProductToCart(event.target); }
    if (event.target.id === "add-combo-form") { event.preventDefault(); addComboToCart(event.target); }
    if (event.target.id === "review-form") { event.preventDefault(); saveReview(event.target); }
    });
  }
  window.addEventListener("kat:storage", function (event) {
    if (!event.detail) return;
    if (event.detail.key === "products" || event.detail.key === "reviews") { renderCategories(); renderProducts(); return; }
    if (event.detail.key === "combos" || event.detail.key === "vouchers") renderOffers();
    if (event.detail.key === "cart") updateCartBadges();
  });
  setupHomeShowcase(); renderCategories(); renderProducts();
})();
