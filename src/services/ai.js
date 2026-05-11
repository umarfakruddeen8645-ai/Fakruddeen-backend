const fs = require('fs');
const DeepSpeech = require('deepspeech');
const cv = require('opencv4nodejs');

const modelPath = 'models/deepspeech-0.9.3-models.pbmm';
const scorerPath = 'models/deepspeech-0.9.3-models.scorer';

const model = new DeepSpeech.Model(modelPath);
model.enableExternalScorer(scorerPath);

function transcribeAudio(filePath) {
  const buffer = fs.readFileSync(filePath);
  const audioStream = model.createStream();
  audioStream.feedAudioContent(buffer);
  const text = audioStream.finishStream();
  return text;
}

function detectFace(imagePath) {
  const classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);
  const image = cv.imread(imagePath);
  const grayImg = image.bgrToGray();
  const faces = classifier.detectMultiScale(grayImg).objects;
  return faces.length > 0 ? "Face detected" : "No face detected";
}

module.exports = { transcribeAudio, detectFace };
