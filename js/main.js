(function () {
  const carousel = document.getElementById("masthead-carousel");
  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(carousel.querySelectorAll("[data-hero-to]"));
    let activeIndex = slides.findIndex(function (slide) { return slide.classList.contains("is-active"); });
    let controlsTimer;

    function showControls() {
      carousel.classList.add("is-controls-visible");
      window.clearTimeout(controlsTimer);
      controlsTimer = window.setTimeout(function () {
        carousel.classList.remove("is-controls-visible");
      }, 3000);
    }

    function showSlide(nextIndex) {
      if (!slides.length) return;
      const normalizedIndex = (nextIndex + slides.length) % slides.length;
      if (normalizedIndex === activeIndex) return;

      carousel.classList.add("is-fading");
      slides[activeIndex].classList.remove("is-active");
      slides[activeIndex].setAttribute("aria-hidden", "true");
      slides[normalizedIndex].classList.add("is-active");
      slides[normalizedIndex].setAttribute("aria-hidden", "false");
      dots.forEach(function (dot, index) {
        dot.setAttribute("aria-pressed", String(index === normalizedIndex));
      });
      activeIndex = normalizedIndex;
      window.setTimeout(function () { carousel.classList.remove("is-fading"); }, 950);
      showControls();
    }

    carousel.addEventListener("click", function (event) {
      const control = event.target.closest("[data-hero-prev], [data-hero-next], [data-hero-to]");
      if (!control) return;
      event.preventDefault();
      if (control.hasAttribute("data-hero-prev")) showSlide(activeIndex - 1);
      else if (control.hasAttribute("data-hero-next")) showSlide(activeIndex + 1);
      else showSlide(Number(control.dataset.heroTo));
    });
    carousel.addEventListener("pointermove", showControls, { passive: true });
    carousel.addEventListener("focusin", showControls);
  }

  document.addEventListener("submit", function (event) {
    const form = event.target.closest("[data-demo-form]");
    if (!form) return;
    event.preventDefault();
    showToast(form.dataset.message || form.dataset.successMessage || "Đã bấm nút.", "info");
  });

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

    const action = event.target.closest("[data-demo-action], [data-demo-add-combo], [data-demo-map], [data-demo-social]");
    if (!action) return;
    const message = action.dataset.message || (action.hasAttribute("data-demo-add-combo")
      ? "Đã thêm combo vào giỏ hàng."
      : action.hasAttribute("data-demo-map")
        ? "Đã mở bản đồ chỉ đường (mô phỏng)."
        : action.hasAttribute("data-demo-social")
          ? "Đã mở liên kết mạng xã hội (mô phỏng)."
          : "Đã bấm nút.");
    showToast(message, "info");
  });

  const menuQuery = new URLSearchParams(window.location.search).get("q");
  const menuSearch = document.querySelector('[data-menu-filter] input[name="q"]');
  if (menuSearch && menuQuery) menuSearch.value = menuQuery;
})();
