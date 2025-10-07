import mongoose, {Schema, Model, Document} from "mongoose";

export enum content_type {
    "text",
    "image"
}

export interface IMessage extends Document{
    room: Schema.Types.ObjectId;
    sender: Schema.Types.ObjectId;
    type: content_type;
    content: string;
    read_by: Schema.Types.ObjectId[];
}

const schema = new Schema({
    room: {type: Schema.Types.ObjectId, ref: "Room"},
    sender: {type: Schema.Types.ObjectId, ref: "User"},
    type: {type: String, enum: Object.values(content_type), required: true},
    content: {type: String, required: true},    
    read_by: [{type: Schema.Types.ObjectId, ref: "User", required: true}]
});

export const Message: Model<IMessage> = mongoose.model<IMessage>("Message", schema);