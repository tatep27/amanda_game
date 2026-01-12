const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

async function extractFrames() {
  try {
    // Load the multi-frame PNG
    const img = await loadImage('./client/public/assets/sprites/player_1.png');
    
    // Create canvas with the image dimensions
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    
    // Draw the image
    ctx.drawImage(img, 0, 0);
    
    // Save as a single frame (APNG frames need special handling)
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('./client/public/assets/sprites/frame_0.png', buffer);
    
    console.log('Extracted frame 0');
    console.log('Note: Multiple frames in APNG require specialized libraries');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

extractFrames();

