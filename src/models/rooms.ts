import mongoose, {Model, Schema, Document} from 'mongoose'
import { StreamOptions } from 'stream'

enum room_type {
    "private",
    "group"
}

export interface IRoom extends Document {
    room_name: string;
    description: string;
    type: room_type;
    created_by: Schema.Types.ObjectId;
    members: Schema.Types.ObjectId[];
}

const schema = new Schema({
    room_name : {type:String, required: true, unique: true},
    description: {type: String},
    type: {type: String, enum: Object.values(room_type), required: true},
    created_by: {type: Schema.Types.ObjectId, ref: "User"},
    members: [{type: Schema.Types.ObjectId, ref: "User"}]
}, { timestamps: true});

// Text index for full-text search on room_name and description
schema.index({ room_name: 'text', description: 'text' });
// Regular index for prefix searches
schema.index({ room_name: 1 });
// Compound index for joined rooms query (crucial for performance)
schema.index({ members: 1, room_name: 1 });
// Index for filtering by type
schema.index({ type: 1 });

export const Room : Model<IRoom> = mongoose.model<IRoom>("Room", schema);