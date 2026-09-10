const dialog = document.querySelector<HTMLDialogElement>("#terminal-dialog");
const slot = document.querySelector<HTMLElement>("#terminal-frame-slot");
const close = document.querySelector<HTMLButtonElement>("#close-terminal");
const expand = document.querySelector<HTMLButtonElement>("#expand-terminal");
const motion = matchMedia("(prefers-reduced-motion: reduce)");
let closing = false;
let opener: HTMLElement | null = null;
// The drawer is a view, so the platform Back gesture should leave it rather
// than leave the site. Push an entry without touching the URL: a shareable
// address would then have to survive a reload, and the drawer does not.
let historyEntry = false;

function closeTerminal(fromHistory = false) {
  if (!dialog?.open || closing) return;
  closing = true;
  dialog.getAnimations().forEach((animation) => animation.cancel());
  const finish = () => {
    dialog.close();
    closing = false;
    if (historyEntry) {
      historyEntry = false;
      // Closing any other way has to consume the entry we pushed, or Back
      // would afterwards step through a view that is no longer open.
      if (!fromHistory) history.back();
    }
  };
  if (motion.matches) return finish();
  const animation = dialog.animate(
    [{ transform: "translateX(0)" }, { transform: "translateX(100%)" }],
    { duration: 220, easing: "cubic-bezier(.4, 0, 1, 1)" },
  );
  animation.onfinish = finish;
}
// Building the frame on click means the whole framed page loads while the
// drawer is animating in. Hovering, touching or focusing the control is a
// reliable signal of intent, and costs nothing for visitors who never use it.
function ensureFrame() {
  if (!slot || slot.firstChild) return;
  // Isolate the existing terminal's global CSS and event lifecycle.
  const frame = document.createElement("iframe");
  frame.src = "/terminal";
  frame.title = "Shaun’s interactive portfolio terminal";
  slot.append(frame);
}
document
  .querySelectorAll<HTMLAnchorElement>("[data-terminal]")
  .forEach((link) => {
    for (const signal of ["pointerenter", "touchstart", "focus"]) {
      link.addEventListener(signal, ensureFrame, {
        once: true,
        passive: true,
      });
    }
    link.addEventListener("click", (event) => {
      if (
        !dialog ||
        !slot ||
        typeof dialog.showModal !== "function" ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      event.preventDefault();
      opener = link;
      if (dialog.open) return;
      ensureFrame();
      dialog.showModal();
      if (!historyEntry) {
        history.pushState({ terminalOpen: true }, "");
        historyEntry = true;
      }
      if (!motion.matches)
        dialog.animate(
          [{ transform: "translateX(100%)" }, { transform: "translateX(0)" }],
          { duration: 340, easing: "cubic-bezier(.16, 1, .3, 1)" },
        );
      document.body.classList.add("terminal-open");
      close?.focus();
    });
  });
expand?.addEventListener("click", () => {
  const expanded = dialog?.classList.toggle("terminal-expanded") ?? false;
  expand.textContent = expanded ? "Back to sidebar" : "Full screen";
  expand.setAttribute("aria-pressed", String(expanded));
});
close?.addEventListener("click", () => closeTerminal());
addEventListener("popstate", () => {
  if (dialog?.open) closeTerminal(true);
  else historyEntry = false;
});
dialog?.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeTerminal();
});
dialog?.addEventListener("click", (event) => {
  if (event.target === dialog) closeTerminal();
});
dialog?.addEventListener("close", () => {
  document.body.classList.remove("terminal-open");
  opener?.focus();
});
slot?.addEventListener(
  "load",
  (event) => {
    const frame = event.target;
    if (frame instanceof HTMLIFrameElement)
      frame.contentDocument?.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          closeTerminal();
        }
      });
  },
  true,
);
const stage = document.querySelector<HTMLElement>("#computer-stage");
const computer = document.querySelector<HTMLElement>("#computer");
const coarse = matchMedia("(hover: none)");
stage?.addEventListener("pointermove", (event) => {
  if (!computer || motion.matches || event.pointerType !== "mouse") return;
  const bounds = stage.getBoundingClientRect();
  computer.style.setProperty(
    "--turn",
    `${-13 + ((event.clientX - bounds.left) / bounds.width - 0.5) * 18}deg`,
  );
  computer.style.setProperty(
    "--tilt",
    `${-7 - ((event.clientY - bounds.top) / bounds.height - 0.5) * 12}deg`,
  );
});
stage?.addEventListener("pointerleave", () => {
  computer?.style.removeProperty("--turn");
  computer?.style.removeProperty("--tilt");
});
// Touch has no pointer to follow, so the machine answers the input it does
// have: how far it has travelled through the viewport.
let tiltQueued = false;
function scrollTilt() {
  tiltQueued = false;
  if (!stage || !computer) return;
  const bounds = stage.getBoundingClientRect();
  const centre = (bounds.top + bounds.height / 2) / window.innerHeight;
  const travel = Math.min(Math.max(centre, 0), 1) - 0.5;
  computer.style.setProperty("--turn", `${-13 - travel * 16}deg`);
  computer.style.setProperty("--tilt", `${-7 + travel * 10}deg`);
}
if (coarse.matches && !motion.matches) {
  addEventListener(
    "scroll",
    () => {
      if (tiltQueued) return;
      tiltQueued = true;
      requestAnimationFrame(scrollTilt);
    },
    { passive: true },
  );
  scrollTilt();
}
