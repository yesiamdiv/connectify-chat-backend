import express, { Router } from "express"
import { auth_router } from "./auth.routes";
import { search_router } from "./search.routes";
import { verifyUserSession } from "../controllers/auth.controller";

const router: Router = express.Router();

router.use('/auth', auth_router);

router.use('/search', verifyUserSession, search_router);

export const routes: Router = router;