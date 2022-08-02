// @ts-nocheck

import type { Writable } from 'stream'
import cliCursor from './utils/cli-cursor'
import ansiEscapes from './utils/ansi-escapes'

export interface LogUpdate {
  clear: () => void
  done: () => void
  (str: string): void
}

const create = (stream: Writable, { showCursor = false } = {}): LogUpdate => {
  let previousLineCount = 0
  let previousOutput = ''
  let hasHiddenCursor = false

  const render = (str: string) => {
    if (!showCursor && !hasHiddenCursor) {
      cliCursor.hide()
      hasHiddenCursor = true
    }

    const output = `${str}\n`
    if (output === previousOutput)
      return

    previousOutput = output
    stream.write(ansiEscapes.eraseLines(previousLineCount) + output)
    previousLineCount = output.split('\n').length
  }

  render.clear = () => {
    stream.write(ansiEscapes.eraseLines(previousLineCount))
    previousOutput = ''
    previousLineCount = 0
  }

  render.done = () => {
    previousOutput = ''
    previousLineCount = 0
    if (!showCursor) {
      cliCursor.show()
      hasHiddenCursor = false
    }
  }

  return render
}

export default { create }