import type { User } from '@/interfaces/User.ts'

export interface Manager{
  id: number;
  name : string;
  phone : string;
  position : string;
  user : User;
}