(function () {
  const form = document.getElementById("admin-login-form");
  if (!form) return;
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const values = new FormData(form);
    if (window.KatAccount) window.KatAccount.setSession({
      role: "admin",
      fullName: "Quản trị viên",
      phone: String(values.get("phone") || "").trim(),
      email: ""
    });
    window.location.replace("admin.html");
  });
})();