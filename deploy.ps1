# Run after: gh auth login
# Creates repo, pushes code, and enables GitHub Pages (Actions)

$ErrorActionPreference = "Stop"
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")

Set-Location $PSScriptRoot

gh auth status
if ($LASTEXITCODE -ne 0) {
    Write-Host "Not logged in. Run: gh auth login" -ForegroundColor Yellow
    exit 1
}

$repo = "Sachini88/little-bit-of-heaven"

if (-not (git remote get-url origin 2>$null)) {
    gh repo create $repo --public --source=. --remote=origin --description "Showcase site for Little Bit of Heaven pottery shop, Cranbourne VIC"
} else {
    git push -u origin main
}

gh api "repos/$repo/pages" -X PUT -f build_type=workflow 2>$null
if ($LASTEXITCODE -ne 0) {
    gh api "repos/$repo/pages" -X POST -f build_type=workflow
}

Write-Host ""
Write-Host "Done! Site will be live at:" -ForegroundColor Green
Write-Host "https://sachini88.github.io/little-bit-of-heaven/" -ForegroundColor Cyan
Write-Host "Check deployment: https://github.com/$repo/actions" -ForegroundColor Gray
