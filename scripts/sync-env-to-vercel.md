# Sync .env to Vercel via CLI

Run this from the project root whenever you update `.env` and want to push all values to Vercel across all three environments (production, preview, development).

## Prerequisites

- Vercel CLI installed: `npm i -g vercel`
- Logged in: `vercel login`
- Project linked (run `vercel link` once if not already done)

## Command

```powershell
$ErrorActionPreference='Stop'; $targets=@('production','preview','development'); $updated=0; Get-Content .env | ForEach-Object { $line=$_.Trim(); if ($line -eq '' -or $line.StartsWith('#')) { return }; if ($line -notmatch '^[A-Za-z_][A-Za-z0-9_]*\s*=') { return }; $parts=$line -split '=',2; $key=$parts[0].Trim(); $value=$parts[1].Trim(); if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) { if ($value.Length -ge 2) { $value=$value.Substring(1,$value.Length-2) } }; foreach ($target in $targets) { vercel env add $key $target --value "$value" --force --yes --non-interactive | Out-Null; $updated++ } }; Write-Output "Updated $updated env entries across $($targets.Count) environments."
```

## What it does

- Reads every non-comment key=value line from `.env`
- Strips surrounding quotes from values
- Pushes each key to production, preview, and development using `--force` (overwrites existing)
- Skips blank lines and `#` comments

## Verify after running

```powershell
vercel env ls production
vercel env ls preview
vercel env ls development
```

## Notes

- `NEXT_PUBLIC_*` variables will show a warning from Vercel that they are visible to site visitors — this is expected and fine for public client IDs.
- After pushing env changes, redeploy so the running deployment picks them up: `vercel --prod`
