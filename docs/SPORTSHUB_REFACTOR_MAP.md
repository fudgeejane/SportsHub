# SportsHub Refactor Map

## Goal

SportsHub is now organized around a small React + Firebase v9 Modular SDK architecture. The main idea is simple:

- `AuthContext.jsx` stores session state only.
- Hooks own Firebase workflows.
- Firestore collections map to real product concepts.
- Duplicate sports/team-structure logic lives in one place.

## Updated Folder Structure

```txt
src/
+-- contexts/
|   +-- AuthContext.jsx
+-- hooks/
|   +-- useAuth.js
|   +-- useSportManagement.js
|   +-- useTeamManagement.js
|   +-- useEventManagement.js
|   +-- useRegistrationManagement.js
```

Supporting hooks still exist where the current UI needs them, but the five hooks above are the canonical architecture.

## System Flow

```txt
User signs up/signs in
        |
        v
AuthContext watches Firebase Auth + users/{uid}
        |
        v
useAuth handles auth actions and organizer approval workflows
        |
        v
Role-specific pages call management hooks
        |
        v
Firestore collections: users, sports, teams, events, eventSchedules, registrations, notifications
```

## Roles And Statuses

Roles:

```txt
organizer
coach
facilitator
player
```

Statuses:

```txt
pending
approved
rejected
```

Organizers are the only role that can approve or reject users.

## Hook Responsibilities

### `useAuth.js`

Owns:

- Sign in
- Sign up
- Sign out
- Google sign in
- Email verification
- Password reset
- Profile updates
- Current user profile reads
- Organizer review helpers:
  - `approveCoach`
  - `rejectCoach`
  - `approveFacilitator`
  - `rejectFacilitator`
  - `approvePlayer`
  - `rejectPlayer`

### `AuthContext.jsx`

Stores only:

```js
currentUser
userProfile
role
loading
```

Exposes:

```js
isOrganizer
isCoach
isFacilitator
isPlayer
```

It also normalizes legacy uppercase role/status values while the database migrates.

### `useSportManagement.js`

Owns:

- Create, update, archive, delete sports
- Get sports
- Team or individual sport type
- Sport rules
- Team structure helpers
- Merged logic from the removed sports files

Sport shape:

```js
{
  sportName,
  sportType,
  minPlayers,
  maxPlayers,
  allowedSubstitutes,
  rules,
  teamStructure,
  status,
  createdAt,
  updatedAt
}
```

### `useTeamManagement.js`

Owns:

- Create, update, delete teams
- Get teams
- Add/remove members
- Team validation against sport rules
- Compatibility methods used by existing team screens

Team shape:

```js
{
  teamName,
  sportId,
  sportName,
  coachId,
  coachName,
  members,
  status,
  createdAt,
  updatedAt
}
```

### `useEventManagement.js`

Owns:

- Create, update, delete events
- Assign facilitators
- Create, update, delete schedules
- Get events and schedules

Event shape:

```js
{
  eventName,
  description,
  venue,
  startDate,
  endDate,
  facilitatorIds,
  status,
  createdAt,
  updatedAt
}
```

Schedule shape:

```js
{
  eventId,
  sportId,
  matchTitle,
  venue,
  date,
  facilitatorId,
  status,
  createdAt,
  updatedAt
}
```

### `useRegistrationManagement.js`

Owns:

- Coach event registrations
- Register teams for events
- Get registrations by coach, event, or team
- Registration approval workflow
- Temporary compatibility methods for player join requests

Registration shape:

```js
{
  eventId,
  teamId,
  coachId,
  status,
  createdAt,
  updatedAt
}
```

## Firestore Collections

```txt
users
sports
teams
events
eventSchedules
registrations
notifications
```

Temporary compatibility collections still used by current screens:

```txt
teamMembers
playerApplications
payments
```

These should be migrated into `teams.members`, `registrations`, and `notifications` in a later pass.

## Security Rules Summary

- Organizer: full access to core operational data.
- Coach: manage own teams and registrations.
- Facilitator: manage assigned events and schedules.
- Player: read-only access to sports, events, and schedules.
- Users: update only their own profile fields.
- Approval/rejection: organizer only.

## Firestore Indexes

Configured in `firestore.indexes.json`:

- `users(role, status)`
- `sports(status, createdAt)`
- `events(status, createdAt)`
- `events(facilitatorIds, status)`
- `eventSchedules(eventId, facilitatorId)`
- `teams(coachId, sportId)`
- `registrations(eventId, coachId)`
- `registrations(eventId, status)`

## Files Deleted Or Merged

Merged into `useSportManagement.js`:

- `src/hooks/useAvailableSports.js`
- `src/hooks/useSportsSystem.jsx`
- `src/constants/teamStructure.js`

Replaced by canonical hooks:

- `src/hooks/useAuth.jsx` -> `src/hooks/useAuth.js`
- `src/hooks/useTeams.js` -> `src/hooks/useTeamManagement.js`
- `src/hooks/useEvents.js` -> `src/hooks/useEventManagement.js`
- `src/hooks/useRegistration.js` -> `src/hooks/useRegistrationManagement.js`

## Additional Improvements

- Centralize collection names in `src/constants/collections.js`.
- Keep Firestore writes in hooks, not components.
- Normalize old uppercase role/status values at the context boundary.
- Prefer one document shape per concept.
- Move payment and player application compatibility logic into `registrations` in the next cleanup pass.
- Add code splitting for large route groups if the production bundle warning becomes a problem.

## What Still Needs A Future Migration

```txt
payments            -> registrations.payment*
playerApplications  -> registrations or team join request sub-workflow
teamMembers         -> teams.members
legacy uppercase statuses -> lowercase statuses
```

The app currently builds with the new hook architecture, but these data migrations should be planned before removing the compatibility rules.
