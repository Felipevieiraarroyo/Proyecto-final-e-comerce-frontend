import { Moon, Sun } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Ativar tema claro" : "Ativar tema escuro"}
      title={isDark ? "Ativar tema claro" : "Ativar tema escuro"}
      className="flex items-center justify-center rounded-xl border p-2.5 transition-all duration-200 hover:scale-105"
      style={{
        backgroundColor: "var(--color-surface)",
        color: "var(--color-text)",
        borderColor: "var(--color-border)",
      }}
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
