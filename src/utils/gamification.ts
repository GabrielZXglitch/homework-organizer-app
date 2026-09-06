interface GamificationInput {
  xpTotal: number
  streakDias: number
  ultimoConcluido: { toDate: () => Date } | null
}

interface GamificationResult {
  xpGained: number
  newXp: number
  newStreak: number
}

export function calculateGamification(
  user: GamificationInput,
  exigeFoto: boolean,
  now: Date = new Date()
): GamificationResult {
  const xpGained = exigeFoto ? 20 : 10
  const newXp = user.xpTotal + xpGained

  let newStreak: number

  if (!user.ultimoConcluido) {
    // First ever completion
    newStreak = 1
  } else {
    const lastDate = user.ultimoConcluido.toDate()
    const lastDay = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate())
    const todayDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const diffMs = todayDay.getTime() - lastDay.getTime()
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      // Same day — keep streak
      newStreak = user.streakDias
    } else if (diffDays === 1) {
      // Consecutive day — increment
      newStreak = user.streakDias + 1
    } else {
      // Gap — reset
      newStreak = 1
    }
  }

  return { xpGained, newXp, newStreak }
}
