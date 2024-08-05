import sqlite from "bun:sqlite";
import session from "express-session";
import sqliteSession from "better-sqlite3-session-store";

import path from "path";
import shared from "../shared";

const SqliteStore = sqliteSession(session);
const db = new sqlite(path.join(shared.paths.data, shared.config.sessionDb), {
  strict: true,
  create: true,
});

export const sessionMiddleware = session({
  store: new SqliteStore({
    client: db,
    expired: {
      clear: true,
      intervalMs: 1000 * 60 * 60 * 24 * 7, // 7 days
    }
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  },
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
});

export default sessionMiddleware;