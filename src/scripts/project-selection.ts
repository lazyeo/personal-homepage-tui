import { projects } from "../data/projects";
const showcase = document.querySelector<HTMLElement>(".project-showcase")!;
const host = showcase.querySelector<HTMLElement>("#scene")!;
const panels = Array.from(
  showcase.querySelectorAll<HTMLElement>("[data-project-panel]"),
);
const motion = matchMedia("(prefers-reduced-motion: reduce)");
// Kept with the projects, so reordering them cannot mislabel the evidence.
const notes = projects.map((project) => project.evidenceNote);
let selected = 0;
function selectProject(index: number, animate = true) {
  if (!Number.isInteger(index) || index < 0 || index >= panels.length) return;
  const changed = index !== selected;
  selected = index;
  host.dataset.selected = String(index);
  panels.forEach((panel, i) => {
    panel.getAnimations().forEach((animation) => animation.cancel());
    panel.hidden = i !== index;
    if (changed) panel.querySelector("details")?.removeAttribute("open");
  });
  showcase.querySelector("#preview-note")!.textContent = notes[index];
  showcase.querySelector("#project-count")!.textContent =
    `${index + 1} / ${panels.length}`;
  showcase.querySelector("#collection-name")!.textContent =
    panels[index].dataset.projectName!;
  host
    .querySelector(".project-stage-fallback")!
    .replaceChildren(
      panels[index].querySelector(".project-art")!.cloneNode(true),
    );
  host.dispatchEvent(new CustomEvent("project-change", { detail: index }));
  if (animate && changed && !motion.matches)
    panels[index].animate(
      [
        {
          opacity: 0.25,
          transform: "translateX(12px)",
          clipPath: "inset(0 0 5% 0)",
        },
        { opacity: 1, transform: "translateX(0)", clipPath: "inset(0 0 0 0)" },
      ],
      { duration: 360, easing: "cubic-bezier(.16,1,.3,1)" },
    );
}
showcase
  .querySelector("#project-prev")!
  .addEventListener("click", () =>
    selectProject((selected + panels.length - 1) % panels.length),
  );
showcase
  .querySelector("#project-next")!
  .addEventListener("click", () =>
    selectProject((selected + 1) % panels.length),
  );
showcase
  .querySelector("#project-picker")!
  .addEventListener("keydown", (event) => {
    const key = event as KeyboardEvent;
    const index =
      key.key === "ArrowRight"
        ? (selected + 1) % panels.length
        : key.key === "ArrowLeft"
          ? (selected + panels.length - 1) % panels.length
          : key.key === "Home"
            ? 0
            : key.key === "End"
              ? panels.length - 1
              : null;
    if (index === null) return;
    key.preventDefault();
    selectProject(index);
  });
host.addEventListener("project-pick", (event) =>
  selectProject((event as CustomEvent<number>).detail),
);
showcase.dataset.enhanced = "true";
showcase.querySelector<HTMLElement>("#project-picker")!.hidden = false;
selectProject(0, false);
const observer = new IntersectionObserver(async (entries) => {
  if (!entries.some((entry) => entry.isIntersecting)) return;
  observer.disconnect();
  try {
    const { mountScene } = await import("./experience-scene");
    mountScene(host, false);
  } catch (error) {
    console.warn(
      "Interactive display unavailable; collection browsing remains usable.",
      error,
    );
    showcase.querySelector("#scene-status")!.textContent =
      "Static collection · browse with Previous and Next";
  }
});
observer.observe(host);
