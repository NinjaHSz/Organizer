# Task: Task Attachments (File Upload)

Add support for uploading and managing files/attachments for each task in the Organizer.

## 🎨 DESIGN COMMITMENT: PREMIUM FILE MANAGER

- **UI**: Integration within the expanded task card.
- **Aesthetics**: Clean, minimal file icons with progress indicators and delete options.
- **Interaction**: Smooth upload transitions and immediate visual feedback.
- **Storage**: Supabase Storage for persistent file hosting.

---

## 📅 Phases

### Phase 1: Storage Infrastructure

- [x] Create `src/api/storage.js` for Supabase Storage operations.
- [x] Update `src/api/database.js` if needed to support an `attachments` JSON field in the `tasks` table (Implemented via SQL migration).
- [x] Create storage bucket `task-attachments` in Supabase.

### Phase 2: UI Components

- [x] Modify `UI.renderTaskCard` in `src/components/ui.js` to include an "Anexos" section and an "Adicionar Arquivo" button.
- [x] Add styling for file chips and progress states in `src/styles/main.css` (Used existing tailwind classes).

### Phase 3: Upload Logic

- [x] Implement file upload handler in `src/core/app-engine.js`.
- [x] Handle file selection, upload to Supabase, and update task record with the file URL.
- [x] Implement file deletion logic.

### Phase 4: Polish & Refinement

- [x] Add image previews for image attachments (Used material symbols for icons).
- [x] Add download/open functionality for files.
- [x] Final testing of the upload flow on desktop and mobile.

## 🚀 Verification

- [x] Create/Edit a task and upload a PDF or Image.
- [x] Ensure the file persists after page reload.
- [x] Verify that deleting a file removes it from both Storage and Database record.
