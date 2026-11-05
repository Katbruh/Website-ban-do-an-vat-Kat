(function () {
  const region = document.getElementById("toast-region") || document.body.appendChild(Object.assign(document.createElement("div"), { id: "toast-region", className: "toast-region" }));
  let confirmDialog;

  window.showToast = function (message, type) {
    const toast = document.createElement("div");
    toast.className = "toast toast-" + (type || "info");
    toast.setAttribute("role", type === "error" ? "alert" : "status");
    toast.textContent = message;
    region.appendChild(toast);
    window.setTimeout(function () { toast.classList.add("is-leaving"); window.setTimeout(function () { toast.remove(); }, 220); }, 3600);
  };

  window.showConfirmModal = function (message, onConfirm, options) {
    if (confirmDialog) confirmDialog.remove();
    const opts = options || {};
    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop is-open";
    const dialog = document.createElement("section");
    dialog.className = "dialog confirm-dialog";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", "confirm-title");
    dialog.tabIndex = -1;
    dialog.innerHTML = '<p class="eyebrow">Xác nhận</p><h2 id="confirm-title">' + escapeHTML(opts.title || "Bạn chắc chứ?") + '</h2><p class="dialog-copy"></p><div class="dialog-actions"><button class="button button-secondary" type="button" data-cancel>Để sau</button><button class="button ' + (opts.danger ? "button-danger" : "button-primary") + '" type="button" data-confirm>' + escapeHTML(opts.confirmText || "Xác nhận") + '</button></div>';
    dialog.querySelector(".dialog-copy").textContent = message;
    backdrop.appendChild(dialog);
    document.body.appendChild(backdrop);
    confirmDialog = backdrop;
    const previousFocus = document.activeElement;
    const finish = function (result) {
      backdrop.remove(); confirmDialog = null;
      if (previousFocus && previousFocus.focus) previousFocus.focus();
      if (result && typeof onConfirm === "function") onConfirm();
      resolvePromise(result);
    };
    let resolvePromise;
    const promise = new Promise(function (resolve) { resolvePromise = resolve; });
    dialog.querySelector("[data-cancel]").addEventListener("click", function () { finish(false); });
    dialog.querySelector("[data-confirm]").addEventListener("click", function () { finish(true); });
    backdrop.addEventListener("click", function (event) { if (event.target === backdrop) finish(false); });
    dialog.addEventListener("keydown", function (event) { if (event.key === "Escape") finish(false); });
    window.requestAnimationFrame(function () { dialog.focus(); });
    return promise;
  };
})();
