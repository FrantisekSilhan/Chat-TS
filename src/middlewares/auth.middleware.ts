import type { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import shared from "../shared";
import logger from "../utils/logger";

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.session.userId) {
    next();
  } else {
    req.session.returnTo = req.originalUrl;
    res.redirect("/login");
  }
};

export const isNotAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.session.userId) {
    res.redirect("/");
  } else {
    next();
  }
};

export const limiter = rateLimit({
  windowMs: shared.config.length.delay.rateLimit.ms,
  max: shared.config.length.delay.rateLimit.max,
  handler: (_, res) => {
    res.status(429).render("error", { status: 429, message: "Too Many Requests - Please Try Again Later" });
  },
  legacyHeaders: false,
  standardHeaders: "draft-7",
  keyGenerator: (req) => {
    let ip = req.ip;

    if (!ip) {
      ip = (Array.isArray(req.headers['x-forwarded-for']) 
        ? req.headers['x-forwarded-for'][0] 
        : req.headers['x-forwarded-for']) || req.connection.remoteAddress || "unknown";
    }

    return ip.replace(/:\d+[^:]*$/, "");
  },
});

export default {
  isAuthenticated,
  isNotAuthenticated,
  limiter,
};