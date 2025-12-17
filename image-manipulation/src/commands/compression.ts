import chalk from "chalk";
import path from "path";
import sharp from "sharp";
import fs from "fs/promises";

interface CompressionOptions {
  input: string;
  output?: string;
  quality: number;
}

export const compressImage = async (options: CompressionOptions) => {
  try {
    const quality = Number(options.quality);

    if (Number.isNaN(quality) || quality < 1 || quality > 100) {
      throw new Error("Quality must be a number between 1 and 100");
    }

    const parsed = path.parse(options.input);
    const image = sharp(options.input);
    const metadata = await image.metadata();

    if (!metadata.format) {
      throw new Error("Unable to detect image format");
    }

    const format = metadata.format;

    const outputPath =
      options.output ??
      path.join(parsed.dir, `${parsed.name}.${format}`);

    // Apply format-specific compression
    let pipeline = image;

    switch (format) {
      case "jpeg":
      case "jpg":
        pipeline = pipeline.jpeg({ quality, mozjpeg: true });
        break;

      case "png":
        pipeline = pipeline.png({ compressionLevel: 9 });
        break;

      case "webp":
        pipeline = pipeline.webp({ quality });
        break;

      default:
        throw new Error(`Compression not supported for format: ${format}`);
    }

    await pipeline.toFile(outputPath);

    const stats = await fs.stat(outputPath);
    const sizeKB = (stats.size / 1024).toFixed(2);

    console.log(
      chalk.bgGreen(
        `✔ Image compressed (${format}) → ${outputPath} (${sizeKB} KB)`
      )
    );
  } catch (error: any) {
    console.log(chalk.bgRed(error.message));
    process.exitCode = 1;
  }
};
