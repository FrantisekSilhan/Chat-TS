import express from "express";

const router = express.Router();
import { isNotAuthenticated, limiter } from "../middlewares/auth.middleware";

import shared from "../shared";
import auth from "../utils/auth";

import { isIError } from "../app";

const path = "/login";

router.get("/", isNotAuthenticated, (req, res) => {
  const formData = req.session.formData ?? {};
  const error = req.session.error ?? {};
  delete req.session.formData;
  delete req.session.error;

  res.render("login", {
    formData,
    error,
    loginMax: shared.config.length.email.max,
    passwordMax: shared.config.length.password.max
  });
});

interface IFormData {
  login: string;
  password: string;
};

router.post("/", isNotAuthenticated, limiter, async (req, res) => {
  const { login, password }: IFormData = req.body;
  req.session.formData = { login };

  if (!login || !password) {
    return shared.errorRedirectBack(req, res, { message: "Username And Password Are Required", status: 400 }, "/login");
  }

  if (login.length > shared.config.length.email.max) {
    return shared.errorRedirectBack(req, res, { message: `Login Must Be At Most ${shared.config.length.username.max} Characters`, status: 400 }, "/login");
  }

  if (password.length > shared.config.length.password.max) {
    return shared.errorRedirectBack(req, res, { message: `Password Must Be At Most ${shared.config.length.password.max} Characters`, status: 400 }, "/login");
  }

  const user = await auth.login(login, password);

  if (isIError(user)) {
    await auth.sleepRandomDelay(shared.config.length.delay.failedAuth.min, shared.config.length.delay.failedAuth.max);
    return shared.errorRedirectBack(req, res, user, "/login");
  }

  req.session.userId = user.id;
  req.session.username = user.username;
  req.session.displayname = user.displayname;
  req.session.color = user.color;

  delete req.session.formData;
  delete req.session.error;

  const returnTo = req.session.returnTo || "/";
  delete req.session.returnTo;
  res.redirect(returnTo);
});

export default { path, router };