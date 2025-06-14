import { Router } from "express";
import { createForm } from "../controllers/form.controller";
import { authenticate } from "../middleware/auth.middleare";

const router = Router();

router.post("/", authenticate, createForm); // POST /forms

export default router;
