do {
    Clear-Host
    Write-Host "============================================"
    Write-Host ""
    Write-Host "         CONVERSOR DE IMAGENS EM PDF        "
    Write-Host "               por pietrohpp               "
    Write-Host ""
    Write-Host "============================================"

    # === Verificação de dependências ===
    function Verificar-Dependencias {
        Write-Host "`n🔍 Verificando dependências..." -ForegroundColor Yellow

        # Verifica se ImageMagick está disponível
        $magickOk = Get-Command magick -ErrorAction SilentlyContinue
        if (-not $magickOk) {
            Write-Host "`n❌ ImageMagick não está instalado ou não está no PATH." -ForegroundColor Red
            Write-Host "🔗 Baixe em: https://imagemagick.org/script/download.php" -ForegroundColor Cyan
            Start-Process "https://imagemagick.org/script/download.php"
            Read-Host "⏸ Pressione Enter após instalar o ImageMagick e adicionar ao PATH para continuar..."
        } else {
            Write-Host "✅ ImageMagick está instalado." -ForegroundColor Green
        }

        # Verifica se Compress-Archive está disponível
        if (-not (Get-Command Compress-Archive -ErrorAction SilentlyContinue)) {
            Write-Host "❌ Compress-Archive não está disponível." -ForegroundColor Red
            Write-Host "➡️ Ele requer PowerShell 5.0 ou superior com o módulo Microsoft.PowerShell.Archive."
            Write-Host "🔍 Tentando instalar módulo..."
            try {
                Install-Module -Name Microsoft.PowerShell.Archive -Scope CurrentUser -Force -ErrorAction Stop
                Write-Host "✅ Módulo instalado com sucesso." -ForegroundColor Green
            } catch {
                Write-Host "❌ Falha ao instalar módulo: $($_.Exception.Message)" -ForegroundColor Red
            }
        } else {
            Write-Host "✅ Compress-Archive disponível." -ForegroundColor Green
        }
    }

    Verificar-Dependencias

    $basePath = Read-Host "Cole aqui o caminho da pasta base com subpastas de imagens"

    if (-not (Test-Path $basePath)) {
        Write-Host "`n❌ Caminho inválido ou inexistente!" -ForegroundColor Red
        continue
    }

    function Mostrar-Menu {
        Write-Host ""
        Write-Host "[1] Converter TODAS as pastas"
        Write-Host "[2] Converter UMA pasta específica"
        Write-Host "[4] Compactar um PDF em ZIP (ou pressione 'Z')"
        Write-Host "[3] Sair (ou pressione 'S')"
        Write-Host "[5] Pausar (somente durante conversão)"
        return Read-Host "Escolha uma opção (1/2/3/4/5 ou S/Z)"
    }

    function Converter-Pasta($pasta, $indiceAtual, $totalPastas) {
        $pdfPath = Join-Path $basePath "$($pasta.Name).pdf"
        if (Test-Path $pdfPath) {
            Write-Host "⏭️ PDF já existe: $pdfPath — pulando..." -ForegroundColor DarkYellow
            return
        }

        $images = Get-ChildItem $pasta.FullName -Include *.jpg, *.jpeg, *.png -Recurse | Where-Object { -not $_.PSIsContainer }

        $percentual = [math]::Round(($indiceAtual / $totalPastas) * 100, 1)
        Write-Progress -Activity "Convertendo pastas..." -Status "$($pasta.Name) ($indiceAtual de $totalPastas)" -PercentComplete $percentual

        if ($images.Count -gt 0) {
            $cover = $images | Where-Object { $_.BaseName -match '^\s*cover\s*$' -or $_.BaseName -match '^\s*cover\..*' } | Sort-Object Name
            $resto = $images | Where-Object { $_.BaseName -notmatch '^\s*cover(\..*)?$' }
            $restoOrdenado = $resto | Sort-Object {
                if ($_ -match '\d+') { [long]($_.Name -replace '\D', '') } else { $_.Name }
            }

            $ordenadas = @()
            if ($cover) { $ordenadas += $cover }
            $ordenadas += $restoOrdenado

            $imagePaths = $ordenadas | ForEach-Object { "`"$($_.FullName)`"" }
            $cmd = "magick " + ($imagePaths -join ' ') + " `"$pdfPath`""

            try {
                Invoke-Expression $cmd

                $tentativas = 0
                while (-not (Test-Path $pdfPath) -and $tentativas -lt 10) {
                    Start-Sleep -Seconds 1
                    $tentativas++
                }

                if (Test-Path $pdfPath) {
                    Write-Host "✅ PDF criado: $pdfPath" -ForegroundColor Green
                } else {
                    Write-Host "❌ PDF não foi criado: $($pasta.Name)" -ForegroundColor Red
                }
            } catch {
                Write-Host "❌ Erro ao gerar PDF: $($pasta.Name)" -ForegroundColor Red
            }
        } else {
            Write-Host "⚠️ Nenhuma imagem em: $($pasta.Name)" -ForegroundColor Yellow
        }
    }

    function Converter-Todas {
        $pastas = Get-ChildItem $basePath -Directory
        $totalPastas = $pastas.Count
        $contador = 0

        foreach ($pasta in $pastas) {
            $contador++
            $percentual = [math]::Round(($contador / $totalPastas) * 100, 1)
            Write-Host "`n🔄 Processando ($contador de $totalPastas) - $($pasta.Name) [$percentual%]"

            Converter-Pasta $pasta $contador $totalPastas
        }
        Write-Progress -Activity "Conversão finalizada!" -Completed
    }

    function Converter-Especifica {
        $pastas = Get-ChildItem $basePath -Directory
        for ($i = 0; $i -lt $pastas.Count; $i++) {
            Write-Host "[$($i + 1)] $($pastas[$i].Name)"
        }

        $indice = Read-Host "Digite o número da pasta que deseja converter"
        if ($indice -match '^\d+$' -and $indice -ge 1 -and $indice -le $pastas.Count) {
            $pastaEscolhida = $pastas[$indice - 1]
            Converter-Pasta $pastaEscolhida 1 1

            Write-Host "⏸ Pressione 'P' para pausar ou Enter para continuar..."
            $key = $host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            if ($key.Character -eq 'P' -or $key.VirtualKeyCode -eq 80) {
                Write-Host "⏸ Pausado. Pressione Enter para continuar..."
                [void][System.Console]::ReadLine()
            }
        } else {
            Write-Host "❌ Opção inválida." -ForegroundColor Red
        }
    }

    function Compactar-PDF {
        $pdfsCriados = Get-ChildItem $basePath -Recurse -Filter *.pdf
        if ($pdfsCriados.Count -eq 0) {
            Write-Host "❌ Nenhum PDF encontrado para compactar." -ForegroundColor Red
            return
        }

        Write-Host "`nSelecione o PDF que deseja compactar:"
        $pdfsCriados | ForEach-Object { Write-Host "$($_.FullName)" }

        $pdfEscolhido = Read-Host "Digite o nome (ou parte do nome) do PDF para compactar"
        $pdfSelecionado = $pdfsCriados | Where-Object { $_.Name -like "*$pdfEscolhido*" }

        if ($pdfSelecionado.Count -eq 1) {
            $zipPath = [System.IO.Path]::ChangeExtension($pdfSelecionado.FullName, ".zip")
            try {
                Compress-Archive -Path $pdfSelecionado.FullName -DestinationPath $zipPath -Force
                Write-Host "✅ PDF compactado em ZIP: $zipPath" -ForegroundColor Green
            } catch {
                Write-Host "❌ Falha ao compactar: $($_.Exception.Message)" -ForegroundColor Red
            }
        } elseif ($pdfSelecionado.Count -gt 1) {
            Write-Host "❌ Múltiplos PDFs encontrados, refine a pesquisa." -ForegroundColor Red
        } else {
            Write-Host "❌ PDF não encontrado." -ForegroundColor Red
        }
    }

    do {
        $opcao = Mostrar-Menu
        switch ($opcao.ToUpper()) {
            "1"        { Converter-Todas }
            "2"        { Converter-Especifica }
            "4"        { Compactar-PDF }
            "Z"        { Compactar-PDF }
            "3"        {
                Write-Host "`n👋 Saindo..."
                Write-Host "`n🌐 Acesse o site do programador: https://www.instagram.com/prietto_polar?igsh=MXgycXg5eThzNmprZw==" -ForegroundColor Cyan
                Start-Process "https://www.instagram.com/prietto_polar?igsh=MXgycXg5eThzNmprZw=="
                Pause
                exit
            }
            "S"        { exit }
            default    { Write-Host "❌ Opção inválida. Tente novamente." -ForegroundColor Red }
        }
    } while ($true)

    $continuar = Read-Host "`n🔁 Deseja colar um novo caminho e voltar ao menu? (S/N)"
} while ($continuar.ToUpper() -eq "S")
