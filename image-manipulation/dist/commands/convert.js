import chalk from "chalk";
import sharp, {} from "sharp";
import path from "path";
export const formatImage = async (options) => {
    try {
        const parsed = path.parse(options.input);
        const outputPath = options.output ??
            path.join(parsed.dir, `${parsed.name}.${options.format}`);
        const image = sharp(options.input);
        const metadata = await image.metadata();
        if (!metadata.format) {
            throw new Error("Unable to detect input image format");
        }
        // Format-aware conversion
        let pipeline = image;
        switch (options.format) {
            case "jpeg":
            case "jpg":
                pipeline = pipeline.jpeg({ quality: 90 });
                break;
            case "png":
                pipeline = pipeline.png({ compressionLevel: 9 });
                break;
            case "webp":
                pipeline = pipeline.webp({ quality: 90 });
                break;
            case "avif":
                pipeline = pipeline.avif({ quality: 50 });
                break;
            default:
                throw new Error(`Unsupported format: ${options.format}`);
        }
        await pipeline.toFile(outputPath);
        console.log(chalk.bgGreen(`✔ Image converted ${metadata.format} → ${options.format} (${outputPath})`));
    }
    catch (error) {
        console.log(chalk.bgRed(error.message));
        process.exitCode = 1;
    }
};
//# sourceMappingURL=convert.js.map