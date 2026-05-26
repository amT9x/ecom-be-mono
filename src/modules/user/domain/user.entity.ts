export type UserRole = 'ADMIN' | 'USER';

export type User = {
  id: string;
  email: string;
  full_name: string;
  password_hash: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}
