(function () {
  var header = document.getElementById("header");
  var toggle = document.querySelector(".nav-toggle");
  var navMenu = document.querySelector(".nav-menu");

  /* ---- Header state on scroll ---- */
  function syncHeader() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 30);
  }
  window.addEventListener("scroll", syncHeader, { passive: true });
  syncHeader();

  /* ---- Mobile nav ---- */
  if (toggle && navMenu) {
    toggle.addEventListener("click", function () {
      var open = navMenu.classList.toggle("open");
      toggle.classList.toggle("active", open);
      toggle.setAttribute("aria-expanded", open);
    });

    navMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navMenu.classList.remove("open");
        toggle.classList.remove("active");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---- About photo carousel ---- */
  document.querySelectorAll("[data-about-carousel]").forEach(function (root) {
    var viewport = root.querySelector(".about-carousel-viewport");
    var track = root.querySelector(".about-carousel-track");
    var dotsWrap = root.querySelector(".about-carousel-dots");
    if (!viewport || !track || !dotsWrap) return;
    var slides = track.children;
    var total = slides.length;
    if (total < 2) return;
    var current = 0;
    var timer = null;
    var startX = 0;
    var dragging = false;

    for (var i = 0; i < total; i++) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "about-carousel-dot" + (i === 0 ? " active" : "");
      dot.setAttribute("aria-label", String(i + 1));
      dot.setAttribute("data-index", String(i));
      dotsWrap.appendChild(dot);
    }
    var dots = dotsWrap.querySelectorAll(".about-carousel-dot");

    function goTo(index) {
      if (index < 0) index = total - 1;
      if (index >= total) index = 0;
      current = index;
      track.style.transform = "translateX(-" + current * 100 + "%)";
      dots.forEach(function (d, idx) {
        d.classList.toggle("active", idx === current);
      });
    }

    function play() {
      stop();
      timer = setInterval(function () { goTo(current + 1); }, 4500);
    }
    function stop() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    dotsWrap.addEventListener("click", function (e) {
      var t = e.target.closest(".about-carousel-dot");
      if (!t) return;
      goTo(parseInt(t.getAttribute("data-index"), 10));
      play();
    });

    function onDown(x) {
      dragging = true;
      startX = x;
      viewport.classList.add("is-dragging");
      stop();
    }
    function onUp(x) {
      if (!dragging) return;
      dragging = false;
      viewport.classList.remove("is-dragging");
      var dx = x - startX;
      if (Math.abs(dx) >= 40) goTo(dx < 0 ? current + 1 : current - 1);
      play();
    }

    viewport.addEventListener("touchstart", function (e) {
      onDown(e.changedTouches[0].clientX);
    }, { passive: true });
    viewport.addEventListener("touchend", function (e) {
      onUp(e.changedTouches[0].clientX);
    }, { passive: true });
    viewport.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "touch") return;
      onDown(e.clientX);
    });
    window.addEventListener("pointerup", function (e) {
      if (e.pointerType === "touch") return;
      onUp(e.clientX);
    });

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", play);
    play();
  });

  /* ---- Reveal on scroll ---- */
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  document
    .querySelectorAll(".section-head, .about-grid, .feature, .signature, .menu-card, .menu-extra, .vip-block, .gallery-item, .review-card, .access-grid")
    .forEach(function (el) {
      el.classList.add("reveal");
      observer.observe(el);
    });

  /* ---- Review clamp / expand ---- */
  (function setupReviewClamps() {
    var lang = (document.documentElement.lang || "").toLowerCase();
    var labels =
      lang.indexOf("ja") === 0
        ? { more: "続きを読む", less: "閉じる" }
        : lang.indexOf("en") === 0
          ? { more: "Read more", less: "Show less" }
          : { more: "展开", less: "收起" };

    document.querySelectorAll(".review-card").forEach(function (card) {
      var quote = card.querySelector("blockquote");
      if (!quote) return;
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "review-more";
      btn.hidden = true;
      btn.textContent = labels.more;
      card.appendChild(btn);

      function fits() {
        return quote.scrollHeight <= quote.clientHeight + 2;
      }
      function sync() {
        if (card.classList.contains("is-expanded")) {
          btn.hidden = false;
          btn.textContent = labels.less;
          return;
        }
        btn.textContent = labels.more;
        btn.hidden = fits();
      }

      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        card.classList.toggle("is-expanded");
        sync();
      });

      sync();
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(sync);
      }
      window.addEventListener("resize", sync);
    });
  })();
})();
