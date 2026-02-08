$images = @{
    "flags/ar.png" = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Flag_of_Argentina.svg/1280px-Flag_of_Argentina.svg.png"
    "flags/br.png" = "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Flag_of_Brazil.svg/3840px-Flag_of_Brazil.svg.png"
    "logo.png"     = "https://api.removal.ai/download/g1/preview/420f9120-87d7-43b0-8854-5cf8e1e1840c.png"
}

foreach ($name in $images.Keys) {
    if ($name -match "/") {
        $dir = Split-Path "public/images/$name"
        if (!(Test-Path $dir)) { mkdir $dir | Out-Null }
    }
    Invoke-WebRequest -Uri $images[$name] -OutFile "public/images/$name"
    Write-Host "Downloaded $name"
}
