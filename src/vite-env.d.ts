/// <reference types="vite/client" />

// Web Speech API types for microphone recognition
declare global {
  interface Window {
    webkitSpeechRecognition?: new () => SpeechRecognition;
    SpeechRecognition?: new () => SpeechRecognition;
  }
  interface SpeechRecognition extends EventTarget {
    grammars: any;
    lang: string;
    interimResults: boolean;
    continuous: boolean;
    soundlevel: number;
    start(): void;
    stop(): void;
    onresult: ((this: SpeechRecognition, e: SpeechRecognitionEvent) => any) | null;
    onerror: ((this: SpeechRecognition, e: SpeechRecognitionErrorEvent) => any) | null;
    abort(): void;
  }
  interface SpeechRecognitionEvent extends Event {
    readonly readonlyResult: boolean;
    results: SpeechRecognitionResultList;
    readonly resultIndex: number;
    readonly transcript: string;
  }
  interface SpeechRecognitionResult {
    readonly index: number;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    readonly[number]: SpeechRecognitionAlternative;
  }
  interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
  }
  interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
    readonly message: string;
  }
}

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_OPENROUTER_API_KEY: string;
  readonly VITE_OPENROUTER_MODEL: string;
  readonly VITE_VAPID_PUBLIC_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
