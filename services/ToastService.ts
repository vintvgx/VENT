// services/ToastService.ts
import { TOAST } from "@/components/ui/toast/useToast";

// Define the callback type to match your existing useShowToast hook
type ToastCallback = (type: TOAST, message: string) => void;

export class ToastService {
  private static callback: ToastCallback | null = null;

  static register(callback: ToastCallback) {
    ToastService.callback = callback;
  }

  static unregister() {
    ToastService.callback = null;
  }

  static show(type: TOAST, message: string) {
    if (ToastService.callback) {
      ToastService.callback(type, message);
    } else {
      console.warn('Toast callback not registered');
    }
  }

  static success(message: string) {
    ToastService.show(TOAST.SUCCESS, message);
  }

  static error(message: string) {
    ToastService.show(TOAST.ERROR, message);
  }

  static info(message: string) {
    ToastService.show(TOAST.INFO, message);
  }

  static warning(message: string) {
    ToastService.show(TOAST.WARNING, message);
  }
}