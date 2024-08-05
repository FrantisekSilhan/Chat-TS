import express from "express";
import shared from "../shared";

import { isAuthenticated } from "../middlewares/auth.middleware";

const router = express.Router();
const path = "/";

router.get("/", isAuthenticated, (req, res) => {
  res.render("index");
});

export default { path, router };