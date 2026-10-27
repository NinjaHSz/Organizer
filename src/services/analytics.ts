/**
 * Analytics consent management.
 *
 * Privacy first: tracks user consent status only.
 * No external SDKs are loaded until the user explicitly grants consent.
 */

const CONSENT_STORAGE_KEY = 'analytics-consent';

export type AnalyticsConsent = 'granted' | 'denied' | 'unset';

let isInitialized = false;

export const getAnalyticsConsent = (): AnalyticsConsent => {
  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    return stored === 'granted' || stored === 'denied' ? stored : 'unset';
  } catch {
    return 'unset';
  }
};

export const isAnalyticsEnabled = (): boolean =>
  isInitialized && getAnalyticsConsent() === 'granted';

/**
 * Persists the user's choice and starts or stops capture accordingly.
 * Used by the privacy toggle in Settings.
 * When consent is granted, a minimal analytics object is created.
 */
export const setAnalyticsConsent = (granted: boolean): boolean => {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, granted ? 'granted' : 'denied');
  } catch (err) {
    console.warn('[Analytics] Could not persist consent:', err);
  }

  if (granted) {
    isInitialized = true;
    return true;
  }

  isInitialized = false;
  return false;
};

/** Session storage helper for consent state. */
export const clearAnalytics = (): void => {
  try {
    localStorage.removeItem(CONSENT_STORAGE_KEY);
    isInitialized = false;
  } catch (err) {
    console.warn('[Analytics] Could not clear consent:', err);
  }
};
