(function () {
  "use strict";
  const grid = document.querySelector(".category-admin-grid");
  if (!grid) return;
  let categories = [];
  const storageKey = "katAdminNewCategories";
  try {
    const stored = JSON.parse(window.localStorage.getItem(storageKey) || "[]");
    const allCategories = Array.isArray(stored) ? stored : [];
    categories = allCategories.filter(function (category) {
      if (typeof category === "string") return category.trim().toLocaleLowerCase("vi") !== "aaaaa";
      return !category || typeof category.name !== "string" || category.name.trim().toLocaleLowerCase("vi") !== "aaaaa";
    });
    if (categories.length !== allCategories.length) {
      window.localStorage.setItem(storageKey, JSON.stringify(categories));
    }
  } catch (error) { categories = []; }

  categories.forEach(function (category) {
    if (!category || !category.name) return;
    const card = document.createElement("article");
    card.className = "category-admin-card";
    const heading = document.createElement("div");
    const icon = document.createElement("span");
    icon.className = "category-admin-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = category.name.slice(0, 1).toLocaleUpperCase("vi");
    const titleBlock = document.createElement("div");
    const title = document.createElement("h2");
    title.textContent = category.name;
    const count = document.createElement("p");
    count.textContent = "0 món";
    const badge = document.createElement("span");
    badge.className = "status-badge status-completed";
    badge.textContent = "Đang hiển thị";
    titleBlock.append(title, count, badge);
    heading.append(icon, titleBlock);
    const description = document.createElement("p");
    description.className = "category-admin-description";
    description.textContent = category.description || "Chưa có mô tả cho danh mục này.";
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
    card.append(heading, description, actions);
    grid.appendChild(card);
  });
})();
