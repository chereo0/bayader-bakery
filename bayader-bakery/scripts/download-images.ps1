<#
Downloads placeholder bakery images into src/assets using Unsplash source images.
Run from project root (PowerShell):
  .\scripts\download-images.ps1

This script uses source.unsplash.com queries so the exact image may vary.
#>

$dest = Join-Path -Path $PSScriptRoot -ChildPath "..\src\assets" | Resolve-Path -Relative
if (-not (Test-Path $dest)) {
    New-Item -ItemType Directory -Path $dest -Force | Out-Null
}

$map = @{
    # hero.jpg intentionally omitted; use public/images/bg.png as the primary background
    'about.jpg'   = 'https://source.unsplash.com/1200x800/?hands,kneading,dough'
    'cakes.jpg'   = 'https://source.unsplash.com/800x600/?cake'
    'pastries.jpg'= 'https://source.unsplash.com/800x600/?pastry'
    'cookies.jpg' = 'https://source.unsplash.com/800x600/?cookies'
    'custom.jpg'  = 'https://source.unsplash.com/800x600/?custom,cake'
}

Write-Host "Downloading images to $dest ..."
foreach ($name in $map.Keys) {
    $url = $map[$name]
    $out = Join-Path $dest $name
    Write-Host " - $name from $url"
    try {
        Invoke-WebRequest -Uri $url -OutFile $out -UseBasicParsing -ErrorAction Stop
    }
    catch {
        Write-Warning "Failed to download $url : $_"
    }
}

Write-Host "Done. Check the files in src/assets/ and restart the dev server if running."
