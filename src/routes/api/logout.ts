import express from "express";

import { isAuthenticated } from "../../middlewares/api.middleware"; // Always make sure it is the right middleware
import deleteUserSession from "../../utils/sessionManager";

const router = express.Router();
const path = "/api/logout";

router.post("/", isAuthenticated, async (req, res, next) => {
    req.session.destroy(err => {
        if (err) {
          next(err);
        } else {
          res.status(200).json({ message: "Success" });
        }
      });
});

router.post("/all", isAuthenticated, (req, res, next) => {
    if (deleteUserSession(req.session.userId!)) {
      res.status(200).json({ message: "Success" });
    } else {
      next({ message: "Failed to log out of all devices", status: 500 });
    }
  });

export default { path, router };