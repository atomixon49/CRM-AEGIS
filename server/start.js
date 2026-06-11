import { spawn } from 'child_process'
import { fileURLToPath, pathToFileURL } from 'url'
import { dirname, resolve } from 'path'

const here = dirname(fileURLToPath(import.meta.url))

const serverPath = resolve(here, 'server.js')

const child = spawn('node', [serverPath], {
  cwd: here,
  stdio: ['inherit', 'inherit', 'inherit']
})

function shutdown(code = 0) {
  child.kill('SIGTERM')
  setTimeout(() => process.exit(code), 500)
}

process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))
child.on('exit', (code) => shutdown(code ?? 0))
