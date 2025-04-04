let song;
let fft;
let bgColor = 'black';
let shapeType = 'rectangle';

let AudioContext = window.AudioContext || window.webkitAudioContext;
let audioContext = new AudioContext();
let htmlAudioElement;
let source;
let analyzer;

let features = {};
// Intialize chromatic pitch classes
let chromas = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "G#", "A", "Bb", "B"];

let danceAnimation = false;

function preload() {
  soundFormats('mp3');
  song = loadSound('/assets/Kalte_Ohren_(_Remix_).mp3');
}

StartAudioContext(audioContext, "#startButton").then(() => {
  console.log("audio context started");
  htmlAudioElement = document.createElement("audio");
  htmlAudioElement.src = "/assets/Kalte_Ohren_(_Remix_).mp3";
  source = audioContext.createMediaElementSource(htmlAudioElement);
  source.connect(audioContext.destination);

  if (typeof Meyda === "undefined") {
    console.log("Meyda could not be found! Have you included it?");
  } else {
    analyzer = Meyda.createMeydaAnalyzer({
      audioContext: audioContext,
      source: source,
      bufferSize: 512,
      numberOfMFCCCoefficients: 12,
      featureExtractors: [
        "rms",
        "amplitudeSpectrum",
        "spectralCentroid",
        "spectralFlux",
        "zcr",
        "chroma"
      ],
      callback: features => {
        updateVisualization(features);
      }
    });
    analyzer.start();
  }

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    console.log("getUserMedia supported.");
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(stream => {
        analyzer.setSource(audioContext.createMediaStreamSource(stream));
        analyzer.start();
      })
      .catch(err => {
        console.log("The following getUserMedia error occured: " + err);
      });
  } else {
    console.log("getUserMedia not supported on your browser!");
  }
});

function setup() {
  createCanvas(windowWidth / 1.5, windowHeight);
  noFill();

  fft = new p5.FFT();
  fft.setInput(song);

  document.getElementById("startButton").addEventListener("click", () => {
    song.play();
    htmlAudioElement.play();
    startSpeechRecognition();
  });

  if (annyang) {
    // Define speech recognition commands
    let commands = {
      'play': () => {
        if (!song.isPlaying()) {
          song.play();
          htmlAudioElement.play();
        }
      },
      'pause': () => {
        if (song.isPlaying()) {
          song.pause();
          htmlAudioElement.pause();
        }
      },
      'dance': () => {
        danceAnimation = true;
        setTimeout(() => danceAnimation = false, 5000); // Show dance animation for 5 seconds
      }
    };

    // Add commands to annyang
    annyang.addCommands(commands);

    // Start listening
    annyang.start();
  } else {
    console.log("Speech recognition is not supported in this browser.");
  }

  console.log("Speech recognition setup complete");
}

function draw() {
  background(bgColor);

  let spectrum = fft.analyze();

  drawVisuals(spectrum);
  if (features) {
    drawRMS(features.rms);
    drawSpectralCentroid(features.spectralCentroid);
    drawSpectralFlux(features.spectralFlux);
    drawZCR(features.zcr);
    drawChroma(features.chroma);
  }

  if (danceAnimation) {
    drawDanceAnimation();
  }
}
// Visualize audio
function drawVisuals(spectrum) {
  for (let i = 0; i < spectrum.length; i += 5) {
    let x = map(i, 0, spectrum.length, 0, width);
    let y = height / 2;
    let colorValue = map(spectrum[i], 0, 255, 0, 255); // Adjust based on feature
    let sizeValue = map(spectrum[i], 0, 255, 10, 100); // Adjust based on feature
    let shape = random(['rectangle', 'circle', 'triangle', 'pentagon']);

    fill(random(255), random(255), random(255), random(100, 255));
    stroke(random(255), random(255), random(255));

    if (shape == 'rectangle') {
      rect(x, y, width / spectrum.length, -spectrum[i] * 2);
    } else if (shape == 'circle') {
      ellipse(x, y, sizeValue, sizeValue);
    } else if (shape == 'triangle') {
      triangle(x, y, x + sizeValue, y, x + sizeValue / 2, y - sizeValue);
    } else if (shape == 'pentagon') {
      polygon(x, y, sizeValue, 5);
    }
  }
}

