$out = 'C:\xampp\htdocs\projects\namhastro.com\docs\screenshots\step13'
$brainDir = 'C:\Users\ROSHAN BHARDWAJ\.gemini\antigravity\brain\f06909b2-0061-4665-92b9-e1d22bbc4166'
$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'

if (!(Test-Path $out)) {
  New-Item -ItemType Directory -Force -Path $out | Out-Null
}

$shots = @(
  @{ name = 'step13-01-homepage-desktop.png'; size = '1440,900'; url = 'http://127.0.0.1:3000/' },
  @{ name = 'step13-02-homepage-mobile.png'; size = '390,844'; url = 'http://127.0.0.1:3000/' },
  @{ name = 'step13-03-janam-kundli-calculator.png'; size = '1440,900'; url = 'http://127.0.0.1:3000/kundli' },
  @{ name = 'step13-04-daily-horoscope.png'; size = '1440,900'; url = 'http://127.0.0.1:3000/horoscope' },
  @{ name = 'step13-05-today-panchang.png'; size = '1440,900'; url = 'http://127.0.0.1:3000/panchang' },
  @{ name = 'step13-06-astrologers-directory.png'; size = '1440,900'; url = 'http://127.0.0.1:3000/astrologers' },
  @{ name = 'step13-07-about-us-heritage.png'; size = '1440,900'; url = 'http://127.0.0.1:3000/about' },
  @{ name = 'step13-08-contact-24x7-support.png'; size = '1440,900'; url = 'http://127.0.0.1:3000/contact' },
  @{ name = 'step13-09-faq-knowledge-centre.png'; size = '1440,900'; url = 'http://127.0.0.1:3000/faq' },
  @{ name = 'step13-10-terms-of-service.png'; size = '1440,900'; url = 'http://127.0.0.1:3000/terms' },
  @{ name = 'step13-11-privacy-policy.png'; size = '1440,900'; url = 'http://127.0.0.1:3000/privacy' },
  @{ name = 'step13-12-refund-billing-policy.png'; size = '1440,900'; url = 'http://127.0.0.1:3000/refund-policy' },
  @{ name = 'step13-13-devotee-login-portal.png'; size = '1440,900'; url = 'http://127.0.0.1:3000/login' },
  @{ name = 'step13-14-customer-dashboard.png'; size = '1440,900'; url = 'http://127.0.0.1:3000/account' },
  @{ name = 'step13-15-puja-marketplace.png'; size = '1440,900'; url = 'http://127.0.0.1:3000/puja' },
  @{ name = 'step13-16-super-admin-overview.png'; size = '1440,900'; url = 'http://127.0.0.1:3000/admin' }
)

$i = 1300
foreach ($s in $shots) {
  $targetPath = Join-Path $out $s.name
  $tempProfile = "C:\Windows\Temp\namh-step13-$i"
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

  if (Test-Path $targetPath) {
    Copy-Item $targetPath $brainDir -Force
  }
  $i++
}

Get-ChildItem -Path $out | Select-Object Name, Length
