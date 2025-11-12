const express = require('express');
const router = express.Router();
const { getBuzzerState, setBuzzerState } = require('../controllers/buzzerController');

// GET - estado do buzzer
router.get('/api/buzzer', getBuzzerState);

// POST - alterar estado do buzzer
router.post('/api/buzzer', setBuzzerState);

module.exports = router;