function polygon(x, y, radius, npoints) {
  let angle = TWO_PI / npoints;
  beginShape();
  for (let a = 0; a < TWO_PI; a += angle) {
    let sx = x + cos(a) * radius;
    let sy = y + sin(a) * radius;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}

function updateVisualization(newFeatures) {
  features = newFeatures;
}

function drawRMS(rms) {
  fill(random(255), 0, 0, 100);
  let size = map(rms, 0, 1, 50, 300);
  ellipse(width / 4, height / 2, size, size);
}

function drawSpectralCentroid(centroid) {
  fill(0, random(255), 0, 100);
  let x = map(centroid, 0, 22050, 0, width);
  rect(x, height / 2 - 50, 10, 100);
}

function drawSpectralFlux(flux) {
  fill(0, 0, random(255), 100);
  let size = map(flux, 0, 1, 50, 200);
  ellipse(width / 2, height / 2, size, size);
}

function drawZCR(zcr) {
  fill(random(255), random(255), 0, 100);
  let size = map(zcr, 0, 1, 50, 200);
  ellipse(3 * width / 4, height / 2, size, size);
}

function drawChroma(chroma) {
  if (!chroma) return;
  let radius = width / 6;
  for (let i = 0; i < chroma.length; i++) {
    let angle = map(i, 0, chroma.length, 0, TWO_PI);
    let x = width / 2 + cos(angle) * radius;
    let y = height / 2 + sin(angle) * radius;
    fill(map(i, 0, chroma.length, 0, 360), 255, 255, chroma[i] * 255);
    ellipse(x, y, chroma[i] * 50, chroma[i] * 50);
  }
}

function drawDanceAnimation() {
  push();
  textSize(8);
  textAlign(CENTER, CENTER);
  fill(random(255), random(255), random(255)); // Electric color effect

  let asciiArt = [
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣤⣶⣏⣹⣓⡒⠦⠤⣀⡀⠀⠀⠀⠀⠀⠀⠀",
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣴⣶⣶⣤⡀⠀⠀⠀⢈⠿⢦⢳⠤⠽⡶⠤⠀⡈⠑⣢⠀⠀⠀⠀⠀",
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⣿⠟⠻⣿⣿⡿⠤⣤⠖⠉⠀⡆⢸⠀⠀⣣⣀⡠⠴⠚⠉⠀⠀⠀⠀⠀",
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⣏⢠⡀⠀⠈⢣⠀⠀⡇⠀⢀⠃⢸⠘⡟⣅⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⣹⣥⣄⣀⣼⠤⠔⠁⠀⡼⠀⢸⠀⡇⠈⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀",
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣴⡏⢹⡯⠉⠙⢳⣬⠏⠀⠀⢀⠜⠁⣠⠃⠀⡇⠀⠘⡆⠀⠀⠀⠀⠀⠀⠀⠀",
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣾⣿⣿⣶⣆⢀⠤⠋⢿⣆⣠⠖⠁⢀⠔⠁⠀⠀⡇⠀⠀⢹⡀⠀⠀⠀⠀⠀⠀⠀",
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⣿⣿⣿⣿⣿⣶⣄⡴⠋⠀⢀⣴⣁⠀⠀⠀⢠⠃⢠⠁⠀⢷⠀⠀⠀⠀⠀⠀⠀",
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠻⢿⣿⣿⣿⣿⣿⠀⠀⠀⠀⢸⣿⣿⣷⡆⠈⢀⠎⠀⠀⠈⢇⠀⠀⠀⠀⠀⠀",
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠿⣿⣿⣿⠑⢤⣀⣀⣾⣿⣿⣿⣇⢠⠎⠀⠀⠀⠀⠘⡆⠀⠀⠀⠀⠀",
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢻⣿⠀⠀⠈⠛⢿⣿⣿⣿⣿⡅⠀⠀⠀⣀⠴⠊⢹⠀⠀⠀⠀⠀",
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⠤⠾⠋⠀⠀⠀⠀⢈⣿⣿⣿⣿⣷⡒⠂⠉⠀⠀⠀⢸⠀⠀⠀⠀⠀",
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣾⣿⣿⣿⣿⣿⠃⠀⠀⠀⠀⢀⡞⠀⠀⠀⠀⠀",
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣴⣾⣿⣿⣿⣿⣿⣿⠃⠀⠀⠀⠀⢀⠞⠀⠀⠀⠀⠀⠀",
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣴⣿⣿⣿⣿⣿⣿⣿⣿⠃⠀⠀⠀⠀⣴⡿⠦⢄⡀⠀⠀⠀⠀",
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣾⠿⠿⠿⠿⠿⣿⣿⣿⠃⠀⠀⠀⣠⠎⠁⠀⠀⠀⠈⠑⠦⣄⠀",
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡰⠋⠀⠀⠀⠀⢀⡴⠋⢻⠏⠀⠀⢀⡴⠿⡤⠤⠤⠤⣤⠤⠄⠀⢈⡇",
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⠊⠀⠀⠀⣀⠴⠚⠁⠀⢠⠏⠀⠀⢠⡟⠀⠀⠘⡄⠀⠰⠁⠀⠀⣠⠎⠁",
    "⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⠴⠊⠀⢀⡠⠖⠋⠀⠀⠀⠀⢰⠃⠀⠀⠀⡎⠱⡀⠀⠀⠘⣄⡇⠀⢀⡜⠁⠀⠀",
    "⠀⠀⠀⠀⠀⠀⠀⢀⡞⠁⠀⢀⡴⠋⠀⠀⠀⠀⠀⠀⣰⠃⠀⠀⠀⡸⠀⠀⢳⡀⠀⠀⡸⠀⣠⠏⠀⠀⠀⠀",
    "⠀⠀⠀⠀⠀⠀⡠⠋⠀⣠⠔⠋⠀⠀⠀⠀⠀⠀⠀⡼⠁⠀⠀⠀⣠⠃⠀⠀⠀⢧⠀⡰⠁⣰⡇⠀⠀⠀⠀⠀",
    "⠀⠀⠀⠀⣠⠞⢁⠴⠊⠀⠀⠀⠀⠀⠀⠀⠀⠀⡜⠁⠀⠀⠀⢠⠇⠀⠀⠀⠀⠸⡏⠀⢠⠃⢃⠀⠀⠀⠀⠀",
    "⠀⢀⡴⠊⢁⠔⠁⠀⠀⠀⠀⠀⠀⠀⠀⢀⣠⢾⣤⣀⣀⣀⡴⠃⠀⠀⠀⣀⡤⠚⢙⡄⢨⣀⣸⠀⠀⠀⠀⠀",
    "⠀⡎⢀⡔⠁⠀⠀⠀⠀⠀⠀⠀⠀⠐⠻⠥⠤⠤⠤⠦⠤⠞⠀⠀⠀⠀⠀⠉⠉⠉⠉⠳⠤⠷⠆⠀⠀⠀⠀⠀",
    "⠸⡴⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀"
  ];

  // Calculate starting y position 
  let startY = height  - (asciiArt.length * 12);
  for (let i = 0; i < asciiArt.length; i++) {
    fill(random(255), random(255), random(255)); // Electric colors for each line
    text(asciiArt[i], width / 2, startY + i * 10);
  }

  // Add "Dance now!" text with electric color effect
  textSize(32);
  fill(random(255), random(255), random(255));
  text("Dance now!", width / 2, startY - 40);
  pop();
}