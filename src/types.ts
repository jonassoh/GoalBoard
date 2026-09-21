export type Metric = {
  id: string
  label: string
  target: number
  completed: number
}

export type Goal = {
  id: string
  title: string
  note: string
  monthKey: string
  dueDate: string
  metrics: Metric[]
  createdAt: string
}

export type GoalData = {
  version: 1
  goals: Goal[]
}
