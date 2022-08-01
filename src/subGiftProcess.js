import puppeteer from "puppeteer";
import fs from "fs";
import { Client, Intents } from "discord.js";
import logger, { logLevels } from "./logs/logger.js";

let processPrefix;

let debug = false;
if (process.env.DEBUG === "true") {
  debug = true;
  processPrefix = `DEBUG-`;
}

const client = new Client({ intents: [Intents.FLAGS.GUILD_MESSAGES] });

const giftingProcess = async (gift) => {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: !debug,
    env: {
      LANGUAGE: "en-US",
    },
    defaultViewport: {
      width: 800,
      height: 750,
    },
  });

  const page = await browser.newPage();
  await page.setCookie(...gift.cookies);

  //sequnece of sub gifting.
  try {
    await page.goto(`https://www.twitch.tv/${gift.channel}`);
    await page.waitForTimeout(5000);

    await page.waitForTimeout(15000);

    //check if channel exists
    if (await page.$(".core-error")) {
      logger(`${processPrefix} Channel does not exist.`, logLevels.error);
      client.channels.fetch(process.env.CHANNELID).then((channel) => {
        channel
          .send({
            embeds: [
              {
                color: 0xff9a2e,
                title: "⚠️ CHANNEL DOES NOT EXIST",
                description: `For: ${gift.user} on ${gift.channel} channel.`,
              },
            ],
          })
          .then(() => {
            process.exit(3);
          });
      });
    } else {
      logger(`${processPrefix} channel found.`, logLevels.info);
      //click sub button
      await page.click('button[data-a-target="subscribe-button"]');
      await page.waitForTimeout(5000);

      //search for sub gift button and assign it special class
      await page.evaluate(() => {
        document.querySelectorAll(".support-panel button").forEach((button) => {
          if (button.textContent.includes("Gift a Sub")) {
            button.classList.add("gift-sub-button");
          }
        });
      });
      await page.click(".gift-sub-button");
      await page.waitForTimeout(5000);

      //find sub gift button for specific user
      await page.evaluate(() => {
        document.querySelectorAll(".support-panel button").forEach((button) => {
          if (button.innerHTML.includes("Gift a specific")) {
            button.classList.add("gift-specific-button");
          }
        });
      });
      await page.click(".gift-specific-button");
      await page.waitForTimeout(5000);

      //type receipient of gift
      await page.type('input[aria-label="Search for a Twitch ID"]', gift.user);
      await page.waitForTimeout(3000);

      //verify that the nicknames are equal
      let giftUser = gift.user.toLowerCase();
      await page.evaluate((giftUser) => {
        document
          .querySelectorAll(".gift-recipient-search-result-view button")
          .forEach((userButton) => {
            if (
              userButton.getAttribute("data-user_name").toLowerCase() ==
              giftUser
            ) {
              userButton.classList.add("specific-user-button");
            }
          });
      }, giftUser);
      if (!(await page.$(".specific-user-button"))) {
        logger(`${processPrefix} Cant find user.`, logLevels.error);
        client.channels.fetch(process.env.CHANNELID).then((channel) => {
          channel
            .send({
              embeds: [
                {
                  color: 0xff9a2e,
                  title: "⚠️ CANT FIND USER",
                  description: `Cant find user ${gift.user}. (For gift him sub on ${gift.channel})`,
                },
              ],
            })
            .then(() => {
              process.exit(5);
            });
        });
      } else {
        await page.waitForTimeout(2000);
        await page.click(".specific-user-button");
        await page.waitForTimeout(2000);

        //select time of sub
        //future feature -> select how many months sub
        await page.evaluate(() => {
          let elementMonth = document.querySelector(
            '.tw-selectable [data-month="1"]'
          );
          let monthId = elementMonth.getAttribute("id");
          document
            .querySelector(`label[for="${monthId}"]`)
            .classList.add("monthLabel");
        });
        await page.click(".monthLabel");
        await page.waitForTimeout(2000);

        //take screenshot of review of sub
        await page.screenshot({ path: "previewprocess/usergiftreview.png" });
        await page.waitForTimeout(1000);

        //check if it possible to gift sub for user
        if (
          await page.$(
            '[data-test-selector="gift-eligibility-message-selector"]'
          )
        ) {
          logger(`${processPrefix} not possible to gift`, logLevels.error);
          await page.screenshot({
            path: `error/cant-gift-${gift.channel}-${gift.user}.png`,
          });
          client.channels.fetch(process.env.CHANNELID).then((channel) => {
            channel
              .send({
                embeds: [
                  {
                    color: 0xff9a2e,
                    title: "⚠️ CANT GIFT FOR THIS USER ON THIS CHANNEL",
                    description: `${gift.user} on ${gift.channel} channel.`,
                  },
                ],
              })
              .then(() => {
                process.exit(4);
              });
          });
        }

        //review whole purchase
        await page.click(
          'button[data-test-selector="checkout-gift-subscribe-button"]'
        );
        await page.waitForTimeout(5000);

        //final button to gift sub.
        if (!debug) {
          await page.click(
            'button[data-a-target="spm-complete-purchase-button"]'
          );
        }

        logger(`${processPrefix} Successful gifted sub to.`, logLevels.success);
        client.channels.fetch(process.env.CHANNELID).then((channel) => {
          channel
            .send({
              embeds: [
                {
                  color: 0xffffff,
                  title: "✅ GIFTED SUB",
                  description: `${gift.user} on ${gift.channel} channel.`,
                },
              ],
            })
            .then(() => {
              process.exit(0);
            });
        });
      }
    }
  } catch (err) {
    await page.screenshot({
      path: `error/error${gift.channel}-${gift.user}.png`,
    });
    client.channels.fetch(process.env.CHANNELID).then((channel) => {
      channel
        .send({
          embeds: [
            {
              color: 0xff2121,
              title: "❌ ERROR",
              description: `${gift.user} on ${gift.channel}, check screenshot or console.\n ${err}`,
            },
          ],
        })
        .then(() => {
          logger(`${processPrefix} ${err}`, logLevels.error);
          process.exit(1);
        });
    });
  }
};

client.login(process.env.DISCORDTOKEN);

const args = process.argv.slice(2);
let [channel, user, product, cookies] = args;
cookies = JSON.parse(cookies);
giftingProcess({ channel, user, product, cookies });
