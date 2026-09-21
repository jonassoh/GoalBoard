import { FormEvent, useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  CloudOff,
  Flame,
  Home,
  Minus,
  MoreHorizontal,
  Plus,
  Target,
  Trash2,
  X,
} from 'lucide-react'
import { loadData, saveData } from './storage'
import type { Goal, GoalData, Metric } from './types'

const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`

const monthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

const dateFromMonthKey = (key: string) => {
  const [year, month] = key.split('-').map(Number)
  return new Date(year, month - 1, 1)
}

const addMonths = (date: Date, count: number) =>
  new Date(date.getFullYear(), date.getMonth() + count, 1)

const monthEnd = (key: string) => {
  const date = dateFromMonthKey(key)
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  return `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`
}

const displayMonth = (key: string, format: 'long' | 'short' = 'long') =>
  dateFromMonthKey(key).toLocaleDateString('en-US', { month: format, year: format === 'long' ? 'numeric' : undefined })

const goalProgress = (goal: Goal) => {
  const total = goal.metrics.reduce((sum, metric) => sum + metric.target, 0)
  const completed = goal.metrics.reduce((sum, metric) => sum + Math.min(metric.completed, metric.target), 0)
  return total ? Math.round((completed / total) * 100) : 0
}

const daysUntil = (dateString: string) => {
  const due = new Date(`${dateString}T23:59:59`)
  return Math.max(0, Math.ceil((due.getTime() - Date.now()) / 86_400_000))
}

function starterData(): GoalData {
  const current = monthKey(new Date())
  const next = monthKey(addMonths(new Date(), 1))
  const create = (title: string, note: string, key: string, metrics: Array<[string, number, number]>): Goal => ({
    id: uid(),
    title,
    note,
    monthKey: key,
    dueDate: monthEnd(key),
    createdAt: new Date().toISOString(),
    metrics: metrics.map(([label, target, completed]) => ({ id: uid(), label, target, completed })),
  })

  return {
    version: 1,
    goals: [
      create('LeetCode sprint', 'Build consistency across every difficulty.', current, [
        ['Hard', 5, 2],
        ['Medium', 10, 7],
        ['Easy', 20, 14],
      ]),
      create('Run 50 kilometers', 'Three steady runs each week.', current, [['Kilometers', 50, 31]]),
      create('Finish my reading list', 'A chapter before bed, phone away.', current, [['Books', 3, 1]]),
      create('Ship the side project', 'One small, useful release.', next, [['Milestones', 8, 0]]),
    ],
  }
}

function ProgressRing({ value, size = 70, stroke = 7 }: { value: number; size?: number; stroke?: number }) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  return (
    <div className="progress-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle className="ring-track" cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} />
        <circle
          className="ring-value"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - value / 100)}
        />
      </svg>
      <strong>{value}%</strong>
    </div>
  )
}

function MiniCalendar({ selectedKey, dueDays }: { selectedKey: string; dueDays: number[] }) {
  const date = dateFromMonthKey(selectedKey)
  const totalDays = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const firstDay = date.getDay()
  const today = new Date()
  const isCurrentMonth = monthKey(today) === selectedKey
  const cells: Array<number | null> = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: totalDays }, (_, index) => index + 1),
  ]

  return (
    <section className="panel calendar-panel">
      <div className="panel-title-row">
        <div>
          <p className="eyebrow">Calendar</p>
          <h3>{displayMonth(selectedKey)}</h3>
        </div>
        <CalendarDays size={19} />
      </div>
      <div className="calendar-grid weekdays">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}
      </div>
      <div className="calendar-grid dates">
        {cells.map((day, index) => (
          <div
            className={`${day && isCurrentMonth && day === today.getDate() ? 'today' : ''} ${day && dueDays.includes(day) ? 'due' : ''}`}
            key={index}
          >
            {day}
          </div>
        ))}
      </div>
      <div className="calendar-legend"><i /> Goal due date</div>
    </section>
  )
}

function GoalCard({ goal, onStep, onDelete }: {
  goal: Goal
  onStep: (goalId: string, metricId: string, delta: number) => void
  onDelete: (goalId: string) => void
}) {
  const progress = goalProgress(goal)
  return (
    <article className={`goal-card ${progress === 100 ? 'complete' : ''}`}>
      <div className="goal-card-top">
        <ProgressRing value={progress} />
        <div className="goal-heading">
          <div className="goal-title-row">
            <h3>{goal.title}</h3>
            {progress === 100 && <span className="complete-label"><Check size={13} /> Complete</span>}
          </div>
          <p>{goal.note || 'A little progress still counts.'}</p>
        </div>
        <button className="icon-button menu-button" aria-label={`Delete ${goal.title}`} onClick={() => onDelete(goal.id)}>
          <Trash2 size={17} />
        </button>
      </div>
      <div className="metric-list">
        {goal.metrics.map((metric) => {
          const percent = Math.min(100, Math.round((metric.completed / metric.target) * 100))
          return (
            <div className="metric" key={metric.id}>
              <div className="metric-copy">
                <span>{metric.label}</span>
                <strong>{metric.completed}<em>/ {metric.target}</em></strong>
              </div>
              <div className="bar"><span style={{ width: `${percent}%` }} /></div>
              <div className="stepper">
                <button aria-label={`Decrease ${metric.label}`} onClick={() => onStep(goal.id, metric.id, -1)} disabled={metric.completed === 0}><Minus size={14} /></button>
                <button aria-label={`Increase ${metric.label}`} onClick={() => onStep(goal.id, metric.id, 1)} disabled={metric.completed >= metric.target}><Plus size={14} /></button>
              </div>
            </div>
          )
        })}
      </div>
      <div className="goal-footer">
        <span><CalendarDays size={14} /> Due {new Date(`${goal.dueDate}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        <span>{progress === 100 ? 'Finished' : `${daysUntil(goal.dueDate)} days remaining`}</span>
      </div>
    </article>
  )
}

