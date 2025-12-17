#!/usr/bin/env node
import chalk from 'chalk';
import { Command } from 'commander';
import { resize } from './commands/resize.js';
import { formatImage } from './commands/convert.js';
import { compressImage } from './commands/compression.js';
import { rotateImage } from './commands/flip.js';
const program = new Command();
program
    .name('img')
    .version('1.0.0')
    .description('A simple image manipulation CLI.');
program
    .command("resize")
    .description("Resize an image")
    .requiredOption("-i, --input <input>", "Input")
    .requiredOption("-o, --output <output>", "Output")
    // .requiredOption("-w, --width <width>", "Width")
    // .requiredOption("-h, --height <height>", "Height")
    .option("-w, --width <width>", "Width")
    .option("-h, --height <height>", "Height")
    .action(resize);
program
    .command("convert")
    .description("Convert an image")
    .requiredOption("-i, --input <input>", "Input")
    .option("-o, --output <output>", "Output")
    .requiredOption("-f, --format <format>", "Format")
    .action(formatImage);
program
    .command("compress")
    .description("Compress an image")
    .requiredOption("-i, --input <input>", "Input")
    .option("-o, --output <output>", "Output")
    .requiredOption("-q, --quality <quality>", "Quality")
    .action(compressImage);
program
    .command("flip")
    .description("Flip an image")
    .requiredOption("-i, --input <input>", "Input")
    .option("-o, --output <output>", "Output")
    .requiredOption("-d, --degree <degree>", "Degree")
    .action(rotateImage);
program.parse(process.argv);
//# sourceMappingURL=index.js.map