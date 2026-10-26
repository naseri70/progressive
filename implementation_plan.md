# Enhanced Implementation Plan: Progressive Lens Education Simulator
## Three.js + TypeScript + Vite

## 1. Project Objective

Transform the existing Three.js/Vite starter into a polished, interactive 3D progressive addition lens (PAL) education simulator for optometry consultations.

The application should enable an optometrist to demonstrate, in approximately 1–2 minutes, how progressive lenses support distance, intermediate, and near vision, how the wearer changes their gaze through the lens, and why peripheral optical effects can occur.

The initial release is an educational visualization, not a clinical optical-design or ray-tracing system.

### Primary objectives

1. Present a rotatable, transparent 3D spectacle lens.
2. Visualize continuous progression from distance to intermediate and near vision.
3. Connect each viewing region to a corresponding real-world task.
4. Animate a gaze indicator when the patient switches viewing tasks.
5. Explain peripheral unwanted astigmatism and adaptation without exaggerating or misrepresenting them.
6. Provide a guided demonstration suitable for a live optometry consultation.
7. Support Persian RTL and English LTR interfaces.
8. Remain fast, responsive, and deployable as a static web application.

### Non-goals for version 1

- Simulating a patient's exact retinal image.
- Calculating a proprietary manufacturer's progressive lens design.
- Predicting actual visual acuity, adaptation time, or lens performance.
- Replacing professional fitting, dispensing, or clinical assessment.
- Collecting patient records or requiring a backend.
- Implementing an unnecessarily complex optical simulation before the educational interface is complete.

---

## 2. Initial Repository Inspection

Before modifying files, inspect the existing repository.

Determine:

- Current project structure and entry point.
- Installed versions of Three.js, Vite, and other dependencies.
- Existing package scripts and lockfile.
- Current HTML, CSS, and any working rendering functionality.
- Whether TypeScript is already configured.
- Whether Git contains existing user changes.

Preserve useful existing functionality and avoid overwriting unrelated work.

Do not delete generated files, configuration, or user work unless removal is necessary and justified.

If the starter already has compatible dependencies, reuse them rather than reinstalling everything.

After inspection, provide a short summary of the existing project and proceed with implementation. Do not stop at a proposed plan unless a genuine blocker requires clarification.

---

## 3. Technology Stack and Architecture

### Core stack

- Three.js for 3D rendering.
- TypeScript with strict type checking.
- Vite for development and production builds.
- Native HTML and CSS for interface elements.
- `OrbitControls` from the Three.js examples module.
- Localized educational content stored in TypeScript modules.
- No backend or database.

Retain the project's existing compatible dependencies. If starting from the supplied starter, the existing Three.js `^0.170.0` and Vite `^5.4.0` can be retained. Upgrade only when necessary and verify compatibility.

Add TypeScript if it is not already configured.

### Architecture principles

- Use a single application entry point.
- Keep scene creation, lens visualization, animations, UI, and translations separate.
- Use one centrally managed render loop.
- Avoid global mutable state wherever practical.
- Use typed interfaces for communication between modules.
- Separate optical visualization parameters from UI presentation.
- Make scene objects explicitly disposable.
- Avoid introducing a framework or runtime dependency unless it materially improves the application.

The rendering engine must not own or manipulate educational text directly. The DOM UI must not modify Three.js objects independently of the application state.

---

## 4. Recommended Project Structure

Adapt the existing repository rather than forcing this exact structure if a simpler equivalent already exists.

```text
src/
  main.ts
  app/
    createApp.ts
    appState.ts
    lifecycle.ts
  scene/
    createScene.ts
    createCamera.ts
    createLighting.ts
    createLens.ts
    createGazeMarker.ts
    createTargets.ts
    createEnvironment.ts
    animationController.ts
    resizeController.ts
  components/
    controls.ts
    ui.ts
    educationMode.ts
    languageToggle.ts
    accessibility.ts
  education/
    zones.ts
    explanations.ts
    opticalModel.ts
  i18n/
    index.ts
    resources.ts
  types/
    index.ts
  styles/
    main.css
  assets/
    fonts/
    icons/
index.html
package.json
tsconfig.json
vite.config.ts
README.md
```

