// Wikimedia's thumbnail endpoint (/thumb/.../NNNpx-filename) rate-limits or
// outright rejects on-demand generation of widths it hasn't already cached,
// returning a 400 "Use thumbnail sizes listed on..." error — inconsistently,
// per file and per width. The raw, non-thumbnailed file URL has no such
// generation step and reliably loads, so any OpenTripMap-provided preview
// URL gets converted to its raw form before we persist or serve it.
const THUMB_URL_PATTERN =
    /^(https:\/\/upload\.wikimedia\.org\/wikipedia\/commons)\/thumb\/(.+)\/\d+px-[^/]+$/;

/**
 * @param {string|null} url
 * @returns {string|null}
 */
function toRawCommonsUrl(url) {
    if (!url) return url;
    const match = url.match(THUMB_URL_PATTERN);
    if (!match) return url;
    const [, base, rawPath] = match;
    return `${base}/${rawPath}`;
}

module.exports = { toRawCommonsUrl };
