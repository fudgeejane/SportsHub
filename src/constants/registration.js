export const SIGNUP_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
}

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
}

export const PAYMENT_METHODS = {
  CASH: 'cash',
  GCASH: 'gcash',
  BANK_TRANSFER: 'bank_transfer',
}

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.CASH]: 'Cash',
  [PAYMENT_METHODS.GCASH]: 'GCash',
  [PAYMENT_METHODS.BANK_TRANSFER]: 'Bank Transfer',
}
