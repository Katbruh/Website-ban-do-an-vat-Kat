(function () {
  const form = document.getElementById("checkout-form");
  const button = document.getElementById("place-order");
  if (!form || !button) return;

  const addressChoices = Array.from(form.querySelectorAll('input[name="addressChoice"]'));
  const savedAddress = form.elements.namedItem("savedAddress");
  const addressInput = form.elements.namedItem("shippingAddress");
  const savedAddressField = document.getElementById("saved-address-field");
  const newAddressField = document.getElementById("new-address-field");
  const orderTypes = Array.from(form.querySelectorAll('input[name="orderType"]'));
  const branchSelect = form.elements.namedItem("pickupBranch");
  let previouslyUsingSavedAddress = true;

  function updateAddressControls() {
    const useSavedAddress = addressChoices.some(function (choice) { return choice.checked && choice.value === "saved"; });
    savedAddress.disabled = !useSavedAddress;
    savedAddressField.hidden = !useSavedAddress;
    newAddressField.hidden = useSavedAddress;
    addressInput.disabled = useSavedAddress;
    if (!useSavedAddress && previouslyUsingSavedAddress) addressInput.value = "";
    previouslyUsingSavedAddress = useSavedAddress;
  }

  function updatePickupBranch() {
    const selectedType = orderTypes.find(function (choice) { return choice.checked; });
    const isDelivery = selectedType && selectedType.value === "delivery";
    branchSelect.disabled = Boolean(isDelivery);
    const branchField = document.getElementById("pickup-branch-field");
    if (branchField) branchField.classList.toggle("is-disabled", Boolean(isDelivery));
  }

  addressChoices.forEach(function (choice) { choice.addEventListener("change", updateAddressControls); });
  savedAddress.addEventListener("change", function () { addressInput.value = savedAddress.value; });
  orderTypes.forEach(function (choice) { choice.addEventListener("change", updatePickupBranch); });
  updateAddressControls();
  updatePickupBranch();

  button.addEventListener("click", function () {
    const isUsingNewAddress = addressChoices.some(function (choice) { return choice.checked && choice.value === "new"; });
    if (isUsingNewAddress && !addressInput.value.trim()) {
      addressInput.focus();
      if (typeof window.showToast === "function") window.showToast("Vui lòng nhập địa chỉ giao hàng.", "info");
      return;
    }
    window.location.href = "order-success.html";
  });
})();
