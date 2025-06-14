import { toast } from "sonner";
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";

export const showToast = {
  success: (msg: string) =>
    toast.success(msg, {
      icon: <CheckCircle className="text-green-400 w-5 h-5" />,
      className:
        "bg-green-600 text-white border border-green-500 shadow-green-500/30",
    }),

  error: (msg: string) =>
    toast.error(msg, {
      icon: <XCircle className="text-red-400 w-5 h-5" />,
      className:
        "bg-red-600 text-white border border-red-500 shadow-red-500/30",
      duration: 5000,
    }),

  warning: (msg: string) =>
    toast.warning(msg, {
      icon: <AlertTriangle className="text-yellow-400 w-5 h-5" />,
      className:
        "bg-yellow-400 text-black border border-yellow-500 shadow-yellow-500/30",
      duration: 4000,
    }),

  info: (msg: string) =>
    toast.info(msg, {
      icon: <Info className="text-blue-400 w-5 h-5" />,
      className:
        "bg-blue-600 text-white border border-blue-500 shadow-blue-500/30",
      duration: 3500,
    }),
};
