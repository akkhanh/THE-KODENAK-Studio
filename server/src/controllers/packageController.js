import { prisma } from '../config/prisma.js'

export async function listPackages(_req, res) { res.json({ packages: await prisma.servicePackage.findMany({ where: { isActive: true }, orderBy: [{ displayOrder: 'asc' }, { price: 'asc' }] }) }) }
export async function getPackage(req, res) {
  const servicePackage = await prisma.servicePackage.findFirst({ where: { id: req.params.id, isActive: true } })
  if (!servicePackage) { const error = new Error('Không tìm thấy gói dịch vụ.'); error.status = 404; throw error }
  res.json({ package: servicePackage })
}
