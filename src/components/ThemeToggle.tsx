import { Moon } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "../lib/theme";

export function ThemeToggle() {
  const { theme } = useTheme();
  // Always dark mode - show moon icon only
  return (
    <Button variant="outline" size="icon" aria-label="Dark mode" disabled>
      <Moon size={16} />
    </Button>
  );
}
