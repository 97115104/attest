# Good First Issues for attest

## Issue 1: Add Loading States for Badge Rendering
**Labels:** `good first issue`, `enhancement`, `frontend`

### Description
When badges are dynamically rendered on a page, there's no visual feedback while they're loading. Add loading states to improve user experience.

### Tasks
- [ ] Add a loading placeholder while badges are being rendered
- [ ] Create a simple CSS animation (spinner or skeleton)
- [ ] Update `badge-renderer.js` to show/hide loading state
- [ ] Test across different browsers

### Files to modify
- `/static/badge-renderer.js`
- `/static/badge-styles.css`

### Expected outcome
Users see a visual indicator while badges are loading instead of empty space.

---

## Issue 2: Add Dark Mode Support
**Labels:** `good first issue`, `enhancement`, `ui/ux`

### Description
Add a dark mode theme to improve accessibility and user preference support.

### Tasks
- [ ] Create CSS variables for dark mode colors
- [ ] Add a theme toggle button in the header
- [ ] Save theme preference to localStorage
- [ ] Update all pages to respect theme preference
- [ ] Test color contrast for accessibility

### Files to modify
- `/static/style.css`
- `/static/theme-switcher.js` (new file)
- All HTML files (add theme toggle)

### Expected outcome
Users can switch between light and dark themes with their preference persisted.

---

## Issue 3: Add Copy-to-Clipboard Feedback
**Labels:** `good first issue`, `enhancement`, `frontend`

### Description
When users click copy buttons, there's minimal feedback. Add visual confirmation when content is copied.

### Tasks
- [ ] Add "Copied!" tooltip or text change on copy
- [ ] Add success animation (color change, checkmark)
- [ ] Reset button after 2 seconds
- [ ] Handle copy failures gracefully

### Files to modify
- `/static/attestation-tool.js`
- `/static/style.css`

### Expected outcome
Clear visual feedback when users copy attestation URLs or codes.

---

## Issue 4: Add Keyboard Shortcuts
**Labels:** `good first issue`, `enhancement`, `accessibility`

### Description
Add keyboard shortcuts for common actions to improve accessibility and power user experience.

### Tasks
- [ ] Add shortcuts for Create (Ctrl/Cmd + N), Verify (Ctrl/Cmd + V)
- [ ] Add help modal showing available shortcuts (?)
- [ ] Ensure shortcuts don't conflict with browser defaults
- [ ] Add visual indicators for focusable elements

### Files to modify
- `/static/keyboard-shortcuts.js` (new file)
- `/static/modal.js` (for help modal)

### Expected outcome
Users can navigate and use the site more efficiently with keyboard shortcuts.

---

## Issue 5: Add Badge Preview in Creation Form
**Labels:** `good first issue`, `enhancement`, `ui/ux`

### Description
Show a live preview of the badge while users are creating an attestation.

### Tasks
- [ ] Add preview container to creation form
- [ ] Update preview as form fields change
- [ ] Show different badge styles
- [ ] Make preview responsive

### Files to modify
- `/create/index.html`
- `/static/attestation-creator.js`
- `/static/badge-renderer.js`

### Expected outcome
Users can see how their badge will look before creating the attestation.

---

## Issue 6: Add JSON Export/Import for Attestations
**Labels:** `good first issue`, `feature`, `backend`

### Description
Allow users to export and import attestations as JSON files for backup and portability.

### Tasks
- [ ] Add export button to attestation display
- [ ] Create JSON with proper formatting
- [ ] Add import functionality with validation
- [ ] Handle errors gracefully

### Files to modify
- `/static/attestation-tool.js`
- `/verify/index.html`

### Expected outcome
Users can download their attestations as JSON and re-import them later.

---

## Issue 7: Add Search/Filter for AI Models
**Labels:** `good first issue`, `enhancement`, `ui/ux`

### Description
With 100+ AI models, finding the right one can be difficult. Add search/filter functionality.

### Tasks
- [ ] Add search input above model dropdown
- [ ] Implement fuzzy search for model names
- [ ] Add provider filter checkboxes
- [ ] Highlight matching results

### Files to modify
- `/static/ai-models.js`
- `/create/index.html`
- `/static/attestation-creator.js`

### Expected outcome
Users can quickly find and select their AI model from the large list.

---

## Issue 8: Add Attestation Statistics
**Labels:** `good first issue`, `feature`, `analytics`

### Description
Show basic statistics about attestations (counts by model, role, etc.) on the homepage.

### Tasks
- [ ] Create stats collection in localStorage
- [ ] Display stats on homepage
- [ ] Add simple charts/visualizations
- [ ] Make stats optional (privacy)

### Files to modify
- `/index.html`
- `/static/stats-tracker.js` (new file)
- `/static/style.css`

### Expected outcome
Users can see aggregated statistics about AI usage patterns.

---

## Getting Started

1. Read the [Contributing Guide](../CONTRIBUTING.md)
2. Fork the repository
3. Pick an issue and comment that you're working on it
4. Create a feature branch
5. Make your changes
6. Submit a pull request

## Questions?

Feel free to ask questions in the issue comments or reach out on GitHub Discussions!