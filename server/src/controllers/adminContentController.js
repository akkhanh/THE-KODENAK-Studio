import { prisma } from '../config/prisma.js'

const cleanFaq = (body, partial = false) => {
  const data = {}
  for (const field of ['question', 'answer', 'category']) if (!partial || body[field] !== undefined) data[field] = String(body[field] || '').trim()
  if (body.isActive !== undefined) data.isActive = Boolean(body.isActive)
  if (body.displayOrder !== undefined) data.displayOrder = Number(body.displayOrder)
  if ((!partial && (!data.question || !data.answer)) || (data.question !== undefined && !data.question) || (data.answer !== undefined && !data.answer) || (data.displayOrder !== undefined && (!Number.isInteger(data.displayOrder) || data.displayOrder < 0))) { const error = new Error('Thông tin FAQ không hợp lệ.'); error.status = 400; throw error }
  return data
}
export async function faqs(_req, res) { res.json({ faqs: await prisma.fAQItem.findMany({ orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }] }) }) }
export async function faqDetail(req, res) { const faq = await prisma.fAQItem.findUnique({ where: { id: req.params.id } }); if (!faq) { const error = new Error('Không tìm thấy FAQ.'); error.status = 404; throw error } res.json({ faq }) }
export async function createFaq(req, res) { res.status(201).json({ faq: await prisma.fAQItem.create({ data: cleanFaq(req.body) }) }) }
export async function updateFaq(req, res) { res.json({ faq: await prisma.fAQItem.update({ where: { id: req.params.id }, data: cleanFaq(req.body, true) }) }) }
export async function toggleFaq(req, res) { const current = await prisma.fAQItem.findUnique({ where: { id: req.params.id }, select: { isActive: true } }); if (!current) { const error = new Error('Không tìm thấy FAQ.'); error.status = 404; throw error } res.json({ faq: await prisma.fAQItem.update({ where: { id: req.params.id }, data: { isActive: !current.isActive } }) }) }

const settingFields = ['brandName', 'tagline', 'contactEmail', 'facebookUrl', 'zaloUrl', 'locationText', 'bankName', 'bankAccountName', 'bankAccountNumber', 'footerDescription']
export async function settings(_req, res) { res.json({ settings: await prisma.websiteSetting.upsert({ where: { id: 'main' }, create: { id: 'main' }, update: {} }) }) }
export async function updateSettings(req, res) { const data = Object.fromEntries(settingFields.filter((field) => req.body[field] !== undefined).map((field) => [field, String(req.body[field] || '').trim()])); if (!Object.keys(data).length) { const error = new Error('Không có thông tin để cập nhật.'); error.status = 400; throw error } res.json({ settings: await prisma.websiteSetting.upsert({ where: { id: 'main' }, create: { id: 'main', ...data }, update: data }) }) }
