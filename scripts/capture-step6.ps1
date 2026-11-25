$out = 'C:\xampp\htdocs\projects\namhastro.com\docs\screenshots\step6'
$brainDir = 'C:\Users\ROSHAN BHARDWAJ\.gemini\antigravity\brain\f06909b2-0061-4665-92b9-e1d22bbc4166'
$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'

if (!(Test-Path $out)) {
  New-Item -ItemType Directory -Force -Path $out | Out-Null
}

$shots = @(
  @{ name = 'step6-customer-chat-live.png'; size = '1440,900'; url = 'http://127.0.0.1:3000/consultation/chat?id=demo-step6&role=customer' },
  @{ name = 'step6-astrologer-chat-live.png'; size = '1440,900'; url = 'http://127.0.0.1:3000/consultation/chat?id=demo-step6&role=astrologer' },
  @{ name = 'step6-admin-live-control.png'; size = '1440,900'; url = 'http://127.0.0.1:3000/admin' },
  @{ name = 'step6-chat-mobile.png'; size = '390,844'; url = 'http://127.0.0.1:3000/consultation/chat?id=demo-step6&role=customer' }
)

$i = 600
foreach ($s in $shots) {
  $targetPath = Join-Path $out $s.name
  $tempProfile = "C:\Windows\Temp\namh-step6-$i"
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
