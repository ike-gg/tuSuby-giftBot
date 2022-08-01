import SubQueue from "./subQueueClass.js";
import currentPath from "../utils/currentPath.js";
const __dirname = currentPath(import.meta.url);

const subQueue = new SubQueue(`${__dirname}/../subGiftProcess.js`);

export const sendGift = (channel, user, product) => {
  subQueue.addSubToQueue(channel, user, product);
};

export const setCookies = (nickname) => {};
