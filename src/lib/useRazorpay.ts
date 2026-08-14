import { useEffect, useState } from 'react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

export interface UseRazorpay {
  isLoaded: boolean;
  /** Returns the Razorpay constructor once the checkout script is ready. */
  loadRazorpay: () => Promise<any>;
}

/** Loads the Razorpay Checkout script once and reports when it's ready. */
export function useRazorpay(): UseRazorpay {
  const [ready, setReady] = useState(!!window.Razorpay);

  useEffect(() => {
    if (window.Razorpay) {
      setReady(true);
      return;
    }
    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => setReady(true));
      return;
    }
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => setReady(true);
    document.body.appendChild(script);
  }, []);

  const loadRazorpay = async (): Promise<any> => {
    if (window.Razorpay) return window.Razorpay;
    await new Promise<void>((resolve) => {
      const check = setInterval(() => {
        if (window.Razorpay) {
          clearInterval(check);
          resolve();
        }
      }, 150);
    });
    return window.Razorpay;
  };

  return { isLoaded: ready, loadRazorpay };
}
