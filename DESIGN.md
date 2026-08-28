---
name: Syl-Cal
description: A calm, practical way for students to turn syllabi into a clean academic calendar.
colors:
  page-cool: "#f8fafc"
  surface-white: "#ffffff"
  ink-deep: "#1a202c"
  ink-strong: "#0a0a0a"
  ink-muted: "#718096"
  line-soft: "#e2e8f0"
  action-blue: "#3b82f6"
  action-blue-deep: "#2563eb"
  action-indigo: "#6366f1"
  success-emerald: "#059669"
  success-pale: "#ecfdf5"
  error-red: "#dc2626"
  error-pale: "#fee2e2"
typography:
  display:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.5px"
  headline:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: 1.2
  title:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.5
  body:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.5px"
rounded:
  xs: "3px"
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "32px"
  3xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.action-blue}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.action-blue-deep}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.md}"
  button-secondary:
    backgroundColor: "{colors.action-indigo}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  input-default:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.ink-deep}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  card-default:
    backgroundColor: "{colors.surface-white}"
    rounded: "{rounded.xl}"
    padding: "32px"

# Design System: Syl-Cal

## Overview

**Creative North Star: "The Calm Academic Utility"**

Syl-Cal is a quiet, practical place for students to upload their syllabi and get a clean calendar of important academic events. The interface should reduce the feeling of administrative work: clear entry points, concise language, and enough structure to make the next action obvious.

The visual system uses cool neutral surfaces, restrained blue and indigo actions, rounded containers, and softly layered depth. It is welcoming without becoming playful or decorative. The interface should feel student-friendly through clarity and approachability, not through novelty, illustration, or an overfilled palette.

**Key Characteristics:**
- Calm cool-white canvas with clean white working surfaces.
- Friendly blue actions used sparingly for direction and confirmation.
- Crisp, efficient controls with predictable states.
- Softly layered cards and containers that support scanning.
- Concise content and low visual noise.

## Colors

The palette is a cool, low-noise neutral system with one trusted action family, a restrained indigo upload accent, and semantic green/red feedback.

### Primary
- **Student-Friendly Blue** (`{colors.action-blue}`): Primary sign-in, navigation, and action color. It should make the next step obvious without dominating the page.
- **Action Blue Deep** (`{colors.action-blue-deep}`): Hover and emphasis state for primary blue actions.

### Secondary
- **Quiet Indigo** (`{colors.action-indigo}`): Upload flow action color and active drop-zone state. Keep it contextual rather than adding it to unrelated surfaces.

### Tertiary
- **Success Emerald** (`{colors.success-emerald}`): Successful processing and calendar download actions.
- **Error Red** (`{colors.error-red}`): Validation and processing errors only.

### Neutral
- **Cool Page** (`{colors.page-cool}`): Default app canvas and upload-flow background.
- **Surface White** (`{colors.surface-white}`): Cards, forms, drop zones, and other working surfaces.
- **Deep Ink** (`{colors.ink-deep}`): Primary interface text.
- **Strong Ink** (`{colors.ink-strong}`): Dashboard headings and high-emphasis values.
- **Muted Slate** (`{colors.ink-muted}`): Supporting copy, labels, and secondary controls.
- **Soft Line** (`{colors.line-soft}`): Subtle card and form borders.

### Named Rules
**The Calm Palette Rule.** Use neutral surfaces as the visual majority. Accent colors should signal action or status, not decorate empty space.

**The One-Next-Step Rule.** A screen should have one unmistakable primary action, with secondary actions visually quieter.

## Typography

**Display Font:** System UI stack (`system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`)
**Body Font:** The same system UI stack for consistent rendering and efficient scanning.

**Character:** Neutral, familiar, and readable. Weight and size create hierarchy; typography should stay crisp and unshowy so the academic schedule remains the content users notice.

### Hierarchy
- **Display** (700, `2rem`, `1.1`): Dashboard page titles and high-level orientation.
- **Headline** (600, `1.75rem`, `1.2`): Authentication and major flow headings.
- **Title** (700, `1.125rem`, `1.5`): Action cards, section headings, and result summaries.
- **Body** (400, `0.9375rem`, `1.6`): Explanations and supporting copy, kept concise.
- **Label** (600, `0.8125rem`, `0.5px` tracking): Stat labels and compact metadata; uppercase is reserved for short dashboard labels.

### Named Rules
**The Familiar Type Rule.** Keep the system UI stack. Syl-Cal earns trust through clarity and speed, not a branded display face.

## Layout

The app is organized around two simple spatial models. The dashboard uses a persistent dark sidebar and a generous content area with a three-column stats row followed by three quick-action cards. The upload flow uses a centered, narrow content column capped at approximately `800px`, keeping the drop zone and results easy to understand.

