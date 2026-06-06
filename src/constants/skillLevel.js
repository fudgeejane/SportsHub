export const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Competitive']

export const SKILL_WEIGHTS = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
  Competitive: 4,
}

export function skillWeight(level) {
  return SKILL_WEIGHTS[level] ?? 1
}

export function averageSkill(members) {
  if (!members.length) return 0
  const total = members.reduce((sum, m) => sum + skillWeight(m.skillLevel), 0)
  return total / members.length
}
