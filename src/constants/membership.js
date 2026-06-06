export const MEMBERSHIP_STATUS = {
  PENDING_COACH_APPROVAL: 'PENDING_COACH_APPROVAL', // Player signed up, coach hasn't approved
  PENDING_TEAM_ASSIGNMENT: 'PENDING_TEAM_ASSIGNMENT', // Coach approved, awaiting team assignment
  TEAM_ASSIGNED: 'TEAM_ASSIGNED', // Team assigned, ready for payment
  PENDING_PAYMENT: 'PENDING_PAYMENT', // Awaiting payment submission
  PENDING_PAYMENT_APPROVAL: 'PENDING_PAYMENT_APPROVAL', // Payment submitted, facilitator reviewing
  ACTIVE: 'ACTIVE', // Fully activated, eligible for scheduling
  REJECTED: 'REJECTED', // Coach/Facilitator rejected
}
