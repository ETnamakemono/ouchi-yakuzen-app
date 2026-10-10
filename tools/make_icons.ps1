# Generate app icons: powershell -File toolsmake_icons.ps1
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent $PSScriptRoot
$out = Join-Path $root 'icons'
New-Item -ItemType Directory -Force $out | Out-Null

function Draw-Icon([int]$size, [string]$path, [double]$pad) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $g.Clear([System.Drawing.ColorTranslator]::FromHtml('#7a9a5a'))
  $s = $size * (1 - 2 * $pad) / 100.0
  $o = $size * $pad
  function P([double]$x, [double]$y) { New-Object System.Drawing.PointF ([float]($o + $x * $s)), ([float]($o + $y * $s)) }
  $cream = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml('#f7f3ea'))
  $kaki = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml('#d9822b'))
  $soup = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml('#f3d9a6'))
  $pen = New-Object System.Drawing.Pen ([System.Drawing.ColorTranslator]::FromHtml('#f7f3ea')), ([float](4.5 * $s))
  $pen.StartCap = 'Round'; $pen.EndCap = 'Round'
  # steam
  foreach ($dx in @(-14, 0, 14)) {
    $pts = @((P (50 + $dx) 40), (P (45 + $dx) 32), (P (55 + $dx) 24), (P (50 + $dx) 16))
    $g.DrawCurve($pen, [System.Drawing.PointF[]]$pts)
  }
  # bowl
  $path2 = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path2.AddArc([float]($o + 16 * $s), [float]($o + 30 * $s), [float](68 * $s), [float](56 * $s), 0, 180)
  $g.FillPath($cream, $path2)
  $g.FillEllipse($cream, [float]($o + 14 * $s), [float]($o + 47 * $s), [float](72 * $s), [float](20 * $s))
  $g.FillEllipse($soup, [float]($o + 19 * $s), [float]($o + 50 * $s), [float](62 * $s), [float](14 * $s))
  $g.FillEllipse($kaki, [float]($o + 40 * $s), [float]($o + 53 * $s), [float](9 * $s), [float](6 * $s))
  $g.FillRectangle($cream, [float]($o + 38 * $s), [float]($o + 82 * $s), [float](24 * $s), [float](5 * $s))
  # leaf
  $leaf = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml('#5d7d42'))
  $g.FillEllipse($leaf, [float]($o + 54 * $s), [float]($o + 53 * $s), [float](12 * $s), [float](6 * $s))
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose()
}

Draw-Icon 192 (Join-Path $out 'icon-192.png') 0.08
Draw-Icon 512 (Join-Path $out 'icon-512.png') 0.08
Draw-Icon 512 (Join-Path $out 'icon-maskable-512.png') 0.2
Write-Output 'icons created'
