$out = 'C:\xampp\htdocs\projects\namhastro.com\docs\screenshots\step8'
$brainDir = 'C:\Users\ROSHAN BHARDWAJ\.gemini\antigravity\brain\f06909b2-0061-4665-92b9-e1d22bbc4166'
$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'

if (!(Test-Path $out)) {
  New-Item -ItemType Directory -Force -Path $out | Out-Null
}

$shots = @(
  @{ name = 'step8-astrologer-earnings.png'; size = '1440,900'; url = 'http://127.0.0.1:3000/partner?demo=1&tab=earnings' },
  @{ name = 'step8-withdrawal-modal.png'; size = '1440,900'; url = 'http://127.0.0.1:3000/partner?demo=1&tab=earnings&withdrawModal=1' },
  @{ name = 'step8-admin-finance-dashboard.png'; size = '1440,900'; url = 'http://127.0.0.1:3000/admin?demo=1&tab=commission' },
  @{ name = 'step8-settlement-batches.png'; size = '1440,900'; url = 'http://127.0.0.1:3000/admin?demo=1&tab=settlements' },
  @{ name = 'step8-profit-and-loss.png'; size = '1440,900'; url = 'http://127.0.0.1:3000/admin?demo=1&tab=pnl' }
)

$i = 800
foreach ($s in $shots) {
  $targetPath = Join-Path $out $s.name
  $tempProfile = "C:\Windows\Temp\namh-step8-$i"
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
