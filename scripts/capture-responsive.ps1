$out = 'C:\xampp\htdocs\projects\namhastro.com\docs\screenshots\v2'
$brainDir = 'C:\Users\ROSHAN BHARDWAJ\.gemini\antigravity\brain\f06909b2-0061-4665-92b9-e1d22bbc4166'
$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'

$shots = @(
  @{ name = 'resp-1920.png'; size = '1920,1080' },
  @{ name = 'resp-1440.png'; size = '1440,900'  },
  @{ name = 'resp-1280.png'; size = '1280,800'  },
  @{ name = 'resp-1024.png'; size = '1024,768'  },
  @{ name = 'resp-768.png';  size = '768,1024'  },
  @{ name = 'resp-430.png';  size = '430,932'   },
  @{ name = 'resp-390.png';  size = '390,844'   },
  @{ name = 'resp-360.png';  size = '360,780'   }
)

$i = 100
foreach ($s in $shots) {
  $targetPath = Join-Path $out $s.name
  $tempProfile = "C:\Windows\Temp\namh-resp-$i"
  Start-Process -FilePath $chrome -ArgumentList @(
    '--headless=new',
    '--no-first-run',
    '--disable-gpu',
    "--user-data-dir=$tempProfile",
    '--virtual-time-budget=3000',
    "--window-size=$($s.size)",
    "--screenshot=$targetPath",
    'http://127.0.0.1:3000/'
  ) -Wait

  Copy-Item $targetPath $brainDir -Force
  $i++
}

Get-ChildItem -Path $out -Filter 'resp-*.png' | Select-Object Name, Length
