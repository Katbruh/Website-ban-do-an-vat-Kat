(function () {
  const form = document.getElementById("customer-feedback-form");
  if (!form) return;
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    const feedback = readStore("feedback") || [];
    feedback.unshift({
      id: makeId("FDBK"),
      userId: currentUser ? currentUser.id : "",
      name: String(values.get("name") || "").trim(),
      topic: String(values.get("topic") || "other"),
      email: String(values.get("email") || "").trim(),
      message: String(values.get("message") || "").trim(),
      createdAt: new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date())
    });
    if (!writeStore("feedback", feedback)) {
      showToast("Không lưu được góp ý. Hãy thử lại sau.", "error");
      return;
    }
    form.reset();
    const success = document.getElementById("feedback-success");
    if (success) success.hidden = false;
  });
})();
