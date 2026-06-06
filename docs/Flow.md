# 🏛️ SportsHub System Flow

## 📊 Complete Player Lifecycle

```
SIGNUP
  ↓ Player creates account, selects sport & skill level (NO team selection)
  ↓ Email verification sent
  ↓ Status: PENDING_COACH_APPROVAL
  ↓ ❌ BLOCKED: Cannot sign in or access dashboard
  
  
COACH APPROVAL & TEAM ASSIGNMENT
  ↓ Coach reviews pending players in Coach/Requests
  ↓ Coach approves player → Status: PENDING_TEAM_ASSIGNMENT
  ↓ Team Assignment Modal Opens
  ↓ Coach selects team for player
  ↓ Player assigned to team → Status: TEAM_ASSIGNED
  ↓ ✅ UNLOCKED: Player can now sign in to dashboard
  

PAYMENT SUBMISSION
  ↓ Player navigates to Payment page
  ↓ Page shows assigned team & fee
  ↓ Player selects payment method (Cash/GCash/Bank Transfer)
  ↓ Player submits payment proof → Status: PENDING_PAYMENT_APPROVAL
  ↓ ⏳ Awaiting facilitator review
  

PAYMENT VERIFICATION
  ↓ Facilitator reviews payment in Facilitator/Requests
  ↓ Facilitator approves payment
  ↓ Status: ACTIVE (FULLY ACTIVATED)
  ↓ ✅ Player eligible for scheduling
  ↓ Payment rejected → Status stays PENDING_PAYMENT
  ↓ Player can resubmit payment


SCHEDULING & BRACKETS
  ↓ Facilitator can only schedule teams if ALL members:
  ↓   • Coach assigned ✓
  ↓   • Payment approved ✓
  ↓   • Status = ACTIVE ✓
  ↓ Generate brackets with approved players
  ↓ Start event
```

---

## 👥 Role Responsibilities

### 🟠 Community Sports Organizer (Municipal Head)

**Scope:** ONE municipality only (e.g., Binangonan)

**Access:**
- Full control of municipality
- All events, teams, and participants
- User management and approval

**Responsibilities:**
- Create sports events
- Manage event fees
- Set organizer-level configurations
- View all activity and analytics
- Approve non-player roles (coaches, facilitators)

**Key Idea:** 👉 Organizer = System owner for municipality

---

### 🔵 Coach (Player Recruitment & Training)

**Scope:** Assigned teams/sports only

**Access:**
- Pending players awaiting approval
- Assigned teams and players
- Team performance data

**Responsibilities:**
- **REVIEW** players who signed up for their sport
- **APPROVE or REJECT** player applications
- **ASSIGN** approved players to specific teams
- Track team performance
- Provide coaching feedback
- Guide training and development

**Key Idea:** 👉 Coach = Gatekeeper for player activation

---

### 🟡 Facilitator (Event Operations & Payments)

**Scope:** Assigned events only

**Access:**
- All pending payments for event
- Assigned event teams and schedules
- Team member lists

**Responsibilities:**
- **VERIFY** player payment submissions
- **APPROVE or REJECT** payments
- Generate scheduling brackets (only after all payments approved)
- Coordinate event logistics
- Send announcements and updates
- Assist with check-ins and attendance

**Key Idea:** 👉 Facilitator = Payment gatekeeper & event coordinator

---

### 🟢 Player / Participant (End User)

**Scope:** Personal profile + assigned team

**Access:**
- Own profile and dashboard
- Only AFTER coach approval & team assignment
- Assigned team and event schedules
- Payment submission form (after team assignment)

**Responsibilities:**
- Complete signup with skill level
- Wait for coach approval
- Make payment when assigned to team
- Follow schedule and participate
- View performance feedback

**Key Idea:** 👉 Player = Participant in approved flow

---

## 🔐 Auth & Access Gates

### Signup
```
✅ Available to: Anyone
📋 Required: Email, password, sport, skill level
❌ Team selection: NOT available yet
```

### Dashboard Access
```
❌ BLOCKED if: PENDING_COACH_APPROVAL or PENDING_TEAM_ASSIGNMENT
⏳ PENDING if: PENDING_PAYMENT_APPROVAL
✅ ALLOWED if: TEAM_ASSIGNED, PENDING_PAYMENT, or ACTIVE
```

### Payment Submission
```
✅ Available if: Status = TEAM_ASSIGNED or PENDING_PAYMENT
❌ Blocked if: Not yet assigned team
❌ Blocked if: Already payment approved
```

### Scheduling
```
✅ Facilitator can schedule if:
   • All team members have status = ACTIVE
   • All team members have payment status = APPROVED
   • Team has assigned coach
❌ Cannot schedule incomplete teams
```

---

## 📈 Status Progression

| Status | Actor | Action | Next Status |
|---|---|---|---|
| PENDING_COACH_APPROVAL | Player signs up | — | (awaits coach) |
| PENDING_COACH_APPROVAL | Coach | Approve | PENDING_TEAM_ASSIGNMENT |
| PENDING_COACH_APPROVAL | Coach | Reject | REJECTED |
| PENDING_TEAM_ASSIGNMENT | Coach | Assign Team | TEAM_ASSIGNED |
| TEAM_ASSIGNED | Player | Submit Payment | PENDING_PAYMENT_APPROVAL |
| PENDING_PAYMENT_APPROVAL | Facilitator | Approve | **ACTIVE** |
| PENDING_PAYMENT_APPROVAL | Facilitator | Reject | PENDING_PAYMENT |
| ACTIVE | System | — | Eligible for scheduling |

---

## 🛡️ No-Bypass Guarantee

```
❌ Cannot skip coach approval
   → Access denied at auth gate

❌ Cannot skip team assignment
   → Payment form unavailable

❌ Cannot skip payment
   → Cannot reach ACTIVE status

❌ Cannot skip payment approval
   → Cannot be scheduled

❌ Cannot manipulate status manually
   → All status changes only via official actions
```

---

## 📋 System Structure

```
COMMUNITY SPORTS ORGANIZER
        ↓
   EVENTS (with fees)
        ↓
COACHES (approve players)
        ↓
PLAYERS (signup → approval → payment → activation)
        ↓
FACILITATORS (verify payments & schedule)
```

---

## ✅ Final Flow Summary

1. **Player signs up** without selecting team
2. **Coach approves** and assigns team via modal
3. **Player submits** payment proof
4. **Facilitator verifies** payment
5. **Player activated** and eligible for scheduling
6. **Facilitator creates** brackets with approved players
7. **Event begins** with balanced, verified participants

**Result:** No incomplete teams, no unpaid players, no unauthorized access.