Keep the implementation lean. Do not create empty abstractions or modules that have no meaningful responsibility.

---

## 5. Shared Types and Application State

Define shared domain types in `src/types/index.ts`.

```ts
import type * as THREE from 'three';
import type { OrbitControls } from
  'three/examples/jsm/controls/OrbitControls.js';

export type LanguageCode = 'fa' | 'en';

export type ZoneId =
  | 'distance'
  | 'intermediate'
  | 'near';

export type ViewMode = 'front' | 'angled';

export type EducationStep = 0 | 1 | 2;

export type EducationMode =
  | 'idle'
  | 'running'
  | 'paused'
  | 'completed';

export interface Point3 {
  x: number;
  y: number;
  z: number;
}

export interface LensZoneConfig {
  id: ZoneId;
  labelKey: string;
  explanationKey: string;
  targetPosition: Point3;
  normalizedPosition: {
    x: number;
    y: number;
  };
}

export interface SceneContext {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
}

export interface LensParts {
  group: THREE.Group;
  lensMesh: THREE.Mesh;
  highlight: THREE.Mesh;
  setHighlight(zone: ZoneId | null): void;
  setVisualizationEnabled(enabled: boolean): void;
  dispose(): void;
}

export interface GazeMarkerParts {
  group: THREE.Group;
  animateTo(
    target: THREE.Vector3,
    durationMs?: number
  ): void;
  setPathVisible(visible: boolean): void;
  update(deltaSeconds: number): void;
  dispose(): void;
}

export interface TargetSet {
  group: THREE.Group;
  show(zone: ZoneId | null): void;
  dispose(): void;
}

export interface AppState {
  language: LanguageCode;
  selectedZone: ZoneId;
  viewMode: ViewMode;
  gazePathVisible: boolean;
  guidedMode: EducationMode;
  educationStep: EducationStep;
}
```

Use a single state-management mechanism appropriate to this small application. Native TypeScript state with explicit callbacks is sufficient; do not introduce a state-management library for version 1.

The application state should be the source of truth for selected zone, language, camera view, and education mode.

Every state change must update all relevant visual and interface components consistently.

---

## 6. Scene Creation and Lifecycle

### `createScene.ts`

Implement a scene factory responsible for:

- Creating the Three.js scene.
- Creating the WebGL renderer.
- Applying a conservative pixel ratio.
- Configuring the background and color management.
- Detecting WebGL availability and reporting initialization errors.
- Supporting responsive resizing.
- Exposing the renderer and scene through a typed context.

Use a dedicated canvas container with an explicit size.

Set renderer color-space and tone-mapping settings deliberately. Avoid uncontrolled combinations of transparent materials, tone mapping, and color-space conversions that make the lens appear opaque or wash out the overlays.

If WebGL initialization fails, display a helpful localized fallback explaining that interactive 3D is unavailable. Provide a simple static illustration or HTML-based educational fallback where practical.

Do not leave a blank page or an uncaught exception.

### `createCamera.ts`

Support two views:

- **Front:** A nearly straight-on view for understanding the vertical progression.
- **Angled:** A perspective view showing the lens surface and frame depth.

Implement a predictable reset operation that restores both camera position and OrbitControls target.

Prevent camera movement from making the lens unusable or moving the camera through the object.

### `createLighting.ts`

Use a restrained lighting setup:

- Ambient or hemisphere lighting.
- A primary directional light.
- A subtle rim or fill light.

Avoid excessive reflections that obscure the educational overlay.

### Application lifecycle

Create one centrally managed animation loop.

The loop should:

1. Calculate delta time.
2. Update active animations.
3. Update the gaze indicator.
4. Render the scene.

Pause or reduce nonessential animation work when the page is hidden.

On application teardown, cancel animation, remove event listeners, dispose of controls and renderer resources, and release geometries, materials, and textures owned by the application.

Handle partial initialization failures without leaking already-created resources.

---

## 7. Lens Geometry and Progressive Visualization

### `createLens.ts`

Create a spectacle lens with a recognizable lens outline and subtle thickness.

