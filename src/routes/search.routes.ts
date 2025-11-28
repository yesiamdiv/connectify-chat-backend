import express, { Router } from "express";
import { 
    searchUsersGlobally, 
    searchRoomsGlobally, 
    searchJoinedRooms 
} from "../controllers/search.controller";

const router: Router = express.Router();

// Search for users globally
// GET /search/users?q=john&page=1&limit=20
router.get('/users', searchUsersGlobally);

// Search for rooms globally
// GET /search/rooms?q=chat&type=group&page=1&limit=20
router.get('/rooms', searchRoomsGlobally);

// Search for rooms the authenticated user has joined
// GET /search/rooms/joined?q=team&page=1&limit=20
router.get('/rooms/joined', searchJoinedRooms);

export const search_router: Router = router;