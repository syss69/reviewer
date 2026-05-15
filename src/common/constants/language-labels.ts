import { Languages } from '../enums/languages.enum';

/** Human-readable names for prompts (AI responds more reliably than with ISO codes alone). */
export const LANGUAGE_LABELS: Record<Languages, string> = {
  [Languages.FRENCH]: 'French',
  [Languages.ENGLISH]: 'English',
  [Languages.SPANISH]: 'Spanish',
  [Languages.ITALIAN]: 'Italian',
  [Languages.PORTUGUESE]: 'Portuguese',
  [Languages.GERMAN]: 'German',
  [Languages.RUSSIAN]: 'Russian',
  [Languages.CHINESE]: 'Chinese',
  [Languages.JAPANESE]: 'Japanese',
  [Languages.KOREAN]: 'Korean',
  [Languages.ARABIC]: 'Arabic',
  [Languages.HINDI]: 'Hindi',
};

export function getLanguageLabel(language: Languages): string {
  return LANGUAGE_LABELS[language];
}
