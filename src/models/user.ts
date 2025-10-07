import mongoose, { Schema, Model, Document, CallbackError} from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document{
    user_name: string;
    password: string;
    status?: string;
}

const schema = new Schema({
    user_name: {type: String, required: true, unique: true },
    password: {type: String, required: true},
    status: {type: String},
}, {timestamps: true});

schema.pre('save', async function(next){
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
})

export const User : Model<IUser> = mongoose.model<IUser>('User',schema);