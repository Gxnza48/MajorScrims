$images = @{
    "avatars/blxckoutz.png" = "https://pbs.twimg.com/media/D449qW9WsAEhluy.png"
    "avatars/gorilon.jpg"   = "https://pbs.twimg.com/profile_images/1671310062797697024/odAdVAH1.jpg"
    "icons/verified.png"    = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Twitter_Verified_Badge.svg/512px-Twitter_Verified_Badge.svg.png"
}

foreach ($name in $images.Keys) {
    if ($name -match "/") {
        $dir = Split-Path "public/images/$name"
        if (!(Test-Path $dir)) { mkdir $dir | Out-Null }
    }
    try {
        Invoke-WebRequest -Uri $images[$name] -OutFile "public/images/$name" -ErrorAction Stop
        Write-Host "Downloaded $name"
    }
    catch {
        Write-Host "Failed to download $name : $_"
    }
}
