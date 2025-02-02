const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

let currentStream;
let isFrontCamera = false;
let zoomLevel = 1;
let isInverted = false;
let isFlashOn = false;

// Access the camera
async function startCamera(facingMode) {
    try {
        // Stop any existing streams
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
        }

        // Get new media stream
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: { ideal: facingMode }, // Use "ideal" for broader support
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });

        currentStream = stream;
        video.srcObject = stream;

        console.log(`Camera started: ${facingMode}`);
    } catch (error) {
        console.error("Error accessing the camera: ", error);
        alert("Failed to access the camera. Please check permissions.");
    }
}

// Switch between front and rear camera
document.getElementById('switch-camera').addEventListener('click', () => {
    isFrontCamera = !isFrontCamera;
    startCamera(isFrontCamera ? "user" : "environment");
});

// Capture image
document.getElementById('capture').addEventListener('click', () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (isInverted) {
        invertColors();
    }
});

// Save image
document.getElementById('save').addEventListener('click', () => {
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = `photo_${new Date().toISOString()}.png`;
    link.click();
});

// Zoom function
function applyZoom() {
    video.style.transform = `scale(${zoomLevel})`;
}

// Zoom in
document.getElementById('zoom-in').addEventListener('click', () => {
    if (zoomLevel < 2) { // Limit zoom to 2x
        zoomLevel += 0.1;
        applyZoom();
    }
});

// Zoom out
document.getElementById('zoom-out').addEventListener('click', () => {
    if (zoomLevel > 1) { // Prevent zooming out below 1x
        zoomLevel -= 0.1;
        applyZoom();
    }
});

// Invert colors
document.getElementById('invert-color').addEventListener('click', () => {
    isInverted = !isInverted;
    canvas.classList.toggle('inverted', isInverted);
    if (!isInverted) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
    }
});

// Apply color inversion effect
function invertColors() {
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];     // Red
        data[i + 1] = 255 - data[i + 1]; // Green
        data[i + 2] = 255 - data[i + 2]; // Blue
    }

    context.putImageData(imageData, 0, 0);
}

// Toggle flash (simulated)
document.getElementById('flash').addEventListener('click', () => {
    isFlashOn = !isFlashOn;
    video.style.filter = isFlashOn ? 'brightness(1.5)' : 'brightness(1)';
});

// Start with the rear camera by default
startCamera("environment");

