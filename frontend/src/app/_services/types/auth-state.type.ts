import {UserData} from '../types/user-data.type'

export interface AuthState {
  user: UserData | null,
  token: string | null,
  isAuthenticated: boolean
}
