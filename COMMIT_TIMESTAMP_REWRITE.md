# Commit Timestamp Rewrite Playbook

This guide rewrites commit dates on `main` while preserving author name/email.

It does all of the following:
- Creates a backup branch first.
- Spreads commits from a start date to an end date.
- Allows excluded dates.
- Assigns at most one commit per used day.
- Rewrites only `GIT_AUTHOR_DATE` and `GIT_COMMITTER_DATE`.

## 1) Save this PowerShell script

Create `rewrite-commit-dates.ps1` in your target repo and paste:

```powershell
param(
  [string]$Branch = "main",
  [string]$StartDate = "2026-01-01",
  [string]$EndDate = (Get-Date).ToString("yyyy-MM-dd"),
  [string[]]$ExcludedDates = @(
    "2026-01-02",
    "2026-01-10",
    "2026-02-06",
    "2026-02-10",
    "2026-03-23",
    "2026-03-24",
    "2026-03-25"
  )
)

$ErrorActionPreference = "Stop"

function To-UnixPath([string]$p) {
  return ($p -replace "\\", "/")
}

Write-Host "Checking repository..."
git rev-parse --is-inside-work-tree *> $null
if ($LASTEXITCODE -ne 0) {
  throw "Not inside a git repository."
}

Write-Host "Checking out branch $Branch..."
git checkout $Branch
if ($LASTEXITCODE -ne 0) {
  throw "Failed to checkout branch $Branch."
}

$backupBranch = "backup/pre-rewrite-" + (Get-Date -Format "yyyyMMdd-HHmmss")
Write-Host "Creating backup branch $backupBranch..."
git branch $backupBranch

Write-Host "Collecting commits from $Branch..."
$commits = @(git rev-list --reverse $Branch)
if ($commits.Count -eq 0) {
  throw "No commits found on branch $Branch."
}

$start = [datetime]$StartDate
$end = [datetime]$EndDate

if ($end -lt $start) {
  throw "EndDate must be on or after StartDate."
}

Write-Host "Building allowed date list..."
$allowedDates = @()
for ($d = $start; $d -le $end; $d = $d.AddDays(1)) {
  $ds = $d.ToString("yyyy-MM-dd")
  if ($ExcludedDates -notcontains $ds) {
    $allowedDates += $d
  }
}

if ($allowedDates.Count -lt $commits.Count) {
  throw "Not enough allowed dates ($($allowedDates.Count)) for commits ($($commits.Count))."
}

Write-Host "Generating commit-to-date mapping..."
$map = @()
$k = $commits.Count
$n = $allowedDates.Count

for ($i = 0; $i -lt $k; $i++) {
  if ($k -eq 1) {
    $idx = 0
  } else {
    $idx = [int][math]::Round($i * ($n - 1) / ($k - 1))
  }
  $dateStr = $allowedDates[$idx].ToString("yyyy-MM-dd") + "T12:00:00"
  $map += [pscustomobject]@{
    Commit = $commits[$i]
    Date   = $dateStr
  }
}

Write-Host "Preparing env-filter script..."
$envScript = Join-Path (Get-Location) ".git-date-env.sh"
$unixEnvScript = To-UnixPath (Resolve-Path $envScript)

$lines = @()
$lines += "case `"`$GIT_COMMIT`" in"
foreach ($row in $map) {
  $lines += "  $($row.Commit))"
  $lines += "    export GIT_AUTHOR_DATE=`"$($row.Date)`""
  $lines += "    export GIT_COMMITTER_DATE=`"$($row.Date)`""
  $lines += "    ;;"
}
$lines += "esac"

[System.IO.File]::WriteAllText($envScript, ($lines -join "`n"), (New-Object System.Text.UTF8Encoding($false)))

Write-Host "Rewriting timestamps on $Branch..."
$oldWarning = $env:FILTER_BRANCH_SQUELCH_WARNING
$env:FILTER_BRANCH_SQUELCH_WARNING = "1"

try {
  git filter-branch -f --env-filter ". '$unixEnvScript'" -- $Branch
  if ($LASTEXITCODE -ne 0) {
    throw "git filter-branch failed."
  }
}
finally {
  if ($null -eq $oldWarning) {
    Remove-Item Env:FILTER_BRANCH_SQUELCH_WARNING -ErrorAction SilentlyContinue
  } else {
    $env:FILTER_BRANCH_SQUELCH_WARNING = $oldWarning
  }
  Remove-Item -Force $envScript -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "Done."
Write-Host "Backup branch: $backupBranch"
Write-Host "Identity unchanged: only dates were rewritten."
Write-Host ""
Write-Host "Quick verify:"
Write-Host "  git log --reverse --date=short --format=\"%h | %ad | %an | %ae\" $Branch"
Write-Host ""
Write-Host "If you need remote updated:"
Write-Host "  git push --force-with-lease origin $Branch"
```

## 2) Run it

From the target repo:

```powershell
powershell -ExecutionPolicy Bypass -File .\rewrite-commit-dates.ps1
```

Optional custom run:

```powershell
powershell -ExecutionPolicy Bypass -File .\rewrite-commit-dates.ps1 `
  -Branch main `
  -StartDate 2026-01-01 `
  -EndDate 2026-03-25 `
  -ExcludedDates 2026-01-02,2026-01-10,2026-02-06,2026-02-10,2026-03-23,2026-03-24,2026-03-25
```

## 3) Verify before push

```powershell
git log --reverse --date=short --format="%h | %ad | %an | %ae" main
```

Check that:
- Dates are spread across your target window.
- Excluded dates do not appear.
- Name/email are unchanged.

## 4) Push rewritten history

```powershell
git push --force-with-lease origin main
```

## Keep this file uncommitted

If you want this file ignored locally in this repo:

```powershell
Add-Content .git/info/exclude "COMMIT_TIMESTAMP_REWRITE.md"
```

That keeps it out of commits without modifying tracked `.gitignore`.
