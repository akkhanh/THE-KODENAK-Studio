import { prisma } from '../config/prisma.js'

export async function publicFaqs(_req, res) { res.json({ faqs: await prisma.fAQItem.findMany({ where: { isActive: true }, orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }] }) }) }
export async function publicSettings(_req, res) {
  const setting = await prisma.websiteSetting.findUnique({ where: { id: 'main' } })
  if (!setting) return res.json({ settings: null })
  const { bankName: _bankName, bankAccountName: _bankAccountName, bankAccountNumber: _bankAccountNumber, ...safe } = setting
  res.json({ settings: safe })
}
