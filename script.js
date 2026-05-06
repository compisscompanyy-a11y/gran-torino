/* ===================================================
   GRAN TORINO — Script principal
   CSS 3D Burger rotation + GSAP animations + interactions
   =================================================== */

// ============ LOADER ============
window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("loader").classList.add("hidden");
    animateHeroEntrance();
  }, 1200);
});

// ============ NAVBAR SCROLL ============
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 60);
}, { passive: true });

// ============ MOBILE MENU ============
const burger = document.querySelector(".nav-burger");
const mobileMenu = document.getElementById("mobile-menu");
burger.addEventListener("click", () => {
  burger.classList.toggle("active");
  mobileMenu.classList.toggle("open");
  document.body.style.overflow = mobileMenu.classList.contains("open") ? "hidden" : "";
});
mobileMenu.querySelectorAll("a").forEach((a) => {
  a.addEventListener("click", () => {
    burger.classList.remove("active");
    mobileMenu.classList.remove("open");
    document.body.style.overflow = "";
  });
});

// ============ HERO ENTRANCE ANIMATION (GSAP) ============
function animateHeroEntrance() {
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
  tl.to(".hero-eyebrow", { opacity: 1, y: 0, duration: 0.8 })
    .to(".hero-line", { opacity: 1, y: 0, duration: 1, stagger: 0.15 }, "-=0.4")
    .to(".hero-sub", { opacity: 1, y: 0, duration: 0.8 }, "-=0.5")
    .to(".hero-ctas", { opacity: 1, y: 0, duration: 0.8 }, "-=0.4")
    .to(".hero-rating", { opacity: 1, y: 0, duration: 0.6 }, "-=0.3")
    .fromTo(".hero-burger-wrapper", { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 1.2, ease: "back.out(1.4)" }, "-=0.8");
}

// ============ HERO BURGER MOUSE PARALLAX ============
(function initBurgerParallax() {
  const wrapper = document.getElementById("hero-burger");
  if (!wrapper) return;

  let mouseX = 0;
  let mouseY = 0;
  let currentX = 0;
  let currentY = 0;

  document.addEventListener("mousemove", (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function animate() {
    currentX += (mouseX - currentX) * 0.03;
    currentY += (mouseY - currentY) * 0.03;

    const moveX = currentX * 18;
    const moveY = currentY * 10;

    wrapper.style.transform = `translateY(-50%) translate(${moveX}px, ${moveY}px)`;

    requestAnimationFrame(animate);
  }
  animate();
})();

// ============ MENU TABS ============
(function initMenuTabs() {
  const tabs = document.querySelectorAll(".menu-tab");
  const panels = document.querySelectorAll(".menu-panel");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // Deactivate all
      tabs.forEach((t) => t.classList.remove("active"));
      panels.forEach((p) => p.classList.remove("active"));

      // Activate clicked
      tab.classList.add("active");
      const target = document.getElementById("panel-" + tab.dataset.tab);
      if (target) {
        target.classList.add("active");

        // Re-trigger reveal animations for cards inside this panel
        target.querySelectorAll(".menu-card, .tapa-card").forEach((card) => {
          card.classList.remove("visible");
          void card.offsetWidth; // force reflow
          card.classList.add("visible");
        });
      }
    });
  });
})();

// ============ SCROLL REVEAL ============
function initReveal() {
  const reveals = document.querySelectorAll(
    ".menu-card, .ingredient-card, .review-card, .section-header, #cta-section h2, #cta-section p, .cta-buttons"
  );
  reveals.forEach((el, i) => {
    el.classList.add("reveal");
    el.classList.add("reveal-delay-" + ((i % 6) + 1));
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        } else {
          entry.target.classList.remove("visible");
        }
      });
    },
    { threshold: 0.1, rootMargin: "-50px" }
  );
  reveals.forEach((el) => observer.observe(el));
}
initReveal();

// ============ SMOOTH SCROLL FOR NAV ============
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (e) => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute("href"));
    if (target) target.scrollIntoView({ behavior: "smooth" });
  });
});

// ============ STAT COUNTER ANIMATION ============
function animateStats() {
  const stats = document.querySelectorAll(".stat-number");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseFloat(el.dataset.target);
          const isDecimal = target % 1 !== 0;
          const duration = 2000;
          const start = performance.now();

          function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = target * eased;
            el.textContent = isDecimal ? current.toFixed(1) : Math.floor(current);
            if (progress < 1) requestAnimationFrame(update);
          }
          requestAnimationFrame(update);
        } else {
          entry.target.textContent = "0";
        }
      });
    },
    { threshold: 0.3 }
  );
  stats.forEach((s) => observer.observe(s));
}
animateStats();
