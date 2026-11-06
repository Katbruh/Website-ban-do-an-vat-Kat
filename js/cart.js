(function () {
  const button = document.getElementById("place-order");
  if (!button) return;
  button.addEventListener("click", function () {
    window.location.href = "order-success.html";
  });
})();