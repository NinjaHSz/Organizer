# Task: AI Image-to-Task Scanner

Implement a smart scanning feature that uses AI (Gemini 1.5 Flash) to automatically fill the "New Task" form from photos of handwritten notes or whiteboards.

## 🎨 DESIGN COMMITMENT: SMART SCANNER HUD

- **Geometry**: Sharp technical edges for the scan indicator, contrasting with the rounded iOS-style modal.
- **Palette**: Electric Blue glow (#4285F4 with pulse) for the AI action, signaling "intelligence".
- **Interaction**: Glowing "breath" animation on the camera icon. Staggered reveal of auto-filled data.
- **Layout**: The scanner button will be integrated as a "Premium Utility" at the top of the form, disrupting the usual top-down field entry.

---

## 📅 Phases

### Phase 1: AI Integration & UI Hook

- [ ] Create `src/api/ai-service.js` for Gemini API communication.
- [ ] Add the glowing camera button to the `showTaskForm` in `src/core/app-engine.js`.
- [ ] Add the "breath" glow animation CSS to `src/styles/main.css`.

### Phase 2: Capture & Image Processing

- [ ] Add hidden file input with `capture="environment"` support.
- [ ] Implement image-to-base64 conversion helper.
- [ ] Build the prompt for Gemini to ensure it returns structured JSON (Title, Description, Priority, Due Date).

### Phase 3: Auto-fill Logic

- [ ] Implement the "Processing..." state in the modal.
- [ ] Add logic to map AI responses to form inputs.
- [ ] Implement intelligent subject matching based on the task title/content.

### Phase 4: Polish & Refinement

- [ ] Add haptic-like vibration on scan success (for mobile).
- [ ] Implement error handling for blurry photos or empty responses.
- [ ] Final testing with handwritten notes and whiteboard samples.

## 🚀 Verification

- [ ] Scan a photo of a whiteboard with "Matemática amanhã às 10h".
- [ ] Form should fill Title: "Matemática", Date: [Amanhã], Subject: [Matemática].
- [ ] Verify that it works for both gallery selection and direct camera capture.
