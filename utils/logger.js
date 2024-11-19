import {
  addColors,
  format as _format,
  transports as _transports,
  createLogger,
} from "winston";

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const level = () => {
  const env = process.env.NODE_ENV || "development";
  const isDevelopment = env === "development";
  return isDevelopment ? "debug" : "warn";
};

const colors = {
  error: "red",
  debug: "white",
  warn: "yellow",
  http: "magenta",
  info: "green",
};

addColors(colors);

const format = _format.combine(
  _format.timestamp({ format: "DD-MM-YY HH:mm:ss:ms" }),

  _format.colorize({ all: true }),

  _format.printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`),

  _format.errors({ stack: true }),

  _format.splat(),

  _format.json()
);

const transports = [
  new _transports.Console(),

  new _transports.File({
    filename: "logs/app_errors.log",
    level: "error",
  }),

  new _transports.File({ filename: "logs/all_app.log" }),
];

const logger = createLogger({
  level: level(),
  levels,
  format,
  transports,
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new _transports.Console({
    format: _format.combine(
      _format.colorize(),
      _format.simple()
    )
  }));
}

export default logger;
