// modules
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

import express from "express";
import type { Request, Response, NextFunction } from "express";

import minify from "express-minify";
import compression from "compression";
import expressLayouts from "express-ejs-layouts";
import cookieParser from "cookie-parser";
import csrf from "csurf";
import helmet from "helmet";
import crypto from "crypto";

// setup
dotenv.config();
import "./setup";

// custom modules
import shared from "./shared";
import logger from "./utils/logger";

import { sessionMiddleware } from "./middlewares/session.middleware";
import { isAuthenticatedCSRF } from "./middlewares/api.middleware";
import { shouldMinify } from "./middlewares/minify.middleware";
import type { ExecuteResult } from "./utils/database";

// interfaces and stuff
export interface IError {
  status?: number;
  message: string;
  part?: string;
  additional?: any;
};

export const isIError = (error: any): error is IError => {
  return (error as IError).message !== undefined;
}

declare module "express-session" {
  interface SessionData {
    userId: ExecuteResult | undefined;
    username: string | undefined;
    displayname: string | undefined;
    color: string | undefined;
    returnTo: string | undefined;
    error: IError | undefined;
    formData: any | undefined;
    skipCSRF: boolean | undefined;
  }
};

// app
const app = express();

const csrfProtection = csrf({ cookie: true });

app.set("view engine", "ejs");
app.set("views", shared.paths.views);
app.set("layout", path.join(shared.paths.layouts, "main"));
app.set("trust proxy", 1);

express.static.mime.define({"image/avif": ["avif"]});

// middlewares
app.use(compression());
app.use(shouldMinify);
app.use((req, res, next) => {
  if (!res.locals.minify) {
    return next();
  }
  minify({
    cache: shared.paths.cache,
    cssmin: require("lightningcss"),
  })(req, res, next);
});
app.use(express.static(shared.paths.public));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(expressLayouts);
app.use(cookieParser());
app.use(sessionMiddleware);
app.use(isAuthenticatedCSRF);
app.use((req, res, next) => {
  if (req.session.skipCSRF) {
    next();
  } else {
    csrfProtection(req, res, next);
  }
});
app.use((req, res, next) => {
  res.locals.host = req.headers.host;
  res.locals.site = shared.config.site;
  res.locals.siteUrl = shared.config.siteUrl;
  if (!req.session.skipCSRF) {
    res.locals.csrfToken = req.csrfToken();
  }
  res.locals.renderNavbar = true;
  res.locals.isError = false;
  res.locals.user = req.session.userId;
  res.locals.username = req.session.username;
  res.locals.cspNonce = crypto.randomBytes(16).toString("hex");
  next();
});
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        scriptSrc: ["'self'", (_, res) => `'nonce-${(res as Response).locals.cspNonce}'`],
      },
    },
  }),
);

// routes
const routeFiles = [
  fs.readdirSync(shared.paths.routes),
  fs.readdirSync(shared.paths.api),
];

for (const file of routeFiles[0]) {
  if (file.endsWith(".ts") && file !== "index.ts") {
    const router = await import(path.join(shared.paths.routes, file));
    app.use(router.default.path, router.default.router);
  }
}

for (const file of routeFiles[1]) {
  if (file.endsWith(".ts") && file !== "index.ts") {
    const router = await import(path.join(shared.paths.api, file));
    app.use(router.default.path, router.default.router);
  }
}

const router = await import(path.join(shared.paths.routes, "index"));
const apiRouter = await import(path.join(shared.paths.api, "index"));
app.use(router.default.path, router.default.router);
app.use(apiRouter.default.path, apiRouter.default.router);

// server
const server = process.env.NODE_ENV === "production" ? (await import("http")).createServer(app) : (await import("https")).createServer({
  key: fs.readFileSync(path.join(shared.paths.src, "localcerts", "selfsigned.key")),
  cert: fs.readFileSync(path.join(shared.paths.src, "localcerts", "selfsigned.crt")),
}, app);

import { initializeWebSocket } from "./websocket/websocket";
initializeWebSocket(server, sessionMiddleware);

// error handling
app.use((_, __, next) => {
  next({
    status: 404,
    message: "Not Found",
  });
});

app.use((err: any, req: Request, res: Response, _: NextFunction) => {
  logger.error(err);

  const status = (err.status !== undefined && err.status >= 500 && err.status < 600) ? 500 : err.status || 500;
  const message = (status === 500) ? "Internal Server Error" : err.message || "Unknown Error";

  if (req.session.skipCSRF) {
    res.status(status).json({ message });
    return;
  }

  res.locals.isError = true;
  res.status(status).render("error", { status, message });
});

// start
server.listen(shared.config.port, () => {
  logger.info(`Server is running on ${process.env.NODE_ENV === "producation" ? "http" : "https"}://guwa.localhost:${shared.config.port}`);
});
