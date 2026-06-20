const PAYMENT_TRANSITIONS = {
  UNPAID: ['DEPOSIT_PENDING', 'DEPOSIT_PAID', 'CANCELLED'],
  DEPOSIT_PENDING: ['UNPAID', 'DEPOSIT_PAID', 'CANCELLED'],
  DEPOSIT_PAID: ['FINAL_PAYMENT_PENDING', 'FULLY_PAID', 'CANCELLED'],
  FINAL_PAYMENT_PENDING: ['DEPOSIT_PAID', 'FULLY_PAID', 'CANCELLED'],
  FULLY_PAID: [],
  CANCELLED: [],
}

const PROJECT_TRANSITIONS = {
  WAITING_DEPOSIT: ['WAITING_BRIEF', 'BRIEF_SUBMITTED', 'CANCELLED'],
  WAITING_BRIEF: ['BRIEF_SUBMITTED', 'CANCELLED'],
  BRIEF_SUBMITTED: ['WAITING_BRIEF', 'REVIEWING', 'CANCELLED'],
  REVIEWING: ['BRIEF_SUBMITTED', 'IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['WAITING_FEEDBACK', 'WAITING_FINAL_PAYMENT', 'CANCELLED'],
  WAITING_FEEDBACK: ['IN_PROGRESS', 'WAITING_FINAL_PAYMENT', 'CANCELLED'],
  WAITING_FINAL_PAYMENT: ['IN_PROGRESS', 'READY_TO_DELIVER', 'CANCELLED'],
  READY_TO_DELIVER: ['WAITING_FINAL_PAYMENT', 'COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
}

export function assertTransition(type, current, next) {
  const transitions = type === 'payment' ? PAYMENT_TRANSITIONS : PROJECT_TRANSITIONS
  if (current === next) return
  if (!transitions[current]?.includes(next)) {
    const error = new Error(`Không thể chuyển trạng thái ${type === 'payment' ? 'thanh toán' : 'dự án'} từ ${current} sang ${next}.`)
    error.status = 409
    throw error
  }
}

export const isTerminalOrder = (order) => order.paymentStatus === 'CANCELLED' || ['COMPLETED', 'CANCELLED'].includes(order.projectStatus)
