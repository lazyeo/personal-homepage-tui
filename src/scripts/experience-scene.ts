import {
  Renderer,
  Camera,
  Transform,
  Box,
  Cylinder,
  Sphere,
  Plane,
  Program,
  Mesh,
  Texture,
  Vec3,
  Raycast,
} from "ogl";
import { projects } from "../data/projects";

const vertex = `
attribute vec3 position, normal;
attribute vec2 uv;
uniform mat4 modelMatrix, modelViewMatrix, projectionMatrix;
uniform mat3 normalMatrix;
varying vec3 vNormal, vPosition;
varying vec2 vUv;
void main(){
  vNormal = normalize(normalMatrix * normal);
  vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
  vUv = uv;
  gl_Position = projectionMatrix * vec4(vPosition, 1.0);
}`;
const fragment = `
precision highp float;
uniform vec3 uColor;
uniform float uMetal;
varying vec3 vNormal, vPosition;
void main(){
  vec3 n = normalize(vNormal);
  vec3 light = normalize(vec3(-0.5, 0.8, 1.2));
  float diffuse = max(dot(n, light), 0.0);
  float rim = pow(1.0 - max(dot(n, normalize(-vPosition)), 0.0), 3.0);
  float spec = pow(max(dot(n, normalize(light + normalize(-vPosition))), 0.0), 65.0);
  vec3 color = uColor * (0.48 + 0.50 * diffuse) + vec3(0.94, 0.89, 0.75) * (spec * uMetal + rim * 0.08);
  gl_FragColor = vec4(color, 1.0);
}`;

type Point = [number, number, number];
const colors = {
  ink: "#243b33",
  sage: "#a8b5a0",
  cream: "#ece8d6",
  copper: "#bd583b",
  wood: "#a68055",
  dark: "#222a24",
  gold: "#ddad68",
};
function rgb(hex: string) {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
}

