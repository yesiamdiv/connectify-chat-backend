import mongoose, { Schema, Model, Document, CallbackError, HydrateOptions, HydratedDocument} from "mongoose";
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

export interface IUserModel extends Model<IUser>{
    verify_token(token: string): Promise<HydratedDocument<IUser> | null>;
}

const schema = new Schema({
    user_name: {type: String, required: true, unique: true },
    password: {type: String, required: true},
    status: {type: String},
}, {collection: 'User',timestamps: true});

// Text index for search optimization
schema.index({ user_name: 'text' });
// Regular index for prefix searches (more efficient for autocomplete)
schema.index({ user_name: 1 });

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

schema.static('verify_token', async function(token: string): Promise<HydratedDocument<IUser> | null> {
    try {
        const decoded = jwt.verify(token, SECRET_KEY as string) as IUserJwtPayload;
        
        const user = await this.findById(decoded.user_id);
        if (!user || user._id)
            return null;
        return user;
       
    } catch (err) {
        return null;
    }
});

export const User = mongoose.model<IUser, IUserModel>('User',schema);