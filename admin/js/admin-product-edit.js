/* ============================================================
   THỰC ĐƠN ADMIN: tạo dòng lựa chọn và xử lý form món ăn
   ============================================================ */
/* ---------- Dựng dòng loại món, mức cay và topping ---------- */
(function () {
  "use strict";

  function createRows(dependencies) {
    const element = dependencies.element;
    const createImageEditor = dependencies.createImageEditor;

    function createVariantRow(data, index) {
      const row = element("article", "option-editor-card");
      row.dataset.variantRow = "";
      const heading = element("div", "option-editor-card-heading");
      heading.appendChild(element("strong", "option-editor-row-title", "Loại " + (index + 1)));
      const remove = element("button", "text-button danger-link", "Xóa loại");
      remove.type = "button";
      remove.dataset.removeVariant = "";
      heading.appendChild(remove);

      const content = element("div", "variant-editor-content");
      const imageEditor = createImageEditor(data.image || "", data.name || "Ảnh lựa chọn", data.imageFileName);
      const fields = element("div", "option-editor-fields");
      const defaultLabel = element("label", "default-option-toggle");
      const defaultRadio = element("input");
      defaultRadio.type = "radio";
      defaultRadio.name = "defaultVariant";
      defaultRadio.checked = Boolean(data.selected);
      defaultRadio.dataset.variantDefault = "";
      defaultLabel.append(defaultRadio, document.createTextNode(" Lựa chọn mặc định"));

      const nameLabel = element("label", "admin-field");
      nameLabel.appendChild(element("span", "", "Tên loại"));
      const nameInput = element("input");
      nameInput.type = "text";
      nameInput.maxLength = 80;
      nameInput.required = true;
      nameInput.value = data.name || "";
      nameInput.dataset.variantName = "";
      nameLabel.appendChild(nameInput);

      const priceLabel = element("label", "admin-field");
      priceLabel.appendChild(element("span", "", "Giá bán (đ)"));
      const price = element("input");
      price.type = "text";
      price.inputMode = "numeric";
      price.placeholder = "Ví dụ: 25.000";
      price.required = true;
      price.value = data.priceText || String(data.price || "");
      price.dataset.variantPrice = "";
      priceLabel.appendChild(price);

      fields.append(defaultLabel, nameLabel, priceLabel);
      content.append(imageEditor, fields);
      row.append(heading, content);
      return row;
    }

    function createSpiceRow(data, index) {
      const row = element("div", "simple-option-row");
      row.dataset.spiceRow = "";
      const defaultLabel = element("label", "default-option-toggle");
      const radio = element("input");
      radio.type = "radio";
      radio.name = "defaultSpice";
      radio.checked = Boolean(data.selected);
      radio.dataset.spiceDefault = "";
      defaultLabel.append(radio, document.createTextNode(" Mặc định"));

      const nameLabel = element("label", "admin-field");
      nameLabel.appendChild(element("span", "", "Mức cay " + (index + 1)));
      const name = element("input");
      name.type = "text";
      name.maxLength = 60;
      name.required = true;
      name.value = data.name || "";
      name.dataset.spiceName = "";
      nameLabel.appendChild(name);

      const remove = element("button", "text-button danger-link", "Xóa mức");
      remove.type = "button";
      remove.dataset.removeSpice = "";
      row.append(defaultLabel, nameLabel, remove);
      return row;
    }

    function createToppingRow(data, index) {
      const row = element("article", "option-editor-card topping-editor-card");
      row.dataset.toppingRow = "";
      const heading = element("div", "option-editor-card-heading");
      heading.appendChild(element("strong", "option-editor-row-title", "Topping " + (index + 1)));
      const remove = element("button", "text-button danger-link", "Xóa topping");
      remove.type = "button";
      remove.dataset.removeTopping = "";
      heading.appendChild(remove);

      const content = element("div", "variant-editor-content");
      const imageEditor = createImageEditor(data.image || "", data.name || "Ảnh topping", data.imageFileName);
      const fields = element("div", "option-editor-fields");
      const visibleLabel = element("label", "default-option-toggle");
      const visible = element("input");
      visible.type = "checkbox";
      visible.checked = data.visible !== false;
      visible.dataset.toppingVisible = "";
      visibleLabel.append(visible, document.createTextNode(" Hiển thị món ăn kèm"));

      const nameLabel = element("label", "admin-field");
      nameLabel.appendChild(element("span", "", "Tên topping"));
      const name = element("input");
      name.type = "text";
      name.maxLength = 80;
      name.required = true;
      name.value = data.name || "";
      name.dataset.toppingName = "";
      nameLabel.appendChild(name);

      const priceLabel = element("label", "admin-field");
      priceLabel.appendChild(element("span", "", "Giá thêm (đ)"));
      const price = element("input");
      price.type = "text";
      price.inputMode = "numeric";
      price.placeholder = "Ví dụ: 5.000";
      price.value = data.priceText || String(data.price || "");
      price.dataset.toppingPrice = "";
      priceLabel.appendChild(price);

      fields.append(visibleLabel, nameLabel, priceLabel);
      content.append(imageEditor, fields);
      row.append(heading, content);
      return row;
    }

    function renderRows(list, items, createRow) {
      list.replaceChildren();
      items.forEach(function (item, index) { list.appendChild(createRow(item, index)); });
    }

    return {
      createVariantRow: createVariantRow,
      createSpiceRow: createSpiceRow,
      createToppingRow: createToppingRow,
      renderRows: renderRows
    };
  }

  window.KatAdminProductEditRows = { create: createRows };
})();

