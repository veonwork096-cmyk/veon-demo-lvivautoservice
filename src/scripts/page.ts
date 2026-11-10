// Page behaviour. Everything here is an enhancement: without JS all content is visible and every link works.

const desktop = window.matchMedia("(min-width: 1024px)");
const wide = window.matchMedia("(min-width: 768px)");

// 1. Header call button (desktop) and bottom bar (phone) appear once the hero field leaves the screen.
const field = document.querySelector<HTMLElement>("[data-hero-field]");
const header = document.querySelector<HTMLElement>("[data-header]");
const headerCall = document.querySelector<HTMLElement>("[data-header-call]");
const callbar = document.querySelector<HTMLElement>("[data-callbar]");
const setPast = (past: boolean) => {
  header?.classList.toggle("is-past", past);
  headerCall?.classList.toggle("is-shown", past);
  callbar?.classList.toggle("is-shown", past);
  if (callbar) callbar.inert = !past;
};
if (field && "IntersectionObserver" in window) {
  new IntersectionObserver(([entry]) => {
    if (!entry) return;
    const past = !entry.isIntersecting && entry.boundingClientRect.top < 0;
    setPast(past);
  }).observe(field);
} else {
  setPast(true);
}

// 2. Phone menu (<details>): close on link tap and on Escape.
const menu = document.querySelector<HTMLDetailsElement>("[data-menu]");
if (menu) {
  menu.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (target.closest("a[href^='#']")) menu.open = false;
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.open) {
      menu.open = false;
      menu.querySelector("summary")?.focus();
    }
  });
  desktop.addEventListener("change", () => { if (desktop.matches) menu.open = false; });
}

// 3. Situations: one open panel; on desktop one is always chosen.
const sitRoot = document.querySelector<HTMLElement>("[data-situations]");
if (sitRoot) {
  const toggles = [...sitRoot.querySelectorAll<HTMLButtonElement>("[data-sit-toggle]")];
  const panelOf = (b: HTMLButtonElement) => document.getElementById(b.getAttribute("aria-controls") ?? "");
  let active = desktop.matches ? 0 : -1;
  const render = () => {
    toggles.forEach((b, i) => {
      const open = i === active;
      b.setAttribute("aria-expanded", String(open));
      const p = panelOf(b);
      if (p) p.hidden = !open;
    });
  };
  toggles.forEach((b, i) => {
    b.addEventListener("click", () => {
      active = active === i && !desktop.matches ? -1 : i;
      render();
    });
  });
  desktop.addEventListener("change", () => {
    if (desktop.matches && active < 0) active = 0;
    render();
  });
  render();
}

// 4. Service groups: folded on the phone, always open from 768px.
const groups = [...document.querySelectorAll<HTMLDetailsElement>("[data-svc-group]")];
const syncGroups = () => {
  groups.forEach((g) => {
    g.open = wide.matches;
    const s = g.querySelector("summary");
    if (s) {
      if (wide.matches) s.setAttribute("tabindex", "-1");
      else s.removeAttribute("tabindex");
    }
  });
};
groups.forEach((g) => {
  g.addEventListener("toggle", () => { if (wide.matches && !g.open) g.open = true; });
});
wide.addEventListener("change", syncGroups);
syncGroups();

// 5. FutureLink notes on touch: shown by tap (or keyboard focus), hidden on scroll or a tap elsewhere; kept inside the screen.
const notes = [...document.querySelectorAll<HTMLElement>(".future-link")];
const fitNote = (el: HTMLElement) => {
  el.classList.remove("future-link--end");
  const n = el.querySelector<HTMLElement>(".future-link__note");
  if (n && n.getBoundingClientRect().right > document.documentElement.clientWidth - 8) el.classList.add("future-link--end");
};
const hideTips = () => notes.forEach((el) => el.classList.remove("is-tip"));
notes.forEach((el) => {
  el.addEventListener("mouseenter", () => fitNote(el));
  el.addEventListener("focus", () => fitNote(el));
});
document.addEventListener("click", (e) => {
  const el = (e.target as HTMLElement).closest<HTMLElement>(".future-link");
  const wasOpen = el?.classList.contains("is-tip");
  hideTips();
  if (el && !wasOpen) { fitNote(el); el.classList.add("is-tip"); }
});
window.addEventListener("scroll", hideTips, { passive: true });

// 6. Request form: never sends anything (the button is disabled; this guards implicit submission).
document.querySelectorAll<HTMLFormElement>("[data-request-form]").forEach((f) => {
  f.addEventListener("submit", (e) => e.preventDefault());
});
