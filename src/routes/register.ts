import express from "express";
const router = express.Router();
import { isNotAuthenticated, limiter } from "../middlewares/auth.middleware";
import { usernameRegex, passwordRegex, emailRegex } from "../utils/user";
import { register } from "../utils/auth";
import shared from "../shared";

import { isIError } from "../app";

const path = "/register";

router.get("/", isNotAuthenticated, (req, res) => {
  const formData = req.session.formData ?? {};
  const error = req.session.error ?? {};
  delete req.session.formData;
  delete req.session.error;

  res.render("register", {
    formData,
    error,
    usernameMin: shared.config.length.username.min,
    usernameMax: shared.config.length.username.max,
    emailMin: shared.config.length.email.min,
    emailMax: shared.config.length.email.max,
    passwordMin: shared.config.length.password.min,
    passwordMax: shared.config.length.password.max,
  });
});

interface IFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

router.post("/", isNotAuthenticated, limiter, (req, res) => {
  const { username, email, password, confirmPassword }: IFormData = req.body;
  req.session.formData = { username, email };

  if (!username || !email || !password || !confirmPassword) {
    return shared.errorRedirectBack(req, res, { message: "Username, Email, Password, And Confirm Password Are Required" }, "/register");
  }

  if (!usernameRegex(username)) {
    return shared.errorRedirectBack(req, res, { message: `Username Must Contain Only Letters, Numbers, Underscores, And Be Within ${shared.config.length.username.min} And ${shared.config.length.username.max} Characters`, status: 400 }, "/register");
  }

  if (!emailRegex(email)) {
    return shared.errorRedirectBack(req, res, { message: `Email Must Be A Valid Email Address And Must Be At Most ${shared.config.length.email.max} Characters`, status: 400 }, "/register");
  }

  if (!passwordRegex(password)) {
    return shared.errorRedirectBack(req, res, { message: `Password Must Contain At Least One Letter, One Number, One Special Character, And Be Within ${shared.config.length.password.min} And ${shared.config.length.password.max} Characters`, status: 400 }, "/register");
  }

  if (password !== confirmPassword) {
    return shared.errorRedirectBack(req, res, { message: "Passwords Do Not Match", status: 400 }, "/register");
  }

  const user = register(username, email, password);

  if (isIError(user)) {
    return shared.errorRedirectBack(req, res, user, "/register");
  }

  delete req.session.formData;
  res.redirect("/login");
});

export default { path, router };