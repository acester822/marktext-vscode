/**
 *
 * @param {string} name the renderer name: plantuml, mermaid, vega-lite, flowchart, sequence
 */
declare function loadRenderer(name: string): Promise<any>;
export default loadRenderer;
