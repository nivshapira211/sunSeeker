import { Request, Response } from 'express';
interface AuthRequest extends Request {
    user?: any;
}
export declare const getPosts: (req: Request, res: Response) => Promise<void>;
export declare const createPost: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getPostById: (req: Request, res: Response) => Promise<void>;
export declare const updatePost: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deletePost: (req: AuthRequest, res: Response) => Promise<void>;
export declare const toggleLike: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getComments: (req: Request, res: Response) => Promise<void>;
export declare const addComment: (req: AuthRequest, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=postController.d.ts.map