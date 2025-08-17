import { User } from '@/database';
import { UserResponse } from '@/schemas/user.schemas';
import express from 'express';

declare global {
  declare namespace Express {
    export interface Request {
      user: UserResponse;
    }
  }
}
