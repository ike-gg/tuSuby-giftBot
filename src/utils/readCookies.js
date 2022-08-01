import fs from "fs";
import logger, { logLevels } from "../logs/logger.js";
import currentPath from "./currentPath.js";
const __dirname = currentPath(import.meta.url);
const cookiesDirectoryPath = `${__dirname}/../../assets/cookies`;

const readCookies = () => {
  const readyCookies = [];
  fs.readdirSync(cookiesDirectoryPath).map((cookiesFile) => {
    if (cookiesFile == "__.json") return;
    const cookiesPath = `${cookiesDirectoryPath}/${cookiesFile}`;
    const cookiesJson = fs.readFileSync(cookiesPath);
    const cookies = JSON.parse(cookiesJson);
    const nameCookie = cookies.find((cookie) => cookie.name === "name");
    if (!nameCookie) return;
    readyCookies.push({
      name: nameCookie.value,
      cookies: cookies,
    });
  });
  if (readyCookies.length === 0) {
    logger(
      `[COOKIES] no cookies found, not ready for gifting, exiting.`,
      logLevels.error
    );
    process.exit(0);
  }
  logger(
    `[COOKIES] received ${readyCookies.length} cookies.`,
    logLevels.success
  );
  return readyCookies;
};

export default readCookies;
