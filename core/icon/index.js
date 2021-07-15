import "./index.scss";

/**
 * Icon template (it needs an HTML embedded `svgicon`)
 *
 * TODO: check sideEffects...
 * @param {string} glyph The name of the SVG glyph to `use`
 * @param {string} [className]
 * @param {string} [id]
 */
export const iconTpl = (glyph, className, id) => {
  return (
    `<svg class="icon icon-${glyph}${className ? " " + className : ""}"` +
    `${id ? 'id="' + id + '"' : ""}><use xlink:href="#${glyph}"></use></svg>`
  );
};
