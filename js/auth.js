(function () {
  window.currentUser = readStore("currentUser");
  if (window.currentUser) {
    const account = (readStore("users") || []).find(function (user) { return user.id === window.currentUser.id; });
    if (!account || account.isActive === false) { window.currentUser = null; writeStore("currentUser", null); }
  }

  function normalizedPhone(value) {
    return String(value || "").replace(/\D/g, "");
  }

  function currentPageReference() {
    const fileName = location.pathname.split("/").pop() || "index.html";
    if (fileName === "login.html") return "index.html";
    return fileName + location.search + location.hash;
  }

  function loginUrl(returnTo) {
    const target = new URL("login.html", location.href);
    target.searchParams.set("returnTo", returnTo || currentPageReference());
    return target.href;
  }

  function adminLoginUrl() {
    const target = new URL("admin-login.html", location.href);
    target.searchParams.set("returnTo", "admin.html");
    return target.href;
  }

  function accountIcon() {
    return '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="3.4"></circle><path d="M5.4 20a6.6 6.6 0 0 1 13.2 0"></path></svg>';
  }

  function cartIcon() {
    return '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 4h2l2.2 11.1a2 2 0 0 0 2 1.6h8.1a2 2 0 0 0 1.9-1.4L21 8H6"></path><circle cx="10" cy="20" r="1"></circle><circle cx="18" cy="20" r="1"></circle></svg>';
  }

  function renderSharedHeader() {
    const fileName = location.pathname.split("/").pop() || "index.html";
    const navItems = [
      ["menu.html", "Thực đơn"],
      ["offers.html", "Ưu đãi hôm nay"],
      ["orders.html", "Đơn hàng"],
      ["stores.html", "Cửa hàng"],
      ["feedback.html", "Góp ý"]
    ];
    document.querySelectorAll(".main-nav").forEach(function (nav) {
      nav.setAttribute("aria-label", "Điều hướng chính");
      nav.innerHTML = navItems.map(function (item) {
        const active = fileName === item[0];
        return '<a class="nav-link' + (active ? ' is-current' : '') + '" href="' + item[0] + '"' + (active ? ' aria-current="page"' : '') + '>' + item[1] + '</a>';
      }).join("");
    });
    document.querySelectorAll(".header-tools").forEach(function (tools) {
      const cartCurrent = fileName === "cart.html";
      tools.innerHTML = '<a class="icon-tool cart-tool' + (cartCurrent ? ' is-current' : '') + '" href="cart.html" aria-label="Giỏ hàng" title="Giỏ hàng"' + (cartCurrent ? ' aria-current="page"' : '') + '>' + cartIcon() + '<span class="cart-count" data-cart-count>0</span></a><span class="auth-slot"></span>';
    });
  }

  function renderSharedFooter() {
    const contact = window.KAT_CONTACT || {};
    const stores = window.KAT_STORES || [];
    const branchLinks = stores.map(function (store) {
      const mapUrl = store.mapUrl || "stores.html";
      return '<a class="footer-branch-link" href="' + escapeHTML(mapUrl) + '"' + (store.mapUrl ? ' target="_blank" rel="noopener noreferrer"' : '') + '><span><strong>' + escapeHTML(store.shortLabel || store.name) + '</strong><small>' + escapeHTML(store.address) + '</small></span><span aria-hidden="true">↗</span></a>';
    }).join("");
    const socialLinks = '<div class="footer-social-links" aria-label="Mạng xã hội của Kat"><a class="footer-social-link footer-social-zalo" href="' + escapeHTML(contact.zaloUrl || "#") + '" target="_blank" rel="noopener noreferrer" aria-label="Zalo Kat" title="Zalo Kat"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2C6.48 2 2 5.9 2 10.72c0 2.47 1.16 4.7 3.02 6.2L4.3 21l4.52-2.3c1.02.3 2.1.46 3.18.46 5.52 0 10-3.9 10-8.44C22 5.9 17.52 2 12 2Z"/><path fill="#0068FF" d="M7.15 8.1h9.7v1.7l-5.48 4.1h5.48v2H7.15v-1.72l5.45-4.08H7.15z"/></svg></a><a class="footer-social-link footer-social-facebook" href="' + escapeHTML(contact.facebookUrl || "#") + '" target="_blank" rel="noopener noreferrer" aria-label="Facebook Kat" title="Facebook Kat"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M13.4 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1v2.3H7.7V13h2.6v8h3.1Z"/></svg></a></div>';
    const footer = '<div class="footer-main page-container"><div class="footer-brand"><a class="brand-name" href="index.html">kat<span class="brand-dot">.</span></a><p>Ăn vặt vui, nhớ vị Kat.</p><a href="index.html#about">Câu chuyện Kat</a><a href="feedback.html">Góp ý khách hàng</a></div><div><strong>Đặt món</strong><a href="menu.html">Thực đơn</a><a href="offers.html">Ưu đãi hôm nay</a><a href="orders.html">Theo dõi đơn</a></div><div class="footer-locations"><strong>Chi nhánh</strong>' + branchLinks + '</div><div class="footer-contact"><strong>Liên hệ</strong><a href="tel:' + escapeHTML(contact.phoneHref || "") + '">' + escapeHTML(contact.phone || "") + '</a><a href="mailto:' + escapeHTML(contact.email || "") + '">' + escapeHTML(contact.email || "") + '</a><span>' + escapeHTML(contact.hours || "") + '</span>' + socialLinks + '</div></div><div class="footer-bottom"><div class="page-container"><span>© Kat · Ăn vặt vui, nhớ vị Kat.</span><span>TP. HCM · 8:00–18:00</span></div></div>';
    document.querySelectorAll(".site-footer").forEach(function (element) { element.innerHTML = footer; });
  }

  window.getPostLoginDestination = function () {
    const query = new URLSearchParams(location.search);
    let returnTo = query.get("returnTo");
    if (!returnTo && query.get("next") === "admin") returnTo = "admin.html";
    if (!returnTo && document.referrer) {
      try {
        const referrer = new URL(document.referrer);
        if (referrer.origin === location.origin && !/(?:^|\/)login\.html$/.test(referrer.pathname)) {
          returnTo = referrer.pathname.split("/").pop() + referrer.search + referrer.hash;
        }
      } catch (error) { returnTo = ""; }
    }
    if (!returnTo) returnTo = "index.html";

    let destination;
    try { destination = new URL(returnTo, location.href); }
    catch (error) { return "index.html"; }
    const fileName = destination.pathname.split("/").pop() || "index.html";
    const allowedPages = ["index.html", "menu.html", "offers.html", "orders.html", "stores.html", "feedback.html", "cart.html", "admin.html"];
    const appDirectory = location.pathname.slice(0, location.pathname.lastIndexOf("/") + 1);
    if (destination.origin !== location.origin || !allowedPages.includes(fileName) || destination.pathname !== appDirectory + fileName) return "index.html";
    if (fileName === "admin.html" && (!currentUser || currentUser.role !== "admin")) return "index.html";
    return destination.href;
  };

  window.updateHeaderAuth = function () {
    document.querySelectorAll(".auth-slot").forEach(function (slot) {
      if (!currentUser) {
        const onLoginPage = location.pathname.endsWith("login.html");
        slot.innerHTML = '<a class="icon-tool account-login-link' + (onLoginPage ? ' is-current' : '') + '" href="login.html" aria-label="Đăng nhập" title="Đăng nhập"' + (onLoginPage ? ' aria-current="page"' : '') + '>' + accountIcon() + '</a>';
        return;
      }
      const label = currentUser.fullname || currentUser.username;
      const roleLabel = currentUser.role === "admin" ? "Chủ cửa hàng" : "Khách hàng";
      const managementLink = currentUser.role === "admin" ? '<a class="account-menu-link" role="menuitem" href="admin.html">Quản lý cửa hàng</a>' : "";
      const menuId = "account-menu-" + Math.random().toString(36).slice(2, 8);
      slot.innerHTML = '<div class="account-control"><button class="icon-tool account-trigger" type="button" aria-label="Tài khoản ' + escapeHTML(label) + '" title="Tài khoản" aria-expanded="false" aria-controls="' + menuId + '">' + accountIcon() + '<span class="account-chevron" aria-hidden="true">⌄</span></button><nav class="account-menu" id="' + menuId + '" aria-label="Tài khoản" hidden><div class="account-menu-heading"><strong>' + escapeHTML(label) + '</strong><small>' + roleLabel + '</small></div><a class="account-menu-link" href="orders.html">Đơn hàng của tôi</a>' + managementLink + '<button class="account-menu-signout" type="button" data-logout>Đăng xuất</button></nav></div>';
    });
    updateCartBadges();
  };

  window.updateCartBadges = function () {
    const total = (readStore("cart") || []).reduce(function (sum, item) { return sum + Number(item.quantity || 0); }, 0);
    document.querySelectorAll("[data-cart-count]").forEach(function (badge) {
      badge.textContent = String(total);
      badge.classList.toggle("has-items", total > 0);
      const cartLink = badge.closest(".cart-tool");
      if (cartLink) cartLink.setAttribute("aria-label", total ? "Giỏ hàng, " + total + " món" : "Giỏ hàng, đang trống");
    });
  };

  window.login = function (phone, password, requiredRole) {
    const phoneDigits = normalizedPhone(phone);
    const users = readStore("users") || [];
    const user = users.find(function (item) { return phoneDigits.length > 0 && normalizedPhone(item.phone) === phoneDigits; });
    if (!user || user.password !== password) { showToast("Số điện thoại hoặc mật khẩu chưa đúng.", "error"); return false; }
    if (requiredRole === "admin" && user.role !== "admin") { showToast("Tài khoản này không có quyền quản trị.", "error"); return false; }
    if (requiredRole === "customer" && user.role === "admin") { showToast("Hãy dùng trang đăng nhập quản trị.", "error"); return false; }
    if (user.isActive === false) { showToast("Tài khoản này đang bị khóa. Hãy liên hệ quản trị viên.", "error"); return false; }
    currentUser = { id: user.id, username: user.username, fullname: user.fullname, role: user.role, phone: user.phone, address: user.address, email: user.email || "" };
    writeStore("currentUser", currentUser);
    return true;
  };

  window.register = function (data) {
    const users = readStore("users") || [];
    const phone = String(data.phone || "").trim();
    const phoneDigits = normalizedPhone(phone);
    const email = String(data.email || "").trim().toLocaleLowerCase("vi");
    if (phoneDigits.length < 9 || phoneDigits.length > 15) { showToast("Hãy nhập số điện thoại hợp lệ.", "error"); return false; }
    if (users.some(function (user) { return normalizedPhone(user.phone) === phoneDigits; })) {
      showToast("Số điện thoại này đã được đăng ký.", "error"); return false;
    }
    if (email && users.some(function (user) { return String(user.email || "").toLocaleLowerCase("vi") === email; })) {
      showToast("Địa chỉ email này đã được sử dụng.", "error"); return false;
    }
    const user = { id: makeId("USR"), username: phoneDigits, password: data.password, fullname: String(data.fullname || "").trim(), email: email, phone: phone, address: "", role: "user", isActive: true };
    users.push(user); writeStore("users", users);
    currentUser = { id: user.id, username: user.username, fullname: user.fullname, role: user.role, phone: user.phone, address: "", email: user.email };
    writeStore("currentUser", currentUser);
    return true;
  };

  window.logout = function () {
    const wasOnAdminPage = location.pathname.endsWith("admin.html");
    currentUser = null; writeStore("currentUser", null); updateHeaderAuth();
    if (wasOnAdminPage) location.replace("admin-login.html");
    else location.reload();
  };

  window.requireAdmin = function () {
    const account = currentUser && (readStore("users") || []).find(function (user) { return user.id === currentUser.id; });
    if (currentUser && currentUser.role === "admin" && account && account.role === "admin" && account.isActive !== false) return true;
    showToast("Bạn cần quyền quản trị để mở trang này.", "error");
    window.setTimeout(function () { location.href = adminLoginUrl(); }, 350);
    return false;
  };

  document.addEventListener("click", function (event) {
    const trigger = event.target.closest(".account-trigger");
    if (trigger) {
      const menu = trigger.parentElement.querySelector(".account-menu");
      const expanded = trigger.getAttribute("aria-expanded") === "true";
      trigger.setAttribute("aria-expanded", String(!expanded));
      menu.hidden = expanded;
      return;
    }
    if (event.target.closest("[data-logout]")) { logout(); return; }

    const accountControl = event.target.closest(".account-control");
    if (!accountControl) closeAccountMenus();

    const loginLink = event.target.closest('a[href*="login.html"]');
    if (!loginLink || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const currentFile = location.pathname.split("/").pop();
    if (currentFile === "login.html") return;
    let destination;
    try { destination = new URL(loginLink.href, location.href); }
    catch (error) { return; }
    if (destination.origin !== location.origin || !destination.pathname.endsWith("login.html") || destination.searchParams.has("returnTo")) return;
    event.preventDefault();
    location.href = loginUrl(currentPageReference());
  });

  function closeAccountMenus() {
    document.querySelectorAll(".account-trigger[aria-expanded='true']").forEach(function (trigger) {
      trigger.setAttribute("aria-expanded", "false");
      const menu = trigger.parentElement.querySelector(".account-menu");
      if (menu) menu.hidden = true;
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    const openTrigger = document.querySelector(".account-trigger[aria-expanded='true']");
    if (openTrigger) { closeAccountMenus(); openTrigger.focus(); }
  });
  renderSharedHeader();
  renderSharedFooter();
  updateHeaderAuth();
  document.addEventListener("DOMContentLoaded", updateHeaderAuth);
  window.addEventListener("kat:storage", function (event) { if (event.detail && event.detail.key === "cart") updateCartBadges(); });
})();
