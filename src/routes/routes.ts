import express, { Router } from "express"
import { auth_router } from "./auth.routes";

const router: Router = express.Router();

router.use('/auth', auth_router);

export const routes: Router = router;