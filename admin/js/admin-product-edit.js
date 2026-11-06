(function () {
  "use strict";

  const form = document.querySelector("[data-product-edit-form]");
  if (!form) return;

  const isAddMode = form.dataset.productMode === "add";
  const addedProductId = new URLSearchParams(window.location.search).get("productId");
  const storageKey = addedProductId ? "katAdminAddedProduct_" + addedProductId : "katAdminProductOptions_banh-trang";
  const defaultImage = "images/banh-trang-tron.jpg";
  const previousDefaultVariantNames = [
    "Bánh tráng trộn",
    "Bánh tráng cuốn bơ me",
    "Bánh tráng chấm tắc bò",
    "Bánh tráng chiên muối ớt",
    "Bánh tráng phơi sương hành phi",
    "Bánh tráng cuộn tôm hành"
  ];
  const defaultVariants = [
    { name: "Bánh tráng trộn", price: 25000, image: "images/banh-trang-tron.jpg", selected: true },
    { name: "Bánh tráng cuốn bơ me", price: 20000, image: "images/banh-trang-cuon-bo-me.jpg" },
    { name: "Bánh tráng chấm tắc bơ", price: 15000, image: "images/banh-trang-cuon-tac-bo.jpg" },
    { name: "Bánh tráng chiên muối ớt", price: 15000, image: "images/banh-trang-chien-muoi-ot.png" },
    { name: "Bánh tráng phơi sương hành phi", price: 15000, image: "images/banh-trang-phoi-suong-hanh-phi.jpg" },
    { name: "Bánh tráng cuộn tôm hành", price: 15000, image: "images/banh-trang-cuon-tom-hanh.jpg" }
  ];
  const defaultSpices = [
    { name: "Không cay" },
    { name: "Cay vừa (Tiêu chuẩn)", selected: true },
    { name: "Siêu cay xé lưỡi" }
  ];
  const defaultToppings = [
    { name: "Phô mai sợi", price: 5000, image: "", visible: true },
    { name: "Khô bò xé cay", price: 7000, image: "", visible: true },
    { name: "Trứng cút 3 quả", price: 5000, image: "", visible: true },
    { name: "Xúc xích nướng", price: 6000, image: "", visible: true },
    { name: "Tép rim mỡ hành", price: 5000, image: "", visible: true }
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
    const label = element("label", "admin-image-upload", "Chọn ảnh");
    const input = element("input");
    input.type = "file";
    input.accept = "image/*";
    input.dataset.optionImageInput = "";
    label.appendChild(input);
    const remove = element("button", "admin-image-remove", "Gỡ ảnh");
    remove.type = "button";
    remove.dataset.removeOptionImage = "";
    controls.append(label, remove);
    const fileNameLabel = element("span", "option-image-file-name");
    fileNameLabel.dataset.optionImageFileName = "";
    editor.append(preview, controls, fileNameLabel);
    editor.dataset.imageSource = source || "";
    editor.dataset.imageFileName = fileNameForImage(source || "", fileName);
    showFileName(fileNameLabel, editor.dataset.imageFileName);
    setPreview(image, placeholder, source || "", alt);
    return editor;
  }

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

    const priceLabelNode = element("label", "admin-field");
    priceLabelNode.appendChild(element("span", "", "Giá bán (đ)"));
    const price = element("input");
    price.type = "number";
    price.min = "0";
    price.step = "1000";
    price.required = true;
    price.value = Number(data.price) || 0;
    price.dataset.variantPrice = "";
    priceLabelNode.appendChild(price);

    fields.append(defaultLabel, nameLabel, priceLabelNode);
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

    const priceLabelNode = element("label", "admin-field");
    priceLabelNode.appendChild(element("span", "", "Giá thêm (đ)"));
    const price = element("input");
    price.type = "number";
    price.min = "0";
    price.step = "1000";
    price.value = Number(data.price) || 0;
    price.dataset.toppingPrice = "";
    priceLabelNode.appendChild(price);

    fields.append(visibleLabel, nameLabel, priceLabelNode);
    content.append(imageEditor, fields);
    row.append(heading, content);
    return row;
  }

  function renderRows(list, items, createRow) {
    list.replaceChildren();
    items.forEach(function (item, index) { list.appendChild(createRow(item, index)); });
  }

  function seedNewCategories() {
    let categories = [];
    try { categories = JSON.parse(window.localStorage.getItem("katAdminNewCategories") || "[]"); } catch (error) {}
    if (!Array.isArray(categories)) return;
    const filteredCategories = categories.filter(function (category) {
      if (typeof category === "string") return category.trim().toLocaleLowerCase("vi") !== "aaaaa";
      return !category || typeof category.name !== "string" || category.name.trim().toLocaleLowerCase("vi") !== "aaaaa";
    });
    if (filteredCategories.length !== categories.length) {
      categories = filteredCategories;
      try { window.localStorage.setItem("katAdminNewCategories", JSON.stringify(categories)); } catch (error) {}
    }
    const select = form.elements.category;
    categories.forEach(function (category) {
      if (!category || !category.name) return;
      const exists = Array.from(select.options).some(function (option) { return option.value === category.name; });
      if (!exists) select.add(new Option(category.name, category.name));
    });
  }

  function loadSavedData() {
    let saved = null;
    try { saved = JSON.parse(window.localStorage.getItem(storageKey) || "null"); } catch (error) {}
    seedNewCategories();

    if (isAddMode || (addedProductId && !saved)) {
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
      if (addedProductId) {
        const title = document.querySelector(".admin-heading h1");
        if (title) title.textContent = "Không tìm thấy món cần sửa";
      }
      return;
    }

    if (!saved) {
      renderRows(variantList, defaultVariants, createVariantRow);
      renderRows(spiceList, defaultSpices, createSpiceRow);
      renderRows(toppingList, defaultToppings, createToppingRow);
      mainImage.dataset.imageSource = defaultImage;
      mainImage.dataset.imageFileName = fileNameForImage(defaultImage, "");
      showFileName(mainImageFileName, mainImage.dataset.imageFileName);
      return;
    }

    form.elements.productName.value = saved.name || "Bánh tráng";
    form.elements.productType.value = saved.productType || "food";
    if (Array.from(form.elements.category.options).some(function (option) { return option.value === saved.category; })) {
      form.elements.category.value = saved.category;
    }
    form.elements.description.value = saved.description || "";
    form.elements.hasVariants.checked = saved.hasVariants !== false;
    form.elements.sellingPrice.value = saved.sellingPrice || 0;
    form.elements.originalPrice.value = saved.originalPrice || "";
    if (addedProductId) {
      const title = document.querySelector(".admin-heading h1");
      if (title) title.textContent = "Sửa món " + (saved.name || "");
      document.title = "Sửa món " + (saved.name || "") + " · Quản trị Kat";
    }

    let variants = Array.isArray(saved.variants) ? saved.variants : defaultVariants;
    variants = variants.map(function (variant, index) {
      const next = Object.assign({}, variant);
      const defaultVariant = addedProductId ? null : defaultVariants[index];
      if (defaultVariant && (next.name === defaultVariant.name || next.name === previousDefaultVariantNames[index])) {
        next.name = defaultVariant.name;
        next.price = defaultVariant.price;
      }
      const isLegacyImage = Number(saved.schemaVersion || 0) < 3 && defaultVariant &&
        (!next.image || next.image.replace(/^\.\.\//, "") === defaultImage);
      if (isLegacyImage) next.image = defaultVariant.image;
      next.imageFileName = fileNameForImage(next.image || "", isLegacyImage ? "" : next.imageFileName);
      return next;
    });
    let selectedVariantIndex = variants.findIndex(function (variant) { return Boolean(variant.selected); });
    if (selectedVariantIndex < 0 && variants.length) selectedVariantIndex = 0;
    variants = variants.map(function (variant, index) {
      return Object.assign({}, variant, { selected: index === selectedVariantIndex });
    });
    renderRows(variantList, variants, createVariantRow);

    let spices = Array.isArray(saved.spices) ? saved.spices : defaultSpices;
    if (saved.spice && !Array.isArray(saved.spices)) {
      spices = defaultSpices.map(function (item) { return Object.assign({}, item, { selected: item.name === saved.spice }); });
    }
    renderRows(spiceList, spices, createSpiceRow);

    let toppings = Array.isArray(saved.toppings) ? saved.toppings : defaultToppings;
    if (toppings.length && typeof toppings[0] === "string") {
      toppings = toppings.map(function (name) {
        const existing = defaultToppings.find(function (item) { return item.name === name; });
        return Object.assign({}, existing || { name: name, price: 0, image: "" }, { visible: true });
      });
    }
    renderRows(toppingList, toppings, createToppingRow);

    mainImage.dataset.imageSource = typeof saved.image === "string" ? saved.image : defaultImage;
    mainImage.dataset.imageFileName = fileNameForImage(mainImage.dataset.imageSource, saved.imageFileName);
    showFileName(mainImageFileName, mainImage.dataset.imageFileName);
    setPreview(mainImage, mainImagePlaceholder, mainImage.dataset.imageSource, saved.name || "Bánh tráng");
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
      .map(function (input) { return Number(input.value); })
      .filter(function (value) { return Number.isFinite(value) && value >= 0; });
    const count = variantList.querySelectorAll("[data-variant-row]").length;
    form.querySelector("[data-variant-count]").textContent = count + " loại";
    form.querySelector("[data-variant-title]").textContent = form.elements.productName.value.trim() || "món";

    if (useVariants && prices.length) {
      priceInput.value = Math.min.apply(Math, prices);
      priceInput.readOnly = true;
      priceLabel.textContent = "Giá thấp nhất (đ)";
      priceHelp.textContent = "Được tính tự động từ giá các loại và hiển thị trên thực đơn.";
    } else {
      priceInput.readOnly = false;
      priceLabel.textContent = "Giá bán (đ)";
      priceHelp.textContent = "Mức giá này sẽ hiển thị trên thực đơn khi món không có các lựa chọn riêng.";
    }
  }

  function compressImage(file) {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = function () {
        const image = new Image();
        image.onerror = reject;
        image.onload = function () {
          const maxSide = 720;
          const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(image.width * scale));
          canvas.height = Math.max(1, Math.round(image.height * scale));
          const context = canvas.getContext("2d");
          if (!context) { reject(new Error("Không đọc được ảnh.")); return; }
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/webp", 0.8));
        };
        image.src = String(reader.result);
      };
      reader.readAsDataURL(file);
    });
  }

  async function handleImageChange(input) {
    const file = input.files && input.files[0];
    if (!file) return;
    try {
      const source = await compressImage(file);
      const mainUpload = input.hasAttribute("data-main-image-input");
      if (mainUpload) {
        mainImage.dataset.imageSource = source;
        mainImage.dataset.imageFileName = file.name;
        showFileName(mainImageFileName, file.name);
        setPreview(mainImage, mainImagePlaceholder, source, form.elements.productName.value);
      } else {
        updateImageEditor(input.closest(".option-image-editor"), source, file.name);
      }
    } catch (error) {
      if (typeof window.showToast === "function") window.showToast("Không thể đọc ảnh này. Hãy chọn ảnh khác.", "error");
    }
    input.value = "";
  }

  function handleClick(event) {
    const target = event.target.closest("button");
    if (!target) return;

    if (target.matches("[data-add-variant]")) {
      const index = variantList.children.length;
      const row = createVariantRow({ name: "Loại mới", price: Number(priceInput.value) || 0, image: "", selected: !variantList.querySelector("[data-variant-default]:checked") }, index);
      variantList.appendChild(row);
      row.querySelector("[data-variant-name]").select();
      updatePriceDisplay();
      return;
    }
    if (target.matches("[data-add-spice]")) {
      const row = createSpiceRow({ name: "Mức cay mới" }, spiceList.children.length);
      spiceList.appendChild(row);
      row.querySelector("[data-spice-name]").select();
      return;
    }
    if (target.matches("[data-add-topping]")) {
      const row = createToppingRow({ name: "Topping mới", price: 0, visible: true }, toppingList.children.length);
      toppingList.appendChild(row);
      row.querySelector("[data-topping-name]").select();
      return;
    }
    if (target.matches("[data-remove-variant]")) {
      target.closest("[data-variant-row]").remove();
      if (!variantList.querySelector("[data-variant-default]:checked")) {
        const firstDefault = variantList.querySelector("[data-variant-default]");
        if (firstDefault) firstDefault.checked = true;
      }
      refreshRowLabels(variantList, ".option-editor-row-title", "Loại");
      updatePriceDisplay();
      return;
    }
    if (target.matches("[data-remove-spice]")) {
      target.closest("[data-spice-row]").remove();
      refreshRowLabels(spiceList, ".admin-field span", "Mức cay");
      return;
    }
    if (target.matches("[data-remove-topping]")) {
      target.closest("[data-topping-row]").remove();
      refreshRowLabels(toppingList, ".option-editor-row-title", "Topping");
      return;
    }
    if (target.matches("[data-remove-option-image]")) {
      updateImageEditor(target.closest(".option-image-editor"), "");
      return;
    }
    if (target.matches("[data-remove-main-image]")) {
      mainImage.dataset.imageSource = "";
      mainImage.dataset.imageFileName = "";
      showFileName(mainImageFileName, "");
      setPreview(mainImage, mainImagePlaceholder, "", "");
    }
  }

  function refreshRowLabels(list, selector, prefix) {
    list.querySelectorAll(selector).forEach(function (node, index) {
      node.textContent = prefix + (selector === ".admin-field span" ? " " : " ") + (index + 1);
    });
  }

  function collectData() {
    const variants = Array.from(variantList.querySelectorAll("[data-variant-row]")).map(function (row) {
      return {
        name: row.querySelector("[data-variant-name]").value.trim(),
        price: Number(row.querySelector("[data-variant-price]").value) || 0,
        image: row.querySelector(".option-image-editor").dataset.imageSource || "",
        imageFileName: row.querySelector(".option-image-editor").dataset.imageFileName || "",
        selected: row.querySelector("[data-variant-default]").checked
      };
    }).filter(function (item) { return item.name; });
    const spices = Array.from(spiceList.querySelectorAll("[data-spice-row]")).map(function (row) {
      return { name: row.querySelector("[data-spice-name]").value.trim(), selected: row.querySelector("[data-spice-default]").checked };
    }).filter(function (item) { return item.name; });
    const toppings = Array.from(toppingList.querySelectorAll("[data-topping-row]")).map(function (row) {
      return {
        name: row.querySelector("[data-topping-name]").value.trim(),
        price: Number(row.querySelector("[data-topping-price]").value) || 0,
        image: row.querySelector(".option-image-editor").dataset.imageSource || "",
        imageFileName: row.querySelector(".option-image-editor").dataset.imageFileName || "",
        visible: row.querySelector("[data-topping-visible]").checked
      };
    }).filter(function (item) { return item.name; });
    return {
      name: form.elements.productName.value.trim(),
      productType: form.elements.productType.value,
      category: form.elements.category.value,
      description: form.elements.description.value.trim(),
      hasVariants: hasVariants.checked,
      sellingPrice: Number(priceInput.value) || 0,
      originalPrice: Number(form.elements.originalPrice.value) || 0,
      image: mainImage.dataset.imageSource || "",
      imageFileName: mainImage.dataset.imageFileName || "",
      schemaVersion: 3,
      variants: variants,
      spices: spices,
      toppings: toppings
    };
  }

  loadSavedData();
  updatePriceDisplay();
  form.addEventListener("click", handleClick);
  form.addEventListener("change", function (event) {
    if (event.target.matches("[data-main-image-input], [data-option-image-input]")) handleImageChange(event.target);
    if (event.target.matches("[data-has-variants]")) updatePriceDisplay();
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
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const data = collectData();
    if (!data.name) {
      form.elements.productName.focus();
      return;
    }
    if (data.hasVariants && !data.variants.length) {
      if (typeof window.showToast === "function") window.showToast("Hãy thêm ít nhất một loại món hoặc tắt tùy chọn nhiều mức giá.", "error");
      return;
    }
    try {
      if (isAddMode) {
        data.id = "product-" + Date.now();
        const addedProducts = JSON.parse(window.localStorage.getItem("katAdminAddedProducts") || "[]");
        const products = Array.isArray(addedProducts) ? addedProducts : [];
        products.push(data);
        window.localStorage.setItem("katAdminAddedProduct_" + data.id, JSON.stringify(data));
        window.localStorage.setItem("katAdminAddedProducts", JSON.stringify(products));
        window.sessionStorage.setItem("katAdminFlash", "Đã thêm món “" + data.name + "” thành công.");
      } else if (addedProductId) {
        data.id = addedProductId;
        const addedProducts = JSON.parse(window.localStorage.getItem("katAdminAddedProducts") || "[]");
        const products = Array.isArray(addedProducts) ? addedProducts : [];
        const index = products.findIndex(function (product) { return product.id === addedProductId; });
        if (index >= 0) products[index] = data;
        else products.push(data);
        window.localStorage.setItem(storageKey, JSON.stringify(data));
        window.localStorage.setItem("katAdminAddedProducts", JSON.stringify(products));
        window.sessionStorage.setItem("katAdminFlash", "Đã cập nhật món “" + data.name + "”.");
      } else {
        window.localStorage.setItem(storageKey, JSON.stringify(data));
        window.sessionStorage.setItem("katAdminFlash", "Đã lưu thông tin và các lựa chọn của món “" + data.name + "”.");
      }
    } catch (error) {
      if (typeof window.showToast === "function") window.showToast("Không thể lưu thông tin. Ảnh có thể quá lớn hoặc bộ nhớ trình duyệt đã đầy.", "error");
      return;
    }
    window.location.href = "admin-products.html";
  });
})();
