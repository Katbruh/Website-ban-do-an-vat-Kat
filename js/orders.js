(function () {
  const form = document.getElementById("order-lookup-form");
  const history = document.getElementById("purchase-history");
  if (!form || !history) return;

  const phoneInput = form.elements.namedItem("phone");
  const samplePhone = "0908345612";

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const enteredPhone = phoneInput.value.replace(/\D/g, "");
    history.hidden = true;

    if (!enteredPhone) {
      showToast("Nhập số điện thoại để tra cứu đơn hàng.", "info");
      return;
    }

    if (enteredPhone !== samplePhone) {
      showToast("Không tìm thấy lịch sử đơn hàng cho số điện thoại này.", "info");
      return;
    }

    history.hidden = false;
  });
})();