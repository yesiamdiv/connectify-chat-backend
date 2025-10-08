import express, { Router } from "express";
import {login, signup} from "../controllers/auth.controller"

const router: Router = express.Router();

router.post('/login', login);
router.post('/signup', signup); 

export const auth_router: express.Router = router;