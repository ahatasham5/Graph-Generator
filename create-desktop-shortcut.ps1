param(
    [Parameter(Mandatory = $true)]
    [string]$Target,

    [string]$Name = "GraphForge"
)

$targetPath = (Resolve-Path -LiteralPath $Target).Path
$desktop = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktop "$Name.lnk"
$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $targetPath
$shortcut.WorkingDirectory = Split-Path -Parent $targetPath
$shortcut.Description = "Start GraphForge"
$shortcut.IconLocation = "$env:SystemRoot\System32\shell32.dll,220"
$shortcut.Save()

Write-Host "Created shortcut: $shortcutPath"
