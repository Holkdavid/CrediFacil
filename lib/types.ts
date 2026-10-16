export type Profile = {
  id: string;
  full_name: string;
  document: string | null;
  phone: string | null;
  birth_date: string | null;
  gender: string | null;
  address: string | null;
  occupation: string | null;
  company: string | null;
  contract_type: string | null;
  monthly_income: number | null;
  monthly_expenses: number | null;
  credit_limit: number;
  notify_quota: boolean;
  notify_payment: boolean;
  notify_offers: boolean;
  client_code: string | null;
  created_at: string;
};

export type LoanStatus = 'review' | 'active' | 'paid' | 'rejected';

export type Loan = {
  id: string;
  code: string;
  loan_type: string;
  purpose: string | null;
  amount: number;
  months: number;
  monthly_rate: number;
  quota_amount: number;
  total_amount: number;
  interest_total: number;
  paid_quotas: number;
  status: LoanStatus;
  next_payment: string | null;
  created_at: string;
};

export type Payment = {
  id: string;
  code: string;
  loan_id: string;
  amount: number;
  method: string;
  status: string;
  quota_number: number;
  created_at: string;
};
