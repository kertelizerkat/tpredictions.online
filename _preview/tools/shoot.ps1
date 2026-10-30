<#
  shoot.ps1 - batched headless-Chrome screenshot rig for the Predicter preview.

  Design constraints (discovered earlier, do not "simplify" them away):
    * An isolated --user-data-dir in a whitespace-free temp path is required;
      shared profiles hang in this environment.
    * file:// URLs with percent-encoded spaces work; Chrome's HTTP fetch path
      can crash its network service here, so the preview is loaded from disk.
    * Start-Process -Wait (plus a hard timeout) so each Chrome run finishes
      before the next starts. One invocation of this script = one batched pass.
    * Chrome writes to a no-space staging dir under %TEMP%; finished artifacts
      are moved into _preview/shots/ (whose full path contains spaces).

  Each run captures, in a single Chrome invocation:
    - PNG screenshot  -> shots/<case>-<theme>-<width>[-rm].png
    - DOM dump        -> shots/dom-<case>-<theme>-<width>[-rm].html   (unless -NoDom)
    - stderr console  -> shots/console-<case>-<theme>-<width>[-rm].log (unless -NoConsole)
  The preview page sets document.title = "PVR <level>: <status>" and exposes
  #pvr-status[data-level], so the DOM dump is enough to detect JS failures.

  EXAMPLES
    # Full default matrix (12 cases x 2 themes x 2 widths = 48 runs, one pass)
    powershell -NoProfile -ExecutionPolicy Bypass -File _preview/tools/shoot.ps1

    # Fast focused pass
    powershell -NoProfile -ExecutionPolicy Bypass -File _preview/tools/shoot.ps1 `
        -Cases win,error -Themes dark,light -Widths 1280,390

    # Reduced-motion evidence for one case, bare chrome
    powershell -NoProfile -ExecutionPolicy Bypass -File _preview/tools/shoot.ps1 `
        -Cases win -Themes dark -Widths 1280 -ReducedMotion -Bare
