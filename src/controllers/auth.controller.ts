import { Request, Response } from "express";
import { User } from "../models/user";
import bcrypt from "bcrypt";

export const signup = async (req: Request, res: Response) => {
    const { user_name, password } = req.body;

    try {
        const user = new User({ user_name, password });
        await user.save();

        const token: string = await user.generate_token();
        
        if (token) {
            console.log(`${new Date().toLocaleString()} - Auth: User created and token generated`);
            res.status(201).json({ 
                msg: "Auth: User created", 
                token: token,
                userId: user._id 
            });
        } else {
            console.log(`${new Date().toLocaleString()} - Auth: User created, but token generation failed`);
            res.status(500).json({ msg: "Auth: User created, but token generation failed" });
        }

    } catch (error: any) {
        console.error(`${new Date().toLocaleString()} - Auth: User creation failed: ${error}`);
        res.status(500).json({ msg: `Auth: User creation failed: ${error.message}` });
    }
};

export const login = async (req: Request, res: Response) => {
    const { user_name, password } = req.body;

    try {
        // Find the user by username and check if the provided password matches the hashed one in the database
        const user = await User.findOne({ user_name });
        
        if (!user || !await bcrypt.compare(password, user.password)) {  
            console.log(`${new Date().toLocaleString()} - Auth: Invalid credentials`);
            return res.status(401).json({ msg: 'Auth: Invalid credentials' });
        }
        
        // Generate a token for the user if their password was correct 
        const token = await user.generate_token();

        console.log(`${new Date().toLocaleString()} - Auth: User authenticated and token generated`);
        res.json({ msg: "Auth: User authenticated", token, userId: user._id });
        
    } catch (error: any) {
        console.error(`${new Date().toLocaleString()} - Auth: Login failed: ${error}`);
        res.status(500).json({ msg: `Auth: Login failed: ${error.message}` });
    }
};