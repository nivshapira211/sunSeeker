import mongoose, { Document } from 'mongoose';
export interface IPost extends Document {
    imageUrl: string;
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
    type: 'sunrise' | 'sunset';
    exif: {
        camera: string;
        lens: string;
        aperture: string;
        iso: string;
        shutter: string;
    };
}
declare const _default: mongoose.Model<IPost, {}, {}, {}, mongoose.Document<unknown, {}, IPost, {}, mongoose.DefaultSchemaOptions> & IPost & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IPost>;
export default _default;
//# sourceMappingURL=Post.d.ts.map