type DraftMetric = { id: string; label: string; target: number }

function GoalModal({ month, onClose, onCreate }: { month: string; onClose: () => void; onCreate: (goal: Goal) => void }) {
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [dueDate, setDueDate] = useState(monthEnd(month))
  const [metrics, setMetrics] = useState<DraftMetric[]>([{ id: uid(), label: '', target: 1 }])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const validMetrics = metrics.filter((metric) => metric.label.trim() && metric.target > 0)
    if (!title.trim() || !validMetrics.length) return
    onCreate({
      id: uid(), title: title.trim(), note: note.trim(), monthKey: month, dueDate,
      createdAt: new Date().toISOString(),
      metrics: validMetrics.map((metric) => ({ ...metric, label: metric.label.trim(), completed: 0 })),
    })
  }

  const updateMetric = (id: string, update: Partial<DraftMetric>) =>
    setMetrics((items) => items.map((item) => item.id === id ? { ...item, ...update } : item))

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form className="modal" onSubmit={submit}>
        <div className="modal-header">
          <div><p className="eyebrow">{displayMonth(month)}</p><h2>Add a new goal</h2></div>
          <button type="button" className="icon-button" onClick={onClose}><X size={20} /></button>
        </div>
        <label>Goal name<input autoFocus required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. LeetCode sprint" /></label>
        <label>Why this matters <span>optional</span><textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="A short note to future you" /></label>
        <label>Due date<input type="date" required value={dueDate} min={`${month}-01`} max={monthEnd(month)} onChange={(event) => setDueDate(event.target.value)} /></label>
        <div className="milestone-header">
          <div><strong>Milestones</strong><span>Break the goal into measurable parts.</span></div>
          <button type="button" className="text-button" onClick={() => setMetrics((items) => [...items, { id: uid(), label: '', target: 1 }])}><Plus size={15} /> Add</button>
        </div>
        <div className="draft-metrics">
          {metrics.map((metric, index) => (
            <div className="draft-metric" key={metric.id}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <input aria-label="Milestone name" required value={metric.label} onChange={(event) => updateMetric(metric.id, { label: event.target.value })} placeholder="Milestone name" />
              <input aria-label="Target" required type="number" min="1" value={metric.target} onChange={(event) => updateMetric(metric.id, { target: Number(event.target.value) })} />
              <button type="button" className="icon-button" disabled={metrics.length === 1} onClick={() => setMetrics((items) => items.filter((item) => item.id !== metric.id))}><X size={16} /></button>
            </div>
          ))}
        </div>
        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
          <button className="primary-button" type="submit"><Plus size={17} /> Create goal</button>
        </div>
      </form>
    </div>
  )
}

