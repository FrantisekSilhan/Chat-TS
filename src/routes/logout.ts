import express from "express";
const router = express.Router();

import { isAuthenticated } from "../middlewares/auth.middleware";
import { deleteUserSession } from "../utils/sessionManager";

const path = "/logout";

router.get("/", isAuthenticated, (req, res, next) => {
  req.session.destroy(err => {
    if (err) {
      next(err);
    } else {
      res.redirect("/login");
    }
  });
});

router.get("/all", isAuthenticated, (req, res, next) => {
  if (deleteUserSession(req.session.userId!)) {
    res.redirect("/login");
  } else {
    next({ message: "Failed to log out of all devices", status: 500 });
  }
});

export default { path, router };