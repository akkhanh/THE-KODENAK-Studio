import bcrypt from 'bcrypt'
import { prisma } from '../config/prisma.js'
import { signToken } from '../utils/token.js'

export const publicUserSelect = { id: true, name: true, email: true, phone: true, role: true, isActive: true, lastLoginAt: true, createdAt: true, updatedAt: true }
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function register(req, res) {
  const { name, email, phone, password } = req.body
  if (!name?.trim() || !email?.trim() || !phone?.trim() || !password) { const error = new Error('Tên, email, số điện thoại và mật khẩu là bắt buộc.'); error.status = 400; throw error }
  if (password.length < 8) { const error = new Error('Mật khẩu phải có ít nhất 8 ký tự.'); error.status = 400; throw error }
  const normalizedEmail = email.trim().toLowerCase()
  if (!EMAIL_PATTERN.test(normalizedEmail)) { const error = new Error('Email không hợp lệ.'); error.status = 400; throw error }
  if (await prisma.user.findUnique({ where: { email: normalizedEmail }, select: { id: true } })) { const error = new Error('Email đã được sử dụng.'); error.status = 409; throw error }
  const user = await prisma.user.create({ data: { name: name.trim(), email: normalizedEmail, phone: phone.trim(), passwordHash: await bcrypt.hash(password, 12), role: 'CUSTOMER' }, select: publicUserSelect })
  res.status(201).json({ token: signToken(user.id), user })
}

export async function login(req, res) {
  const { email, password } = req.body
  if (!email || !password) { const error = new Error('Email và mật khẩu là bắt buộc.'); error.status = 400; throw error }
  const userWithPassword = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } })
  if (!userWithPassword || !await bcrypt.compare(password, userWithPassword.passwordHash)) { const error = new Error('Email hoặc mật khẩu không đúng.'); error.status = 401; throw error }
  if (!userWithPassword.isActive) { const error = new Error('Tài khoản đã bị khóa. Vui lòng liên hệ THE KODENAK Studio.'); error.status = 403; throw error }
  const user = await prisma.user.update({ where: { id: userWithPassword.id }, data: { lastLoginAt: new Date() }, select: publicUserSelect })
  res.json({ token: signToken(user.id), user })
}

export function me(req, res) { res.json({ user: req.user }) }

export async function updateMe(req, res) {
  const name = req.body.name?.trim()
  const phone = req.body.phone?.trim()
  if (!name || !phone) { const error = new Error('Tên và số điện thoại là bắt buộc.'); error.status = 400; throw error }
  const user = await prisma.user.update({ where: { id: req.user.id }, data: { name, phone }, select: publicUserSelect })
  res.json({ user })
}
