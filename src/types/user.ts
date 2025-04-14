export type UserRole = 'SUPER_ADMIN';

export interface User {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  role: UserRole;
  dob: string;
  last_login_at: string;
}
