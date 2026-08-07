type LogArgs = unknown[]

function canLog(): boolean {
  return typeof process !== 'undefined' && process.env.NODE_ENV !== 'production'
}

export const kitLogger = {
  log: (...args: LogArgs) => {
    if (canLog()) {
      console.log(...args)
    }
  },
  warn: (...args: LogArgs) => {
    if (canLog()) {
      console.warn(...args)
    }
  },
  error: (...args: LogArgs) => {
    if (canLog()) {
      console.error(...args)
    }
  },
}