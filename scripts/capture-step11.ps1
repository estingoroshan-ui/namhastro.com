$out = 'C:\xampp\htdocs\projects\namhastro.com\docs\screenshots\step11'
$brainDir = 'C:\Users\ROSHAN BHARDWAJ\.gemini\antigravity\brain\f06909b2-0061-4665-92b9-e1d22bbc4166'
$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'

if (!(Test-Path $out)) {
  New-Item -ItemType Directory -Force -Path $out | Out-Null
}

$shots = @(
  @{ name = 'step11-master-dashboard.png'; size = '1440,900'; url = 'http://127.0.0.1:3000/admin?tab=dashboard' },
  @{ name = 'step11-advanced-analytics.png'; size = '1440,900'; url = 'http://127.0.0.1:3000/admin?tab=analytics' },
  @{ name = 'step11-customer-crm.png'; size = '1440,900'; url = 'http://127.0.0.1:3000/admin?tab=customer-crm' },
  @{ name = 'step11-sales-lead-pipeline.png'; size = '1440,900'; url = 'http://127.0.0.1:3000/admin?tab=sales-crm' },
  @{ name = 'step11-live-consultations.png'; size = '1440,900'; url = 'http://127.0.0.1:3000/admin?tab=live-operations' },
  @{ name = 'step11-staff-management.png'; size = '1440,900'; url = 'http://127.0.0.1:3000/admin?tab=staff-management' },
  @{ name = 'step11-departments-structure.png'; size = '1440,900'; url = 'http://127.0.0.1:3000/admin?tab=departments' },
  @{ name = 'step11-roles-permissions.png'; size = '1440,900'; url = 'http://127.0.0.1:3000/admin?tab=roles-permissions' },
  @{ name = 'step11-support-tickets.png'; size = '1440,900'; url = 'http://127.0.0.1:3000/admin?tab=support-tickets' },
  @{ name = 'step11-complaints-disputes.png'; size = '1440,900'; url = 'http://127.0.0.1:3000/admin?tab=complaints-disputes' },
  @{ name = 'step11-system-health.png'; size = '1440,900'; url = 'http://127.0.0.1:3000/admin?tab=system-health' },
  @{ name = 'step11-admin-mobile.png'; size = '390,844'; url = 'http://127.0.0.1:3000/admin?tab=dashboard' }
)

$i = 1100
foreach ($s in $shots) {
  $targetPath = Join-Path $out $s.name
  $tempProfile = "C:\Windows\Temp\namh-step11-$i"
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
