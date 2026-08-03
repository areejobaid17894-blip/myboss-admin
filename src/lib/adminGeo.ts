export const GOVERNORATES = [
  'Amman',
  'Irbid',
  'Zarqa',
  'Balqa',
  'Madaba',
  'Aqaba',
  'Karak',
  "Ma'an",
  'Jerash',
  'Ajloun',
  'Mafraq',
  'Tafilah',
] as const;

export type Governorate = (typeof GOVERNORATES)[number];

export const AREAS_BY_GOV: Record<string, string[]> = {
  Amman: ['Shmeisani', 'Abdali', 'Sweifieh', 'Jabal Amman', 'Abdoun', "Tla' Al-Ali", 'Marka', 'Sahab', 'Wehdat'],
  Irbid: ['Huson', 'University District', 'Aydoun', 'Bushra', 'Ramtha', 'Irbid Downtown'],
  Zarqa: ['New Zarqa', 'Russeifa', 'Awajan', 'Zarqa Downtown'],
  Balqa: ['Salt Downtown', 'Fuheis', 'Mahis', 'Ain Al-Basha'],
  Madaba: ['Madaba Center', 'Faisaliyeh', 'Dhiban'],
  Aqaba: ['Aqaba City Center', 'Al-Shalalah', 'Airport Road'],
  Karak: ['Karak Downtown', 'Al-Marj', 'Mutah'],
  "Ma'an": ["Ma'an Downtown", 'Wadi Musa', 'Shobak'],
  Jerash: ['Jerash Downtown', 'Souf', 'Sakib'],
  Ajloun: ['Ajloun Downtown', 'Anjara', 'Kufranjah'],
  Mafraq: ['Mafraq City', 'Balama', 'Khalidiya'],
  Tafilah: ['Tafilah Center', 'Busaira', 'Hasa'],
};

export const VEST_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;

export function pickAiDestination(baseGov: string, travelEligible: boolean, seed: number) {
  const areas = AREAS_BY_GOV[baseGov] ?? AREAS_BY_GOV.Amman;
  let destGov = baseGov;
  if (travelEligible && seed % 2 === 0) {
    const others = GOVERNORATES.filter((g) => g !== baseGov);
    destGov = others[seed % others.length];
  }
  const destAreas = AREAS_BY_GOV[destGov] ?? areas;
  const dest = destAreas[seed % destAreas.length];
  return { destGov, dest };
}
