(function () {
    // Mô phỏng người dùng tĩnh thông qua URL (?demo-login=1), tuyệt đối không đọc/ghi localStorage
    const query = new URLSearchParams(location.search);
    const isDemoLoggedIn = query.get("demo-login") === "1";

    window.currentUser = isDemoLoggedIn
        ? {
            id: "USR_DEMO",
            username: "0912345678",
            fullname: "Nguyễn Văn Khách",
            role: "user",
            phone: "0912345678",
            address: "273 An Dương Vương, Quận 5, TP.HCM",
            email: "khachhang@kat.example"
        }
        : null;

    function accountIcon() {
        return '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="3.4"></circle><path d="M5.4 20a6.6 6.6 0 0 1 13.2 0"></path></svg>';
    }

    // Luôn trả về trang đích hợp lệ sau khi đăng nhập mô phỏng
    window.getPostLoginDestination = function () {
        const params = new URLSearchParams(location.search);
        const returnTo = params.get("returnTo");
        if (returnTo) return returnTo;
        return "index.html?demo-login=1";
    };

    // Chỉ cập nhật menu tài khoản nếu đang có ?demo-login=1, giữ nguyên HTML tĩnh của Header & Footer
    window.updateHeaderAuth = function () {
        if (!window.currentUser) return;
        document.querySelectorAll(".auth-slot").forEach(function (slot) {
            const label = window.currentUser.fullname || "Nguyễn Văn Khách";
            const menuId = "account-menu-demo";
            slot.innerHTML =
                '<div class="account-control">' +
                '<button class="icon-tool account-trigger" type="button" aria-label="Tài khoản ' + label + '" title="Tài khoản" aria-expanded="false" aria-controls="' + menuId + '">' +
                accountIcon() +
                '<span class="account-chevron" aria-hidden="true">⌄</span></button>' +
                '<nav class="account-menu" id="' + menuId + '" aria-label="Tài khoản" hidden>' +
                '<div class="account-menu-heading"><strong>' + label + '</strong><small>Khách hàng</small></div>' +
                '<a class="account-menu-link" href="orders.html">Đơn hàng của tôi</a>' +
                '<a class="account-menu-signout" href="index.html" data-logout>Đăng xuất</a>' +
                '</nav></div>';
        });
    };

    // Giữ nguyên số lượng giỏ hàng tĩnh trong HTML (mặc định là 3 món mẫu)
    window.updateCartBadges = function () {
        document.querySelectorAll("[data-cart-count]").forEach(function (badge) {
            if (!badge.textContent || badge.textContent === "0") {
                badge.textContent = "3";
            }
            badge.classList.add("has-items");
        });
    };

    // Bỏ kiểm tra tài khoản/mật khẩu thật: luôn cho phép đăng nhập & đăng ký thành công
    window.login = function () {
        return true;
    };

    window.register = function () {
        return true;
    };

    window.logout = function () {
        const wasOnAdminPage = location.pathname.includes("admin");
        window.currentUser = null;
        if (wasOnAdminPage) location.href = "admin-login.html";
        else location.href = "index.html";
    };

    // Bỏ chặn requireAdmin(): cho phép thầy mở trực tiếp bất kỳ file HTML quản trị nào
    window.requireAdmin = function () {
        return true;
    };

    document.addEventListener("click", function (event) {
        const trigger = event.target.closest(".account-trigger");
        if (trigger) {
            const menu = trigger.parentElement.querySelector(".account-menu");
            const expanded = trigger.getAttribute("aria-expanded") === "true";
            trigger.setAttribute("aria-expanded", String(!expanded));
            if (menu) menu.hidden = expanded;
            return;
        }

        if (event.target.closest("[data-logout]")) {
            event.preventDefault();
            window.logout();
            return;
        }

        // Chặn các link mạng xã hội / bản đồ mở tab ngoài và hiện thông báo mô phỏng
        const socialLink = event.target.closest(".footer-social-link, .footer-branch-link[target='_blank']");
        if (socialLink) {
            event.preventDefault();
            if (typeof showToast === "function") {
                showToast("Đã mở liên kết mạng xã hội (mô phỏng)");
            }
        }
    });

    document.addEventListener("DOMContentLoaded", function () {
        window.updateHeaderAuth();
        window.updateCartBadges();
    });
})();