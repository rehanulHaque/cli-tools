import { type FormatEnum } from "sharp";
interface FormatOptions {
    input: string;
    output?: string;
    format: keyof FormatEnum;
}
export declare const formatImage: (options: FormatOptions) => Promise<void>;
export {};
//# sourceMappingURL=convert.d.ts.map