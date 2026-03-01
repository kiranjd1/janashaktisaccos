# Batch Update HTML Files to Use Dynamic Components
# This safer script updates HTML files by locating header/nav and footer blocks

param(
    [string[]]$FilestoUpdate = @(
        'contact.html', 'jobs.html', 'loans.html',
        'notice.html', 'reports.html', 'savings.html', 'admin/dashboard.html', 'admin/login.html'
    )
)

$ProjectRoot = $PSScriptRoot
$UpdateCount = 0

Write-Host "Starting dynamic component migration..."

foreach ($file in $FilestoUpdate) {
    $filePath = Join-Path $ProjectRoot $file
    if (-not (Test-Path $filePath)) {
        Write-Host "Skipping missing file: $file"
        continue
    }

    Write-Host "Processing: $file"
    $content = Get-Content $filePath -Raw -Encoding UTF8
    $original = $content

    # Replace header+nav by locating start of header and end of </nav>
    $hStart = $content.IndexOf('<header class="top-util-bar">')
    if ($hStart -ge 0) {
        $navEnd = $content.IndexOf('</nav>', $hStart)
        if ($navEnd -ge 0) {
            $navEnd = $navEnd + '</nav>'.Length
            $content = $content.Substring(0, $hStart) + '<div id="header-container"></div>' + $content.Substring($navEnd)
            Write-Host "  Header/Nav replaced"
        }
    }

    # Replace whole footer block
    $fStart = $content.IndexOf('<footer')
    if ($fStart -ge 0) {
        $fEnd = $content.IndexOf('</footer>', $fStart)
        if ($fEnd -ge 0) {
            $fEnd = $fEnd + '</footer>'.Length
            $content = $content.Substring(0, $fStart) + '<div id="footer-container"></div>' + $content.Substring($fEnd)
            Write-Host "  Footer replaced"
        }
    }

    # Ensure components loader script exists before script.js
    if ($content -match '<script[^>]*src="script\.js"') {
        $replacementScript = '<script src="components/components.js" defer></script>' + [Environment]::NewLine + '<script src="script.js" defer></script>'
        $content = $content -replace '<script[^>]*src="script\.js"[^>]*>\s*</script>', $replacementScript
        Write-Host "  Script references updated"
    }

    if ($content -ne $original) {
        Set-Content $filePath -Value $content -Encoding UTF8
        $UpdateCount++
        Write-Host "  File updated"
    } else {
        Write-Host "  No changes needed"
    }
}

Write-Host "\nMigration complete. Files updated: $UpdateCount"
