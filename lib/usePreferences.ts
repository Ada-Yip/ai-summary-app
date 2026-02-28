import { useEffect, useState } from 'react';

export interface Preferences {
  language: string;
  summaryRequirement: string;
}

const PREFERENCES_KEY = 'ai-summary-app-preferences';

const DEFAULT_PREFERENCES: Preferences = {
  language: 'en',
  summaryRequirement: '',
};

export function usePreferences() {
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(PREFERENCES_KEY);
      if (stored) {
        try {
          setPreferences(JSON.parse(stored));
        } catch (e) {
          console.error('Failed to parse stored preferences:', e);
          setPreferences(DEFAULT_PREFERENCES);
        }
      }
      setIsLoaded(true);
    }
  }, []);

  // Save preferences to localStorage whenever they change
  const updatePreferences = (newPrefs: Partial<Preferences>) => {
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
    }
  };

  const updateLanguage = (language: string) => {
    updatePreferences({ language });
  };

  const updateSummaryRequirement = (summaryRequirement: string) => {
    updatePreferences({ summaryRequirement });
  };

  return {
    preferences,
    isLoaded,
    updatePreferences,
    updateLanguage,
    updateSummaryRequirement,
  };
}
