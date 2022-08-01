import giftSub from "./api/giftSub.js";

export default (app) => {
  const path = "/";

  app.post(`${path}giftSub`, giftSub);
};
