<#
  probe.ps1 - DOM/console probe for the Predicter preview harness.

  Two targets:
    -Target integration  loads _preview/integration.html (Lead-owned functional
                         harness that exercises Logged/js/main.js + predictor-view.js
                         with a mocked fetch). Dumps the DOM, extracts
                         #verdict / #results JSON, prints PASS/FAIL + failed tests.
                         -> shots/itest-dom.html, shots/itest-console.log
    -Target preview      loads _preview/preview.html for the given case/theme list
                         and dumps DOM + console only (no screenshots).
                         -> shots/dom-<case>-<theme>.html, console-<case>-<theme>.log

  Same Chrome constraints as shoot.ps1: isolated whitespace-free profile,
  Start-Process -Wait with a hard timeout, one batched pass.

  EXAMPLES
    powershell -NoProfile -ExecutionPolicy Bypass -File _preview/tools/probe.ps1
    powershell -NoProfile -ExecutionPolicy Bypass -File _preview/tools/probe.ps1 -Target preview -Cases win,error -Themes dark,light
#>
[CmdletBinding()]
param(
  [ValidateSet('integration', 'preview')]
  [string]$Target = 'integration',

  [string[]]$Cases = @('win'),
  [string[]]$Themes = @('dark'),

  [string]$OutDir,
  [string]$ChromePath = 'C:\Program Files\Google\Chrome\Application\chrome.exe',

  [int]$Width = 1280,
  [int]$Height = 2200,
  [int]$VirtualTimeBudgetMs = 6000,
  [int]$TimeoutSeconds = 120,
  [switch]$KeepProfile,

  # Print the resolved probe plan without launching Chrome (command-line sanity check).
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

# `powershell -File script.ps1 -Cases win,error` binds the whole "win,error"
# string to one [string[]] element, so split/validate comma lists ourselves.
function Expand-ListValues {
  param([string[]]$Values)
  $expanded = @()
  foreach ($value in @($Values)) {
    if ($null -eq $value) { continue }
    foreach ($token in ($value -split ',')) {
      $trimmed = $token.Trim()
      if ($trimmed) { $expanded += $trimmed }
    }
  }
  return $expanded
}

$Cases = @(Expand-ListValues $Cases)
$Themes = @(Expand-ListValues $Themes)
$normalizedThemes = @()
foreach ($theme in $Themes) {
  $normalized = $theme.ToLowerInvariant()
  if ($normalized -ne 'dark' -and $normalized -ne 'light') {
    throw "Invalid theme '$theme'; use dark,light."
  }
  if ($normalizedThemes -notcontains $normalized) { $normalizedThemes += $normalized }
}
$Themes = $normalizedThemes

function Move-Artifact {
  param([string]$Source, [string]$Destination)
  for ($attempt = 0; $attempt -lt 12; $attempt++) {
    try {
      Move-Item -LiteralPath $Source -Destination $Destination -Force -ErrorAction Stop
      return $true
    } catch {
      Start-Sleep -Milliseconds 300
    }
  }
  return $false
}
$scriptDir = $PSScriptRoot
$previewDir = Split-Path -Parent $scriptDir
if (-not $OutDir) { $OutDir = Join-Path $previewDir 'shots' }
$OutDir = [System.IO.Path]::GetFullPath($OutDir)

$previewPath = [System.IO.Path]::GetFullPath((Join-Path $previewDir 'preview.html'))
$integrationPath = [System.IO.Path]::GetFullPath((Join-Path $previewDir 'integration.html'))

if (-not (Test-Path -LiteralPath $ChromePath -PathType Leaf)) { throw "Chrome not found: $ChromePath" }
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

function Resolve-NoSpaceStageRoot {
  $candidates = @()
  if ($env:TEMP) { $candidates += (Join-Path $env:TEMP 'dsh-preview') }
  if ($env:LOCALAPPDATA) { $candidates += (Join-Path $env:LOCALAPPDATA 'Temp\dsh-preview') }
  $candidates += 'C:\Windows\Temp\dsh-preview'
  foreach ($candidate in $candidates) {
    if ($candidate -notmatch '\s') { return $candidate }
  }
  throw 'No whitespace-free temp directory available for Chrome staging.'
}

$stageRoot = Resolve-NoSpaceStageRoot
$runId = [guid]::NewGuid().ToString('N').Substring(0, 8)
$stageDir = Join-Path $stageRoot ('probe-' + $runId)
New-Item -ItemType Directory -Force -Path $stageDir | Out-Null

# Build the probe plan.
$probes = @()
if ($Target -eq 'integration') {
  if (-not (Test-Path -LiteralPath $integrationPath -PathType Leaf)) {
    throw "Integration harness not found: $integrationPath"
  }
  $probes += [pscustomobject]@{
    Name = 'itest'
    Url  = ([System.Uri]::new($integrationPath)).AbsoluteUri
    Kind = 'integration'
  }
} else {
  if (-not (Test-Path -LiteralPath $previewPath -PathType Leaf)) { throw "Preview page not found: $previewPath" }
  $baseUrl = ([System.Uri]::new($previewPath)).AbsoluteUri
  foreach ($caseName in $Cases) {
    if ($caseName -notmatch '^[a-z0-9][a-z0-9-]*$') { throw "Invalid case name: '$caseName'" }
    foreach ($theme in $Themes) {
      $probes += [pscustomobject]@{
        Name = ('{0}-{1}' -f $caseName, $theme)
        Url  = ($baseUrl + '?theme=' + $theme + '&case=' + $caseName)
        Kind = 'preview'
      }
    }
  }
}
if ($probes.Count -eq 0) { throw 'No probe jobs; check -Target / -Cases / -Themes.' }

if ($DryRun) {
  Write-Host ("Dry run ({0}): {1} job(s); Chrome NOT invoked." -f $Target, $probes.Count)
  $probes | Format-Table Name, Kind, Url -AutoSize | Out-String | Write-Host
  exit 0
}

Write-Host ("Predicter probe ({0}): {1} run(s) -> {2}" -f $Target, $probes.Count, $OutDir)
Write-Host ''

$failures = New-Object System.Collections.ArrayList
$index = 0

foreach ($probe in $probes) {
  $index++
  $profileDir = Join-Path $stageDir ('profile-' + $index)
  $stdoutTemp = Join-Path $stageDir ('stdout-' + $index + '.txt')
  $stderrTemp = Join-Path $stageDir ('stderr-' + $index + '.log')

  $chromeArgs = @(
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    '--disable-extensions',
    '--no-proxy-server',
    '--force-device-scale-factor=1',
    '--enable-logging=stderr',
    '--log-level=0',
    ('--user-data-dir=' + $profileDir),
    ('--window-size=' + $Width + ',' + $Height),
    '--dump-dom',
    ('--virtual-time-budget=' + $VirtualTimeBudgetMs),
    $probe.Url
  )

  try {
    Remove-Item -LiteralPath $profileDir -Recurse -Force -ErrorAction SilentlyContinue
    $proc = Start-Process -FilePath $ChromePath `
      -ArgumentList $chromeArgs `
      -PassThru `
      -WindowStyle Hidden `
      -RedirectStandardOutput $stdoutTemp `
      -RedirectStandardError $stderrTemp

    if (-not $proc.WaitForExit($TimeoutSeconds * 1000)) {
      try { $proc.Kill() } catch { }
      throw ('Chrome timeout after {0}s' -f $TimeoutSeconds)
    }

    if (-not (Test-Path -LiteralPath $stdoutTemp)) { throw 'Chrome wrote no DOM dump' }
    $dom = Get-Content -LiteralPath $stdoutTemp -Raw -Encoding UTF8

    $consoleLines = @()
    if (Test-Path -LiteralPath $stderrTemp) {
      try { $consoleLines = @(Get-Content -LiteralPath $stderrTemp -ErrorAction SilentlyContinue) } catch { }
    }
    $consoleErrors = @($consoleLines | Where-Object {
        $_ -match '(ERROR|SEVERE|FATAL):CONSOLE' -or
        $_ -match 'Uncaught (TypeError|ReferenceError|SyntaxError|RangeError|Error)'
      })

    if ($probe.Kind -eq 'integration') {
      $titleMatch = [regex]::Match($dom, '<title>(.*?)</title>', 'Singleline,IgnoreCase')
      $title = ''
      if ($titleMatch.Success) { $title = [System.Net.WebUtility]::HtmlDecode($titleMatch.Groups[1].Value).Trim() }

      $verdictMatch = [regex]::Match($dom, '<h1 id="verdict"[^>]*>(.*?)</h1>', 'Singleline,IgnoreCase')
      $verdict = 'UNKNOWN'
      if ($verdictMatch.Success) { $verdict = [System.Net.WebUtility]::HtmlDecode($verdictMatch.Groups[1].Value).Trim() }

      $resultsMatch = [regex]::Match($dom, '<pre id="results"[^>]*>(.*?)</pre>', 'Singleline,IgnoreCase')
      $summary = $null
      $failedNames = @()
      if ($resultsMatch.Success) {
        $json = [System.Net.WebUtility]::HtmlDecode($resultsMatch.Groups[1].Value)
        try {
          $parsed = $json | ConvertFrom-Json
          $summary = $parsed.summary
          $failedNames = @($parsed.tests | Where-Object { -not $_.pass } | ForEach-Object { $_.name })
        } catch {
          Write-Warning ('Could not parse #results JSON: ' + $_.Exception.Message)
        }
      }

      Write-Host ('[{0}/{1}] integration ... {2}' -f $index, $probes.Count, $verdict)
      if ($title) { Write-Host ('  title: {0}' -f $title) }
      if ($summary) {
        Write-Host ('  tests: {0} passed / {1} failed of {2}; page errors: {3}' -f $summary.passed, $summary.failed, $summary.total, @($summary.errors).Count)
        if (@($summary.errors).Count -gt 0) {
          foreach ($err in @($summary.errors)) { Write-Host ('  page-error: {0}' -f $err) }
        }
      }
      if ($failedNames.Count -gt 0) {
        Write-Host ('  failed checks: {0}' -f ($failedNames -join '; '))
      }
      if (@($consoleErrors).Count -gt 0) {
        Write-Host ('  console errors: {0}' -f (($consoleErrors | Select-Object -First 5) -join ' | '))
      }

      $null = Move-Artifact -Source $stdoutTemp -Destination (Join-Path $OutDir 'itest-dom.html')
      if (Test-Path -LiteralPath $stderrTemp) {
        $null = Move-Artifact -Source $stderrTemp -Destination (Join-Path $OutDir 'itest-console.log')
      }
      if ($verdict -ne 'ITEST PASS') { $failures += 'integration' }
    } else {
      $titleMatch = [regex]::Match($dom, '<title>(.*?)</title>', 'Singleline,IgnoreCase')
      $title = ''
      if ($titleMatch.Success) { $title = [System.Net.WebUtility]::HtmlDecode($titleMatch.Groups[1].Value).Trim() }
      $levelMatch = [regex]::Match($dom, 'id="pvr-status"[^>]*data-level="([^"]+)"')
      if (-not $levelMatch.Success) { $levelMatch = [regex]::Match($dom, 'data-level="([^"]+)"[^>]*id="pvr-status"') }
      $level = ''
      if ($levelMatch.Success) { $level = $levelMatch.Groups[1].Value }
      $rendererMissing = $dom -match 'predictor-view\.js is not available yet'

      Write-Host ('[{0}/{1}] preview {2} ... title="{3}" level="{4}" renderer={5}' -f $index, $probes.Count, $probe.Name, $title, $level, $(if ($rendererMissing) { 'missing' } else { 'present' }))
      if (@($consoleErrors).Count -gt 0) {
        Write-Host ('  console errors: {0}' -f (($consoleErrors | Select-Object -First 5) -join ' | '))
        $failures += $probe.Name
      }

      $null = Move-Artifact -Source $stdoutTemp -Destination (Join-Path $OutDir ('dom-' + $probe.Name + '.html'))
      if (Test-Path -LiteralPath $stderrTemp) {
        $null = Move-Artifact -Source $stderrTemp -Destination (Join-Path $OutDir ('console-' + $probe.Name + '.log'))
      }
    }
  } catch {
    Write-Host ('[{0}/{1}] {2} ... FAIL ({3})' -f $index, $probes.Count, $probe.Name, $_.Exception.Message)
    $failures += $probe.Name
  } finally {
    if (-not $KeepProfile -and (Test-Path -LiteralPath $profileDir)) {
      $resolvedProfile = [System.IO.Path]::GetFullPath($profileDir)
      $resolvedStage = [System.IO.Path]::GetFullPath($stageDir)
      if ($resolvedProfile.StartsWith($resolvedStage, [System.StringComparison]::OrdinalIgnoreCase)) {
        Remove-Item -LiteralPath $resolvedProfile -Recurse -Force -ErrorAction SilentlyContinue
      }
    }
    foreach ($leftover in @($stdoutTemp, $stderrTemp)) {
      if (Test-Path -LiteralPath $leftover) {
        Remove-Item -LiteralPath $leftover -Force -ErrorAction SilentlyContinue
      }
    }
  }
}

if (-not $KeepProfile) {
  Remove-Item -LiteralPath $stageDir -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host ''
if ($failures.Count -gt 0) {
  Write-Host ('Probe FAILURES: {0}' -f ($failures -join ', '))
  exit 1
}
Write-Host 'Probe: all captured runs OK'
exit 0
