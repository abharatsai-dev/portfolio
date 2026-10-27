/* Portfolio interactions — no dependencies. */
(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ---------- clock ---------- */
  const timeFormatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const clocks = [$("#clock"), $("#clock-menu"), $("#clock-contact")].filter(Boolean);
  const setClocks = () => {
    const now = new Date();
    const label = `IST ${timeFormatter.format(now)}`;
    clocks.forEach((el) => {
      el.textContent = label;
      if (el.tagName === "TIME") el.dateTime = now.toISOString();
    });
  };
  setClocks();
  setInterval(setClocks, 20000);

  /* ---------- current year ---------- */
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- header + progress ---------- */
  const head = $("#site-head");
  const progress = $("#progress-bar");
  let ticking = false;

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      head?.classList.toggle("is-scrolled", scrollTop > 12);
      if (progress) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const value = max > 0 ? Math.min(scrollTop / max, 1) : 0;
        progress.style.transform = `scaleX(${value})`;
      }
      ticking = false;
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- reveal on scroll ---------- */
  const revealItems = $$(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((el) => el.classList.add("is-in"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" }
    );
    revealItems.forEach((el) => revealObserver.observe(el));
  }

  /* ---------- active nav ---------- */
  const navLinks = $$(".nav a");
  const sections = navLinks
    .map((link) => {
      const id = link.getAttribute("href");
      return id ? document.querySelector(id) : null;
    })
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    const setActive = (id) => {
      navLinks.forEach((link) => {
        if (link.getAttribute("href") === `#${id}`) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    };
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-42% 0px -52% 0px", threshold: 0 }
    );
    sections.forEach((section) => navObserver.observe(section));
  }

  /* ---------- mobile menu ---------- */
  const menu = $("#menu");
  const menuBtn = $("#menu-btn");
  const menuLinks = $$(".menu-nav a");
  let menuOpen = false;
  let closeTimer;

  const focusables = () =>
    $$('a[href], button:not([disabled])', menu).filter((el) => el.offsetParent !== null);

  const openMenu = () => {
    clearTimeout(closeTimer);
    menuOpen = true;
    menu.hidden = false;
    document.querySelector("main")?.setAttribute("inert", "");
    document.querySelector(".site-foot")?.setAttribute("inert", "");
    requestAnimationFrame(() => menu.classList.add("is-open"));
    menuBtn.setAttribute("aria-expanded", "true");
    menuBtn.querySelector(".sr-only").textContent = "Close menu";
    document.body.classList.add("menu-open");
    window.setTimeout(() => menuLinks[0]?.focus(), 120);
  };

  const closeMenu = ({ restoreFocus = true } = {}) => {
    if (!menuOpen) return;
    menuOpen = false;
    menu.classList.remove("is-open");
    document.querySelector("main")?.removeAttribute("inert");
    document.querySelector(".site-foot")?.removeAttribute("inert");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.querySelector(".sr-only").textContent = "Open menu";
    document.body.classList.remove("menu-open");
    closeTimer = window.setTimeout(() => {
      if (!menuOpen) menu.hidden = true;
    }, reduceMotion ? 0 : 360);
    if (restoreFocus) menuBtn.focus();
  };

  menuBtn?.addEventListener("click", () => (menuOpen ? closeMenu() : openMenu()));

  menuLinks.forEach((link) =>
    link.addEventListener("click", () => closeMenu())
  );

  document.addEventListener("keydown", (event) => {
    if (!menuOpen) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu();
      return;
    }
    if (event.key !== "Tab") return;
    const items = [menuBtn, ...focusables()].filter(Boolean);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 980 && menuOpen) closeMenu({ restoreFocus: false });
  });

  /* ---------- pause the record when it is off-screen ---------- */
  const sleeve = $(".sleeve");
  if (sleeve && "IntersectionObserver" in window && !reduceMotion) {
    const sleeveObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => sleeve.classList.toggle("is-paused", !entry.isIntersecting));
      },
      { threshold: 0 }
    );
    sleeveObserver.observe(sleeve);
  }

  /* ---------- copy email ---------- */
  const copyBtn = $("#copy-email");
  const toast = $("#toast");
  let toastTimer;

  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2600);
  };

  copyBtn?.addEventListener("click", async () => {
    const email = copyBtn.dataset.email;
    if (!email) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(email);
      } else {
        const field = document.createElement("textarea");
        field.value = email;
        field.setAttribute("readonly", "");
        field.style.position = "fixed";
        field.style.opacity = "0";
        document.body.appendChild(field);
        field.select();
        document.execCommand("copy");
        field.remove();
      }
      copyBtn.textContent = "Copied";
      showToast("Email copied to clipboard");
      window.setTimeout(() => {
        copyBtn.textContent = "Copy email";
      }, 2200);
    } catch {
      showToast(`Email: ${email}`);
    }
  });

  /* ---------- smooth anchor scroll with fixed header ---------- */
  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const id = link.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      if (history.pushState) history.pushState(null, "", id);
    });
  });
})();
