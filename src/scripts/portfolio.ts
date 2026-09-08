const dialog = document.querySelector<HTMLDialogElement>("#terminal-dialog");
const slot = document.querySelector<HTMLElement>("#terminal-frame-slot");
const close = document.querySelector<HTMLButtonElement>("#close-terminal");
const expand = document.querySelector<HTMLButtonElement>("#expand-terminal");
const motion = matchMedia("(prefers-reduced-motion: reduce)");
let closing = false;
let opener: HTMLElement | null = null;

function closeTerminal() {
  if (!dialog?.open || closing) return;
  closing = true;
  dialog.getAnimations().forEach((animation) => animation.cancel());
  const finish = () => {
    dialog.close();
    closing = false;
  };
  if (motion.matches) return finish();
  const animation = dialog.animate(
    [{ transform: "translateX(0)" }, { transform: "translateX(100%)" }],
    { duration: 220, easing: "cubic-bezier(.4, 0, 1, 1)" },
  );
  animation.onfinish = finish;
}
document
  .querySelectorAll<HTMLAnchorElement>("[data-terminal]")
  .forEach((link) => {
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
      if (!slot.firstChild) {
        // Isolate the existing terminal's global CSS and event lifecycle.
        const frame = document.createElement("iframe");
        frame.src = "/terminal";
        frame.title = "Shaun’s interactive portfolio terminal";
        slot.append(frame);
      }
      dialog.showModal();
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
close?.addEventListener("click", closeTerminal);
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
