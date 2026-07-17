export interface Application {
  id: number;
  company_name: string;
  role: string;
  application_status: string;
  portal: string;
  date_applied: string;
  date_of_interview: string | null;
  user_id: number;
}

export interface Contact {
  id: number;
  name: string;
  email?: string;
  phone: string;
  social_url?: string;
  application_id?: number;
}

export interface Note {
  id: number;
  round: string;
  interview_date: string;
  notes: string;
  application_id?: number;
}