/* ---------- Khởi tạo, định dạng và gửi form món ăn ---------- */
(function () {
  "use strict";

  const form = document.querySelector("[data-product-edit-form]");
  if (!form) return;

  const isAddMode = form.dataset.productMode === "add";
  const defaultImage = "images/banh-trang-tron.jpg";
  const defaultVariants = [
    { name: "Bánh tráng trộn", price: 25000, priceText: "25.000", image: "images/banh-trang-tron.jpg", selected: true },
    { name: "Bánh tráng cuốn bơ me", price: 20000, priceText: "20.000", image: "images/banh-trang-cuon-bo-me.jpg" },
    { name: "Bánh tráng chấm tắc bơ", price: 15000, priceText: "15.000", image: "images/banh-trang-cuon-tac-bo.jpg" },
    { name: "Bánh tráng chiên muối ớt", price: 15000, priceText: "15.000", image: "images/banh-trang-chien-muoi-ot.png" },
    { name: "Bánh tráng phơi sương hành phi", price: 15000, priceText: "15.000", image: "images/banh-trang-phoi-suong-hanh-phi.jpg" },
    { name: "Bánh tráng cuộn tôm hành", price: 15000, priceText: "15.000", image: "images/banh-trang-cuon-tom-hanh.jpg" }
  ];
  const defaultSpices = [
    { name: "Không cay" },
    { name: "Cay vừa (Tiêu chuẩn)", selected: true },
    { name: "Siêu cay xé lưỡi" }
  ];
  const defaultToppings = [
    { name: "Phô mai sợi", price: 5000, priceText: "5.000", image: "", visible: true },
    { name: "Khô bò xé cay", price: 7000, priceText: "7.000", image: "", visible: true },
    { name: "Trứng cút 3 quả", price: 5000, priceText: "5.000", image: "", visible: true },
    { name: "Xúc xích nướng", price: 6000, priceText: "6.000", image: "", visible: true },
    { name: "Tép rim mỡ hành", price: 5000, priceText: "5.000", image: "", visible: true }
  ];

  const variantList = form.querySelector("[data-variant-list]");
  const spiceList = form.querySelector("[data-spice-list]");
  const toppingList = form.querySelector("[data-topping-list]");
  const hasVariants = form.querySelector("[data-has-variants]");
  const priceInput = form.querySelector("[data-selling-price]");
  const priceLabel = form.querySelector("[data-price-label]");
  const priceHelp = form.querySelector("[data-price-help]");
  const mainImage = form.querySelector("[data-main-image-preview]");
  const mainImagePlaceholder = form.querySelector("[data-main-image-placeholder]");
  const mainImageFileName = form.querySelector("[data-main-image-file-name]");

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function parseManualPrice(value) {
    const digits = String(value || "").replace(/\./g, "").replace(/\D/g, "");
    return Number(digits) || 0;
  }

  function formatPriceValue(value) {
    return String(value || "")
      .replace(/\D/g, "")
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function formatPriceInput(input) {
    const raw = input.value;
    const caret = input.selectionStart === null ? raw.length : input.selectionStart;
    const digitsBeforeCaret = raw.slice(0, caret).replace(/\D/g, "").length;
    const formatted = formatPriceValue(raw);
    if (formatted === raw) return;

    input.value = formatted;
    let nextCaret = 0;
    let digitsPlaced = 0;
    while (nextCaret < formatted.length && digitsPlaced < digitsBeforeCaret) {
      if (/\d/.test(formatted[nextCaret])) digitsPlaced += 1;
      nextCaret += 1;
    }
    input.setSelectionRange(nextCaret, nextCaret);
  }

  function formatAllPriceInputs() {
    form.querySelectorAll('[data-selling-price], [name="originalPrice"], [data-variant-price], [data-topping-price]').forEach(formatPriceInput);
  }

  function imagePathForAdmin(source) {
    if (!source) return "";
    return source.startsWith("data:") || source.startsWith("../") ? source : "../" + source;
  }

  function fileNameForImage(source, fileName) {
    if (fileName) return fileName;
    if (!source) return "";
    if (source.startsWith("data:")) return "Ảnh đã tải lên";
    return source.split(/[\\/]/).pop().split("?")[0];
  }

  function showFileName(node, fileName) {
    if (!node) return;
    node.textContent = fileName || "";
    node.hidden = !fileName;
  }

  function setPreview(image, placeholder, source, alt) {
    if (source) {
      image.src = imagePathForAdmin(source);
      image.alt = alt || "Ảnh lựa chọn món";
      image.hidden = false;
      placeholder.hidden = true;
    } else {
      image.removeAttribute("src");
      image.alt = "";
      image.hidden = true;
      placeholder.hidden = false;
    }
  }

  function createImageEditor(source, alt, fileName) {
    const editor = element("div", "option-image-editor");
    const preview = element("div", "option-image-preview");
    const image = element("img");
    image.dataset.optionPreview = "";
    const placeholder = element("span", "option-image-placeholder", "Chưa có ảnh");
    placeholder.dataset.optionImagePlaceholder = "";
    preview.append(image, placeholder);

    const controls = element("div", "option-image-controls");
    const choose = element("button", "admin-image-upload", "Chọn ảnh");
    choose.type = "button";
    choose.dataset.chooseOptionImage = "";
    const remove = element("button", "admin-image-remove", "Gỡ ảnh");
    remove.type = "button";
    remove.dataset.removeOptionImage = "";
    controls.append(choose, remove);
    const fileNameLabel = element("span", "option-image-file-name");
    fileNameLabel.dataset.optionImageFileName = "";
    editor.append(preview, controls, fileNameLabel);
    editor.dataset.imageSource = source || "";
    editor.dataset.imageFileName = fileNameForImage(source || "", fileName);
    showFileName(fileNameLabel, editor.dataset.imageFileName);
    setPreview(image, placeholder, source || "", alt);
    return editor;
  }

  const rowBuilders = window.KatAdminProductEditRows.create({ element: element, createImageEditor: createImageEditor });
  const createVariantRow = rowBuilders.createVariantRow;
  const createSpiceRow = rowBuilders.createSpiceRow;
  const createToppingRow = rowBuilders.createToppingRow;
  const renderRows = rowBuilders.renderRows;

  function loadInitialData() {
    if (isAddMode) {
      form.elements.productName.value = "";
      form.elements.productType.value = "";
      form.elements.category.value = "";
      form.elements.description.value = "";
      form.elements.hasVariants.checked = false;
      form.elements.sellingPrice.value = "";
      form.elements.originalPrice.value = "";
      renderRows(variantList, [], createVariantRow);
      renderRows(spiceList, [], createSpiceRow);
      renderRows(toppingList, [], createToppingRow);
      mainImage.dataset.imageSource = "";
      mainImage.dataset.imageFileName = "";
      setPreview(mainImage, mainImagePlaceholder, "", "");
      showFileName(mainImageFileName, "");
      return;
    }

    form.elements.productName.value = "Bánh tráng";
    form.elements.productType.value = "food";
    form.elements.description.value = "Bánh tráng giòn dai, trộn sốt me chua ngọt và rau thơm.";
    form.elements.hasVariants.checked = true;
    form.elements.sellingPrice.value = "15.000";
    form.elements.originalPrice.value = "";
    renderRows(variantList, defaultVariants, createVariantRow);
    renderRows(spiceList, defaultSpices, createSpiceRow);
    renderRows(toppingList, defaultToppings, createToppingRow);
    mainImage.dataset.imageSource = defaultImage;
    mainImage.dataset.imageFileName = fileNameForImage(defaultImage, "");
    showFileName(mainImageFileName, mainImage.dataset.imageFileName);
    setPreview(mainImage, mainImagePlaceholder, defaultImage, "Bánh tráng");
  }

  function updateImageEditor(editor, source, fileName) {
    editor.dataset.imageSource = source;
    editor.dataset.imageFileName = fileNameForImage(source, fileName);
    setPreview(editor.querySelector("[data-option-preview]"), editor.querySelector("[data-option-image-placeholder]"), source, "Ảnh lựa chọn món");
    showFileName(editor.querySelector("[data-option-image-file-name]"), editor.dataset.imageFileName);
  }

  function updatePriceDisplay() {
    const useVariants = hasVariants.checked;
    const variantSection = form.querySelector("[data-variant-section]");
    variantSection.hidden = !useVariants;
    const prices = Array.from(variantList.querySelectorAll("[data-variant-price]"))
      .filter(function (input) { return input.value.trim(); });
    const count = variantList.querySelectorAll("[data-variant-row]").length;
    form.querySelector("[data-variant-count]").textContent = count + " loại";
    form.querySelector("[data-variant-title]").textContent = form.elements.productName.value.trim() || "món";

    if (useVariants && prices.length) {
      const lowestPrice = prices.reduce(function (lowest, input) {
        return parseManualPrice(input.value) < parseManualPrice(lowest.value) ? input : lowest;
      });
      priceInput.value = formatPriceValue(lowestPrice.value);
      priceInput.readOnly = true;
      priceLabel.textContent = "Giá thấp nhất (đ)";
      priceHelp.textContent = "Được tính tự động từ giá các loại và hiển thị trên thực đơn.";
    } else {
      priceInput.readOnly = false;
      priceLabel.textContent = "Giá bán (đ)";
      priceHelp.textContent = "Mức giá này sẽ hiển thị trên thực đơn khi món không có các lựa chọn riêng.";
    }
  }

  function handleClick(event) {
    const target = event.target.closest("button");
    if (!target) return;

    if (target.matches("[data-choose-main-image], [data-choose-option-image]")) {
      if (typeof window.showToast === "function") window.showToast("Đã chọn ảnh cho món.", "info");
      return;
    }
    if (target.matches("[data-remove-main-image], [data-remove-option-image]")) {
      if (typeof window.showToast === "function") window.showToast("Đã gỡ ảnh minh họa.", "info");
      return;
    }
    if (target.matches("[data-add-variant]")) {
      if (typeof window.showToast === "function") window.showToast("Đã thêm loại món.", "info");
      return;
    }
    if (target.matches("[data-add-spice]")) {
      if (typeof window.showToast === "function") window.showToast("Đã thêm mức cay.", "info");
      return;
    }
    if (target.matches("[data-add-topping]")) {
      if (typeof window.showToast === "function") window.showToast("Đã thêm topping.", "info");
      return;
    }
    if (target.matches("[data-remove-variant]")) {
      if (typeof window.showToast === "function") window.showToast("Đã xóa loại món.", "info");
      return;
    }
    if (target.matches("[data-remove-spice]")) {
      if (typeof window.showToast === "function") window.showToast("Đã xóa mức cay.", "info");
      return;
    }
    if (target.matches("[data-remove-topping]")) {
      if (typeof window.showToast === "function") window.showToast("Đã xóa topping.", "info");
      return;
    }
  }

  function refreshRowLabels(list, selector, prefix) {
    list.querySelectorAll(selector).forEach(function (node, index) {
      node.textContent = prefix + (selector === ".admin-field span" ? " " : " ") + (index + 1);
    });
  }

  loadInitialData();
  formatAllPriceInputs();
  updatePriceDisplay();
  form.addEventListener("click", handleClick);
  form.addEventListener("change", function (event) {
    if (event.target.matches("[data-has-variants]")) {
      const message = event.target.checked
        ? "Đã chọn món có nhiều loại."
        : "Đã hủy chọn món có nhiều loại.";
      if (typeof window.showToast === "function") window.showToast(message, "info");
      return;
    }
    if (event.target.matches("[data-variant-default]") && event.target.checked) {
      variantList.querySelectorAll("[data-variant-default]").forEach(function (radio) {
        radio.checked = radio === event.target;
      });
    }
  });
  form.addEventListener("input", function (event) {
    if (event.target.matches("[data-variant-price]")) updatePriceDisplay();
    if (event.target.matches('[name="productName"]')) updatePriceDisplay();
  });
  form.addEventListener("focusout", function (event) {
    if (!event.target.matches('[data-selling-price], [name="originalPrice"], [data-variant-price], [data-topping-price]')) return;
    formatPriceInput(event.target);
    if (event.target.matches("[data-variant-price]")) updatePriceDisplay();
  });
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!form.elements.productName.value.trim()) {
      form.elements.productName.focus();
      return;
    }
    if (hasVariants.checked && !variantList.querySelector("[data-variant-row]")) {
      if (typeof window.showToast === "function") window.showToast("Hãy thêm ít nhất một loại món hoặc tắt tùy chọn nhiều mức giá.", "error");
      return;
    }
    try {
      window.sessionStorage.setItem("katAdminFlash", isAddMode ? "Đã thêm món thành công." : "Đã lưu thay đổi.");
    } catch (error) {}
    window.location.href = "admin-products.html";
  });
})();
