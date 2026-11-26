$out = 'C:\xampp\htdocs\projects\namhastro.com\docs\screenshots\step10'
$brainDir = 'C:\Users\ROSHAN BHARDWAJ\.gemini\antigravity\brain\f06909b2-0061-4665-92b9-e1d22bbc4166'
$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'

if (!(Test-Path $out)) {
  New-Item -ItemType Directory -Force -Path $out | Out-Null
}

$shots = @(
  @{ name = 'step10-puja-marketplace.png'; size = '1440,900'; url = 'http://127.0.0.1:3000/puja' },
  @{ name = 'step10-astro-store-desktop.png'; size = '1440,900'; url = 'http://127.0.0.1:3000/store' },
  @{ name = 'step10-cart-checkout.png'; size = '1440,900'; url = 'http://127.0.0.1:3000/cart' },
  @{ name = 'step10-pandit-dashboard.png'; size = '1440,900'; url = 'http://127.0.0.1:3000/pandit' },
  @{ name = 'step10-admin-puja-management.png'; size = '1440,900'; url = 'http://127.0.0.1:3000/admin?tab=puja-management' },
  @{ name = 'step10-admin-store-inventory.png'; size = '1440,900'; url = 'http://127.0.0.1:3000/admin?tab=store-management' },
  @{ name = 'step10-admin-marketing-coupons.png'; size = '1440,900'; url = 'http://127.0.0.1:3000/admin?tab=marketing-management' }
)

$i = 1000
foreach ($s in $shots) {
  $targetPath = Join-Path $out $s.name
  $tempProfile = "C:\Windows\Temp\namh-step10-$i"
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
