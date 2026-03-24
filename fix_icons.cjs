const sharp = require('sharp');

async function processIcons() {
    const input = '/home/diego/.gemini/antigravity/brain/2496e868-6861-483c-bb2e-9f2f60b515f9/apex_logo_1774384024137.png';
    const image = sharp(input);
    const metadata = await image.metadata();
    
    // Crop the central 70% region out of the image to remove the baked-in black border
    const size = Math.floor(metadata.width * 0.7);
    const offset = Math.floor((metadata.width - size) / 2);

    const cropped = sharp(input).extract({ left: offset, top: offset, width: size, height: size });

    await cropped.clone().resize(192, 192).toFile('public/pwa-192x192.png');
    await cropped.clone().resize(512, 512).toFile('public/pwa-512x512.png');
    await cropped.clone().resize(180, 180).toFile('public/apple-touch-icon.png');
    await cropped.clone().resize(32, 32).toFile('public/favicon.ico');
    
    console.log("Icons cropped dynamically and regenerated.");
}

processIcons().catch(console.error);
