import express from "express";

import shared from "../../shared";

import { isAuthenticated } from "../../middlewares/api.middleware"; // Always make sure it is the right middleware
import { isIError } from "../../app";
import { emailRegex, passwordRegex, usernameRegex } from "../../utils/user";
import { register } from "../../utils/auth";

const router = express.Router();
const path = "/api/register";

interface IFormData {
    username: string;
    email: string;
    password: string;
  };

router.post("/", isAuthenticated, async (req, res) => {
  const { username, email, password }: IFormData = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Username, Email, Password, And Confirm Password Are Required" });
  }

  if (!usernameRegex(username)) {
    return res.status(400).json({ message: `Username Must Contain Only Letters, Numbers, Underscores, And Be Within ${shared.config.length.username.min} And ${shared.config.length.username.max} Characters` });
  }

  if (!emailRegex(email)) {
    return res.status(400).json({ message: `Email Must Be A Valid Email Address And Must Be At Most ${shared.config.length.email.max} Characters` });
  }

  if (!passwordRegex(password)) {
    return res.status(400).json({ message: `Password Must Contain At Least One Letter, One Number, One Special Character, And Be Within ${shared.config.length.password.min} And ${shared.config.length.password.max} Characters` });
  }
  
  const user = register(username, email, password);

  if (isIError(user)) {
    return res.status(user.status || 500).json({ message: user.message });
  } else {
    return res.status(200).json({ message: "Success" });
  }

});

export default { path, router };