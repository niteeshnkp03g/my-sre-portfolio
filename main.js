"use strict";

const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ═══════════════════════════════
   CUSTOM CURSOR
═══════════════════════════════ */
const cursor    = document.getElementById("cursor");
const cursorDot = document.getElementById("cursorDot");
let mx = -200, my = -200, cx = -200, cy = -200;

document.addEventListener("mousemove", e => {
  mx = e.clientX; my = e.clientY;
  cursorDot.style.left = mx + "px";
  cursorDot.style.top  = my + "px";
});
if (finePointer && !reduceMotion) (function animateCursor() {
  cx += (mx - cx) * 0.12;
  cy += (my - cy) * 0.12;
  cursor.style.left = cx + "px";
  cursor.style.top  = cy + "px";
  requestAnimationFrame(animateCursor);
})();

document.querySelectorAll("a,button,.cert-card,.project-card,.stat-card,.interest-item,.achieve-card").forEach(el => {
  el.addEventListener("mouseenter", () => {
    cursor.style.width  = "54px";
    cursor.style.height = "54px";
    cursor.style.borderColor = "rgba(99,102,241,.5)";
  });
  el.addEventListener("mouseleave", () => {
    cursor.style.width  = "36px";
    cursor.style.height = "36px";
    cursor.style.borderColor = "";
  });
});


/* ═══════════════════════════════
   NAV SCROLL
═══════════════════════════════ */
const nav = document.getElementById("nav");
window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 60);
}, { passive: true });


/* ═══════════════════════════════
   MOBILE MENU
═══════════════════════════════ */
const navToggle  = document.getElementById("navToggle");
const mobileMenu = document.getElementById("mobileMenu");
const setMenu = open => {
  mobileMenu.classList.toggle("open", open);
  navToggle.setAttribute("aria-expanded", String(open));
};
navToggle.addEventListener("click", () => setMenu(!mobileMenu.classList.contains("open")));
document.addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });
document.querySelectorAll(".mob-link").forEach(l =>
  l.addEventListener("click", () => setMenu(false))
);


/* ═══════════════════════════════
   SMOOTH SCROLL
═══════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener("click", e => {
    const t = document.querySelector(a.getAttribute("href"));
    if (!t) return;
    e.preventDefault();
    t.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});


/* ═══════════════════════════════
   ACTIVE NAV ON SCROLL
═══════════════════════════════ */
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-link");

const syncActive = () => {
  let current = "";
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 130) current = s.id; });
  navLinks.forEach(l => l.classList.toggle("active", l.dataset.section === current));
};
window.addEventListener("scroll", syncActive, { passive: true });
syncActive();


