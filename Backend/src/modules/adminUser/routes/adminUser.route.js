import express from "express";
import { isAdmin } from "../../middleware/auth.js";
import {
  getInstructors,
  login,
  logout,
  me,
  registerUser,
} from "../controllers/adminUser.controller.js";

const router = express.Router();

router.get("/me", isAdmin, me);
router.post("/login", login);
router.put("/logout", isAdmin, logout);
router.post("/register-instructors", registerUser);
router.get("/get-instructors",getInstructors)

export default router;
