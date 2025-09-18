import { IUser } from "../interfaces/IUser";

declare global {
    namespace Express {
        export interface Request {
            user:IUser
        }
    }
}