import type { Employee } from '@/interfaces/Employee.ts'

export interface Task {
  id?: number
  name: string
  description: string
  status: string
  start_date: string | null
  end_date: string | null
  progress: number
  employee_id: number | null
  employee?: Employee
}