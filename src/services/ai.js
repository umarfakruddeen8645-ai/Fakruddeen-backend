const fs = require('fs');
const path = require('path');
const { pipeline } = require('@xenova/transformers');
const faceapi = require('face-api.js');
const canvas = require('canvas');

// Setup canvas environment
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

// Load Whisper model once
let transcriber;
(async () => {
  transcriber = await pipeline('automatic-speech-recognition', 'openai/whisper-tiny');
})();

async function transcribeAudio(filePath) {
  if (!transcriber) {
    throw new Error("Whisper model not loaded yet");
  }
  const buffer = fs.readFileSync(filePath);
  const result = await transcriber(buffer);
  return result.text;
}

async function detectFace(imagePath) {
  // Load models
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(path.join(__dirname, 'models'));
  await faceapi.nets.faceLandmark68Net.loadFromDisk(path.join(__dirname, 'models'));
  await faceapi.nets.faceRecognitionNet.loadFromDisk(path.join(__dirname, 'models'));

  // Load image
  const img = await canvas.loadImage(imagePath);

  // Detect faces
  const detections = await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors();

  return detections.length > 0 ? `Faces detected: ${detections.length}` : "No face detected";
}

module.exports = { transcribeAudio, detectFace };