Use a lightweight curved surface or appropriately shaped lens mesh. A slightly curved spectacle lens is acceptable for this educational model, but do not imply that its surface geometry reproduces an actual prescription.

The lens should include:

- Transparent or lightly tinted glass.
- A visible outer contour.
- A subtle frame or rim.
- A continuous educational overlay.
- A clearly visible selected viewing region.
- A subtle representation of peripheral unwanted optical effects.

### Continuous progression

The primary educational representation must be continuous.

Distance, intermediate, and near are conceptual regions along one progression, not three separate optical elements.

Use a smooth shader-based gradient, a generated texture, or another lightweight technique to visualize the progression.

The normalized lens coordinates should be independent of pixel dimensions and UI layout.

Define a configurable illustrative model with:

- A distance region toward the upper portion.
- A central intermediate progression corridor.
- A near region toward the lower portion.
- Smooth transitions between regions.
- A configurable corridor width.
- Optional subtle peripheral visualization.

Avoid hard horizontal borders between the three regions.

Do not label the color gradient as measured dioptric power.

### Highlight behavior

When a viewing task is selected:

- Highlight the relevant region softly.
- Preserve visibility of the underlying lens.
- Show a subtle gaze marker.
- Keep the remaining regions visible but less prominent.
- Update the relevant target and explanation.

Use smooth transitions without rebuilding the entire lens mesh every time the user selects a task.

### Peripheral effects

Represent peripheral unwanted astigmatism or distortion with a restrained, explicitly illustrative visual treatment.

Possible techniques include subtle peripheral contours or a low-intensity distortion texture.

Do not simulate strong swimming, blur, or warping as a universal consequence of progressive lenses.

Include a brief explanation that peripheral effects depend on lens design, prescription, fitting, and gaze direction.

If actual optical surface data is introduced in a later version, it must be handled separately from the illustrative model.

---

## 8. Gaze Marker and Viewing Tasks

### `createGazeMarker.ts`

Create a visually distinct marker on or immediately in front of the lens surface.

The marker represents the selected gaze location, not a tracked eye position.

Requirements:

- Smooth interpolation between the three viewing regions.
- Configurable animation duration.
- A small contrasting marker.
- An optional connecting line or path.
- Support for interrupted animations when the user selects another zone.
- Reduced-motion support.
- Explicit cleanup of geometry and materials.

Use the same normalized coordinate system as the lens overlay so that the marker remains correctly positioned across different lens dimensions.

Avoid a floating marker that appears detached from the lens.

### Target objects

Implement three simple, recognizable objects:

**Distance:** A road sign or distant object.

**Intermediate:** A computer monitor.

**Near:** A book or smartphone.

Use simple geometry or lightweight local assets. Detailed models are unnecessary.

Position targets so that the scene remains visually coherent and the patient can easily connect the selected lens region with the corresponding task.

The targets must not overlap the lens or obstruct the viewing region.

When a task is selected, make its target prominent and reduce the prominence of the other targets.

### Important optical distinction

The gaze marker and target animation are conceptual educational cues.

Do not claim that the connecting line is a physically accurate ray-tracing calculation or that the selected point represents a universally prescribed fitting point.

For version 1, use predefined illustrative positions rather than attempting to calculate individualized gaze geometry.

---

## 9. OrbitControls and Camera Interaction

Implement controls for:

- Mouse drag to rotate.
- Touch gestures for rotation and zoom.
- Scroll or pinch to zoom.
- Reset view.
- Front/angled view switching.

Restrict rotation and zoom enough to preserve a useful view of the lens.

Keep camera controls independent of the task-selection buttons.

Ensure that selecting a task does not unexpectedly reset the user's camera angle.

If a user selects Reset View, restore the camera, control target, zoom, and appropriate initial scene state without unintentionally restarting the educational sequence.

Test touch interaction on a narrow viewport and ensure that buttons remain easy to tap.

---

## 10. Educational Content and Guided Mode

### `education/zones.ts`

Define the three viewing regions and their associated normalized positions.

Keep all educational parameters configurable.

Do not duplicate zone coordinates across the lens renderer, gaze controller, and user interface.

### `education/explanations.ts`

Store the localized educational explanations independently of scene code.

Use clinically appropriate, patient-friendly language.

