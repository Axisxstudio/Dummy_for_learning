export {};

declare global {
  interface Window {
    payhere?: {
      startPayment: (payment: Record<string, string | boolean | number>) => void;
      onCompleted?: (orderId: string) => void;
      onDismissed?: () => void;
      onError?: (error: string) => void;
    };
  }
}
