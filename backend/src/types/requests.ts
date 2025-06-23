import { Request } from 'express';
import { UserData } from '../models/User';

export interface AuthenticatedRequest extends Request {
  user?: UserData
}