import chalk from "chalk";
import sharp from "sharp";
import path from "path";


interface RotateOptions {
  input: string;
  output?: string;
  degree: string;
}


export const rotateImage = async (options: RotateOptions) => {
  try {
    const degree = Number(options.degree);

    if (Number.isNaN(degree)) {
      throw new Error("Degree must be a number");
    }

    const image = sharp(options.input);
    const metadata = await image.metadata();

    if (!metadata.format) {
      throw new Error("Unable to detect image format");
    }

    const parsed = path.parse(options.input);
    const outputPath =
      options.output ??
      path.join(parsed.dir, `${parsed.name}.${metadata.format}`);

    await image
      .rotate(degree)
      .toFormat(metadata.format)
      .toFile(outputPath);

    console.log(
      chalk.bgGreen(
        `✔ Image rotated ${degree}° and saved to ${outputPath}`
      )
    );
  } catch (error: any) {
    console.log(chalk.bgRed(error.message));
    process.exitCode = 1;
  }
};
