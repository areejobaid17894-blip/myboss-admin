/** Seed + demo employee accounts for QA (mobile OTP sign-in). */
export interface DemoTestAccount {
  email: string;
  label: string;
  scenario: string;
  role: 'employee' | 'admin';
}

export const DEMO_ADMIN_ACCOUNT: DemoTestAccount = {
  email: 'admin@orange.com',
  label: 'Admin',
  scenario: 'Admin console — password admin123 + OTP',
  role: 'admin',
};

export const DEMO_EMPLOYEE_ACCOUNTS: DemoTestAccount[] = [
  {
    email: 'demo@orange.com',
    label: 'Demo User',
    scenario: 'In squad — full happy path (surveys, chat, gallery)',
    role: 'employee',
  },
  {
    email: 'nisreen.a@orange.com',
    label: 'Nisreen A.',
    scenario: 'Squad leader — Orange Amman Squad',
    role: 'employee',
  },
  {
    email: 'omar.t@orange.com',
    label: 'Omar T.',
    scenario: 'Onboarded, no squad — chat/gallery upload locked',
    role: 'employee',
  },
  {
    email: 'laila.m@orange.com',
    label: 'Laila M.',
    scenario: 'Unregistered — onboarding flow only',
    role: 'employee',
  },
];
