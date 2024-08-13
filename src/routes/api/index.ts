import express from "express";

import { isAuthenticated } from "../../middlewares/api.middleware"; // Always make sure it is the right middleware

const router = express.Router();
const path = "/api";

router.get("/", isAuthenticated, (req, res) => {
  res.status(200).json({ message: "who is json and why would i need to parse him?" });
});

export default { path, router };