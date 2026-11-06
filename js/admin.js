(function () {
  document.addEventListener("submit", function (event) {
    const form = event.target.closest("[data-demo-form]");
    if (!form) return;
    event.preventDefault();
    showToast(form.dataset.successMessage || "Đã bấm nút.", "success");
  });

  document.addEventListener("click", function (event) {
    const action = event.target.closest("[data-demo-action]");
    if (!action) return;
    showToast(action.dataset.message || "Đã bấm nút.", "info");
  });

  document.addEventListener("change", function (event) {
    const field = event.target.closest("[data-demo-change-message]");
    if (field) showToast(field.dataset.demoChangeMessage, "info");
  });
})();
