export interface Student {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  enrollment_date: string;
}

export interface StudentCreate {
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  email: string;
  phone?: string;
  address?: string;
  enrollment_date: string;
}