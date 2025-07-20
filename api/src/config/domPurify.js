const PURIFY_EXTENSIONS = [".html", ".htm", ".svg"];

const allowed_tags = ["title", "link"];

const PURIFY_OPTIONS = { ADD_TAGS: allowed_tags, WHOLE_DOCUMENT: true };

export { PURIFY_EXTENSIONS, PURIFY_OPTIONS };
