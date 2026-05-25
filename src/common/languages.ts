export const Languages = {
  fr: 'French',
  en: 'English',
  es: 'Spanish',
  it: 'Italian',
  pt: 'Portuguese',
  de: 'German',
  ru: 'Russian',
  zh: 'Chinese',
  ja: 'Japanese',
  ko: 'Korean',
  ar: 'Arabic',
  hi: 'Hindi',
} as const;

export type Language = keyof typeof Languages;
