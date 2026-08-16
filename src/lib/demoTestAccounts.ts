import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD, DEMO_EMPLOYEE_EMAIL } from '@/config/demo';

/** Seed + demo employee accounts for QA (mobile OTP sign-in). */
export interface DemoTestAccount {
  email: string;
  label: string;
  scenario: string;
  role: 'employee' | 'admin';
}

export const DEMO_ADMIN_ACCOUNTS: DemoTestAccount[] = [
  {
    email: DEMO_ADMIN_EMAIL,
    label: 'Admin',
    scenario: `Admin console — password ${DEMO_ADMIN_PASSWORD} + OTP`,
    role: 'admin',
  },
  {
    email: 'zaid.obeidat@orange.com',
    label: 'Zaid Obeidat',
    scenario: `Admin console — password ${DEMO_ADMIN_PASSWORD} + OTP`,
    role: 'admin',
  },
];

export const DEMO_ADMIN_ACCOUNT = DEMO_ADMIN_ACCOUNTS[0];

export const DEMO_EMPLOYEE_ACCOUNTS: DemoTestAccount[] = [
  {
    email: 'areej.obaid@orange.com',
    label: 'Areej O.',
    scenario: 'Employee happy path — in Amman squad (surveys, chat, gallery)',
    role: 'employee',
  },
  {
    email: DEMO_EMPLOYEE_EMAIL,
    label: 'Demo User',
    scenario: 'In squad — full happy path (surveys, chat, gallery)',
    role: 'employee',
  },
  {
    email: 'nisreen.a@orange.com',
    label: 'Nisreen A.',
    scenario: 'Squad leader — Orange Amman Squad (join requests)',
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
    scenario: 'Needs onboarding — profile + destinations flow',
    role: 'employee',
  },
  {
    email: 'demo.terms@orange.com',
    label: 'Rana K.',
    scenario: 'Onboarded, terms not accepted — terms popup first',
    role: 'employee',
  },
  {
    email: 'demo.join@orange.com',
    label: 'Huda S.',
    scenario: 'Pending join request — waiting on Amman squad leader',
    role: 'employee',
  },
  {
    email: 'demo.travel@orange.com',
    label: 'Sami A.',
    scenario: 'No squad, open to travel — allocation candidate (Irbid/Zarqa)',
    role: 'employee',
  },
  {
    email: 'sara.h@orange.com',
    label: 'Sara H.',
    scenario: 'Squad leader — Orange Irbid Squad',
    role: 'employee',
  },
  {
    email: 'khaled.r@orange.com',
    label: 'Khaled R.',
    scenario: 'Squad leader — Orange Zarqa Squad',
    role: 'employee',
  },
  {
    email: 'demo.unknown@orange.com',
    label: 'Not eligible',
    scenario: 'Not in participant list — sign-in returns 403',
    role: 'employee',
  },
];
