import path from "path";

export const config = {
  port: 6980,
  site: "Chat",
  siteUrl: "https://chat.slhn.cz",
  db: "app.db",
  sessionDb: "sessions.db",
  user: {
    userNameLen: 32,
    passwordLen: 64,
  },
  length: {
    username: {
      min: 3,
      max: 32,
    },
    delay: {
      failedAuth: {
        min: 500,
        max: 2000
      },
      rateLimit: {
        ms: 15 * 60 * 1000,
        max: 100,
      }
    },
    password: {
      min: 8,
      max: 64,
    },
    email: {
      min: 5,
      max: 64,
    },
    message: {
      min: 1,
      max: 2000,
    },
    tempId: {
      len: 21,
    }
  },
};

const root = path.join(__dirname, "..");

export const paths: { [key: string]: string } = {
  root,
  src: path.join(root, "src"),

  routes: path.join(root, "src", "routes"),
  views: path.join(root, "src", "views"),
  layouts: path.join(root, "src", "views", "layouts"),


  public: path.join(root, "public"),
  data: path.join(root, "data"),
  logs: path.join(root, "logs"),
  cache: path.join(root, "cache"),
};

import type { IError } from "./app";

export const errorRedirectBack = (req: any, res: any, err: IError, path: string) => {
  req.session.error = err;
  return res.redirect(path);
};

export default {
  config,
  paths,
  errorRedirectBack,
};
