$images = @{
    "logo.png" = "https://api.removal.ai/download/g1/preview/420f9120-87d7-43b0-8854-5cf8e1e1840c.png"
    "pro-players/k1nG.png" = "https://specs.gg/assets/include/upload/image.php?name=k1nG&t=2026-02-08%2020:33:37"
    "pro-players/Fazer.png" = "https://specs.gg/assets/include/upload/image.php?name=Fazer&t=2026-02-08%2020:33:53"
    "pro-players/Tisco.png" = "https://specs.gg/assets/include/upload/image.php?name=Tisco&t=2026-02-08%2020:34:01"
    "pro-players/Phzin.png" = "https://specs.gg/assets/include/upload/image.php?name=Phzin&t=2026-02-08%2012:43:31"
    "pro-players/Cadu.png" = "https://specs.gg/assets/include/upload/image.php?name=Cadu&t=2026-02-08%2020:34:38"
    "pro-players/Gabzera.png" = "https://specs.gg/assets/include/upload/image.php?name=Gabzera&t=2026-02-08%2020:34:48"
}

foreach ($name in $images.Keys) {
    if ($name -match "/") {
        $dir = Split-Path "public/images/$name"
        if (!(Test-Path $dir)) { mkdir $dir | Out-Null }
    }
    Invoke-WebRequest -Uri $images[$name] -OutFile "public/images/$name"
    Write-Host "Downloaded $name"
}
