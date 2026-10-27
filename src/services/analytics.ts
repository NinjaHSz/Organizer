import posthog from 'posthog-js';

/**
 * PostHog analytics + Session Replay.
 *
 * Privacy first: nothing is initialized or sent until the user grants consent
 * in Settings > Privacidade & Diagnóstico. Until then the SDK is never loaded
 * and session recording stays off.
 */

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || '';
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';

// Same naming convention as the other flags kept in localStorage
// ('daily-reminders-enabled', 'notif-time', 'accent-color', ...).
const CONSENT_STORAGE_KEY = 'analytics-consent';

export type AnalyticsConsent = 'granted' | 'denied' | 'unset';

let isInitialized = false;

const hasProjectKey = Boolean(POSTHOG_KEY && POSTHOG_KEY !== 'YOUR_POSTHOG_PROJECT_KEY');

export const getAnalyticsConsent = (): AnalyticsConsent => {
  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    return stored === 'granted' || stored === 'denied' ? stored : 'unset';
  } catch {
    return 'unset';
  }
};

export const isAnalyticsEnabled = (): boolean =>
  isInitialized && hasProjectKey && getAnalyticsConsent() === 'granted';

/**
 * Boots the PostHog client. Safe to call on every app start: it only does
 * something when a project key exists and the user has already consented.
 */
export const initAnalytics = (): void => {
  if (isInitialized || !hasProjectKey || getAnalyticsConsent() !== 'granted') return;

  try {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      // Only create person profiles for users we explicitly identify.
      person_profiles: 'identified_only',
      // Honour the browser's Do Not Track signal.
      respect_dnt: true,
      capture_pageview: true,
      capture_pageleave: true,
      disable_session_recording: false,
      session_recording: {
        // Every input (task title, notes, search, settings fields...) is masked
        // before it ever leaves the device. Inputs are masked by default, this
        // makes it explicit so it can't be turned off by accident.
        maskAllInputs: true,
        // Elements opt into text masking with [data-ph-mask] or the
        // ph-no-capture class supported by PostHog out of the box.
        maskTextSelector: '[data-ph-mask], .ph-no-capture',
      },
    });
    isInitialized = true;
  } catch (err) {
    console.warn('[Analytics] PostHog init error:', err);
  }
};

/**
 * Persists the user's choice and starts or stops capture accordingly.
 * Used by the privacy toggle in Settings. Returns true when capture is
 * actually running afterwards (i.e. a PostHog project key is configured).
 */
export const setAnalyticsConsent = (granted: boolean): boolean => {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, granted ? 'granted' : 'denied');
  } catch (err) {
    console.warn('[Analytics] Could not persist consent:', err);
  }

  if (granted) {
    initAnalytics();
    if (!isInitialized) return false;
    posthog.opt_in_capturing();
    posthog.startSessionRecording();
    posthog.capture('analytics_consent_granted');
    return true;
  }

  if (isInitialized) {
    posthog.stopSessionRecording();
    posthog.opt_out_capturing();
  }
  return false;
};

/** Links a session replay to a key user journey step. */
export const trackEvent = (
  event: string,
  properties?: Record<string, string | number | boolean | null | undefined>
): void => {
  if (!isAnalyticsEnabled()) return;

  try {
    posthog.capture(event, properties);
  } catch (err) {
    console.warn('[Analytics] capture error:', err);
  }
};
