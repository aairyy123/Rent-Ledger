import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const DebugRouter = () => {
  const location = useLocation();

  useEffect(() => {
    console.log("🔗 Route changed to:", location.pathname);
    console.log("🔗 Full location object:", location);
  }, [location]);

  return null;
};