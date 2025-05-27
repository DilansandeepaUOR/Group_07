// src/components/ui/use-toast.jsx
import { useState } from "react";

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const toast = ({ title, description, type = "info" }) => {
    setToasts([...toasts, { title, description, type, id: Date.now() }]);
    console.log(`[${type.toUpperCase()}] ${title}: ${description}`);
  };

  return {
    toast,
    toasts, // if you want to display them somewhere
  };
}
