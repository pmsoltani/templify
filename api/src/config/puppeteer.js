import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

let browserInstance = null;

/**
 * Launch and initialize the shared browser instance.
 * This should be called once, when the application starts.
 */
const initializeBrowser = async () => {
  if (browserInstance) return;

  let args = [];
  let executablePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"; // prettier-ignore
  let headless = "new";
  if (process.env.NODE_ENV === "production") {
    args = chromium.args;
    executablePath = await chromium.executablePath();
    headless = chromium.headless;
  }

  console.log("Launching new browser instance...");
  browserInstance = await puppeteer.launch({ args, executablePath, headless });
  console.log("Browser instance initialized successfully.");
};

/**
 * Gets the already-initialized browser instance.
 * @returns {Promise<import('puppeteer-core').Browser>}
 * @throws {Error} If the browser has not been initialized.
 */
const getBrowserInstance = async () => {
  if (!browserInstance) throw new Error("Browser has not been initialized.");
  return browserInstance;
};

/**
 * A function to gracefully close the browser when the server shuts down.
 */
const closeBrowserInstance = async () => {
  if (browserInstance) {
    console.log("Closing the browser instance...");
    await browserInstance.close();
    console.log("Browser instance closed successfully.");
    browserInstance = null;
  }
};

export { initializeBrowser, getBrowserInstance, closeBrowserInstance };
