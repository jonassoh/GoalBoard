import type { GoalData } from './types'

const storageKey = (accountId: string) => `goalboard:data:v2:${accountId}`

export async function loadData(accountId: string): Promise<GoalData | null> {
  if (window.goalboard) return (await window.goalboard.load(accountId)) as GoalData | null
  const value = localStorage.getItem(storageKey(accountId))
  if (!value) {
    const legacy = localStorage.getItem('goalboard:data:v1')
    if (legacy) {
      localStorage.setItem(storageKey(accountId), legacy)
      localStorage.removeItem('goalboard:data:v1')
      return JSON.parse(legacy) as GoalData
    }
  }
  return value ? (JSON.parse(value) as GoalData) : null
}

export async function saveData(accountId: string, data: GoalData): Promise<void> {
  if (window.goalboard) {
    await window.goalboard.save(accountId, data)
  } else {
    localStorage.setItem(storageKey(accountId), JSON.stringify(data))
  }
}
