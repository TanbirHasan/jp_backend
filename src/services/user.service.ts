import * as userModel from '../models/user.model';
import { User, AppError } from '../types';

function findAllUsers(): Promise<User[]> {
  return userModel.findAll();
}

async function findMe(id: number): Promise<User> {
  const user = await userModel.findById(id);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return user;
}

export { findAllUsers, findMe };
