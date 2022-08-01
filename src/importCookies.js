import puppeteer from "puppeteer";
import fs from "fs";
import currentPath from "./utils/currentPath.js";
const __dirname = currentPath(import.meta.url);

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });

  const page = await browser.newPage();

  await page.goto("https://www.twitch.tv/login");
  console.log(
    "You have 60 seconds to log in with your twitch account on the website, after this time the window will close and the cookies will be saved."
  );
  await page.waitForTimeout(60000);
  const cookies = await page.cookies();
  let nickname;
  try {
    let nicknameCookie = cookies.find((cookie) => cookie.name === "name");
    nickname = nicknameCookie.value;
  } catch {
    console.error(
      "Could not find nickname cookie, saving name as random string"
    );
    //lol its just random string function written by github copilot XD
    nickname =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
  }
  await fs.writeFileSync(
    `${__dirname}/../assets/cookies/${nickname}.json`,
    JSON.stringify(cookies)
  );
  await browser.close();
})();
