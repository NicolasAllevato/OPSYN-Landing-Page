# ========================================
# CREAR ACCESO DIRECTO "Panel OPSYN"
# Genera "Panel OPSYN.lnk" en la raíz del proyecto, con el ícono de OPSYN,
# que ejecuta scripts/open-admin.ps1 sin mostrar terminal. El .lnk guarda
# rutas absolutas de esta máquina: no se versiona (.gitignore); si movés
# el proyecto de carpeta, volvé a correr este script.
#
# Uso: powershell -ExecutionPolicy Bypass -File scripts/create-admin-shortcut.ps1
# ========================================

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$launcher = Join-Path $root 'scripts\open-admin.ps1'
$icon = Join-Path $root 'admin\opsyn-admin.ico'
$shortcutPath = Join-Path $root 'Panel OPSYN.lnk'

$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'
$shortcut.Arguments = "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$launcher`""
$shortcut.WorkingDirectory = $root
$shortcut.IconLocation = "$icon,0"
$shortcut.WindowStyle = 7 # minimizado: evita el parpadeo de la consola
$shortcut.Description = 'Abrir el panel de administración de la landing de OPSYN'
$shortcut.Save()

Write-Output "Acceso directo creado: $shortcutPath"
