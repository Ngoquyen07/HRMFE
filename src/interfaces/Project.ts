import type { Task } from '@/interfaces/Task.ts'

export interface Project {
  id: number
  name: string
  description: string
  status: string
  progress: number
  start_date: string
  end_date: string
  manager: { name: string }
  tasks: Task[]
  created_at: string
}