Suggested English copy:

**Distance**

"The upper region is designed primarily for distance vision, such as seeing road signs or people across a room."

**Intermediate**

"The central corridor supports intermediate vision, including computer screens and dashboard viewing. Its usable width varies by lens design and prescription."

**Near**

"The lower region provides the additional optical power commonly needed for reading, using a phone, and other close tasks."

**Peripheral effects**

"Progressive lenses can produce unwanted peripheral astigmatism and visual distortion. These effects vary with lens design, prescription, fitting, and viewing direction."

**Adaptation**

"New wearers may need time to become comfortable with progressive lenses. Follow your optometrist's fitting and adaptation advice."

Provide equivalent natural Persian translations, not mechanically translated text.

### `educationMode.ts`

Implement a guided demonstration controller.

Required operations:

- `start()`
- `pause()`
- `resume()`
- `next()`
- `previous()`
- `restart()`
- `getCurrentStep()`
- `getStatus()`

The guided sequence contains three steps:

1. Distance.
2. Intermediate/computer.
3. Near/reading.

Each step should:

- Select the correct viewing region.
- Animate the gaze marker.
- Display the corresponding target.
- Update the explanation panel.
- Announce the current step in the interface.

On completion, show a brief conclusion and offer the user the option to replay the demonstration.

Manual task selection must remain available throughout the experience.

Switching language must not reset the selected task or restart the guide.

Define state transitions explicitly so that pausing, resuming, navigating backward, and restarting work predictably.

Avoid separate timers for each animation. Use the central animation controller or a controlled transition mechanism.

---

## 11. Interface and Layout

Use a modern, restrained medical-education aesthetic.

### Desktop layout

- Top bar: Application title, language toggle, and camera controls.
- Main panel: Interactive 3D lens.
- Supporting panel: Selected viewing task, explanation, and task selector.
- Bottom or secondary area: Guided demonstration controls.

### Mobile layout

- Place the lens above or beside the educational text, depending on available width.
- Use full-width task buttons when necessary.
- Keep camera controls compact.
- Prevent horizontal overflow.
- Keep all primary controls accessible without excessive scrolling.

### Required controls

- Distance.
- Computer.
- Reading.
- Front View.
- Angled View.
- Reset View.
- Show/Hide Gaze Path.
- Start/Pause/Resume Guided Tour.
- Previous/Next/Restart.
- Persian/English.

Use clear active states and descriptive accessible labels.

Do not rely on color alone to distinguish the three viewing regions. Combine color with labels, position, and a selected-state indicator.

---

## 12. Persian and English Localization

Persian should be the default language.

Implement the following behavior:

- Persian: `lang="fa"` and `dir="rtl"`.
- English: `lang="en"` and `dir="ltr"`.

Update both document attributes when the language changes.

Keep application logic independent of language.

Use a typed translation resource structure rather than unrestricted string dictionaries wherever practical.

Ensure that:

- All interface labels are translated.
- Educational explanations are translated.
- Button order and layout work in both directions.
- English optical abbreviations remain readable within Persian text.
- Numbers and technical terms display correctly.
- Language switching preserves the current viewing task and camera state.

Bundle a Persian-compatible font locally if feasible. Prefer a reliable local font package over a dependency on an external font CDN.

Use logical CSS properties such as `margin-inline-start` and `padding-inline-end` where appropriate.

---

## 13. Accessibility

Implement:

- Semantic HTML buttons.
- Keyboard navigation.
- Visible focus indicators.
- Accessible labels for icon-only controls.
- Adequate color contrast.
- Text labels alongside zone colors.
- A reduced-motion preference.
- A way to pause guided animation.
- Appropriate announcements when the selected viewing task changes.

Use an `aria-live` region for concise status updates where appropriate.

Do not announce every animation frame to assistive technology.

The 3D canvas should not be the only way to understand the educational content. The explanation panel and static fallback must communicate the same essential information.

---

## 14. Performance and Resource Management

Target smooth interaction on typical modern clinic computers, tablets, and smartphones.

Implement:

