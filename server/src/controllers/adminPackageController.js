import { prisma } from '../config/prisma.js'

const clean = (body, partial = false) => {
  const data = {}
  if (!partial || body.name !== undefined) data.name = String(body.name || '').trim()
  if (!partial || body.slug !== undefined) data.slug = String(body.slug || '').trim().toLowerCase()
  if (!partial || body.description !== undefined) data.description = String(body.description || '').trim()
  if (!partial || body.price !== undefined) data.price = Number(body.price)
  if (!partial || body.features !== undefined) data.features = Array.isArray(body.features) ? body.features.map(String).map((item) => item.trim()).filter(Boolean) : String(body.features || '').split('\n').map((item) => item.trim()).filter(Boolean)
  if (body.isActive !== undefined) data.isActive = Boolean(body.isActive)
  if (body.displayOrder !== undefined) data.displayOrder = Number(body.displayOrder)
  if ((!partial && (!data.name || !data.slug || !data.description)) || (data.slug !== undefined && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) || (data.price !== undefined && (!Number.isInteger(data.price) || data.price <= 0)) || (data.displayOrder !== undefined && (!Number.isInteger(data.displayOrder) || data.displayOrder < 0))) { const error = new Error('Thông tin gói dịch vụ không hợp lệ.'); error.status = 400; throw error }
  return data
}

export async function packages(_req, res) { res.json({ packages: await prisma.servicePackage.findMany({ orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }] }) }) }
export async function packageDetail(req, res) { const item = await prisma.servicePackage.findUnique({ where: { id: req.params.id }, include: { _count: { select: { orders: true } } } }); if (!item) { const error = new Error('Không tìm thấy gói dịch vụ.'); error.status = 404; throw error } res.json({ package: item }) }
export async function createPackage(req, res) { res.status(201).json({ package: await prisma.servicePackage.create({ data: clean(req.body) }) }) }
export async function updatePackage(req, res) { res.json({ package: await prisma.servicePackage.update({ where: { id: req.params.id }, data: clean(req.body, true) }) }) }
export async function togglePackage(req, res) { const current = await prisma.servicePackage.findUnique({ where: { id: req.params.id }, select: { isActive: true } }); if (!current) { const error = new Error('Không tìm thấy gói dịch vụ.'); error.status = 404; throw error } res.json({ package: await prisma.servicePackage.update({ where: { id: req.params.id }, data: { isActive: !current.isActive } }) }) }
