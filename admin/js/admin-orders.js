(function () {
  "use strict";

  const validStatuses = ["Chờ xác nhận", "Đang chuẩn bị", "Đang giao", "Hoàn thành"];

  function isBeforeNovemberSix(orderId) {
    const dateCode = orderId.slice(4, 10);
    const day = Number(dateCode.slice(0, 2));
    const month = Number(dateCode.slice(2, 4));
    const year = 2000 + Number(dateCode.slice(4, 6));
    return new Date(year, month - 1, day) < new Date(2026, 10, 6);
  }

  document.querySelectorAll(".admin-order-table tbody tr").forEach(function (row) {
    const idCell = row.querySelector("td:first-child strong");
    const statusSelect = row.querySelector(".admin-order-status-select");
    const detailLink = row.querySelector(".report-order-button");
    if (!idCell || !statusSelect) return;

    const orderId = idCell.textContent.trim();
    if (detailLink) detailLink.href = "order-detail.html?id=KAT-061126-004";

    if (isBeforeNovemberSix(orderId)) statusSelect.value = "Hoàn thành";
    try {
      const saved = window.localStorage.getItem("katAdminOrderStatus_" + orderId);
      if (saved && validStatuses.includes(saved)) statusSelect.value = saved;
    } catch (error) {}

    statusSelect.addEventListener("change", function () {
      try { window.localStorage.setItem("katAdminOrderStatus_" + orderId, statusSelect.value); } catch (error) {}
      if (typeof window.showToast === "function") {
        window.showToast("Đã cập nhật trạng thái đơn " + orderId + ".", "success");
      }
    });
  });
})();
