(function () {
  const form = document.getElementById("admin-login-form");
  if (!form) return;
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    location.replace("admin.html");
  });
})();
