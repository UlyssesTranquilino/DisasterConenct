import { Sun, Moon } from 'lucide-react'
import { Button } from './ui/button'
import { useTheme } from '../lib/theme'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  return (
    <Button variant="outline" size="icon" aria-label="Toggle theme" onClick={toggleTheme}>
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </Button>
  )
}


