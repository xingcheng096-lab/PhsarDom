$ErrorActionPreference = 'Stop'
$port = 4415
$hostAddress = '127.0.0.1'
$preview = $null
$playwrightExit = 1
$cleanupOk = $false
function Test-PortFree { return -not (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue) }
try {
  & npm.cmd run build
  if ($LASTEXITCODE -ne 0) { throw "Build failed with exit code $LASTEXITCODE" }
  if (-not (Test-PortFree)) { throw "Port $port is already in use; no existing process was terminated." }
  $preview = Start-Process -FilePath 'node.exe' -ArgumentList @('node_modules/vite/bin/vite.js', 'preview', '--host', $hostAddress, '--port', $port) -WorkingDirectory (Join-Path $PSScriptRoot '..') -PassThru -WindowStyle Hidden
  Write-Host "Owned preview PID: $($preview.Id)"
  $ready = $false
  for ($attempt = 0; $attempt -lt 60; $attempt++) {
    try { $response = Invoke-WebRequest -Uri "http://${hostAddress}:$port/" -UseBasicParsing -TimeoutSec 2; if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) { $ready = $true; break } } catch { Start-Sleep -Milliseconds 250 }
  }
  if (-not $ready) { throw 'Owned preview did not become ready.' }
  & node node_modules/@playwright/test/cli.js test --config=playwright.external.config.js --project=desktop
  $playwrightExit = $LASTEXITCODE
} catch { Write-Error $_; $playwrightExit = 1 }
finally {
  if ($preview) { try { if (-not $preview.HasExited) { Stop-Process -Id $preview.Id -Force -ErrorAction Stop } } catch { Write-Warning "Owned preview cleanup failed: $($_.Exception.Message)" } }
  $cleanupOk = Test-PortFree
  if (-not $cleanupOk) { Write-Error "Port $port is still listening after owned-process cleanup." }
}
if ($playwrightExit -eq 0 -and $cleanupOk) { exit 0 }
exit 1
