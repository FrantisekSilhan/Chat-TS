import sqlite from "bun:sqlite";
import shared from "../shared";
import path from "path";
import logger from "./logger";

import type { ExecuteResult } from "./database";

const sessionDbPath = path.join(shared.paths.data, shared.config.sessionDb);

const sessionDb = new sqlite(sessionDbPath);

export const deleteUserSession = (userId: ExecuteResult) => {
  try {
    sessionDb.prepare("DELETE FROM sessions WHERE userId = ?").run(userId);
    return true;
  } catch (error) {
    logger.error("deleteUserSession", error);
    return false;
  }
};

export default deleteUserSession;