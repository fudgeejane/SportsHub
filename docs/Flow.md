# 🏛️ FINAL SYSTEM FLOW AND ACCESS

## 🟠 1. Community Sports Organizer (Municipal Head)

**Scope:** ONE municipality only (e.g., Binangonan)

### Role Description:

Helps manage events efficiently through automated scheduling and player matching.

### Access:

- Full control of their municipality only
- All sports events, teams, and participants inside municipality
- Coaches, facilitators, and players under their municipality

### Responsibilities:

- Create and manage sports events
- Handle automated scheduling of games
- Perform player matching and team creation
- Assign coaches and facilitators
- Approve or manage participants
- Monitor all event operations

### Key Idea:

👉 Organizer = Highest authority in the system

---

## 🔵 2. Coach (Performance & Training)

**Scope:** Assigned teams/events only

### Role Description:

Provides tools to monitor player performance and guide training effectively.

### Access:

- Assigned teams and players only
- Event and training data related to their teams

### Responsibilities:

- Track player performance
- Assign training tasks or drills
- Give feedback and evaluation
- Monitor player improvement

### Key Idea:

👉 Coach = Performance development

---

## 🟡 3. Facilitator (Event Support & Communication)

**Scope:** Assigned events only

### Role Description:

Simplifies event coordination and communication with participants.

### Access:

- Assigned events within municipality
- Player lists and schedules for those events

### Responsibilities:

- Coordinate event logistics
- Send announcements and updates
- Assist attendance/check-ins
- Support organizers during events
- Help manage communication flow

### Key Idea:

👉 Facilitator = Operations + communication support

---

## 🟢 4. Player / Participant (End User)

**Scope:** Personal + assigned team only

### Role Description:

Offers fair team matching, easy access to schedules, and performance tracking.

### Access:

- Own profile
- Assigned teams and events
- Schedules and match details
- Performance stats

### Responsibilities:

- Participate in events/games
- Follow schedules
- View feedback and progress
- Receive updates

### Key Idea:

👉 Player = participation + engagement

---

# 🧠 SYSTEM STRUCTURE (NO ADMIN)

```text
COMMUNITY SPORTS ORGANIZER (Municipality Head)
        ↓
   EVENTS / SCHEDULING
        ↓
COACHES + FACILITATORS
        ↓
    PLAYERS / PARTICIPANTS
```

---

# 🔐 CORE RULES

### 1. Single Municipality Control

- Each Organizer belongs to ONE municipality only (e.g., Binangonan)
- No cross-municipality access

### 2. Organizer is Top-Level Authority

- No admin above them
- They control everything inside municipality

### 3. Role Isolation

- Coaches only see assigned teams
- Facilitators only see assigned events
- Players only see their own participation

### 4. Strict Data Boundaries

- No user sees data outside their assignment scope

---

# 📌 FINAL SUMMARY

| Role | Scope | Main Purpose |
|---|---|---|
| Organizer | Full municipality | Event creation, scheduling, matching |
| Coach | Assigned teams | Performance tracking & training |
| Facilitator | Assigned events | Coordination & communication |
| Player | Personal/team | Participation & performance |
