(function () {
  const form = document.getElementById("customer-feedback-form");
  if (!form) return;
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    showToast("Cảm ơn bạn. Góp ý đã được ghi nhận.", "success");
  });
})();