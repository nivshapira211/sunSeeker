import { Request, Response } from 'express';
interface AuthRequest extends Request {
    user?: any;
}
export declare const updateUserProfile: (req: AuthRequest, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=userController.d.ts.map