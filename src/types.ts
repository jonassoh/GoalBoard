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
  categoryId?: string
}

export type Category = {
  id: string
  name: string
  color: string
}

export type GoalData = {
  version: 2
  goals: Goal[]
  categories: Category[]
}