/* ═══════════════════════════════
   HERO CANVAS — PARTICLE NETWORK
═══════════════════════════════ */
(function heroCanvas() {
  const canvas = document.getElementById("heroCanvas");
  const ctx    = canvas.getContext("2d");
  let W, H, pts;
  const COUNT = 85, DIST = 130;

  const resize = () => {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    pts = Array.from({ length: COUNT }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .38,
      vy: (Math.random() - .5) * .38,
    }));
  };
  window.addEventListener("resize", resize);
  resize();

  let mouseX = W / 2, mouseY = H / 2;
  canvas.addEventListener("mousemove", e => {
    const r = canvas.getBoundingClientRect();
    mouseX = e.clientX - r.left;
    mouseY = e.clientY - r.top;
  });

  const tick = () => {
    ctx.clearRect(0, 0, W, H);

    // Subtle radial gradient glow
    const grd = ctx.createRadialGradient(W*.3, H*.4, 0, W*.3, H*.4, W*.55);
    grd.addColorStop(0, "rgba(99,102,241,.06)");
    grd.addColorStop(1, "transparent");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);

    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      const dx = p.x - mouseX, dy = p.y - mouseY;
      const d  = Math.sqrt(dx*dx + dy*dy);
      if (d > 0 && d < 90) {
        p.vx += dx / d * .055; p.vy += dy / d * .055;
        const sp = Math.sqrt(p.vx**2 + p.vy**2);
        if (sp > 1.4) { p.vx /= sp; p.vy /= sp; }
      }
    });

    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < DIST) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(99,102,241,${(1 - d/DIST) * .32})`;
          ctx.lineWidth = .7;
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.stroke();
        }
      }
      ctx.beginPath();
      ctx.arc(pts[i].x, pts[i].y, 2, 0, Math.PI*2);
      ctx.fillStyle = "rgba(165,180,252,.5)";
      ctx.fill();
    }
    if (running) rafId = requestAnimationFrame(tick);
  };

  // Run only while the hero is visible and the tab is active.
  let running = false, rafId = 0, inView = true;
  const setRunning = on => {
    if (on && !running) { running = true; rafId = requestAnimationFrame(tick); }
    else if (!on) { running = false; cancelAnimationFrame(rafId); }
  };
  if (reduceMotion) {
    tick();                       // one static frame, no loop
  } else {
    new IntersectionObserver(([e]) => { inView = e.isIntersecting; setRunning(inView && !document.hidden); }).observe(canvas);
    document.addEventListener("visibilitychange", () => setRunning(inView && !document.hidden));
  }
})();


/* ═══════════════════════════════
   TYPED ROLE
═══════════════════════════════ */
(function typedRole() {
  const el    = document.getElementById("typedRole");
  const roles = [
    "Site Reliability Engineer",
    "Cloud Engineer",
    "Observability Specialist",
    "Product Support Engineer",
    "DevOps Practitioner",
  ];
  if (reduceMotion) { el.textContent = roles[0]; return; }
  let ri = 0, ci = 0, deleting = false;
  const type = () => {
    const word = roles[ri];
    el.textContent = deleting ? word.slice(0, --ci) : word.slice(0, ++ci);
    if (!deleting && ci === word.length) { deleting = true; setTimeout(type, 1800); return; }
    if (deleting && ci === 0)  { deleting = false; ri = (ri + 1) % roles.length; }
    setTimeout(type, deleting ? 48 : 88);
  };
  type();
})();


/* ═══════════════════════════════
   STAT COUNTERS
═══════════════════════════════ */
const counterObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el  = entry.target;
    const end = parseInt(el.dataset.target);
    const sfx = el.dataset.suffix || "+";
    const dur = 1600;
    const start = performance.now();
    const tick = now => {
      const pct = Math.min((now - start) / dur, 1);
      el.textContent = Math.floor(pct * end) + (pct === 1 ? sfx : "");
      if (pct < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    counterObs.unobserve(el);
  });
}, { threshold: .5 });
document.querySelectorAll(".stat-num").forEach(el => counterObs.observe(el));


/* ═══════════════════════════════
   SKILL BAR ANIMATION
═══════════════════════════════ */
const skillObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const fill = entry.target.querySelector(".skill-fill");
    if (fill) fill.style.width = fill.dataset.w + "%";
    skillObs.unobserve(entry.target);
  });
}, { threshold: .3 });
document.querySelectorAll(".skill-bar").forEach(el => skillObs.observe(el));


/* ═══════════════════════════════
   SKILLS CATEGORY FILTER
═══════════════════════════════ */
document.querySelectorAll(".skill-cat-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".skill-cat-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const cat = btn.dataset.cat;

    document.querySelectorAll(".skill-bar").forEach(bar => {
      const show = cat === "all" || bar.dataset.cat === cat;
      bar.classList.toggle("hidden", !show);

      // Re-trigger animation for newly visible bars
      if (show) {
        const fill = bar.querySelector(".skill-fill");
        if (fill && (fill.style.width === "0%" || fill.style.width === "")) {
          setTimeout(() => { fill.style.width = fill.dataset.w + "%"; }, 50);
        }
      }
    });
  });
});


/* ═══════════════════════════════
   REVEAL ON SCROLL
═══════════════════════════════ */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: .1 });
document.querySelectorAll(".reveal-up,.reveal-left,.reveal-right").forEach(el => revealObs.observe(el));


/* ═══════════════════════════════
   PROJECT CARD TILT
═══════════════════════════════ */
document.querySelectorAll(".project-card").forEach(card => {
  card.addEventListener("mousemove", e => {
    const r  = card.getBoundingClientRect();
    const x  = ((e.clientX - r.left) / r.width  - .5) * 8;
    const y  = ((e.clientY - r.top)  / r.height - .5) * -8;
    card.style.transform = `translateY(-5px) perspective(600px) rotateX(${y}deg) rotateY(${x}deg)`;
  });
  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
  });
});


/* ═══════════════════════════════
   CONTACT FORM  (Netlify Forms, mailto fallback)
═══════════════════════════════ */
document.getElementById("contactForm").addEventListener("submit", async e => {
  e.preventDefault();
  const form    = e.currentTarget;
  const name    = form.cName.value.trim();
  const email   = form.cEmail.value.trim();
  const subject = form.cSubject.value.trim();
  const message = form.cMessage.value.trim();
  const status  = document.getElementById("formStatus");
  const btn     = document.getElementById("submitBtn");

  const show = (type, text) => { status.className = "form-status " + type; status.textContent = text; };
  status.className = "form-status";

  if (!name || !email || !subject || !message) return show("error", "Please fill in all fields.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return show("error", "Please enter a valid email address.");

  btn.disabled = true;
  try {
    const res = await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(new FormData(form)).toString(),
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    form.reset();
    show("success", "Message sent. I'll get back to you soon.");
  } catch (err) {
    // Not on Netlify (or the request failed): fall back to the visitor's mail app.
    const body = `From: ${name} (${email})\n\n${message}`;
    window.location.href = `mailto:niteeshnkp03@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    show("success", "Opening your mail app…");
  } finally {
    btn.disabled = false;
  }
});


/* ═══════════════════════════════
   "ASK ME ABOUT" CHIPS → prefill contact subject
═══════════════════════════════ */
document.querySelectorAll(".ask-chip").forEach(chip => {
  chip.addEventListener("click", () => {
    const subject = document.getElementById("cSubject");
    if (subject) subject.value = "Question: " + chip.dataset.topic;
  });
});