# tuSuby (subGiftBot)

## 👉 [Check frontend](https://github.com/ike-gg/tuSuby-front)

Written in Node.js program provides API to make twitch subs gifting fully automatic.
It requires cookies with logged in twitch account with linked credit card, you can obtain cookies of your account from `getCookies.js` file.

### Used libraries:

- Express,
- Puppeteer,
- Discord.js,
- Stripe (as payment service to receive calls information).

---

### .env requirements

```
DISCORDTOKEN = your discord secret key for bot,
CHANNELID = discord channel where you want to get notifications about processes.
```
