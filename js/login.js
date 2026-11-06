(function () {
  const params = new URLSearchParams(window.location.search);
  if (params.get("reset") === "success") {
    if (typeof window.showToast === "function") window.showToast("Đổi mật khẩu thành công.", "success");
    window.history.replaceState({}, "", window.location.pathname);
  }

  const tabs = Array.from(document.querySelectorAll("[data-auth-tab]"));
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  if (!loginForm || !registerForm) return;

  function setTab(name) {
    const isLogin = name === "login";
    loginForm.hidden = !isLogin;
    registerForm.hidden = isLogin;
    tabs.forEach(function (tab) {
      const selected = tab.dataset.authTab === name;
      tab.classList.toggle("is-active", selected);
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
  }

  tabs.forEach(function (tab, index) {
    tab.addEventListener("click", function () { setTab(tab.dataset.authTab); });
    tab.addEventListener("keydown", function (event) {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const nextIndex = event.key === "ArrowRight" ? (index + 1) % tabs.length : (index + tabs.length - 1) % tabs.length;
      tabs[nextIndex].focus();
      setTab(tabs[nextIndex].dataset.authTab);
    });
  });

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const values = new FormData(loginForm);
    if (window.KatAccount) window.KatAccount.setSession({
      role: "customer",
      fullName: "Nguyễn Thị Lan Anh",
      phone: String(values.get("phone") || "0908 345 612").trim(),
      email: "lananh@example.com",
      gender: "female"
    });
    window.location.href = "index.html";
  });

  registerForm.addEventListener("submit", function (event) {
    event.preventDefault();
    if (typeof window.showToast === "function") window.showToast("Đăng ký thành công.", "success");
    setTab("login");
  });
})();
