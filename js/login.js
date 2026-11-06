(function () {
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const tabs = Array.from(document.querySelectorAll("[data-auth-tab]"));

    function setTab(tab) {
        const isLogin = tab === "login";
        if (loginForm) loginForm.hidden = !isLogin;
        if (registerForm) registerForm.hidden = isLogin;
        tabs.forEach(function (button) {
            const active = button.dataset.authTab === tab;
            button.classList.toggle("is-active", active);
            button.setAttribute("aria-selected", String(active));
            button.tabIndex = active ? 0 : -1;
        });
        const authTitle = document.getElementById("auth-title");
        if (authTitle) {
            authTitle.textContent = isLogin ? "Tài khoản Kat" : "Tạo tài khoản Kat";
        }
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

    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();
            if (typeof showToast === "function") {
                showToast("Đăng nhập thành công.", "success");
            }
            window.setTimeout(function () {
                location.href = "index.html?demo-login=1";
            }, 250);
        });
    }

    if (registerForm) {
        registerForm.addEventListener("submit", function (event) {
            event.preventDefault();
            if (typeof showToast === "function") {
                showToast("Đăng ký thành công", "success");
            } else {
                alert("Đăng ký thành công");
            }
            setTab("login");
        });
    }
})();