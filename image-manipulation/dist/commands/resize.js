import fs from "fs/promises";
import sharp from 'sharp';
import chalk from "chalk";
export const resize = async (options) => {
    try {
        const width = options.width ? Number(options.width) : undefined;
        const height = options.height ? Number(options.height) : undefined;
        if (width !== undefined && Number.isNaN(width)) {
            throw new Error("Width must be a number");
        }
        if (height !== undefined && Number.isNaN(height)) {
            throw new Error("Height must be a number");
        }
        if (width === undefined && height === undefined) {
            throw new Error("Provide at least width or height");
        }
        // Resize image
        await sharp(options.input)
            .resize({
            width,
            height,
            fit: "inside", // keeps aspect ratio
        })
            .toFile(options.output);
        // Get output image metadata
        const metadata = await sharp(options.output).metadata();
        // Get file size
        const stats = await fs.stat(options.output);
        const sizeKB = (stats.size / 1024).toFixed(2);
        console.log(chalk.bgGreen(`✔ Image resized to ${metadata.width}x${metadata.height} (${sizeKB} KB)`));
    }
    catch (error) {
        console.log(chalk.bgRed(error.message));
        process.exitCode = 1;
    }
};
//# sourceMappingURL=resize.js.map