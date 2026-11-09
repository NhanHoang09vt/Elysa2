import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JsonStore } from '../database/jsonStore.js';
import { ENV } from '../config/env.js';

export class AuthService {
  private store = JsonStore.getInstance();

  async register(username: string, email: string, password: string) {
    if (!username || !email || !password) {
      throw new Error('Vui lòng điền đầy đủ tài khoản, email và mật khẩu.');
    }
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    if (this.store.users.find((u) => u.username.toLowerCase() === cleanUsername)) {
      throw new Error('Tên tài khoản đã tồn tại.');
    }
    if (this.store.users.find((u) => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('Email này đã được sử dụng.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = {
      id: `USR_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      username: cleanUsername,
      email: cleanEmail,
      passwordHash,
      role: 'player',
      createdAt: new Date().toISOString(),
    };

    this.store.users.push(newUser);
    this.store.save();

    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, role: newUser.role },
      ENV.JWT_SECRET,
      { expiresIn: ENV.JWT_EXPIRES_IN as any }
    );

    return {
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    };
  }

  async login(usernameOrEmail: string, password: string) {
    if (!usernameOrEmail || !password) {
      throw new Error('Vui lòng nhập tài khoản và mật khẩu.');
    }
    const clean = usernameOrEmail.trim().toLowerCase();
    const user = this.store.users.find(
      (u) => u.username.toLowerCase() === clean || u.email.toLowerCase() === clean
    );

    if (!user) {
      throw new Error('Tài khoản hoặc mật khẩu không chính xác.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Tài khoản hoặc mật khẩu không chính xác.');
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      ENV.JWT_SECRET,
      { expiresIn: ENV.JWT_EXPIRES_IN as any }
    );

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }
}
