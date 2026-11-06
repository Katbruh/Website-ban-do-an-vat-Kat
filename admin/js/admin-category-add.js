(function () {
  "use strict";
  const form = document.querySelector("[data-category-form]");
  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const name = form.elements.name.value.trim();
    if (!name) {
      form.elements.name.focus();
      return;
    }
    try {
      window.sessionStorage.setItem("katAdminFlash", "Đã thêm danh mục “" + name + "” thành công.");
    } catch (error) {}
    window.location.href = "admin-categories.html";
  });
})();
