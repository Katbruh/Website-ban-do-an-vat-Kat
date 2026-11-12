/* ============================================================
   HÀNH VI DÙNG CHUNG CHO CÁC TRANG BÁN HÀNG
   ============================================================ */
(function () {
  /* ---------- Masthead: tự chạy, chuyển slide và điều khiển ---------- */
  const carousel = document.getElementById("masthead-carousel");
  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(carousel.querySelectorAll("[data-hero-to]"));
    let activeIndex = slides.findIndex(function (slide) { return slide.classList.contains("is-active"); });
    let controlsTimer;
    let autoAdvanceTimer;
    let transitionTimer;

    function showControls() {
      carousel.classList.add("is-controls-visible");
      window.clearTimeout(controlsTimer);
      controlsTimer = window.setTimeout(function () {
        carousel.classList.remove("is-controls-visible");
      }, 3000);
    }

    function showSlide(nextIndex, direction) {
      if (!slides.length || carousel.classList.contains("is-sliding")) return;
      const normalizedIndex = (nextIndex + slides.length) % slides.length;
      if (normalizedIndex === activeIndex) return;

      window.clearTimeout(transitionTimer);
      carousel.classList.remove("is-fading");
      slides.forEach(function (slide) {
        slide.classList.remove("is-entering-left", "is-entering-right", "is-exiting-left", "is-exiting-right");
      });
      if (direction) {
        const outgoing = slides[activeIndex];
        const incoming = slides[normalizedIndex];
        carousel.classList.add("is-sliding");
        outgoing.classList.add(direction < 0 ? "is-exiting-right" : "is-exiting-left");
        incoming.classList.add(direction < 0 ? "is-entering-left" : "is-entering-right");
        void incoming.offsetWidth;
        window.requestAnimationFrame(function () {
          incoming.classList.remove("is-entering-left", "is-entering-right");
          transitionTimer = window.setTimeout(function () {
            outgoing.classList.remove("is-exiting-left", "is-exiting-right", "is-active");
            outgoing.setAttribute("aria-hidden", "true");
            incoming.classList.remove("is-exiting-left", "is-exiting-right");
            carousel.classList.remove("is-sliding");
          }, 650);
        });
      } else {
        carousel.classList.add("is-fading");
        transitionTimer = window.setTimeout(function () { carousel.classList.remove("is-fading"); }, 950);
      }
      slides[activeIndex].classList.remove("is-active");
      slides[activeIndex].setAttribute("aria-hidden", "true");
      slides[normalizedIndex].classList.add("is-active");
      slides[normalizedIndex].setAttribute("aria-hidden", "false");
      dots.forEach(function (dot, index) {
        dot.setAttribute("aria-pressed", String(index === normalizedIndex));
      });
      activeIndex = normalizedIndex;
      showControls();
      window.clearTimeout(autoAdvanceTimer);
      autoAdvanceTimer = window.setTimeout(function () { showSlide(activeIndex + 1); }, 5000);
    }

    if (slides.length > 1) autoAdvanceTimer = window.setTimeout(function advance() { showSlide(activeIndex + 1); }, 5000);

    carousel.addEventListener("click", function (event) {
      const control = event.target.closest("[data-hero-prev], [data-hero-next], [data-hero-to]");
      if (!control) return;
      event.preventDefault();
      if (control.hasAttribute("data-hero-prev")) showSlide(activeIndex - 1, -1);
      else if (control.hasAttribute("data-hero-next")) showSlide(activeIndex + 1, 1);
      else showSlide(Number(control.dataset.heroTo));
    });
    carousel.addEventListener("pointermove", showControls, { passive: true });
    carousel.addEventListener("focusin", showControls);
  }

  /* ---------- Form demo: thông báo thao tác tĩnh ---------- */
  document.addEventListener("submit", function (event) {
    const form = event.target.closest("[data-demo-form]");
    if (!form) return;
    event.preventDefault();
    showToast(form.dataset.message || form.dataset.successMessage || "Đã bấm nút.", "info");
  });

  /* ---------- Tìm kiếm: luôn mở trang kết quả với URL sạch ---------- */
  document.addEventListener("submit", function (event) {
    const form = event.target.closest("[data-menu-filter]");
    if (!form) return;
    event.preventDefault();

    const destination = new URL("menu-results.html", window.location.href);
    destination.search = "";
    destination.hash = "";
    window.location.assign(destination.href);
  });

  /* ---------- Danh mục và các nút thao tác mẫu ---------- */
  document.addEventListener("click", function (event) {
    const categoryButton = event.target.closest("#category-list [data-category-toggle]");
    if (categoryButton) {
      const categoryList = categoryButton.closest("#category-list");
      categoryList.querySelectorAll("[data-category-toggle]").forEach(function (button) {
        const isSelected = button === categoryButton;
        button.classList.toggle("is-active", isSelected);
        button.setAttribute("aria-pressed", String(isSelected));
      });
      return;
    }

    const action = event.target.closest("[data-demo-action], [data-demo-map], [data-demo-social]");
    if (!action) return;
    const message = action.dataset.message || (action.hasAttribute("data-demo-map")
        ? "Đã mở bản đồ chỉ đường (mô phỏng)."
        : action.hasAttribute("data-demo-social")
          ? "Đã mở liên kết mạng xã hội (mô phỏng)."
          : "Đã bấm nút.");
    showToast(message, "info");
  });

})();
