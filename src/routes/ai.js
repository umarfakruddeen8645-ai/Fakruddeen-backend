const express = require('express');
const router = express.Router();
const { transcribeAudio, detectFace } = require('../services/ai');
const { selfImprove } = require('../server/selfImprove');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    const text = await transcribeAudio(req.file.path);
    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: 'Transcription failed' });
  }
});

router.post('/detect-face', upload.single('image'), async (req, res) => {
  try {
    const result = await detectFace(req.file.path);
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: 'Face detection failed' });
  }
});

router.post('/self-improve', async (req, res) => {
  try {
    const result = await selfImprove(req.body.taskDescription);
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: 'Self-improvement failed' });
  }
});

module.exports = router;
