import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import * as userModel from '../models/user.model';
import * as refreshTokenModel from '../models/refreshToken.model';
import { User, UserRole, AuthResult, RefreshTokenRow, AppError } from '../types';

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

interface LoginPayload {
  email: string;
  password: string;
}

async function register({ name, email, password, role }: RegisterPayload): Promise<AuthResult> {
  if (!name || !email || !password) {
    throw new AppError('Name, email, and password are required', 400);
  }

  const existing = await userModel.findByEmail(email);
  if (existing) {
    throw new AppError('Email is already registered', 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await userModel.create({ name, email, password: hashedPassword, role });

  const accessToken = generateAccessToken(user);
  const { token: refreshToken, expiresAt } = generateRefreshToken();
  await refreshTokenModel.create(user.id, refreshToken, expiresAt);

  const { password: _removed, ...safeUser } = user as any;
  return { user: safeUser, accessToken, refreshToken };
}

async function login({ email, password }: LoginPayload): Promise<AuthResult> {
  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  const user = await userModel.findByEmail(email);
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError('Invalid credentials', 401);
  }

  const accessToken = generateAccessToken(user);
  const { token: refreshToken, expiresAt } = generateRefreshToken();
  await refreshTokenModel.create(user.id, refreshToken, expiresAt);

  const { password: _removed, ...safeUser } = user;
  return { user: safeUser, accessToken, refreshToken };
}

async function refresh(incomingToken: string): Promise<{ accessToken: string }> {
  if (!incomingToken) {
    throw new AppError('Refresh token is required', 401);
  }

  const stored: RefreshTokenRow | null = await refreshTokenModel.findByToken(incomingToken);
  if (!stored) {
    throw new AppError('Invalid refresh token', 401);
  }

  if (new Date() > new Date(stored.expires_at)) {
    await refreshTokenModel.deleteByToken(incomingToken);
    throw new AppError('Refresh token expired — please log in again', 401);
  }

  const user = await userModel.findById(stored.user_id);
  if (!user) {
    throw new AppError('User not found', 401);
  }

  const accessToken = generateAccessToken(user);
  return { accessToken };
}

async function logout(token: string): Promise<void> {
  await refreshTokenModel.deleteByToken(token);
}

function generateAccessToken(user: User): string {
  const expiresIn = (process.env.JWT_EXPIRES_IN || '15m') as SignOptions['expiresIn'];
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn }
  );
}

function generateRefreshToken(): { token: string; expiresAt: Date } {
  const token = crypto.randomBytes(64).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  return { token, expiresAt };
}

export { register, login, refresh, logout };