#>
[CmdletBinding()]
param(
  [string[]]$Cases = @('win', 'draw', 'away', 'unpredictable', 'partial', 'empty', 'premium-empty', 'error', 'format', 'noresults', 'fallback', 'loading'),

  # Comma-separated values are accepted from the command line (e.g. "-Themes dark,light").
  [string[]]$Themes = @('dark', 'light'),

  [string[]]$Widths = @('1280', '390'),

  # Defaults are resolved relative to this script; do not hard-code the workspace path.
  [string]$OutDir,
  [string]$PreviewPath,

  [string]$ChromePath = 'C:\Program Files\Google\Chrome\Application\chrome.exe',

  # Extra query param on preview.html (hides the preview-only top bar).
  [switch]$Bare,

  # Emulate prefers-reduced-motion: reduce (adds "-rm" to artifact names).
  [switch]$ReducedMotion,

  # Skip the DOM dump / stderr console capture for each run.
  [switch]$NoDom,
  [switch]$NoConsole,

  # Tall virtual viewports so a screenshot captures the whole page. Chrome has
  # no --full-page flag; a generous --window-size height is the CLI equivalent.
  [int]$DesktopHeight = 2200,
  [int]$MobileHeight = 2600,
  [int]$MobileMaxWidth = 599,

  [int]$VirtualTimeBudgetMs = 2000,
  [int]$TimeoutSeconds = 90,
  [switch]$KeepProfile,

  # Reuse one isolated profile for all runs in this batch. A fresh profile costs
  # ~45 s per Chrome start in this environment; reusing one cuts the matrix pass
  # down to a few seconds per run. Runs stay sequential (Start-Process -Wait).
  [switch]$ReuseProfile,

  # Kill lingering Chrome helper processes (WMI-based; first call costs ~20 s in
  # this environment). Only needed when reusing a profile or when moves stall.
  [switch]$KillHelpers,

  # Print the resolved run plan without launching Chrome (command-line sanity check).
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

$caseList = @(Expand-ListValues $Cases)
$themeTokens = @(Expand-ListValues $Themes)
$widthTokens = @(Expand-ListValues $Widths)

# NOTE: keep the normalised values in fresh local variables. Re-assigning the
# typed parameter variables would re-coerce them back to [string[]], and then
# "-lt 200" would do a string comparison ("1280" -lt "200" = true).
$themeList = @()
foreach ($theme in $themeTokens) {
  $normalized = $theme.ToLowerInvariant()
  if ($normalized -ne 'dark' -and $normalized -ne 'light') {
    throw "Invalid theme '$theme'; use dark,light."
  }
  if ($themeList -notcontains $normalized) { $themeList += $normalized }
}

$widthList = @()
foreach ($widthToken in $widthTokens) {
  $parsedWidth = 0
  if (-not [int]::TryParse($widthToken, [ref]$parsedWidth)) {
    throw "Invalid width '$widthToken'; use integers, e.g. 1280,390."
  }
  $widthList += $parsedWidth
}

if ($caseList.Count -eq 0 -or $themeList.Count -eq 0 -or $widthList.Count -eq 0) {
  throw 'Empty -Cases/-Themes/-Widths after parsing.'
}

# ---------------------------------------------------------------------------
# Resolve paths
# ---------------------------------------------------------------------------
$scriptDir = $PSScriptRoot
$previewDir = Split-Path -Parent $scriptDir
if (-not $OutDir) { $OutDir = Join-Path $previewDir 'shots' }
if (-not $PreviewPath) { $PreviewPath = Join-Path $previewDir 'preview.html' }

$OutDir = [System.IO.Path]::GetFullPath($OutDir)
$PreviewPath = [System.IO.Path]::GetFullPath($PreviewPath)

if (-not (Test-Path -LiteralPath $PreviewPath -PathType Leaf)) {
  throw "Preview page not found: $PreviewPath"
}
if (-not (Test-Path -LiteralPath $ChromePath -PathType Leaf)) {
  throw "Chrome not found: $ChromePath"
}
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

# Chrome is unreliable when --user-data-dir / --screenshot contain whitespace.
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
$stageDir = Join-Path $stageRoot ('run-' + $runId)
New-Item -ItemType Directory -Force -Path $stageDir | Out-Null

# Chrome's helper processes can keep stdout/stderr/screenshot handles open for a
# moment after the browser process exits; a bare Move-Item then fails with
# "The process cannot access the file". Retry with backoff before giving up.
function Move-Artifact {
  param(
    [Parameter(Mandatory = $true)][string]$Source,
    [Parameter(Mandatory = $true)][string]$Destination,
    [int]$Attempts = 40,
    [int]$DelayMs = 250
  )
  for ($attempt = 1; $attempt -le $Attempts; $attempt++) {
    if (-not (Test-Path -LiteralPath $Source)) { return $false }
    try {
      Move-Item -LiteralPath $Source -Destination $Destination -Force -ErrorAction Stop
      return $true
    } catch {
      if ($attempt -ge $Attempts) {
        throw ('Could not move "{0}" -> "{1}": {2}' -f $Source, $Destination, $_.Exception.Message)
      }
      Start-Sleep -Milliseconds $DelayMs
    }
  }
  return $false
}

# Best-effort recursive delete (profile dirs are lock-prone right after exit).
function Remove-ArtifactPath {
  param(
    [Parameter(Mandatory = $true)][string]$Path,
    [int]$Attempts = 8,
    [int]$DelayMs = 250
  )
  for ($attempt = 1; $attempt -le $Attempts; $attempt++) {
    if (-not (Test-Path -LiteralPath $Path)) { return }
    try {
      Remove-Item -LiteralPath $Path -Recurse -Force -ErrorAction Stop
      return
    } catch {
      if ($attempt -ge $Attempts) { return }
      Start-Sleep -Milliseconds $DelayMs
    }
  }
}

# Chrome leaves crashpad-handler/utility children alive for tens of seconds.
# While alive they keep the --user-data-dir locked (next run stalls ~40-70 s)
# and keep our redirected stdout/stderr file handles open (moves fail).
# They all carry the unique per-batch stage dir in their command line, so we can
# safely kill only our own helpers after the browser process has exited.
function Stop-StageChromeProcesses {
  param(
    [Parameter(Mandatory = $true)][string]$Marker,
    [int]$WaitMs = 300
  )
  $stopped = 0
  try {
    $procs = @(Get-CimInstance Win32_Process -Filter "Name='chrome.exe'" -ErrorAction SilentlyContinue |
      Where-Object { $_.CommandLine -and $_.CommandLine.Contains($Marker) })
    foreach ($chromeProc in $procs) {
      try {
        Stop-Process -Id $chromeProc.ProcessId -Force -ErrorAction Stop
        $stopped++
      } catch { }
    }
  } catch { }
  if ($stopped -gt 0) { Start-Sleep -Milliseconds $WaitMs }
  return $stopped
}

# Percent-encoded file:// URL (spaces become %20).
$baseUrl = ([System.Uri]::new($PreviewPath)).AbsoluteUri
$nameSuffix = ''
if ($ReducedMotion) { $nameSuffix = '-rm' }

# ---------------------------------------------------------------------------
# Build the run plan
# ---------------------------------------------------------------------------
$jobs = @()
foreach ($caseName in $caseList) {
  if ($caseName -notmatch '^[a-z0-9][a-z0-9-]*$') { throw "Invalid case name: '$caseName'" }
  foreach ($theme in $themeList) {
    foreach ($width in $widthList) {
      if ($width -lt 200 -or $width -gt 4000) { throw "Suspicious width: $width" }
      $height = if ($width -le $MobileMaxWidth) { $MobileHeight } else { $DesktopHeight }
      $name = '{0}-{1}-{2}{3}' -f $caseName, $theme, $width, $nameSuffix
      $url = $baseUrl + '?theme=' + $theme + '&case=' + $caseName
      if ($Bare) { $url += '&bare=1' }
      $jobs += [pscustomobject]@{
        Name   = $name
        Case   = $caseName
        Theme  = $theme
        Width  = $width
        Height = $height
        Url    = $url
      }
    }
  }
}
if ($jobs.Count -eq 0) { throw 'No screenshot jobs; check -Cases / -Themes / -Widths.' }

if ($DryRun) {
  Write-Host ("Dry run: {0} screenshot job(s); Chrome NOT invoked." -f $jobs.Count)
  $jobs | Format-Table Name, Width, Height, Url -AutoSize | Out-String | Write-Host
  exit 0
}

Write-Host ("Predicter preview screenshots: {0} runs -> {1}" -f $jobs.Count, $OutDir)
Write-Host ("Chrome: {0}" -f $ChromePath)
Write-Host ("URL:    {0}" -f $baseUrl)
Write-Host ''

# ---------------------------------------------------------------------------
# Run
# ---------------------------------------------------------------------------
$results = New-Object System.Collections.ArrayList
$failures = New-Object System.Collections.ArrayList
$index = 0
$sharedProfileDir = Join-Path $stageDir 'profile'

foreach ($job in $jobs) {
  $index++
  if ($ReuseProfile) {
    $profileDir = $sharedProfileDir
  } else {
    $profileDir = Join-Path $stageDir ('profile-' + $index)
  }
  $shotTemp = Join-Path $stageDir ($job.Name + '.png')
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
    '--disable-breakpad',
    '--disable-component-update',
    '--disable-default-apps',
    '--enable-logging=stderr',
    '--log-level=0',
    ('--user-data-dir=' + $profileDir),
    ('--window-size=' + $job.Width + ',' + $job.Height),
    ('--screenshot=' + $shotTemp),
    ('--virtual-time-budget=' + $VirtualTimeBudgetMs)
  )
  if (-not $NoDom) { $chromeArgs += '--dump-dom' }
  if ($ReducedMotion) { $chromeArgs += '--force-prefers-reduced-motion' }
  $chromeArgs += $job.Url

  $status = 'OK'
  $detail = ''
  $pngBytes = 0
  $title = ''
  $level = ''
  $consoleErrors = 0
  $domBytes = 0
  $rendererMissing = $false

  try {
    if ($ReuseProfile) {
      # Clear stale singleton locks from a previous (already exited) run.
      if (Test-Path -LiteralPath $profileDir) {
        Get-ChildItem -LiteralPath $profileDir -Filter 'Singleton*' -Force -ErrorAction SilentlyContinue |
          Remove-Item -Force -ErrorAction SilentlyContinue
      }
    } else {
      Remove-Item -LiteralPath $profileDir -Recurse -Force -ErrorAction SilentlyContinue
    }

    $runStopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    # Clear helpers left over by the previous run before reusing the profile.
    if ($KillHelpers) { $null = Stop-StageChromeProcesses -Marker $stageDir -WaitMs 200 }
    $proc = Start-Process -FilePath $ChromePath `
      -ArgumentList $chromeArgs `
      -PassThru `
      -WindowStyle Hidden `
      -RedirectStandardOutput $stdoutTemp `
      -RedirectStandardError $stderrTemp

    $exited = $proc.WaitForExit($TimeoutSeconds * 1000)
    if (-not $exited) {
      try { $proc.Kill() } catch { }
      $status = 'FAIL'
      $detail = ('timeout after {0}s' -f $TimeoutSeconds)
    }
    # Browser is done (or was killed); release crashpad/utility children so the
    # profile lock and the redirected handles are free before we touch artifacts.
    if ($KillHelpers) { $null = Stop-StageChromeProcesses -Marker $stageDir -WaitMs 250 }

    # --- screenshot ---
    if ((Test-Path -LiteralPath $shotTemp)) {
      $pngBytes = (Get-Item -LiteralPath $shotTemp).Length
      if ($pngBytes -lt 1024) {
        if ($status -eq 'OK') { $status = 'FAIL'; $detail = 'screenshot too small' }
      }
    } elseif ($status -eq 'OK') {
      $status = 'FAIL'
      $detail = 'screenshot not written'
    }

    # --- DOM dump: title / status level / renderer-missing marker ---
    if (-not $NoDom) {
      if (Test-Path -LiteralPath $stdoutTemp) {
        $domBytes = (Get-Item -LiteralPath $stdoutTemp).Length
        if ($domBytes -gt 0) {
          $dom = Get-Content -LiteralPath $stdoutTemp -Raw -Encoding UTF8
          $titleMatch = [regex]::Match($dom, '<title>(.*?)</title>', 'Singleline,IgnoreCase')
          if ($titleMatch.Success) {
            $title = [System.Net.WebUtility]::HtmlDecode($titleMatch.Groups[1].Value).Trim()
          }
          $levelMatch = [regex]::Match($dom, 'id="pvr-status"[^>]*data-level="([^"]+)"')
          if (-not $levelMatch.Success) {
            $levelMatch = [regex]::Match($dom, 'data-level="([^"]+)"[^>]*id="pvr-status"')
          }
          if ($levelMatch.Success) { $level = $levelMatch.Groups[1].Value }
          $rendererMissing = $dom -match 'predictor-view\.js is not available yet'
          $domName = 'dom-' + $job.Name + '.html'
          $null = Move-Artifact -Source $stdoutTemp -Destination (Join-Path $OutDir $domName)
        }
      }
    }

    # --- console / stderr log: count real JS errors ---
    if (Test-Path -LiteralPath $stderrTemp) {
      $consoleLines = @()
      try { $consoleLines = @(Get-Content -LiteralPath $stderrTemp -ErrorAction SilentlyContinue) } catch { }
      $consoleErrors = @($consoleLines | Where-Object {
          $_ -match '(ERROR|SEVERE|FATAL):CONSOLE' -or
          $_ -match 'Uncaught (TypeError|ReferenceError|SyntaxError|RangeError|Error)'
        }).Count
      if (-not $NoConsole) {
        $null = Move-Artifact -Source $stderrTemp -Destination (Join-Path $OutDir ('console-' + $job.Name + '.log'))
      }
    }

    # --- move PNG into the (space-containing) shots dir last ---
    if (Test-Path -LiteralPath $shotTemp) {
      $movedShot = Move-Artifact -Source $shotTemp -Destination (Join-Path $OutDir ($job.Name + '.png'))
      if (-not $movedShot -and $status -eq 'OK') { $status = 'FAIL'; $detail = 'screenshot move failed' }
    }

    # Chrome sometimes writes every artifact and then refuses to exit (helper
    # shutdown hang). If the screenshot and DOM are complete, the run is usable.
    if ($detail -like 'timeout after*' -and $pngBytes -gt 1024 -and $domBytes -gt 0) {
      $status = 'OK'
      $detail = 'artifacts complete; Chrome hung on shutdown'
    }
    $runStopwatch.Stop()
  } catch {
    if ($runStopwatch) { $runStopwatch.Stop() }
    $status = 'FAIL'
    $detail = $_.Exception.Message
  } finally {
    if (-not $ReuseProfile -and -not $KeepProfile -and (Test-Path -LiteralPath $profileDir)) {
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

  $pngKb = [math]::Round($pngBytes / 1KB)
  $results += [pscustomobject]@{
    Name          = $job.Name
    Case          = $job.Case
    Theme         = $job.Theme
    Width         = $job.Width
    PngKB         = $pngKb
    Title         = $title
    Level         = $level
    ConsoleErrors = $consoleErrors
    RendererState = if ($rendererMissing) { 'missing' } else { 'present' }
    ElapsedSec    = if ($runStopwatch) { [math]::Round($runStopwatch.Elapsed.TotalSeconds, 1) } else { 0 }
    Status        = $status
    Detail        = $detail
  }
  if ($status -ne 'OK') { $failures += $job.Name }

  $line = '[{0}/{1}] {2} ... {3} ({4}s)' -f $index, $jobs.Count, $job.Name, $status, $(if ($runStopwatch) { [math]::Round($runStopwatch.Elapsed.TotalSeconds, 1) } else { 0 })
  if ($detail) { $line += ' (' + $detail + ')' }
  Write-Host $line
}

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
if (-not $KeepProfile) {
  Remove-Item -LiteralPath $stageDir -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host ''
Write-Host '--- Predicter preview screenshot summary ---'
$results | Format-Table Name, Width, PngKB, Title, Level, ConsoleErrors, ElapsedSec, Status -AutoSize | Out-String | Write-Host

$rendererStates = ($results | Group-Object RendererState | ForEach-Object { '{0}={1}' -f $_.Name, $_.Count }) -join ', '
$totalConsoleErrors = ($results | Measure-Object -Property ConsoleErrors -Sum).Sum
if ($null -eq $totalConsoleErrors) { $totalConsoleErrors = 0 }
Write-Host ("Shots: {0}  Failures: {1}  ConsoleErrors: {2}  Renderer: {3}" -f $results.Count, $failures.Count, $totalConsoleErrors, $rendererStates)
Write-Host ("Artifacts: {0}" -f $OutDir)

if ($failures.Count -gt 0) {
  Write-Host ("FAILED runs: {0}" -f ($failures -join ', '))
  exit 1
}
exit 0
