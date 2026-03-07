import mongoose, { Schema, Document } from 'mongoose';

export interface IPost extends Document {
  imageUrl?: string;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  time: string;
  date: string;
  caption?: string;
  user: mongoose.Types.ObjectId;
  likes: mongoose.Types.ObjectId[];
  commentCount: number;
  type: 'sunrise' | 'sunset';
  exif: {
    camera: string;
    lens: string;
    aperture: string;
    iso: string;
    shutter: string;
  };
}

const PostSchema: Schema = new Schema({
  imageUrl: { type: String },
  location: { type: String, default: 'Unknown' },
  coordinates: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 },
  },
  time: { type: String },
  date: { type: String },
  caption: { type: String },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  commentCount: { type: Number, default: 0 },
  type: { type: String, enum: ['sunrise', 'sunset'], required: true },
  exif: {
    camera: { type: String, default: 'Unknown' },
    lens: { type: String, default: '' },
    aperture: { type: String, default: '' },
    iso: { type: String, default: '' },
    shutter: { type: String, default: '' },
  },
}, { timestamps: true });

PostSchema.index({ caption: 'text', location: 'text' });

export default mongoose.model<IPost>('Post', PostSchema);