export default function App() {
  const today = useMemo(() => new Date(), [])
  const availableMonths = useMemo(() => Array.from({ length: 12 }, (_, index) => monthKey(addMonths(today, index))), [today])
  const [selectedMonth, setSelectedMonth] = useState(availableMonths[0])
  const [data, setData] = useState<GoalData | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [saved, setSaved] = useState(true)

  useEffect(() => {
    loadData().then((stored) => setData(stored?.version === 1 ? stored : starterData()))
  }, [])

  useEffect(() => {
    if (!data) return
    setSaved(false)
    const timer = window.setTimeout(() => saveData(data).then(() => setSaved(true)), 180)
    return () => window.clearTimeout(timer)
  }, [data])

  if (!data) return <div className="loading"><Target size={30} /> Opening your board…</div>

  const goals = data.goals.filter((goal) => goal.monthKey === selectedMonth)
  const selectedIndex = availableMonths.indexOf(selectedMonth)
  const nextMonth = availableMonths[selectedIndex + 1]
  const nextGoals = nextMonth ? data.goals.filter((goal) => goal.monthKey === nextMonth) : []
  const totalTarget = goals.flatMap((goal) => goal.metrics).reduce((sum, metric) => sum + metric.target, 0)
  const totalDone = goals.flatMap((goal) => goal.metrics).reduce((sum, metric) => sum + Math.min(metric.completed, metric.target), 0)
  const overall = totalTarget ? Math.round(totalDone / totalTarget * 100) : 0
  const dueDays = goals.map((goal) => Number(goal.dueDate.split('-')[2]))

  const stepMetric = (goalId: string, metricId: string, delta: number) => setData((current) => current && ({
    ...current,
    goals: current.goals.map((goal) => goal.id !== goalId ? goal : {
      ...goal,
      metrics: goal.metrics.map((metric) => metric.id !== metricId ? metric : {
        ...metric, completed: Math.max(0, Math.min(metric.target, metric.completed + delta)),
      }),
    }),
  }))

  const createGoal = (goal: Goal) => {
    setData((current) => current && ({ ...current, goals: [...current.goals, goal] }))
    setShowModal(false)
  }

  const deleteGoal = (goalId: string) => {
    if (window.confirm('Remove this goal from your board?')) {
      setData((current) => current && ({ ...current, goals: current.goals.filter((goal) => goal.id !== goalId) }))
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span><Target size={21} /></span><strong>GoalBoard</strong></div>
        <nav className="main-nav">
          <button className="active"><Home size={18} /> Home</button>
        </nav>
        <div className="months-heading"><span>Plan ahead</span><span>12 mo.</span></div>
        <nav className="month-nav">
          {availableMonths.map((key, index) => {
            const count = data.goals.filter((goal) => goal.monthKey === key).length
            return (
              <button className={selectedMonth === key ? 'active' : ''} onClick={() => setSelectedMonth(key)} key={key}>
                <span>{displayMonth(key, 'short')}</span>
                <strong>{index === 0 ? 'Now' : String(index + 1).padStart(2, '0')}</strong>
                {count > 0 && <i>{count}</i>}
              </button>
            )
          })}
        </nav>
        <div className="offline-note"><CloudOff size={16} /><div><strong>Offline ready</strong><span>{saved ? 'All changes saved' : 'Saving changes…'}</span></div></div>
      </aside>

      <main>
        <header className="topbar">
          <div className="breadcrumb"><span>Home</span><ChevronRight size={14} /><strong>{displayMonth(selectedMonth)}</strong></div>
          <div className="top-actions">
            <button className="icon-button" aria-label="Help"><CircleHelp size={18} /></button>
            <div className="avatar">JS</div>
          </div>
        </header>

        <div className="content">
          <section className="page-heading">
            <div>
              <p className="eyebrow">Monthly focus</p>
              <h1>{selectedMonth === availableMonths[0] ? 'Make this month count.' : `Plan for ${displayMonth(selectedMonth, 'short')}.`}</h1>
              <p>{goals.length ? `${goals.length} active goal${goals.length === 1 ? '' : 's'} · ${totalDone} of ${totalTarget} milestones complete` : 'A fresh month, ready for a clear direction.'}</p>
            </div>
            <div className="heading-actions">
              <button className="month-arrow" disabled={selectedIndex === 0} onClick={() => setSelectedMonth(availableMonths[selectedIndex - 1])}><ChevronLeft size={18} /></button>
              <button className="month-arrow" disabled={selectedIndex === availableMonths.length - 1} onClick={() => setSelectedMonth(availableMonths[selectedIndex + 1])}><ChevronRight size={18} /></button>
              <button className="primary-button" onClick={() => setShowModal(true)}><Plus size={18} /> Add goal</button>
            </div>
          </section>

          <section className="summary-strip">
            <div className="summary-progress"><ProgressRing value={overall} size={86} stroke={8} /></div>
            <div className="summary-copy"><p className="eyebrow">Overall progress</p><h2>{overall === 100 ? 'Month complete — nicely done.' : overall > 50 ? 'You’re over halfway there.' : 'Every small step adds up.'}</h2><p>Progress is weighted across all of this month’s milestones.</p></div>
            <div className="summary-stat"><span>Completed</span><strong>{totalDone}<em> / {totalTarget || 0}</em></strong></div>
            <div className="summary-stat"><span>Time left</span><strong>{selectedMonth === availableMonths[0] ? daysUntil(monthEnd(selectedMonth)) : new Date(dateFromMonthKey(selectedMonth).getFullYear(), dateFromMonthKey(selectedMonth).getMonth() + 1, 0).getDate()}<em> days</em></strong></div>
            <Flame className="summary-mark" size={110} strokeWidth={1.2} />
          </section>

          <div className="dashboard-grid">
            <section className="goals-column">
              <div className="section-heading"><div><p className="eyebrow">Your goals</p><h2>In progress</h2></div><span>{goals.length} total</span></div>
              {goals.length ? goals.map((goal) => <GoalCard key={goal.id} goal={goal} onStep={stepMetric} onDelete={deleteGoal} />) : (
                <div className="empty-state">
                  <div><Target size={25} /></div><h3>No goals here yet</h3><p>Choose one meaningful outcome and give it a measurable finish line.</p>
                  <button className="primary-button" onClick={() => setShowModal(true)}><Plus size={17} /> Add your first goal</button>
                </div>
              )}
            </section>
            <aside className="right-column">
              <MiniCalendar selectedKey={selectedMonth} dueDays={dueDays} />
              <section className="panel next-panel">
                <div className="panel-title-row"><div><p className="eyebrow">Up next</p><h3>{nextMonth ? displayMonth(nextMonth) : 'Looking ahead'}</h3></div><ArrowRight size={19} /></div>
                {nextGoals.length ? (
                  <div className="next-list">{nextGoals.slice(0, 3).map((goal) => (
                    <button key={goal.id} onClick={() => setSelectedMonth(goal.monthKey)}><span>{goal.title}</span><strong>{goal.metrics.reduce((sum, metric) => sum + metric.target, 0)} milestones</strong></button>
                  ))}</div>
                ) : <div className="next-empty"><p>Nothing planned yet. Give next month a head start.</p><button onClick={() => nextMonth && setSelectedMonth(nextMonth)}>Plan ahead <ArrowRight size={14} /></button></div>}
              </section>
              <blockquote><span>“</span>We are what we repeatedly do.<cite>— Will Durant</cite></blockquote>
            </aside>
          </div>
        </div>
      </main>
      {showModal && <GoalModal month={selectedMonth} onClose={() => setShowModal(false)} onCreate={createGoal} />}
    </div>
  )
}
