import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

let browserInstance = null;

/**
 * Gets a single, shared instance of a Puppeteer browser.
 * This function is now environment-aware.
 * @returns {Promise<import('puppeteer-core').Browser>}
 */
const getBrowserInstance = async () => {
  if (browserInstance) return browserInstance;

  let exePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  let launchArgs = [];
  let headless = "new";
  if (process.env.NODE_ENV === "production") {
    exePath = await chromium.executablePath();
    launchArgs = chromium.args;
    headless = chromium.headless;
  }

  try {
    console.log("Launching new browser instance...");
    browserInstance = await puppeteer.launch({
      args: launchArgs,
      executablePath: exePath,
      headless: headless,
    });
    return browserInstance;
  } catch (error) {
    console.error("Error launching Puppeteer browser:", error);
    throw new Error("Failed to launch Puppeteer browser instance.");
  }
};

/**
 * A function to gracefully close the browser when the server shuts down.
 */
const closeBrowserInstance = async () => {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
};

export { getBrowserInstance, closeBrowserInstance };
