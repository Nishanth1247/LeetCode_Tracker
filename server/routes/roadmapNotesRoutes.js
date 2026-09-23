const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const notesController = require('../controllers/roadmapNotesController');

// All routes require authentication
router.use(verifyToken);

// 1. GET /api/roadmap/notes — List all notes for req.user.id with optional filters
router.get('/', notesController.getMyNotes);

// 2. GET /api/roadmap/notes/problem/:slug — Get problem-specific notes
router.get('/problem/:slug', notesController.getProblemNotes);

// 3. GET /api/roadmap/notes/topic/:topicId — Get topic-specific notes
router.get('/topic/:topicId', notesController.getTopicNotes);

// 4. POST /api/roadmap/notes — Create a new note
router.post('/', notesController.createNote);

// 5. PUT /api/roadmap/notes/:id — Update a note
router.put('/:id', notesController.updateNote);

// 6. DELETE /api/roadmap/notes/:id — Delete a note
router.delete('/:id', notesController.deleteNote);

module.exports = router;
