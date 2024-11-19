import jwt from "jsonwebtoken";

import secret from "../utils/secret.js";
import User from "../models/user.js";
import logger from "../utils/logger.js";

export default (req, res, next) => {
  const authorization = req.get("Authorization");
  const apiKey = req.get("X-API-KEY");

  if (!authorization && !apiKey) {
    res.status(401).send("Unauthorized - Authorization header is missing");
  }

  if (apiKey) {
    if (apiKey === process.env.api_key) {
      next();
      return;
    } else {
      res.status(401).send(`Unauthorized`);
      return;
    }
  } else if (authorization) {
    const token = authorization.startsWith("Bearer ") && authorization.slice(7);

    if (token) {
      try {
        const data = jwt.verify(token, secret.key);

        const user = User.findOne({ email: data.data.email }).lean();

        if (!user) {
          res.status(401).send(`Unauthorized`);
          return;
        }

        next();
      } catch (err) {
        logger.error("Token verification failed", err);
        res.status(401).send(`Unauthorized - ${err.name}`);
      }
    } else {
      res.status(401).send("Unauthorized - auth token is missing");
    }
  } else {
    res.status(401).send("Unauthorized - auth token is missing");
  }
};
