import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { createProxyMiddleware, fixRequestBody } from "http-proxy-middleware";
import compression from "compression";
import xss from "xss-clean";
import sanitizer from "express-html-sanitizer";
import mongoose from "mongoose";

import rateLimiter from "./middleware/rateLimiter.js";
import auth from "./middleware/auth.js";
import logger from "./utils/logger.js";

mongoose
  .connect(
    `mongodb+srv://${process.env.username}:${process.env.password}@sandbox.vaxh3kz.mongodb.net/e-comm?retryWrites=true&w=majority`
  )
  .then(() => logger.info("Connected!"))
  .catch((e) => logger.info("Failed to connect to DB...", e));

const app = express();



const sanitizeConfig = {
  allowedTags: ["b", "i", "em", "strong", "a", "p"],
  allowedAttributes: { a: ["href"] },
};

app.use(cors());
app.use(cookieParser());
app.use(helmet());
app.use(sanitizer(sanitizeConfig));
app.use(rateLimiter);
app.use(xss());
app.use(compression());
app.options("*", cors());
app.disable("x-powered-by");

// log all requests
app.use((req, res, next) => {
  const log = {
    method: req.method,
    url: req.url,
    statusCode: res.statusCode,
  };

  if (res.statusCode > 299) {
    logger.error(log);
  } else {
    logger.info(log);
  }
  next();
});

app.get("/health", (req, res) => {
  res.send("Ok");

  logger.info("Health", req);
});

const services = [
  {
    route: "/user/health",
    target: "http://localhost:4000/health",
    nonProtected: true,
  },
  {
    route: "/user/signup",
    target: "http://localhost:4000/user/signup",
    nonProtected: true,
  },
  {
    route: "/user/login",
    target: "http://localhost:4000/user/login",
    nonProtected: true,
  },
  {
    route: "/user",
    target: "http://localhost:4000/user",
    nonProtected: false,
  },
  {
    route: "/order",
    target: "http://localhost:4001/api/orders",
    nonProtected: false,
  },
  {
    route: "/tracking",
    target: "http://localhost:4002/tracking",
    nonProtected: false,
  },
  {
    route: "/product",
    target: "http://localhost:4003/products",
    nonProtected: false,
  },
];

services.forEach(({ route, target, nonProtected }) => {
  // Proxy options
  const proxyOptions = {
    target,
    changeOrigin: true,
    pathRewrite: {
      [`^${route}`]: "",
    },
    onProxyReq: fixRequestBody
  };

  // Apply rate limiting and timeout middleware before proxying
  if (nonProtected) {
    app.use(route, createProxyMiddleware(proxyOptions));
  } else {
    app.use(route, auth, createProxyMiddleware(proxyOptions));
  }
});

app.use((_req, res) => {
  res.status(404).json({
    code: 404,
    status: "Error",
    message: "Route not found.",
    data: null,
  });
});

// error handler
app.use(function (err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

const PORT = process.env.PORT || 5000;

// Start Express server
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Gateway is running on port ${PORT}`);
});
