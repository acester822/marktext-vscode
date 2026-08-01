export default class Diagram {
    encodedInput: string;
    plantumlServer: string;
    /**
     * Builds a Diagram object storing the encoded input value
     */
    static parse(input: string, plantumlServer?: string): Diagram;
    /**
     * Encodes a diagram following PlantUML specs, I used `plantuml-encoder` at last.
     *
     * From https://plantuml.com/text-encoding
     * 1. Encoded in UTF-8
     * 2. Compressed using Deflate or Brotli algorithm
     * 3. Re-encoded in ASCII using a transformation close to base64
     */
    private _encode;
    insertImgElement(container: string | HTMLElement): void;
}
