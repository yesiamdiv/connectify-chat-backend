
import { Request, Response } from 'express';
import { User, IUser } from '../models/user';
import { Room, IRoom } from '../models/rooms';
import { HydratedDocument } from 'mongoose';

// Extend Request to include authenticated user
export interface AuthenticatedRequest extends Request {
    user?: HydratedDocument<IUser>;
}

// Controller to search users globally
export const searchUsersGlobally = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { q, page = '1', limit = '20' } = req.query;
        
        if (!q || typeof q !== 'string') {
            return res.status(400).json({ 
                error: 'Search query (q) is required' 
            });
        }

        const pageNum = Math.max(1, parseInt(page as string));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit as string))); // Cap at 100
        const skip = (pageNum - 1) * limitNum;

        // Use regex for prefix matching (more efficient than text search for autocomplete)
        // Case-insensitive search
        const searchRegex = new RegExp(`^${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');

        const [users, total] = await Promise.all([
            User.find({ user_name: searchRegex })
                .select('user_name status createdAt') // Don't send password
                .limit(limitNum)
                .skip(skip)
                .lean() // Faster, returns plain objects
                .exec(),
            User.countDocuments({ user_name: searchRegex }).exec()
        ]);

        return res.status(200).json({
            data: users,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
                hasMore: skip + users.length < total
            }
        });

    } catch (error) {
        console.error('Error searching users:', error);
        return res.status(500).json({ 
            error: 'Failed to search users' 
        });
    }
};

// Controller to search rooms globally
export const searchRoomsGlobally = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { q, type, page = '1', limit = '20' } = req.query;
        
        if (!q || typeof q !== 'string') {
            return res.status(400).json({ 
                error: 'Search query (q) is required' 
            });
        }

        const pageNum = Math.max(1, parseInt(page as string));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
        const skip = (pageNum - 1) * limitNum;

        // Build query
        const searchRegex = new RegExp(`^${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
        const query: any = { room_name: searchRegex };
        
        // Optional filter by room type
        if (type && (type === 'private' || type === 'group')) {
            query.type = type;
        }

        const [rooms, total] = await Promise.all([
            Room.find(query)
                .select('room_name description type created_by members createdAt')
                .populate('created_by', 'user_name')
                .limit(limitNum)
                .skip(skip)
                .lean()
                .exec(),
            Room.countDocuments(query).exec()
        ]);

        // Add member count to each room
        const roomsWithCount = rooms.map(room => ({
            ...room,
            memberCount: (room.members as any[]).length
        }));

        return res.status(200).json({
            data: roomsWithCount,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
                hasMore: skip + rooms.length < total
            }
        });

    } catch (error) {
        console.error('Error searching rooms globally:', error);
        return res.status(500).json({ 
            error: 'Failed to search rooms' 
        });
    }
};

// Controller to search rooms the user has joined
export const searchJoinedRooms = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ 
                error: 'User not authenticated' 
            });
        }

        const { q, type, page = '1', limit = '20' } = req.query;
        
        if (!q || typeof q !== 'string') {
            return res.status(400).json({ 
                error: 'Search query (q) is required' 
            });
        }

        const pageNum = Math.max(1, parseInt(page as string));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
        const skip = (pageNum - 1) * limitNum;

        // Build query - user must be in members array
        const searchRegex = new RegExp(`^${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
        const query: any = { 
            members: req.user._id,
            room_name: searchRegex 
        };
        
        if (type && (type === 'private' || type === 'group')) {
            query.type = type;
        }

        // This query will use the compound index { members: 1, room_name: 1 }
        const [rooms, total] = await Promise.all([
            Room.find(query)
                .select('room_name description type created_by members createdAt')
                .populate('created_by', 'user_name')
                .limit(limitNum)
                .skip(skip)
                .lean()
                .exec(),
            Room.countDocuments(query).exec()
        ]);

        const roomsWithCount = rooms.map(room => ({
            ...room,
            memberCount: (room.members as any[]).length
        }));

        return res.status(200).json({
            data: roomsWithCount,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
                hasMore: skip + rooms.length < total
            }
        });

    } catch (error) {
        console.error('Error searching joined rooms:', error);
        return res.status(500).json({ 
            error: 'Failed to search joined rooms' 
        });
    }
};