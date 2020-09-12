export const IS_SERVER = typeof window === 'undefined';

export function isDocumentVisible(): boolean {
  if (typeof document !== 'undefined' && typeof document.visibilityState !== 'undefined') {
    return document.visibilityState !== 'hidden';
  }
  // always assume it's visible
  return true;
}

export function isOnline(): boolean {
  if (typeof navigator.onLine !== 'undefined') {
    return navigator.onLine;
  }
  // always assume it's online
  return true;
}

export const equal = (a: any, b: any) => a === b;
