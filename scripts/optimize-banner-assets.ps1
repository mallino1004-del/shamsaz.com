Add-Type -AssemblyName System.Drawing
$bannerDirectory = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../public/assets/banners'))
$jpegEncoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
foreach ($bannerFile in Get-ChildItem -LiteralPath $bannerDirectory -Filter '*.png' -File) {
  $destination = [System.IO.Path]::ChangeExtension($bannerFile.FullName, '.jpg')
  if (Test-Path -LiteralPath $destination) { continue }
  $bitmap = [System.Drawing.Image]::FromFile($bannerFile.FullName)
  $encoding = New-Object System.Drawing.Imaging.EncoderParameters(1)
  $encoding.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]86)
  try { $bitmap.Save($destination, $jpegEncoder, $encoding) } finally { $encoding.Dispose(); $bitmap.Dispose() }
}
$originalSize = (Get-ChildItem -LiteralPath $bannerDirectory -Filter '*.png' -File | Measure-Object -Property Length -Sum).Sum
$delivery = Get-ChildItem -LiteralPath $bannerDirectory -Filter '*.jpg' -File
$deliverySize = ($delivery | Measure-Object -Property Length -Sum).Sum
Write-Output ('Prepared {0} JPEG delivery assets: {1:N2} MB; original PNG assets preserved: {2:N2} MB' -f $delivery.Count, ($deliverySize/1MB), ($originalSize/1MB))
