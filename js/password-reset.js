(function () {
  const requestForm = document.getElementById("password-reset-request");
  if (requestForm) {
    requestForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const phone = String(requestForm.elements.phone.value || "").trim();
      if (!phone) {
        if (typeof window.showToast === "function") window.showToast("Vui lòng nhập số điện thoại.", "error");
        return;
      }
      try { window.sessionStorage.setItem("katPasswordResetPhone", phone); } catch (error) {}
      if (typeof window.showToast === "function") window.showToast("Đã gửi mã OTP đến " + phone + ".", "success");
      window.setTimeout(function () { window.location.href = "reset-password.html"; }, 1200);
    });
  }

  const confirmForm = document.getElementById("password-reset-confirm");
  if (!confirmForm) return;

  let phone = "0908 345 612";
  try { phone = window.sessionStorage.getItem("katPasswordResetPhone") || phone; } catch (error) {}
  confirmForm.elements.phone.value = phone;
  const notice = document.getElementById("otp-sent-notice");
  if (notice) notice.textContent = "Nhập mã OTP gồm 6 chữ số đã được gửi đến " + phone + " để xác minh tài khoản.";

  const otpInput = confirmForm.elements.otp;
  otpInput.addEventListener("input", function () {
    otpInput.value = otpInput.value.replace(/\D/g, "").slice(0, 6);
  });

  confirmForm.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!/^\d{6}$/.test(otpInput.value)) {
      if (typeof window.showToast === "function") window.showToast("Mã OTP cần gồm đúng 6 chữ số.", "error");
      otpInput.focus();
      return;
    }
    const newPassword = String(confirmForm.elements.newPassword.value || "");
    const confirmPassword = String(confirmForm.elements.confirmPassword.value || "");
    if (!newPassword) {
      if (typeof window.showToast === "function") window.showToast("Vui lòng nhập mật khẩu mới.", "error");
      confirmForm.elements.newPassword.focus();
      return;
    }
    if (newPassword !== confirmPassword) {
      if (typeof window.showToast === "function") window.showToast("Mật khẩu xác nhận chưa khớp.", "error");
      confirmForm.elements.confirmPassword.focus();
      return;
    }
    try { window.sessionStorage.removeItem("katPasswordResetPhone"); } catch (error) {}
    window.location.href = "login.html?reset=success";
  });
})();
