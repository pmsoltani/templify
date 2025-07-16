const PDF_FORMATS = ["A5", "A4", "A3", "A2", "A1", "A0", "Letter", "Legal"];

const PDF_ORIENTATIONS = ["portrait", "landscape"];

const DEFAULT_PDF_MARGIN = "20mm";

const DEFAULT_PDF_SETTINGS = {
  format: "A4",
  margin: {
    top: DEFAULT_PDF_MARGIN,
    bottom: DEFAULT_PDF_MARGIN,
    left: DEFAULT_PDF_MARGIN,
    right: DEFAULT_PDF_MARGIN,
  },
  orientation: "portrait",
  printBackground: true,
  displayHeaderFooter: false,
  headerTemplate: "",
  footerTemplate: "",
};

export { DEFAULT_PDF_MARGIN, DEFAULT_PDF_SETTINGS, PDF_FORMATS, PDF_ORIENTATIONS };
