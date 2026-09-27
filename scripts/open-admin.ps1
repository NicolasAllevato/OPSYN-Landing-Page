# ========================================
# ABRIR PANEL ADMIN (doble clic en "Panel OPSYN")
# Si el servidor local del panel no está corriendo, lo levanta en segundo
# plano (sin ventana de terminal) y abre el navegador en el panel.
# Si ya estaba corriendo, solo abre el navegador.
# Log del servidor: %TEMP%\opsyn-admin.log
# ========================================

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$url = 'http://127.0.0.1:4321/admin'
$logOut = Join-Path $env:TEMP 'opsyn-admin.log'
$logErr = Join-Path $env:TEMP 'opsyn-admin-error.log'

function Test-Panel {
  try {
    return (Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2).StatusCode -eq 200
  } catch {
    return $false
  }
}

function Show-Error([string]$message) {
  Add-Type -AssemblyName PresentationFramework
  [System.Windows.MessageBox]::Show($message, 'Panel OPSYN', 'OK', 'Error') | Out-Null
}

if (-not (Test-Panel)) {
  $node = Get-Command node -ErrorAction SilentlyContinue
  if (-not $node) {
    Show-Error "No se encontró Node.js. Instalalo desde https://nodejs.org y volvé a intentar."
    exit 1
  }

  Start-Process -FilePath $node.Source -ArgumentList 'scripts/admin-server.js' `
    -WorkingDirectory $root -WindowStyle Hidden `
    -RedirectStandardOutput $logOut -RedirectStandardError $logErr

  # Espera hasta ~10 s a que el servidor responda
  for ($i = 0; $i -lt 40 -and -not (Test-Panel); $i++) {
    Start-Sleep -Milliseconds 250
  }
}

if (Test-Panel) {
  Start-Process $url
} else {
  Show-Error "El panel no respondió. Revisá el log:`n$logErr"
  exit 1
}
