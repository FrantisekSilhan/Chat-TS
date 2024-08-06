import sqlite from "bun:sqlite";
import path from "path";
import fs from "fs";
import shared from "../shared";
import logger from "./logger";

if (!fs.existsSync(shared.paths.data)) {
  fs.mkdirSync(shared.paths.data, { recursive: true });
}

const dbPath = path.join(shared.paths.data, shared.config.db);

const safeInteger = true;
export type ExecuteResult = bigint; // bigint if safeInteger is true, number if false

export const db = new sqlite(dbPath, {
  strict: true,
  create: true,
  safeInteger,
});

export const initialize = () => {
  db.exec("PRAGMA journal_mode = WAL;");

  db.transaction(() => {
    db.prepare(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        displayname TEXT NOT NULL,
        email TEXT NOT NULL,
        isEmailVerified BOOLEAN DEFAULT FALSE,
        color TEXT NOT NULL
      )
    `).run();
    db.prepare(`
      CREATE TABLE IF NOT EXISTS passwords (
        id INTEGER PRIMARY KEY,
        password TEXT NOT NULL,
        salt TEXT NOT NULL,
        timestamp TEXT NOT NULL
      )
    `).run();
    db.prepare(`
      CREATE TABLE IF NOT EXISTS passwordResets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        token TEXT NOT NULL,
        timestamp TEXT NOT NULL
      )
    `).run();
    db.prepare(`
      CREATE TABLE IF NOT EXISTS emailVerifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        token TEXT NOT NULL,
        timestamp TEXT NOT NULL
      )
    `).run();
    db.prepare(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        sender INTEGER NOT NULL,
        isEdited BOOLEAN DEFAULT FALSE,
        timestamp TEXT NOT NULL
      )
    `).run();
    db.prepare(`
      CREATE TABLE IF NOT EXISTS privateMessages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        sender INTEGER NOT NULL,
        receiver INTEGER NOT NULL,
        isEdited BOOLEAN DEFAULT FALSE,
        timestamp TEXT NOT NULL
      )
    `).run();
  })();
};

export interface IUser {
  id?: ExecuteResult;
  username?: string;
  displayname?: string;
  email?: string;
  isEmailVerified?: boolean;
  color?: string;
};

export interface IPassword {
  id?: ExecuteResult;
  password?: string;
  salt?: string;
  timestamp?: string;
};

export interface IPasswordReset {
  id?: ExecuteResult;
  userId?: ExecuteResult;
  token?: string;
  timestamp?: string;
};

export interface IMessage {
  id?: ExecuteResult;
  content?: string;
  sender?: ExecuteResult;
  isEdited?: boolean;
  timestamp?: string;
};

export interface IPrivateMessage {
  id?: ExecuteResult;
  content?: string;
  sender?: ExecuteResult;
  receiver?: ExecuteResult;
  isEdited?: boolean;
  timestamp?: string;
};

export function querySingle<T>(sql: string, params: any[]): T | undefined {
  try {
    return db.prepare(sql).get(...params) as T || undefined;
  } catch (err) {
    logger.error("querySingle", err);
    return undefined;
  }
};

export function queryAll<T>(sql: string, params?: any[]): T[] | undefined {
  try {
    return db.prepare(sql).all(...(params || [])) as T[] || undefined;
  } catch (err) {
    logger.error("queryAll", err);
    return undefined;
  }
};

export function executeInsert(sql: string, params: any[]): ExecuteResult {
  return db.prepare(sql).run(...params).lastInsertRowid as ExecuteResult;
};

export function executeUpdate(sql: string, params: any[]): number {
  return db.prepare(sql).run(...params).changes;
};

export function executeDelete(sql: string, params: any[]): number {
  return db.prepare(sql).run(...params).changes;
};

export function executeInsertSafe(sql: string, params: any[]): ExecuteResult {
  try {
    return db.prepare(sql).run(...params).lastInsertRowid as ExecuteResult;
  } catch (err) {
    logger.error("executeInsertSafe", err);
    return (safeInteger ? 0n : 0) as ExecuteResult;
  }
}

export function executeUpdateSafe(sql: string, params: any[]): number {
  try {
    return db.prepare(sql).run(...params).changes;
  } catch (err) {
    logger.error("executeUpdateSafe", err);
    return 0;
  }
};

export default {
  db,
  initialize,
  querySingle,
  queryAll,
  executeInsert,
  executeUpdate,
  executeDelete,
  executeUpdateSafe,
};