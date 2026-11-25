$out = 'C:\xampp\htdocs\projects\namhastro.com\docs\screenshots\step4'
$brainDir = 'C:\Users\ROSHAN BHARDWAJ\.gemini\antigravity\brain\f06909b2-0061-4665-92b9-e1d22bbc4166'
$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'

if (!(Test-Path $out)) {
  New-Item -ItemType Directory -Force -Path $out | Out-Null
}

$shots = @(
  @{ name = 'step4-partner-portal-live.png'; size = '1440,900'; url = 'http://127.0.0.1:3000/partner' },
  @{ name = 'step4-partner-mobile.png'; size = '390,844'; url = 'http://127.0.0.1:3000/partner' },
  @{ name = 'step4-admin-portal-live.png'; size = '1440,900'; url = 'http://127.0.0.1:3000/admin' }
)

$i = 400
foreach ($s in $shots) {
  $targetPath = Join-Path $out $s.name
  $tempProfile = "C:\Windows\Temp\namh-step4-$i"
  Start-Process -FilePath $chrome -ArgumentList @(
    '--headless=new',
    '--no-first-run',
    '--disable-gpu',
    "--user-data-dir=$tempProfile",
    '--virtual-time-budget=4000',
    "--window-size=$($s.size)",
    "--screenshot=$targetPath",
    $s.url
  ) -Wait

  Copy-Item $targetPath $brainDir -Force
  $i++
}

Get-ChildItem -Path $out | Select-Object Name, Length
