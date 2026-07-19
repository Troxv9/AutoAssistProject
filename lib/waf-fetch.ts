import { execFile } from "node:child_process"

export async function wafFetchJson<T = unknown>(
  url: string,
  headers: Record<string, string>,
  timeoutMs = 10000,
): Promise<{ status: number; json: T | null }> {
  const viaCurl = await curlJson<T>(url, headers, timeoutMs)
  if (viaCurl && viaCurl.status === 200 && viaCurl.json) return viaCurl

  const viaPython = await pythonJson<T>(url, headers, timeoutMs)
  if (viaPython && viaPython.status === 200 && viaPython.json) return viaPython

  try {
    const response = await fetch(url, { headers, signal: AbortSignal.timeout(timeoutMs), cache: "no-store" })
    let json: T | null = null
    try {
      json = (await response.json()) as T
    } catch {
      json = null
    }
    return { status: response.status, json }
  } catch {
    return { status: 0, json: null }
  }
}

function curlJson<T>(
  url: string,
  headers: Record<string, string>,
  timeoutMs: number,
): Promise<{ status: number; json: T | null } | null> {
  return new Promise((resolve) => {
    const args = [
      "-sS",
      "--max-time",
      String(Math.ceil(timeoutMs / 1000)),
      "-w",
      "\n__HTTP_STATUS__%{http_code}",
      ...Object.entries(headers).flatMap(([name, value]) => ["-H", `${name}: ${value}`]),
      url,
    ]
    execFile("curl", args, { maxBuffer: 20 * 1024 * 1024 }, (error, stdout) => {
      if (error && !stdout) return resolve(null)
      const marker = stdout.lastIndexOf("\n__HTTP_STATUS__")
      if (marker === -1) return resolve(null)
      const status = Number(stdout.slice(marker + "\n__HTTP_STATUS__".length)) || 0
      const body = stdout.slice(0, marker)
      let json: T | null = null
      try {
        json = JSON.parse(body) as T
      } catch {
        json = null
      }
      resolve({ status, json })
    })
  })
}

function pythonJson<T>(
  url: string,
  headers: Record<string, string>,
  timeoutMs: number,
): Promise<{ status: number; json: T | null } | null> {
  return new Promise((resolve) => {
    const pythonCode = `
import urllib.request, sys, json
url = sys.argv[1]
headers = json.loads(sys.argv[2])
req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req, timeout=${Math.ceil(timeoutMs / 1000)}) as response:
        print(response.read().decode("utf-8"))
except Exception as e:
    sys.stderr.write(str(e))
    sys.exit(1)
`
    execFile("python", ["-c", pythonCode, url, JSON.stringify(headers)], { maxBuffer: 20 * 1024 * 1024 }, (error, stdout) => {
      if (error) return resolve(null)
      let json: T | null = null
      try {
        json = JSON.parse(stdout) as T
      } catch {
        json = null
      }
      resolve({ status: 200, json })
    })
  })
}

export async function wafFetchText(
  url: string,
  headers: Record<string, string>,
  timeoutMs = 12000,
): Promise<{ status: number; text: string | null }> {
  const viaCurl = await curlText(url, headers, timeoutMs)
  if (viaCurl && viaCurl.status === 200 && viaCurl.text) return viaCurl

  try {
    const response = await fetch(url, { headers, signal: AbortSignal.timeout(timeoutMs), cache: "no-store" })
    const text = await response.text().catch(() => null)
    return { status: response.status, text }
  } catch {
    return { status: 0, text: null }
  }
}

function curlText(
  url: string,
  headers: Record<string, string>,
  timeoutMs: number,
): Promise<{ status: number; text: string | null } | null> {
  return new Promise((resolve) => {
    const args = [
      "-sSL",
      "--max-time",
      String(Math.ceil(timeoutMs / 1000)),
      "-w",
      "\n__HTTP_STATUS__%{http_code}",
      ...Object.entries(headers).flatMap(([name, value]) => ["-H", `${name}: ${value}`]),
      url,
    ]
    execFile("curl", args, { maxBuffer: 30 * 1024 * 1024 }, (error, stdout) => {
      if (error && !stdout) return resolve(null)
      const marker = stdout.lastIndexOf("\n__HTTP_STATUS__")
      if (marker === -1) return resolve({ status: 200, text: stdout })
      const status = Number(stdout.slice(marker + "\n__HTTP_STATUS__".length)) || 0
      const text = stdout.slice(0, marker)
      resolve({ status, text })
    })
  })
}
