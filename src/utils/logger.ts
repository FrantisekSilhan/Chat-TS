import winston from "winston";
import shared from "../shared";
import path from "path";

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({ filename: path.join(shared.paths.logs, "error.log"), level: "error" }),
    new winston.transports.File({ filename: path.join(shared.paths.logs, "combined.log") }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

export default logger;