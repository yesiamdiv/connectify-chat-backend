import { Express, Request, Response } from "express";


export const signup = async (req: Request, res: Response) => {
    const user_name: String = req.body.user_name
    const passowrd: String = req.body.password
}