Spacing is generous enough to separate tasks without creating empty spectacle: `16px` and `24px` are the primary internal rhythms, with `32px` and `48px` used for card padding and page-level breathing room. Cards use `12px` corners; controls use `6px` to `8px` corners. On small screens, authentication reduces card padding and type size. Future dashboard work should collapse or transform the sidebar and multi-column grids rather than forcing horizontal scrolling.

## Elevation & Depth

Syl-Cal uses a softly layered depth system. White surfaces sit on a cool-white page canvas with subtle borders and low ambient shadows. Shadows are structural only when they help distinguish a working surface or hover state; they should never make the interface feel glossy, heavy, or promotional.

### Shadow Vocabulary
- **Soft surface lift** (`0 1px 3px rgba(0, 0, 0, 0.1)`): Default form card, upload surface, and file-list separation.
- **Hover lift** (`0 4px 6px rgba(0, 0, 0, 0.1)`): Login-card hover state only; use sparingly elsewhere.
- **Focus halo** (`0 0 0 3px rgba(59, 130, 246, 0.1)`): Keyboard and input focus support around blue-accented fields.

### Named Rules
**The Soft Landing Rule.** Surfaces should feel inviting at rest. Prefer a pale canvas, a white working area, and one subtle edge or shadow over stacked effects.

## Shapes

The form language is gently rounded but efficient: `6px` corners for inputs and buttons, `8px` for compact surfaces, and `12px` for cards and drop zones. Borders are thin and low contrast. Dashed borders are reserved for the upload affordance, where they communicate an empty drop target. Avoid pills and ornamental geometry unless a future feature has a clear semantic need for them.

## Components

### Buttons
- **Shape:** Crisp, gently rounded controls (`6px` to `8px` radius).
- **Primary:** Blue background with white text, `12px 24px` padding, medium-to-semibold weight, and full-width treatment when it is the sole action in a form or upload flow.
- **Hover / Focus:** Deepen the blue on hover, add a restrained lift only where it improves affordance, and preserve a visible keyboard focus ring.
- **Secondary / Ghost / Tertiary:** Transparent or neutral-surface controls with a subtle border; keep them clearly subordinate to the primary action.

### Cards / Containers
- **Corner Style:** Soft `12px` radius for dashboard cards, upload zones, and result panels.
- **Background:** White on the cool page canvas.
- **Shadow Strategy:** Low ambient shadow and/or a soft border; never multiple competing shadows.
- **Border:** `1px` soft neutral line where separation needs to be explicit.
- **Internal Padding:** `24px` to `32px` for primary surfaces; `12px` for compact file rows.

### Inputs / Fields
- **Style:** White background, `1px` neutral border, `6px` radius, and `12px 16px` internal padding.
- **Focus:** Blue border with a restrained blue focus halo.
- **Error / Disabled:** Red border/message for errors; muted slate and pale neutral background for disabled controls.

### Navigation
- **Style:** Dashboard navigation is a dark, fixed-width rail with a compact blue SylCal mark and familiar system text.
- **Default / Hover / Active:** Inactive items are muted gray; the active item uses a slightly lighter dark surface and white text. The Upload destination is the primary route into the product workflow.
- **Mobile Treatment:** A future responsive pass should replace the wide rail with a compact top or bottom navigation rather than shrinking labels until they become ambiguous.

### Upload Drop Zone
- **Style:** A large white, centered drop target with a `2px` dashed neutral border, centered upload icon, one-line instruction, and a quiet PDF-only hint.
- **Active:** Shift the border and pale background toward indigo when files are selected; keep the state obvious without adding extra decoration.

### Status Panels
- **Success:** Pale emerald surface, emerald edge, concise completion summary, and a clear calendar download action.
- **Error:** Pale red surface, red edge, and direct explanation of what needs attention.

## Do's and Don'ts

### Do:
- **Do** make uploading syllabi and downloading the resulting calendar the clearest actions in the product.
- **Do** use student-friendly blue as a signal for action, navigation, and progress.
- **Do** keep copy concise and specific; every sentence should help a student complete the task.
- **Do** preserve generous whitespace and soft surface separation so important dates remain easy to scan.
- **Do** use semantic green and red only for success and error feedback.
- **Do** retain visible focus states and clear disabled states.

### Don't:
- **Don't** introduce gradients, decorative illustrations, excessive badges, or busy visual effects that compete with the calendar workflow.
- **Don't** use multiple bright accent colors on one screen when one action color can establish hierarchy.
- **Don't** turn the product into a generic AI interface with glowing effects, chat-like decoration, or abstract automation imagery.
- **Don't** add density or feature chrome that makes a simple upload-to-calendar task feel like a project-management suite.
- **Don't** hide the primary action inside a menu or behind ambiguous icon-only controls.
