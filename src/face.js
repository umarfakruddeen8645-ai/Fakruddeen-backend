const faceapi = require('face-api.js');
const canvas = require('canvas');
const path = require('path');

// Setup canvas environment
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

async function run() {
  // Load models
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(path.join(__dirname, 'models'));
  await faceapi.nets.faceLandmark68Net.loadFromDisk(path.join(__dirname, 'models'));
  await faceapi.nets.faceRecognitionNet.loadFromDisk(path.join(__dirname, 'models'));

  // Load image
  const img = await canvas.loadImage('./test.jpg');

  // Detect faces
  const detections = await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors();

  console.log('Faces detected:', detections.length);
}

run();
