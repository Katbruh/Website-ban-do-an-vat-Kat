(function () {
  const form = document.getElementById("admin-login-form");
  if (!form) return;
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!login(form.elements.phone.value, form.elements.password.value, "admin")) return;
    showToast("Đăng nhập quản trị thành công.", "success");
    window.setTimeout(function () { location.replace("admin.html"); }, 250);
  });
})();
