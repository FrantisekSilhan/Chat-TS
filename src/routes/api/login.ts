import express from "express";

import shared from "../../shared";

import { isAuthenticated } from "../../middlewares/api.middleware"; // Always make sure it is the right middleware
import auth from "../../utils/auth";
import { isIError } from "../../app";

const router = express.Router();
const path = "/api/login";

interface IFormData {
  login: string;
  password: string;
};

router.post("/", isAuthenticated, async (req, res) => {
  const { login, password }: IFormData = req.body;
  console.log(req.body);

  if (!login || !password) {
    res.status(400).json({ message: "Username And Password Are Required" });
  }

  if (login.length > shared.config.length.email.max) {
    res.status(400).json({ message: `Login Must Be At Most ${shared.config.length.username.max} Characters` });
  }

  if (password.length > shared.config.length.password.max) {
    res.status(400).json({ message: `Password Must Be At Most ${shared.config.length.password.max} Characters` });
  }

  const user = await auth.login(login, password);
  console.log(user);

  if (isIError(user)) {
    await auth.sleepRandomDelay(shared.config.length.delay.failedAuth.min, shared.config.length.delay.failedAuth.max);
    res.status(user.status || 500).json({ message: user.message });
  } else {
    res.status(200).json({ message: "Success" });
  }

});

export default { path, router };