import type { GoalData } from './types'

const STORAGE_KEY = 'goalboard:data:v1'

export async function loadData(): Promise<GoalData | null> {
  if (window.goalboard) return (await window.goalboard.load()) as GoalData | null
  const value = localStorage.getItem(STORAGE_KEY)
  return value ? (JSON.parse(value) as GoalData) : null
}

export async function saveData(data: GoalData): Promise<void> {
  if (window.goalboard) {
    await window.goalboard.save(data)
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }
}
