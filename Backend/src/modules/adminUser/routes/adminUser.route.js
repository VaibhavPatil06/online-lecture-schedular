import express from "express";
import { isAdmin } from "../../middleware/auth.js";
import {
  login,
  logout,
  me,
  registerUser,
} from "../controllers/adminUser.controller.js";

const router = express.Router();

router.get("/me", isAdmin, me);
router.post("/login", login);
router.put("/logout", isAdmin, logout);
router.post("/register-user", registerUser);

export default router;
