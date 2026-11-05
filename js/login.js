(function () {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const tabs = Array.from(document.querySelectorAll("[data-auth-tab]"));
  let signedInNote = null;

  function setTab(tab) {
    const isLogin = tab === "login";
    loginForm.hidden = !isLogin;
    registerForm.hidden = isLogin;
    tabs.forEach(function (button) {
      const active = button.dataset.authTab === tab;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
    });
    document.getElementById("auth-title").textContent = isLogin ? "Tài khoản Kat" : "Tạo tài khoản Kat";
  }

  tabs.forEach(function (button, index) {
    button.addEventListener("click", function () { setTab(button.dataset.authTab); });
    button.addEventListener("keydown", function (event) {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const nextIndex = event.key === "ArrowRight" ? (index + 1) % tabs.length : (index + tabs.length - 1) % tabs.length;
      tabs[nextIndex].focus();
      setTab(tabs[nextIndex].dataset.authTab);
    });
  });

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!login(loginForm.elements.phone.value, loginForm.elements.password.value, "customer")) return;
    showToast("Đăng nhập thành công.", "success");
    window.setTimeout(function () { location.replace(getPostLoginDestination()); }, 250);
  });

  registerForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const password = registerForm.elements.password.value;
    if (password !== registerForm.elements.confirmPassword.value) {
      showToast("Mật khẩu xác nhận chưa khớp.", "error");
      registerForm.elements.confirmPassword.focus();
      return;
    }
    const fullname = [registerForm.elements.firstname.value.trim(), registerForm.elements.lastname.value.trim()].filter(Boolean).join(" ");
    if (!register({ fullname: fullname, email: registerForm.elements.email.value, phone: registerForm.elements.phone.value, password: password })) return;
    showToast("Tạo tài khoản thành công.", "success");
    window.setTimeout(function () { location.replace(getPostLoginDestination()); }, 250);
  });

  function updateSignedInNote() {
    if (!currentUser) {
      if (signedInNote) signedInNote.remove();
      signedInNote = null;
      return;
    }
    if (!signedInNote) {
      signedInNote = document.createElement("p");
      signedInNote.className = "signed-in-note";
      loginForm.before(signedInNote);
    }
    signedInNote.textContent = currentUser.role === "admin" ? "Đang đăng nhập bằng tài khoản quản trị. Mục Quản lý cửa hàng có trong menu tài khoản." : "Bạn đã đăng nhập. Có thể tiếp tục dùng tài khoản này hoặc đăng nhập tài khoản khác.";
  }

  window.addEventListener("kat:storage", function (event) {
    if (event.detail && event.detail.key === "currentUser") updateSignedInNote();
  });
  document.addEventListener("DOMContentLoaded", updateSignedInNote);
})();
