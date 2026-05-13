const fs = require('fs');
const { pipeline } = require('@xenova/transformers');
const faceapi = require('face-api.js');
const canvas = require('canvas');
const path = require('path');

// Setup canvas environment
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

// Load Whisper model once (multilingual)
let transcriber;
(async () => {
  // Sauya daga 'whisper-tiny.en' zuwa multilingual model
  transcriber = await pipeline(
    'automatic-speech-recognition',
    'Xenova/whisper-large-v2'   // ✅ wannan yana gane harsuna da dama (Hausa, Arabic, French, Spanish, Chinese, da sauransu)
  );
})();

async function transcribeAudio(filePath) {
  if (!transcriber) {
    throw new Error("Whisper model not loaded yet");
  }
  const buffer = fs.readFileSync(filePath);
  const result = await transcriber(buffer);
  return result.text; // zai dawo da transcription a harshen da aka yi magana
}

async function detectFace(imagePath) {
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(path.join(__dirname, 'models'));
  await faceapi.nets.faceLandmark68Net.loadFromDisk(path.join(__dirname, 'models'));
  await faceapi.nets.faceRecognitionNet.loadFromDisk(path.join(__dirname, 'models'));

  const img = await canvas.loadImage(imagePath);
  const detections = await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors();

  return detections.length > 0 ? `Faces detected: ${detections.length}` : "No face detected";
}

module.exports = { transcribeAudio, detectFace };
