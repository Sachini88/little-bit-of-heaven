(function () {
  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav-links");
  const filterBtns = document.querySelectorAll(".filter-btn");
  const galleryItems = document.querySelectorAll(".gallery-item");
  const galleryEmpty = document.getElementById("gallery-empty");
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const triggers = document.querySelectorAll(".gallery-trigger");
  const yearEl = document.getElementById("year");

  let visibleItems = [];
  let lightboxIndex = 0;

  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Sticky header */
  function onScroll() {
    if (window.scrollY > 40) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile nav */
  navToggle?.addEventListener("click", () => {
    const open = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!open));
    navMenu?.classList.toggle("is-open", !open);
  });

  navMenu?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navToggle?.setAttribute("aria-expanded", "false");
      navMenu?.classList.remove("is-open");
    });
  });

  /* Reveal on scroll */
  const revealEls = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  revealEls.forEach((el) => revealObserver.observe(el));

  /* Counter animation */
  const statValue = document.querySelector(".stat-value[data-count]");
  if (statValue) {
    const target = parseInt(statValue.dataset.count, 10);
    const counterObserver = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        counterObserver.disconnect();
        const duration = 1400;
        const start = performance.now();
        function tick(now) {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          statValue.textContent = Math.round(eased * target);
          if (t < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      },
      { threshold: 0.5 }
    );
    counterObserver.observe(statValue);
  }

  /* Gallery filter */
  function updateVisibleItems() {
    visibleItems = Array.from(galleryItems).filter(
      (item) => !item.classList.contains("is-hidden")
    );
  }

  function applyFilter(filter) {
    let visibleCount = 0;
    galleryItems.forEach((item) => {
      const categories = item.dataset.category || "";
      const match = filter === "all" || categories.split(" ").includes(filter);
      item.classList.toggle("is-hidden", !match);
      if (match) visibleCount += 1;
    });
    galleryEmpty?.classList.toggle("hidden", visibleCount > 0);
    updateVisibleItems();
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;
      filterBtns.forEach((b) => {
        const active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-selected", String(active));
      });
      applyFilter(filter);
    });
  });

  updateVisibleItems();

  /* Lightbox */
  function getCaption(trigger) {
    const cap = trigger.querySelector(".gallery-caption");
    if (!cap) return "";
    const title = cap.querySelector("strong")?.textContent || "";
    const sub = cap.querySelector("span:last-child")?.textContent || "";
    return sub ? `${title} — ${sub}` : title;
  }

  function openLightbox(index) {
    const item = visibleItems[index];
    if (!item) return;
    const trigger = item.querySelector(".gallery-trigger");
    const img = trigger?.querySelector("img");
    if (!img) return;

    lightboxIndex = index;
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = getCaption(trigger);
    lightbox.removeAttribute("hidden");
    requestAnimationFrame(() => lightbox.classList.add("is-open"));
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    document.body.style.overflow = "";
    setTimeout(() => {
      if (!lightbox.classList.contains("is-open")) {
        lightbox.setAttribute("hidden", "");
        lightboxImg.src = "";
      }
    }, 350);
  }

  function stepLightbox(delta) {
    if (!visibleItems.length) return;
    lightboxIndex = (lightboxIndex + delta + visibleItems.length) % visibleItems.length;
    openLightbox(lightboxIndex);
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      updateVisibleItems();
      const item = trigger.closest(".gallery-item");
      lightboxIndex = visibleItems.indexOf(item);
      if (lightboxIndex < 0) lightboxIndex = 0;
      openLightbox(lightboxIndex);
    });
  });

  lightbox.querySelector(".lightbox-close")?.addEventListener("click", closeLightbox);
  lightbox.querySelector(".lightbox-prev")?.addEventListener("click", () => stepLightbox(-1));
  lightbox.querySelector(".lightbox-next")?.addEventListener("click", () => stepLightbox(1));

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") stepLightbox(-1);
    if (e.key === "ArrowRight") stepLightbox(1);
  });
})();
