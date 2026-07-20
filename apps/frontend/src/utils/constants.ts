export const API_URL = import.meta.env.DEV
    ? import.meta.env.VITE_API_URL
    : typeof window !== 'undefined'
      ? window.location.origin
      : import.meta.env.VITE_API_URL;
export const BOOKING_FORM_URL = import.meta.env.VITE_BOOKING_FORM_URL;