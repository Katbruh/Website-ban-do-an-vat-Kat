/* ============================================================
   THÔNG BÁO DÙNG CHUNG
   ============================================================ */
(function () {
  const region = document.getElementById("toast-region") || document.body.appendChild(Object.assign(document.createElement("div"), { id: "toast-region", className: "toast-region" }));

  window.showToast = function (message, type) {
    const toast = document.createElement("div");
    toast.className = "toast toast-" + (type || "info");
    toast.setAttribute("role", type === "error" ? "alert" : "status");
    toast.textContent = message;
    region.appendChild(toast);
    window.setTimeout(function () { toast.classList.add("is-leaving"); window.setTimeout(function () { toast.remove(); }, 220); }, 3600);
  };

})();
