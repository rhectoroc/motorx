import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

/**
 * Vite plugin to automatically generate WebP versions of images during build
 */
export default function vitePluginWebpGenerator(options = {}) {
    const {
        quality = 80,
        formats = ['.jpg', '.jpeg', '.png']
    } = options;

    return {
        name: 'vite-plugin-webp-generator',

        async closeBundle() {
            const distDir = path.resolve(process.cwd(), 'dist');
            const assetsDir = path.join(distDir, 'assets');

            if (!fs.existsSync(assetsDir)) {
                console.log('⚠️  Assets directory not found, skipping WebP generation');
                return;
            }

            const files = fs.readdirSync(assetsDir);
            const imageFiles = files.filter(file => {
                const ext = path.extname(file).toLowerCase();
                return formats.includes(ext);
            });

            console.log(`\n🖼️  Generating WebP versions for ${imageFiles.length} images...`);

            let converted = 0;
            for (const file of imageFiles) {
                const inputPath = path.join(assetsDir, file);
                const outputPath = path.join(assetsDir, file.replace(/\.(jpg|jpeg|png)$/i, '.webp'));

                try {
                    await sharp(inputPath)
                        .webp({ quality })
                        .toFile(outputPath);

                    const originalSize = fs.statSync(inputPath).size;
                    const webpSize = fs.statSync(outputPath).size;
                    const savings = ((1 - webpSize / originalSize) * 100).toFixed(1);

                    console.log(`  ✓ ${file} → ${path.basename(outputPath)} (${savings}% smaller)`);
                    converted++;
                } catch (error) {
                    console.error(`  ✗ Failed to convert ${file}:`, error.message);
                }
            }

            console.log(`✅ WebP generation complete: ${converted}/${imageFiles.length} images converted\n`);
        }
    };
}
