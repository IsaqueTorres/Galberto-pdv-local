import fs from 'fs'
import path from 'path'
import { app } from 'electron'

const logDir = path.join(app.getPath('userData'), 'logs')

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true })
}

function writeLog(level: 'INFO' | 'WARN' | 'ERROR', message: string) {
  const date = new Date()
  const dateISO = date.toLocaleString('sv-SE', {
    timeZone: 'America/Sao_Paulo'
  }).replace(' ', 'T')
  const line = `${dateISO} [${level}] ${message}\n`

  const fileName = `${dateISO.slice(0, 10)}.log`
  const filePath = path.join(logDir, fileName)

  fs.appendFileSync(filePath, line, { encoding: 'utf-8' })
}

export const logger = {
  info: (msg: string) => writeLog('INFO', msg),
  warn: (msg: string) => writeLog('WARN', msg),
  error: (msg: string) => writeLog('ERROR', msg)
}
