# Упаковка PWA-пакета любого проекта воркспейса.
#
# ВАЖНО: паковать ТОЛЬКО этим скриптом. Compress-Archive и
# [ZipFile]::CreateFromDirectory в PowerShell 5.1 пишут имена записей zip
# с ОБРАТНЫМИ слэшами (assets\index.js). Анпакеры хостингов (Netlify) не
# распознают их как папки: на сайте нет /assets/* -> 404 -> БЕЛЫЙ ЭКРАН.
# Здесь имена записей задаются явно с прямыми слэшами (стандарт ZIP),
# в конце — самопроверка: ни одного бэкслеша.
#
# Использование:
#   powershell -File scripts\pwa\pack-pwa.ps1 -ProjectDir artifacts\KAS-buh
#   (или npm run pwa:pack из папки проекта)
param(
  [string]$ProjectDir = ".",
  [string]$BuildDir = "build",
  [string]$OutDir = ""
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$proj = (Resolve-Path $ProjectDir).Path
$name = (Split-Path -Leaf $proj).ToLower()
$ver = (Get-Content (Join-Path $proj 'package.json') -Raw | ConvertFrom-Json).version

# корень воркспейса: <root>\scripts\pwa\pack-pwa.ps1
$root = Split-Path (Split-Path $PSScriptRoot)
if (-not $OutDir) { $OutDir = Join-Path $root 'downloads' }
$dst = Join-Path $OutDir "$name-pwa-$ver.zip"

$buildPath = Join-Path $proj $BuildDir
if (-not (Test-Path $buildPath)) {
  throw "Нет папки $BuildDir в $proj — сначала выполните npm run build"
}

# README из шаблона с подстановкой имени и версии
$readmeTmp = Join-Path $PSScriptRoot 'README-PWA.template.txt'
$readmeFile = $null
if (Test-Path $readmeTmp) {
  $readmeFile = Join-Path $env:TEMP "README-PWA-$name-$ver.txt"
  (Get-Content $readmeTmp -Raw -Encoding UTF8).Replace('{NAME}', $name).Replace('{VERSION}', $ver) |
    Set-Content $readmeFile -Encoding UTF8 -NoNewline
}

if (Test-Path $dst) { Remove-Item $dst -Force }
$fs = [System.IO.File]::Open($dst, 'Create')
$zip = New-Object System.IO.Compression.ZipArchive($fs, [System.IO.Compression.ZipArchiveMode]::Create)
$broot = (Resolve-Path $buildPath).Path
Get-ChildItem $buildPath -Recurse -File | ForEach-Object {
  $rel = $_.FullName.Substring($broot.Length + 1).Replace('\', '/')
  [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, $rel) | Out-Null
}
if ($readmeFile) {
  [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $readmeFile, 'README-PWA.txt') | Out-Null
}
$zip.Dispose()
$fs.Dispose()

# Самопроверка: ни одного бэкслеша в именах записей
$z = [System.IO.Compression.ZipFile]::OpenRead($dst)
$bad = @($z.Entries | Where-Object { $_.FullName -like '*\*' }).Count
$total = $z.Entries.Count
$z.Dispose()
if ($bad -gt 0) { throw "В zip найдены записи с бэкслэшами: $bad — такой пакет даст белый экран на хостинге!" }
Write-Output "OK: $dst | записей: $total | бэкслешей: 0 | проект: $name | версия: $ver"