- Conservative device pixel ratio, with a configurable upper limit.
- Efficient geometries and materials.
- No unnecessary texture downloads.
- No unnecessary continuous animation when the scene is idle.
- A single render loop.
- Proper disposal of owned resources.
- Resize handling with cleanup.
- Reduced rendering work when the page is hidden.
- A graceful WebGL fallback.

Do not add post-processing, complex physics, large 3D models, or unnecessary animation libraries in version 1.

Avoid creating new geometries, materials, or DOM elements during every render frame.

Keep the production build small and avoid adding dependencies without a clear benefit.

---

## 15. Testing and Validation

### Automated checks

Add or preserve the following scripts:

- `npm run dev`
- `npm run typecheck`
- `npm run build`
- `npm run preview`

Run type checking and the production build before declaring completion.

Resolve TypeScript errors instead of bypassing them with `any`, `@ts-ignore`, or disabled strict checks unless there is a documented, unavoidable reason.

Add automated tests for important pure logic, such as:

- Zone configuration validity.
- Guided-step navigation.
- Language resource completeness.
- Application state transitions.

Do not introduce a large test framework solely for a handful of simple functions if the existing project has no testing infrastructure.

### Manual acceptance checklist

**Rendering**
- The lens renders without errors.
- The lens remains visible during rotation and zoom.
- The front and angled views work.
- Resize does not distort the scene.

**Education**
- Distance selects the upper viewing region.
- Computer selects the intermediate corridor.
- Reading selects the lower region.
- Each selection updates the marker, target, highlight, and explanation.
- The color progression remains continuous.
- Peripheral effects are subtle and explicitly illustrative.

**Guided mode**
- Start, pause, resume, next, previous, and restart work.
- The final step completes correctly.
- Manual task selection remains available.

**Localization**
- Persian RTL works.
- English LTR works.
- All interface labels and explanations are translated.
- Switching language preserves application state.

**Accessibility**
- Controls can be operated with a keyboard.
- Active states are visible.
- Reduced-motion behavior is respected.
- Core educational information remains available without 3D.

**Performance**
- No repeated console errors.
- No unhandled WebGL initialization failures.
- No unnecessary duplicate render loops.
- Resource cleanup works during teardown.
- Production build succeeds.

Report any tests that could not be performed instead of claiming they passed.

---

## 16. Implementation Order

Implement in the following order, keeping each stage functional before proceeding.

### Phase 1: Inspect and establish the foundation
- Inspect the existing repository.
- Configure TypeScript if needed.
- Establish the application entry point and build scripts.
- Verify that the development server and initial Three.js scene work.

### Phase 2: Build the core 3D lens
- Create the lens mesh.
- Add lighting, transparent material, and lens outline.
- Implement continuous educational visualization.
- Add camera presets and OrbitControls.

### Phase 3: Add educational interaction
- Define zone configuration.
- Implement selection and highlighting.
- Create the gaze marker.
- Add the three target objects.
- Connect all components to shared application state.

### Phase 4: Build the interface
- Create the responsive layout.
- Add viewing-task controls.
- Add reset and camera controls.
- Add the explanation panel.
- Verify desktop and mobile behavior.

### Phase 5: Localization and guided education
- Add Persian and English translations.
- Implement RTL/LTR switching.
- Implement guided demonstration state transitions.
- Add accessibility and reduced-motion support.

### Phase 6: Validation and delivery
- Run type checking.
- Run automated tests, if configured.
- Start the development server and test the actual application.
- Verify interactions manually.
- Run the production build.
- Fix discovered defects.
- Update the README with setup, usage, build, and deployment instructions.
- Commit and push changes only if repository access is available and the user has authorized the operation.

---

## 17. Delivery Requirements

Deliver a working application rather than a mockup or a plan alone.

At completion, report:

1. Features implemented.
2. Important files created or modified.
3. Dependencies added or changed.
4. Commands used to validate the project.
5. Build and type-check results.
6. Known limitations, especially the distinction between educational visualization and actual optical simulation.
7. Exact instructions for running and deploying the app.

Do not claim that the application has been tested, committed, or pushed unless those actions were actually completed.

The final result should be simple enough to maintain, accurate enough for patient education, and modular enough to support future extensions such as lens-design comparisons, personalized prescriptions, and more advanced optical simulations.