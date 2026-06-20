import { prisma } from '../config/prisma.js'
import { publicUserSelect } from './authController.js'

const include = { order: { include: { customer: { select: publicUserSelect }, servicePackage: { select: { id: true, name: true, slug: true } } } } }
export async function briefs(_req, res) { res.json({ briefs: await prisma.projectBrief.findMany({ include, orderBy: { createdAt: 'desc' } }) }) }
export async function briefDetail(req, res) { const brief = await prisma.projectBrief.findUnique({ where: { id: req.params.id }, include }); if (!brief) { const error = new Error('Không tìm thấy brief dự án.'); error.status = 404; throw error } res.json({ brief }) }
export async function reviewBrief(req, res) { res.json({ brief: await prisma.$transaction(async (tx) => { const brief = await tx.projectBrief.update({ where: { id: req.params.id }, data: { isReviewed: req.body.isReviewed === undefined ? true : Boolean(req.body.isReviewed) } }); if (brief.isReviewed) await tx.serviceOrder.updateMany({ where: { id: brief.orderId, projectStatus: 'BRIEF_SUBMITTED' }, data: { projectStatus: 'REVIEWING' } }); return brief }) }) }
export async function noteBrief(req, res) { res.json({ brief: await prisma.projectBrief.update({ where: { id: req.params.id }, data: { adminBriefNote: String(req.body.adminBriefNote || '').trim() } }) }) }