export function mountScene(host: HTMLElement, studio: boolean) {
  const projectExhibit = host.dataset.projectExhibit === "true";
  let selectedProject = Number(host.dataset.selected || 0);
  const projectMeshes: Mesh[] = [];
  let deviceIndex = -1;
  let deviceSpin = 0;
  const raycast = new Raycast();
  let inspecting = false;
  let hoveredProject = -1;
  let switchTime = -1000;
  const inspectButton =
    document.querySelector<HTMLButtonElement>("#project-inspect");
  const hoverLabel = document.querySelector<HTMLElement>("#exhibit-hover");
  const projectNames = projects.map((p) => p.publicName || p.name);
  const status = document.querySelector<HTMLElement>("#scene-status");
  const toggle = document.querySelector<HTMLButtonElement>("#motion-toggle");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const coarse = matchMedia("(pointer: coarse)");
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  const renderer = new Renderer({
    canvas,
    alpha: true,
    antialias: true,
    dpr: Math.min(devicePixelRatio, coarse.matches ? 1 : 1.5),
    powerPreference: "low-power",
  });
  const gl = renderer.gl;
  if (!gl) throw new Error("WebGL context unavailable");
  gl.clearColor(0, 0, 0, 0);
  const camera = new Camera(gl, { fov: 35, near: 0.1, far: 100 });
  const scene = new Transform();
  const object = new Transform();
  object.setParent(scene);
  const geometry = new Box(gl);
  const plane = new Plane(gl);
  const cylinder = new Cylinder(gl, { radialSegments: 48 });
  const sphere = new Sphere(gl, { widthSegments: 20, heightSegments: 12 });
  const programs = new Map<string, Program>();
  function material(color: string, metal = 0.15) {
    const key = `${color}/${metal}`;
    if (!programs.has(key))
      programs.set(
        key,
        new Program(gl, {
          vertex,
          fragment,
          uniforms: { uColor: { value: rgb(color) }, uMetal: { value: metal } },
        }),
      );
    return programs.get(key)!;
  }
  function box(
    parent: Transform,
    size: Point,
    position: Point,
    color: string,
    metal = 0.15,
  ) {
    const mesh = new Mesh(gl, { geometry, program: material(color, metal) });
    mesh.scale.set(...size);
    mesh.position.set(...position);
    mesh.setParent(parent);
    return mesh;
  }
  function round(
    parent: Transform,
    size: Point,
    position: Point,
    color: string,
  ) {
    const mesh = new Mesh(gl, {
      geometry: cylinder,
      program: material(color, 0.35),
    });
    mesh.scale.set(...size);
    mesh.position.set(...position);
    mesh.setParent(parent);
    return mesh;
  }
  function ball(
    parent: Transform,
    size: Point,
    position: Point,
    color: string,
  ) {
    const mesh = new Mesh(gl, { geometry: sphere, program: material(color) });
    mesh.scale.set(...size);
    mesh.position.set(...position);
    mesh.setParent(parent);
    return mesh;
  }
  function labelTexture(
    title: string,
    subtitle: string,
    background: string,
    steps = ["EXPERIENCE", "CONTENT", "IMPLEMENTATION"],
  ) {
    const surface = document.createElement("canvas");
    surface.width = 1024;
    surface.height = 640;
    const ctx = surface.getContext("2d")!;
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, 1024, 640);
    ctx.fillStyle = "#ece8d6";
    ctx.font = "24px sans-serif";
    ctx.fillText("SHAUN ZHANG / PRODUCT STUDY", 65, 76);
    ctx.font = "72px Georgia";
    ctx.fillText(title, 65, 245);
    ctx.font = "26px sans-serif";
    ctx.fillText(subtitle, 65, 307);
    ctx.strokeStyle = "#ffffff55";
    ctx.strokeRect(65, 385, 890, 170);
    ctx.font = "20px sans-serif";
    ctx.fillText(`01   ${steps[0]}`, 95, 438);
    ctx.fillText(`02   ${steps[1]}`, 380, 438);
    ctx.fillText(`03   ${steps[2]}`, 650, 438);
    ctx.fillStyle = "#eeb76e";
    ctx.fillRect(95, 478, 220, 3);
    ctx.fillRect(380, 478, 210, 3);
    ctx.fillRect(650, 478, 270, 3);
    return new Texture(gl, {
      image: surface,
      generateMipmaps: false,
      minFilter: gl.LINEAR,
    });
  }
  const screenTexture = labelTexture(
    "MRSL",
    "A considered home for a property business.",
    "#243b33",
  );
  const textureProgram = (texture: Texture) =>
    new Program(gl, {
      vertex,
      fragment: `precision highp float; uniform sampler2D uTexture; varying vec2 vUv; void main(){gl_FragColor=vec4(texture2D(uTexture,vUv).rgb,1.0);}`,
      uniforms: { uTexture: { value: texture } },
    });
  function screen(
    parent: Transform,
    size: [number, number],
    position: Point,
    texture = screenTexture,
  ) {
    const mesh = new Mesh(gl, {
      geometry: plane,
      program: textureProgram(texture),
    });
    mesh.scale.set(size[0], size[1], 1);
    mesh.position.set(...position);
    mesh.setParent(parent);
    return mesh;
  }
  // A single analytic contact shadow avoids a shadow-map pass and a large texture.
  const shadow = new Mesh(gl, {
    geometry: plane,
    program: new Program(gl, {
      vertex,
      fragment: `precision highp float; varying vec2 vUv; void main(){float d=length((vUv-.5)*2.0);gl_FragColor=vec4(0.06,0.10,0.07,0.24*(1.0-smoothstep(0.15,0.95,d)));}`,
      transparent: true,
      depthWrite: false,
      cullFace: false,
    }),
  });
  shadow.scale.set(studio ? 10 : 8, studio ? 7 : 6, 1);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -1.41;
  shadow.setParent(scene);
  const layers: Transform[] = [];
  function buildDevice(parent: Transform, k: number) {
    const body = box(
      parent,
      [2.05 * k, 3.37 * k, 0.22 * k],
      [0, 0, 0],
      "#2c3130",
      0.45,
    );
    for (const x of [-0.43, 0.43])
      box(
        parent,
        [0.22 * k, 0.22 * k, 0.05 * k],
        [x * k, -1.33 * k, 0.113 * k],
        "#454c44",
        0.3,
      );
    // ogl uploads nothing from an HTMLImageElement here, so draw it first.
    const image = new Image();
    image.onload = () => {
      const surface = document.createElement("canvas");
      surface.width = image.naturalWidth;
      surface.height = image.naturalHeight;
      surface.getContext("2d")!.drawImage(image, 0, 0);
      screen(
        parent,
        [1.67 * k, 2.09 * k],
        [0, 0.32 * k, 0.135 * k],
        new Texture(gl, {
          image: surface,
          generateMipmaps: false,
          minFilter: gl.LINEAR,
        }),
      );
      requestRender();
    };
    image.src = "/ky01/screens/home.png";
    return body;
  }
  if (projectExhibit) {
    round(object, [2.9, 0.17, 1.9], [0, -1.63, 0], colors.sage);
    round(object, [2.67, 0.03, 1.75], [0, -1.53, 0], "#c8d0bb");
    shadow.position.y = -1.74;
    function exhibitTexture(worksheet: boolean) {
      const surface = document.createElement("canvas");
      surface.width = 1280;
      surface.height = 800;
      const ctx = surface.getContext("2d")!;
      ctx.fillStyle = worksheet ? "#f7efcf" : "#eeedf5";
      ctx.fillRect(0, 0, 1280, 800);
      ctx.fillStyle = worksheet ? "#465638" : "#45485e";
      ctx.font = "24px sans-serif";
      ctx.fillText(
        worksheet
          ? "KIDS WORKSHEETS / A LITTLE PRACTICE, EVERY DAY"
          : "CAREERMATCH AI / FIND YOUR NEXT CHAPTER",
        75,
        78,
      );
      ctx.font = "74px Georgia";
      ctx.fillText(worksheet ? "Let’s count" : "Your experience.", 75, 207);
      ctx.fillText(
        worksheet ? "something good." : "A clearer direction.",
        75,
        287,
      );
      if (worksheet) {
        ctx.font = "22px sans-serif";
        ctx.fillText(
          "Made for curious minds.      Name: __________________",
          75,
          352,
        );
        ctx.font = "46px Georgia";
        ["3 + 2 = ___", "4 + 1 = ___", "2 + 6 = ___", "5 + 3 = ___"].forEach(
          (sum, i) =>
            ctx.fillText(
              sum,
              85 + (i % 2) * 570,
              478 + Math.floor(i / 2) * 124,
            ),
        );
      } else {
        [
          "Your experience",
          "The opportunity",
          "A thoughtful application",
        ].forEach((title, i) => {
          const y = 375 + i * 105;
          ctx.strokeStyle = "#45485e33";
          ctx.beginPath();
          ctx.moveTo(75, y);
          ctx.lineTo(1205, y);
          ctx.stroke();
          ctx.font = "24px sans-serif";
          ctx.fillText(`0${i + 1}`, 80, y + 55);
          ctx.font = "32px Georgia";
          ctx.fillText(title, 160, y + 55);
          ctx.font = "19px sans-serif";
          ctx.fillText(
            [
              "What you have actually done.",
              "What the role really needs.",
              "Find the connection. Tell your story.",
            ][i],
            685,
            y + 55,
          );
        });
      }
      ctx.font = "20px sans-serif";
      ctx.fillText(
        worksheet
          ? "ILLUSTRATIVE WORKSHEET · THE LEARNING HAPPENS OFFLINE"
          : "WORKFLOW ILLUSTRATION · YOU REVIEW THE RECOMMENDATIONS",
        75,
        750,
      );
      return new Texture(gl, {
        image: surface,
        generateMipmaps: false,
        minFilter: gl.LINEAR,
      });
    }
    // Built from the same list, in the same order, so a change to the data
    // cannot leave the exhibit showing one project under another's name.
    const panelTexture: Record<string, ReturnType<typeof exhibitTexture>> = {
      mrsl: screenTexture,
      careermatch: exhibitTexture(false),
      "kids-worksheets": exhibitTexture(true),
    };
    projects.forEach((project) => {
      const item = new Transform();
      item.setParent(object);
      layers.push(item);
      if (project.slug === "ky01-launcher") {
        deviceIndex = layers.length - 1;
        projectMeshes.push(buildDevice(item, 1));
        return;
      }
      box(
        item,
        [4.6, 2.95, 0.14],
        [0, 0, 0],
        project.slug === "careermatch" ? "#595b79" : colors.ink,
        0.5,
      );
      projectMeshes.push(
        screen(item, [4.4, 2.75], [0, 0, 0.078], panelTexture[project.slug]),
      );
    });
    object.rotation.y = -0.16;
  } else if (!studio) {
    round(object, [2.85, 0.18, 2.05], [0, -1.28, 0], colors.sage);
    round(object, [2.55, 0.035, 1.83], [0, -1.17, 0], "#c6d0bd");
    const product = new Transform();
    product.position.y = 0.24;
    product.rotation.x = -0.09;
    product.setParent(object);
    for (let i = 0; i < 3; i++) {
      const layer = new Transform();
      layer.position.z = -0.22 * i;
      layer.setParent(product);
      layers.push(layer);
      box(
        layer,
        [3.7, 2.38, 0.13],
        [0, 0, 0],
        [colors.ink, colors.copper, colors.cream][i],
        0.65,
      );
      if (i === 0) {
        screen(layer, [3.5, 2.18], [0, 0, 0.071]);
        ball(layer, [0.016, 0.016, 0.016], [0, 1.14, 0.075], "#a8b5a0");
      } else {
        const texture = labelTexture(
          i === 1 ? "Content, structured." : "Built to hold up.",
          i === 1
            ? "A clear model. A maintainable system."
            : "Integrations. Delivery. The details.",
          i === 1 ? "#a44831" : "#4c5a47",
        );
        screen(layer, [3.5, 2.18], [0, 0, 0.071], texture);
        for (let j = 0; j < 5; j++)
          box(
            layer,
            [0.08, 0.16, 0.035],
            [-1.6 + j * 0.8, -1.24, 0.01],
            colors.gold,
          );
      }
    }
    box(object, [0.13, 0.35, 0.12], [-1.25, -1.03, -0.36], colors.ink);
    box(object, [0.13, 0.35, 0.12], [1.25, -1.03, -0.36], colors.ink);
    object.rotation.y = -0.36;
  } else {
    // A deliberately small procedural set: no external model, environment map or post-processing.
    box(object, [5.9, 0.22, 3.2], [0, -0.42, 0], colors.wood, 0.25);
    box(object, [5.65, 0.045, 3], [0, -0.285, 0], "#c29e6d");
    for (const x of [-2.5, 2.5])
      for (const z of [-1.1, 1.1])
        box(object, [0.13, 1, 0.13], [x, -0.95, z], colors.dark, 0.65);
    box(object, [3.4, 0.018, 1.8], [0.1, -0.25, 0.2], "#48564b");
    const monitor = new Transform();
    monitor.position.set(0, 0.98, -0.62);
    monitor.rotation.x = -0.07;
    monitor.setParent(object);
    box(monitor, [2.85, 1.87, 0.16], [0, 0, 0], "#26342b", 0.6);
    screen(monitor, [2.66, 1.66], [0, 0.02, 0.086]);
    box(object, [0.22, 0.6, 0.17], [0, 0.1, -0.75], colors.sage, 0.7);
    box(object, [1.1, 0.07, 0.7], [0, -0.21, -0.65], colors.sage, 0.7);
    const keyboard = new Transform();
    keyboard.position.set(0, -0.2, 0.65);
    keyboard.setParent(object);
    box(keyboard, [1.9, 0.09, 0.63], [0, 0, 0], "#b8bca7", 0.4);
    for (let row = 0; row < 4; row++)
      for (let col = 0; col < 12; col++)
        box(
          keyboard,
          [0.12, 0.035, 0.105],
          [-0.83 + col * 0.15, 0.06, -0.22 + row * 0.14],
          col === 0 && row === 0 ? colors.copper : colors.cream,
        );
    ball(object, [0.17, 0.08, 0.24], [1.35, -0.16, 0.65], colors.cream);
    round(object, [0.34, 0.08, 0.34], [-2.18, -0.2, -0.55], colors.ink);
    round(object, [0.035, 1.7, 0.035], [-2.18, 0.68, -0.55], colors.gold);
    const arm = round(
      object,
      [0.025, 0.65, 0.025],
      [-1.91, 1.49, -0.55],
      colors.gold,
    );
    arm.rotation.z = -1.15;
    const shade = new Mesh(gl, {
      geometry: new Cylinder(gl, {
        radiusTop: 0.16,
        radiusBottom: 0.48,
        height: 0.4,
        radialSegments: 32,
      }),
      program: material(colors.ink, 0.4),
    });
    shade.position.set(-1.65, 1.36, -0.55);
    shade.setParent(object);
    round(object, [0.41, 0.018, 0.41], [-1.65, 1.15, -0.55], "#ffe3a5");
    round(object, [0.25, 0.5, 0.25], [2.25, -0.03, -0.85], colors.cream);
    for (let i = 0; i < 5; i++) {
      const leaf = ball(
        object,
        [0.1, 0.46, 0.065],
        [
          2.25 + Math.sin(i * 2) * 0.17,
          0.5 + i * 0.04,
          -0.85 + Math.cos(i * 2) * 0.14,
        ],
        i % 2 ? "#6b8656" : "#8b9d67",
      );
      leaf.rotation.z = Math.sin(i * 2) * 0.55;
    }
    for (let i = 0; i < 3; i++) {
      const book = box(
        object,
        [0.85, 0.13, 0.64],
        [-2.05, -0.18 + i * 0.14, 0.75],
        [colors.copper, colors.cream, colors.ink][i],
      );
      book.rotation.y = (i - 1) * 0.12;
    }
    const paper = box(
      object,
      [0.75, 0.012, 0.95],
      [2.05, -0.25, 0.68],
      colors.cream,
    );
    paper.rotation.y = -0.16;
    for (let i = 0; i < 4; i++)
      box(
        object,
        [0.4 - i * 0.04, 0.013, 0.012],
        [2.02, -0.24, 0.45 + i * 0.12],
        "#8a967d",
      );
    const pencil = round(
      object,
      [0.025, 0.8, 0.025],
      [2.5, -0.19, 0.73],
      colors.gold,
    );
    pencil.rotation.x = Math.PI / 2;
    pencil.rotation.z = -0.2;
    round(object, [0.19, 0.33, 0.19], [1.75, -0.1, -0.63], colors.copper);
    round(object, [0.16, 0.014, 0.16], [1.75, 0.07, -0.63], "#412d23");
    object.rotation.y = -0.4;
  }

  let frame = 0,
    visible = true,
    // Reduced motion suppresses the establishing move below, not the ability
    // to touch the thing: motion the visitor asks for by dragging is not the
    // motion the preference is about. Only the toggle pauses now.
    paused = false,
    lost = false,
    disposed = false;
  let turn = object.rotation.y,
    targetTurn = turn,
    tilt = 0,
    targetTilt = 0,
    explosion = 0,
    targetExplosion = 0;
  let view = 0,
    frameCount = 0,
    lastTime = 0;
  const cameraPosition = new Vec3();
  const look = new Vec3(0, studio ? 0.25 : -0.05, 0);
  const targetCamera = new Vec3();
  function setCameraTarget() {
    const narrow = host.clientWidth < 450;
    const distance = studio
      ? view === 1
        ? 8.5
        : view === 2
          ? 6.3
          : 10.5
      : projectExhibit
        ? inspecting
          ? 8.3
          : 10.1
        : 9.8;
    targetCamera.set(
      studio && view === 2 ? 1 : 0,
      studio
        ? view === 1
          ? 5.4
          : view === 2
            ? 2.7
            : 5.5
        : projectExhibit
          ? 1.7
          : 2.35,
      distance * (narrow ? (projectExhibit ? 1.25 : 1.15) : 1),
    );
  }
  setCameraTarget();
  cameraPosition.copy(targetCamera);
  // One short establishing move; the scene has no perpetual ambient animation.
  if (!reduced.matches) {
    cameraPosition.z += 1;
    turn -= 0.2;
  }
  function allowed() {
    return (
      !paused &&
      !lost &&
      !disposed &&
      visible &&
      !document.hidden &&
      !document.querySelector<HTMLDialogElement>("#terminal-dialog")?.open
    );
  }
  function requestRender() {
    if (!frame && allowed()) frame = requestAnimationFrame(render);
  }
  function render(time: number) {
    frame = 0;
    if (!allowed()) return;
    const stepMs = Math.min(time - lastTime || 16, 50);
    const ease = 1 - Math.exp(-stepMs / 110);
    lastTime = time;
    turn += (targetTurn - turn) * ease;
    tilt += (targetTilt - tilt) * ease;
    explosion += (targetExplosion - explosion) * ease;
    cameraPosition.lerp(targetCamera, ease);
    camera.position.copy(cameraPosition);
    camera.lookAt(look);
    object.rotation.y = turn;
    object.rotation.x = tilt;
    let projectDistance = 0;
    layers.forEach((layer, i) => {
      if (projectExhibit) {
        const seat =
          (i - selectedProject + layers.length) % layers.length;
        const arc = Math.sin(
          Math.PI * Math.min(1, Math.max(0, (time - switchTime) / 650)),
        );
        const target =
          seat === 0
            ? new Vec3(-0.35, 0.03 + arc * 0.24, 1.35 + arc * 0.6)
            : seat === 1
              ? new Vec3(1.55, 0.44, -1.0)
              : seat === 2
                ? new Vec3(-0.1, 0.72, -2.15)
                : new Vec3(-1.78, 0.24, -0.85);
        if (hoveredProject === i && seat !== 0) target.y += 0.1;
        const rotation =
          seat === 0
            ? inspecting
              ? 0.16
              : -0.08
            : seat === 1
              ? -0.5
              : seat === 2
                ? 0.06
                : 0.45;
        // The device turns while it is the one being looked at, so its shape
        // reads as a shape. It rests as soon as another project is brought
        // forward, and never turns when reduced motion is asked for.
        if (i === deviceIndex && seat === 0 && !reduced.matches) {
          // Swayed rather than spun: this one leads the exhibit, and a full
          // turn would leave a visitor looking at the back of a black slab.
          deviceSpin += stepMs * 0.00035;
          layer.rotation.y = rotation + Math.sin(deviceSpin) * 0.42;
          projectDistance += 1;
        } else {
          if (i === deviceIndex) deviceSpin = 0;
          layer.rotation.y += (rotation - layer.rotation.y) * ease;
        }
        layer.position.lerp(target, ease);
        projectDistance +=
          layer.position.distance(target) +
          (i === deviceIndex && seat === 0
            ? 0
            : Math.abs(rotation - layer.rotation.y)) +
          (arc > 0.001 ? 0.01 : 0);
        return;
      }
      layer.position.z = -0.22 * i + (1 - i) * explosion * 1.8;
      layer.position.y = (1 - i) * explosion * 0.3;
    });
    renderer.render({ scene, camera });
    host.dataset.ready = "true";
    host.dataset.frames = String(++frameCount);
    const unsettled =
      projectDistance +
        Math.abs(turn - targetTurn) +
        Math.abs(tilt - targetTilt) +
        Math.abs(explosion - targetExplosion) +
        cameraPosition.distance(targetCamera) >
      0.001;
    host.dataset.animating = String(unsettled);
    if (unsettled) requestRender();
  }
  function resize() {
    renderer.setSize(host.clientWidth, host.clientHeight);
    camera.perspective({ aspect: host.clientWidth / host.clientHeight });
    setCameraTarget();
    requestRender();
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  const visibilityObserver = new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    requestRender();
  });
  visibilityObserver.observe(host);
  const dialogObserver = new MutationObserver(requestRender);
  const dialog = document.querySelector("#terminal-dialog");
  if (dialog)
    dialogObserver.observe(dialog, {
      attributes: true,
      attributeFilter: ["open"],
    });
  const abort = new AbortController();
  const on = (target: EventTarget, name: string, listener: EventListener) =>
    target.addEventListener(name, listener, { signal: abort.signal });
  function updateStatus() {
    host.dataset.ready = String(!paused && !lost);
    if (!toggle || !status) return;
    toggle.textContent = paused ? "Enable interactive 3D" : "Use static view";
    toggle.setAttribute("aria-pressed", String(!paused));
    if (status) status.textContent = paused
      ? "Static view · motion is off"
      : projectExhibit
        ? "Pick an edge. Bring a different story forward."
        : "Drag to explore · rests when you do";
    document
      .querySelectorAll<HTMLInputElement | HTMLButtonElement>(
        ".scene-controls input, .scene-controls button",
      )
      .forEach((control) => {
        control.disabled = paused || lost;
      });
    if (inspectButton) inspectButton.hidden = paused || lost;
    if (projectExhibit && (paused || lost)) {
      host.style.cursor = "default";
      if (hoverLabel) hoverLabel.hidden = true;
    }
  }
  if (toggle)
    on(toggle, "click", () => {
      paused = !paused;
      updateStatus();
      requestRender();
    });
  on(document, "visibilitychange", requestRender);
  function inspectProject() {
    if (!projectExhibit || paused || lost) return;
    inspecting = !inspecting;
    host.dataset.inspecting = String(inspecting);
    if (inspectButton) {
      inspectButton.textContent = inspecting
        ? "Back to collection"
        : "Look closer";
      inspectButton.setAttribute("aria-pressed", String(inspecting));
    }
    setCameraTarget();
    requestRender();
  }
  if (inspectButton) on(inspectButton, "click", inspectProject);
  on(host, "project-change", (event) => {
    const index = (event as CustomEvent<number>).detail;
    if (
      !projectExhibit ||
      !Number.isInteger(index) ||
      index < 0 ||
      index >= layers.length
    )
      return;
    if (selectedProject !== index) switchTime = performance.now();
    selectedProject = index;
    inspecting = false;
    host.dataset.inspecting = "false";
    if (inspectButton) {
      inspectButton.textContent = "Look closer";
      inspectButton.setAttribute("aria-pressed", "false");
    }
    setCameraTarget();
    requestRender();
  });
  on(document.querySelector("#explode") ?? host, "input", (event) => {
    targetExplosion = Number((event.target as HTMLInputElement).value) / 100;
    targetTurn = -0.36 - targetExplosion * 0.42;
    requestRender();
  });
  for (const [id, delta] of [
    ["rotate-left", -0.3],
    ["rotate-right", 0.3],
  ] as const)
    if (document.getElementById(id))
      on(document.getElementById(id)!, "click", () => {
        targetTurn += delta;
        requestRender();
      });
  document
    .querySelectorAll<HTMLButtonElement>("[data-view]")
    .forEach((button) =>
      on(button, "click", () => {
        view = Number(button.dataset.view);
        setCameraTarget();
        targetTurn = [-0.4, -0.12, -0.1][view];
        document
          .querySelectorAll("[data-view]")
          .forEach((item) =>
            item.setAttribute("aria-pressed", String(item === button)),
          );
        requestRender();
      }),
    );
  let drag: { x: number; y: number; turn: number } | null = null;
  function hitProject(pointer: PointerEvent) {
    const bounds = host.getBoundingClientRect();
    raycast.castMouse(camera, [
      ((pointer.clientX - bounds.left) / bounds.width) * 2 - 1,
      1 - ((pointer.clientY - bounds.top) / bounds.height) * 2,
    ]);
    const hit = raycast.intersectMeshes(projectMeshes)[0];
    return hit ? projectMeshes.indexOf(hit) : -1;
  }
  on(host, "pointerdown", (event) => {
    const pointer = event as PointerEvent;
    if (paused || pointer.button !== 0) return;
    drag = { x: pointer.clientX, y: pointer.clientY, turn: targetTurn };
    host.setPointerCapture(pointer.pointerId);
  });
  on(host, "pointermove", (event) => {
    const pointer = event as PointerEvent;
    if (projectExhibit && !paused && !lost && pointer.pointerType === "mouse") {
      const index = hitProject(pointer);
      if (index !== hoveredProject) {
        hoveredProject = index;
        requestRender();
      }
      host.style.cursor =
        index < 0
          ? "default"
          : index === selectedProject
            ? inspecting
              ? "zoom-out"
              : "zoom-in"
            : "pointer";
      if (hoverLabel) {
        hoverLabel.hidden = index < 0;
        hoverLabel.textContent =
          index === selectedProject
            ? inspecting
              ? "Back to the collection"
              : "Take a closer look"
            : `Pick up ${projectNames[index]}`;
      }
    }
    if (!drag || projectExhibit) return;
    targetTurn = drag.turn + (pointer.clientX - drag.x) * 0.007;
    targetTilt = Math.max(
      -0.18,
      Math.min(0.18, (pointer.clientY - drag.y) * 0.002),
    );
    requestRender();
  });
  const release = () => {
    drag = null;
    targetTilt = 0;
    requestRender();
  };
  on(host, "pointerup", (event) => {
    const pointer = event as PointerEvent;
    if (
      projectExhibit &&
      drag &&
      Math.hypot(pointer.clientX - drag.x, pointer.clientY - drag.y) < 8
    ) {
      const index = hitProject(pointer);
      if (index === selectedProject) inspectProject();
      else if (index >= 0)
        host.dispatchEvent(
          new CustomEvent("project-pick", {
            detail: index,
          }),
        );
    }
    release();
  });
  on(host, "pointercancel", release);
  on(host, "pointerleave", () => {
    hoveredProject = -1;
    if (hoverLabel) hoverLabel.hidden = true;
    requestRender();
  });
  on(host, "lostpointercapture", release);
  on(canvas, "webglcontextlost", (event) => {
    event.preventDefault();
    lost = true;
    updateStatus();
    if (status) status.textContent = "Static view · graphics context interrupted";
    if (toggle) toggle.hidden = true;
  });
  // Reload is explicit after context loss: never leave a blank canvas or silently rebuild resources.
  on(canvas, "webglcontextrestored", () => {
    if (status) status.textContent = "Static view · reload to restore 3D";
  });
  on(window, "pagehide", (event) => {
    if ((event as PageTransitionEvent).persisted) return;
    disposed = true;
    cancelAnimationFrame(frame);
    resizeObserver.disconnect();
    visibilityObserver.disconnect();
    dialogObserver.disconnect();
    abort.abort();
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  });
  const preview = new Image();
  preview.onload = () => {
    if (disposed || lost) return;
    screenTexture.image = preview;
    screenTexture.needsUpdate = true;
    requestRender();
  };
  preview.onerror = () => {
    if (status) status.textContent = "3D study · website preview unavailable";
  };
  preview.src = "/images/mrsl-live-2026-09-08.webp";
  host.append(canvas);
  if (toggle) toggle.hidden = false;
  updateStatus();
  resize();
}
