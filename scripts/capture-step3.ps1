$out = 'C:\xampp\htdocs\projects\namhastro.com\docs\screenshots\step3'
$brainDir = 'C:\Users\ROSHAN BHARDWAJ\.gemini\antigravity\brain\f06909b2-0061-4665-92b9-e1d22bbc4166'
$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'

if (!(Test-Path $out)) {
  New-Item -ItemType Directory -Force -Path $out | Out-Null
}

$shots = @(
  @{ name = '01-desktop-account-overview.png'; size = '1440,900'; url = 'http://127.0.0.1:3000/account' },
  @{ name = '02-mobile-account.png'; size = '390,844'; url = 'http://127.0.0.1:3000/account' },
  @{ name = '03-astrologers-directory-live.png'; size = '1440,900'; url = 'http://127.0.0.1:3000/astrologers' },
  @{ name = '04-astrologer-profile-live.png'; size = '1440,900'; url = 'http://127.0.0.1:3000/astrologer/acharya-raghavendra-sharma' },
  @{ name = '05-wallet-recharge-live.png'; size = '1440,900'; url = 'http://127.0.0.1:3000/account/wallet' }
)

$i = 300
foreach ($s in $shots) {
  $targetPath = Join-Path $out $s.name
  $tempProfile = "C:\Windows\Temp\namh-step3-$i"
  Start-Process -FilePath $chrome -ArgumentList @(
    '--headless=new',
    '--no-first-run',
    '--disable-gpu',
    "--user-data-dir=$tempProfile",
    '--virtual-time-budget=3000',
    "--window-size=$($s.size)",
    "--screenshot=$targetPath",
    $s.url
  ) -Wait

  Copy-Item $targetPath $brainDir -Force
  $i++
}

Get-ChildItem -Path $out | Select-Object Name, Length
