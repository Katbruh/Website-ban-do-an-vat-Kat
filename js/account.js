(function () {
  "use strict";
  const STORAGE_KEY = "katSession";

  function readSession() {
    try {
      const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
      if (!value || (value.role !== "admin" && value.role !== "customer")) return null;
      if (value.role === "customer" && (!value.fullName || value.fullName === "Khách hàng")) {
        value.fullName = "Nguyễn Thị Lan Anh";
        value.phone = "0908 345 612";
        value.email = "lananh@example.com";
        value.gender = "female";
        try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); } catch (error) {}
      }
      return value;
    } catch (error) { return null; }
  }
  function writeSession(session) {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session)); return true; }
    catch (error) { return false; }
  }
  function clearSession() {
    try { window.localStorage.removeItem(STORAGE_KEY); } catch (error) {}
  }
  function isAdminArea() {
    return /(?:^|\/)admin\//i.test(window.location.pathname.replace(/\\/g, "/"));
  }
  function isAdminLoginPage() {
    return /\/admin\/admin-login\.html$/i.test(window.location.pathname.replace(/\\/g, "/"));
  }
  window.KatAccount = { getSession: readSession, setSession: writeSession, clearSession: clearSession };

  const icon = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="3.4"></circle><path d="M5.4 20a6.6 6.6 0 0 1 13.2 0"></path></svg>';
  let menuIndex = 0;

  function createControl(anchor, session) {
    const control = document.createElement("div");
    control.className = "account-control";
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "icon-tool account-trigger";
    trigger.setAttribute("aria-label", "Tài khoản");
    trigger.setAttribute("aria-haspopup", "menu");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-controls", "account-menu-" + (++menuIndex));
    trigger.dataset.accountTrigger = "";
    trigger.innerHTML = icon;

    const menu = document.createElement("div");
    menu.className = "account-menu";
    menu.id = trigger.getAttribute("aria-controls");
    menu.setAttribute("role", "menu");
    menu.hidden = true;

    const heading = document.createElement("div");
    heading.className = "account-menu-heading";
    const name = document.createElement("strong");
    name.dataset.accountName = "";
    name.textContent = session.fullName || (session.role === "admin" ? "Quản trị viên" : "Khách hàng");
    const role = document.createElement("small");
    role.textContent = session.role === "admin" ? "Quản trị viên" : "Khách hàng";
    heading.append(name, role);

    const settings = document.createElement("a");
    settings.className = "account-menu-link";
    settings.href = document.body.classList.contains("admin-page") ? "../account-settings.html" : "account-settings.html";
    settings.setAttribute("role", "menuitem");
    settings.textContent = "Cài đặt tài khoản";

    const logout = document.createElement("button");
    logout.className = "account-menu-signout";
    logout.type = "button";
    logout.setAttribute("role", "menuitem");
    logout.dataset.accountLogout = "";
    logout.textContent = "Đăng xuất";

    menu.append(heading, settings, logout);
    control.append(trigger, menu);
    anchor.replaceWith(control);
  }

  function renderControls() {
    const session = readSession();
    const adminPage = document.body.classList.contains("admin-page");
    const adminActions = document.querySelector(".admin-header-actions");

    if (adminActions && !adminActions.querySelector(".account-login-link, [data-account-trigger]")) {
      adminActions.replaceChildren();
      const slot = document.createElement("span");
      slot.className = "auth-slot";
      const link = document.createElement("a");
      link.className = "icon-tool account-login-link";
      link.href = "admin-login.html";
      link.title = "Tài khoản";
      link.setAttribute("aria-label", "Tài khoản");
      link.innerHTML = icon;
      slot.append(link);
      adminActions.append(slot);
    }

    document.querySelectorAll(".auth-slot").forEach(function (slot) {
      const anchor = slot.querySelector(".account-login-link");
      if (!session) {
        if (anchor) anchor.href = adminPage ? "admin-login.html" : "login.html";
        return;
      }
      if (anchor) createControl(anchor, session);
    });
  }

  function renderAccountArea() {
    const area = document.querySelector("[data-account-area-content]");
    const loginNotice = document.querySelector("[data-account-login-notice]");
    const session = readSession();
    const isAdmin = session && session.role === "admin";
    if (area) area.hidden = !session;
    if (loginNotice) loginNotice.hidden = Boolean(session);

    document.querySelectorAll("[data-customer-account-link]").forEach(function (link) {
      link.hidden = Boolean(isAdmin);
    });
    document.querySelectorAll("[data-customer-only-content]").forEach(function (content) {
      content.hidden = Boolean(isAdmin);
    });
    document.querySelectorAll("[data-admin-account-note]").forEach(function (note) {
      note.hidden = !isAdmin;
    });
  }

  function renderSettings() {
    const form = document.querySelector("[data-account-settings-form]");
    if (!form) return;
    const session = readSession();
    const title = document.querySelector("[data-account-settings-title]");
    const roleLabel = document.querySelector("[data-account-role]");
    if (!session) return;

    const isAdmin = session.role === "admin";
    if (title) title.textContent = isAdmin ? "Cài đặt tài khoản quản trị" : "Cài đặt tài khoản";
    if (roleLabel) roleLabel.textContent = isAdmin ? "Tài khoản quản trị" : "Tài khoản khách hàng";
    form.elements.fullName.value = session.fullName || "";
    form.elements.phone.value = session.phone || "";
    form.elements.email.value = session.email || "";
    if (form.elements.gender) form.elements.gender.value = session.gender || "";
    if (form.elements.birthDay) form.elements.birthDay.value = session.birthDay || "";
    if (form.elements.birthMonth) form.elements.birthMonth.value = session.birthMonth || "";
    if (form.elements.birthYear) form.elements.birthYear.value = session.birthYear || "";
  }

  document.addEventListener("click", function (event) {
    const trigger = event.target.closest("[data-account-trigger]");
    if (trigger) {
      const open = trigger.getAttribute("aria-expanded") !== "true";
      document.querySelectorAll("[data-account-trigger]").forEach(function (button) {
        button.setAttribute("aria-expanded", "false");
        const menu = document.getElementById(button.getAttribute("aria-controls"));
        if (menu) menu.hidden = true;
      });
      trigger.setAttribute("aria-expanded", String(open));
      const menu = document.getElementById(trigger.getAttribute("aria-controls"));
      if (menu) menu.hidden = !open;
      return;
    }

    if (event.target.closest("[data-account-logout]")) {
      clearSession();
      window.location.reload();
      return;
    }

    if (!event.target.closest(".account-control")) {
      document.querySelectorAll("[data-account-trigger]").forEach(function (button) {
        button.setAttribute("aria-expanded", "false");
        const menu = document.getElementById(button.getAttribute("aria-controls"));
        if (menu) menu.hidden = true;
      });
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    document.querySelectorAll("[data-account-trigger]").forEach(function (button) {
      button.setAttribute("aria-expanded", "false");
      const menu = document.getElementById(button.getAttribute("aria-controls"));
      if (menu) menu.hidden = true;
    });
  });

  document.addEventListener("submit", function (event) {
    const form = event.target.closest("[data-account-settings-form]");
    if (!form) return;
    event.preventDefault();
    const session = readSession();
    if (!session) return;
    session.fullName = String(form.elements.fullName.value || "").trim();
    session.phone = String(form.elements.phone.value || "").trim();
    session.email = String(form.elements.email.value || "").trim();
    session.gender = String(form.elements.gender ? form.elements.gender.value : "");
    session.birthDay = String(form.elements.birthDay ? form.elements.birthDay.value : "");
    session.birthMonth = String(form.elements.birthMonth ? form.elements.birthMonth.value : "");
    session.birthYear = String(form.elements.birthYear ? form.elements.birthYear.value : "");
    if (!writeSession(session)) {
      if (typeof window.showToast === "function") window.showToast("Không thể lưu cài đặt tài khoản trên trình duyệt này.", "error");
      return;
    }
    document.querySelectorAll("[data-account-name]").forEach(function (node) {
      node.textContent = session.fullName || (session.role === "admin" ? "Quản trị viên" : "Khách hàng");
    });
    if (typeof window.showToast === "function") window.showToast("Đã lưu cài đặt tài khoản.", "success");
  });

  function renderReviewGate() {
    const form = document.querySelector("[data-review-form]");
    const prompt = document.querySelector("[data-review-login-prompt]");
    if (!form || !prompt) return;
    const signedIn = Boolean(readSession());
    form.hidden = !signedIn;
    prompt.hidden = signedIn;
  }

  function enforceAdminAccess() {
    if (!isAdminArea()) return;
    let session = readSession();
    if (session && session.role === "customer") {
      clearSession();
      session = null;
    }
    if (!isAdminLoginPage() && (!session || session.role !== "admin")) {
      window.location.replace("admin-login.html");
    }
  }

  enforceAdminAccess();
  renderControls();
  renderAccountArea();
  renderSettings();
  renderReviewGate();
})();
