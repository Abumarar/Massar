export const JORDAN_GOVERNORATES = [
  'Amman',
  'Zarqa',
  'Irbid',
  'Aqaba',
  'Mafraq',
  'Jerash',
  'Madaba',
  'Balqa',
  'Karak',
  'Tafilah',
  'Ma\'an',
  'Ajloun'
] as const;

export type Governorate = typeof JORDAN_GOVERNORATES[number];
