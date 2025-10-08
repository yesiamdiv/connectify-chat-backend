import mongoose, { Schema, Model, Document, CallbackError} from "mongoose";
import bcrypt from "bcrypt";
import jwt, {JsonWebTokenError, JwtPayload, sign, verify, VerifyErrors} from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';
export interface IUser extends Document{
    user_name: string;
    password: string;
    status?: string;

    generate_token(): Promise<string>;
    verify_token(): Promise<IUser | null>;
};

export interface IUserJwtPayload extends JwtPayload{
    user_id: string;
    user_name: string;
};

const schema = new Schema({
    user_name: {type: String, required: true, unique: true },
    password: {type: String, required: true},
    status: {type: String},
}, {collection: 'User',timestamps: true});

schema.pre<IUser>('save', async function(next){
    if (!this.isModified('password')) { 
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);       
        const hashed_password = await bcrypt.hashSync(this.password, salt); 
        this.password = hashed_password;
    }
    catch(error:any) {
        next(error);
    } 
    next();
});

schema.method('generate_token', async function(): Promise<string> {
    const user = this;
    const payload: IUserJwtPayload = {
        user_id : user._id.toString(),
        user_name : user.user_name 
    }
    return sign(payload, SECRET_KEY, {expiresIn: '2h'});
});

schema.method('verify_token', async function(token: string): Promise<IUser | null> {
    try {
        const decoded = jwt.verify(token, SECRET_KEY) as IUserJwtPayload;
        
        const user = await User.findById(decoded.user_id);
        if (!user || user._id)
            return null;
        return user;
       
    } catch (err) {
        return null;
    }
});

export const User : Model<IUser> = mongoose.model<IUser>('User',schema);