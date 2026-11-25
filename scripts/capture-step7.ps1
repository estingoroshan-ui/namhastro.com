$out = 'C:\xampp\htdocs\projects\namhastro.com\docs\screenshots\step7'
$brainDir = 'C:\Users\ROSHAN BHARDWAJ\.gemini\antigravity\brain\f06909b2-0061-4665-92b9-e1d22bbc4166'
$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'

if (!(Test-Path $out)) {
  New-Item -ItemType Directory -Force -Path $out | Out-Null
}

$shots = @(
  @{ name = 'step7-audio-call-live.png'; size = '1440,900'; url = 'http://127.0.0.1:3000/consultation/call?id=demo-step7&role=customer&type=audio' },
  @{ name = 'step7-video-call-live.png'; size = '1440,900'; url = 'http://127.0.0.1:3000/consultation/call?id=demo-step7&role=customer&type=video' },
  @{ name = 'step7-incoming-call.png'; size = '1440,900'; url = 'http://127.0.0.1:3000/partner' },
  @{ name = 'step7-admin-live-calling.png'; size = '1440,900'; url = 'http://127.0.0.1:3000/admin' },
  @{ name = 'step7-call-mobile.png'; size = '390,844'; url = 'http://127.0.0.1:3000/consultation/call?id=demo-step7&role=customer&type=audio' }
)

$i = 700
foreach ($s in $shots) {
  $targetPath = Join-Path $out $s.name
  $tempProfile = "C:\Windows\Temp\namh-step7-$i"
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
