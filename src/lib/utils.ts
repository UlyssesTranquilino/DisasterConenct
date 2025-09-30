export type ClassValue = string | number | null | undefined | Record<string, boolean> | Array<ClassValue>

function simpleClsx(...inputs: ClassValue[]): string {
  const classes: string[] = []
  const push = (val: ClassValue) => {
    if (!val) return
    if (typeof val === 'string' || typeof val === 'number') classes.push(String(val))
    else if (Array.isArray(val)) val.forEach(push)
    else if (typeof val === 'object') for (const key in val) if (val[key]) classes.push(key)
  }
  inputs.forEach(push)
  return classes.join(' ')
}

// Minimal class merge. This does not resolve all Tailwind conflicts, but is sufficient here.
export function cn(...inputs: ClassValue[]) {
  return simpleClsx(...inputs)
}


