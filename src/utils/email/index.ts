import type { Email } from '../../types';

export function getEmailPriority(email: Email): 'low' | 'moderate' | 'high' {
  if (email.importance >= 0 && email.importance <= 3) {
    return 'low';
  } else if (email.importance >= 4 && email.importance <= 7) {
    return 'moderate';
  } else {
    return 'high';
  }
}
