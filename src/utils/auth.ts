import crypto from "crypto";

import { querySingle, executeInsert } from "./database";
import { db } from "./database";
import type { IUser, IPassword } from "./database";

import { emailRegex, getRandomHSL } from "./user";
import { timestamp } from "./timestamp";
import type { IError } from "../app";
import logger from "./logger";

export const hash = (password: string, salt: string): string => {
  return crypto.pbkdf2Sync(password, salt, 420727, 64, "sha512").toString("hex");
}

export const generateSalt = (): string => {
  return crypto.randomBytes(16).toString("hex");
}

export const sleepRandomDelay = (min: number, max: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * (max - min + 1)) + min));
};

export const login = (login: string, password: string): (IUser | IError) => {
  let user: IUser | undefined;
  if (emailRegex(login)) {
    user = querySingle<IUser>("SELECT * FROM users WHERE LOWER(email) = ?", [login.toLowerCase()]);
  } else {
    user = querySingle<IUser>("SELECT * FROM users WHERE LOWER(username) = ?", [login.toLowerCase()]);
  }

  if (!user) return { message: "Invalid Login Or Password", status: 401 };

  const userCreds = querySingle<IPassword>("SELECT password, salt FROM passwords WHERE id = ?", [user.id]);

  if (!userCreds) return { message: "Invalid Login Or Password", status: 401 };

  const hashedPassword = hash(password, userCreds.salt!);

  if (hashedPassword !== userCreds.password) {
    return { message: "Invalid Login Or Password", status: 401 };
  }

  return user;
};

const VIPUsers: { [key: string]: string } = {
  "mapetr": "linear-gradient(90deg, #009F81, #FFFF63)",
  "mthia": "linear-gradient(90deg, #F0AEF3 0%, #F0AEF3 32%, #FFF 32%)",
  "chromik": "linear-gradient(90deg, #FED1EF, #9ADCFF)",
  "tttie": "linear-gradient(90deg, #5BCEFA, #F5A9B8)",
  "yellowbear": "#EC51E6",
};

export const register = (username: string, email: string, password: string): (IUser | IError) => {
  const existingUser = querySingle<IUser>("SELECT id FROM users WHERE LOWER(username) = ? OR LOWER(email) = ?", [username.toLowerCase(), email.toLowerCase()]);

  if (existingUser) return { message: "User Already Exists", status: 409 };

  const salt = generateSalt();

  const hashedPassword = hash(password, salt);

  const color = VIPUsers[username.toLowerCase()] || getRandomHSL(50, 60);

  let returnValue: IUser = { username, displayname: username, email, color };

  try {
    db.transaction(() => {
      const userId = executeInsert("INSERT INTO users (username, displayname, email, color) VALUES (?, ?, ?, ?)", [username, username, email, color]);
      returnValue.id = userId;
      executeInsert("INSERT INTO passwords (id, password, salt, timestamp) VALUES (?, ?, ?, ?)", [userId, hashedPassword, salt, timestamp(userId)]);
    })();
  } catch (err) {
    logger.error("register", err);
    return { message: "Error Creating User", status: 500 };
  }

  return returnValue;
};

export default {
  hash,
  login,
  register,
  sleepRandomDelay,
}