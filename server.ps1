# Servidor de desarrollo local para ConectaYungay
# Sirve la carpeta del proyecto en http://localhost:8000/ para probar la app.
# Hace falta porque fetch() a los .txt no funciona con file://.
#
# Seguridad:
#   - Solo escucha en localhost.
#   - Solo entrega las extensiones de la lista $contentTypes.
#   - Nunca entrega archivos ni carpetas que empiecen con punto (.git, .env, ...).
#   - Cada request se aísla: un error en un archivo no detiene el servidor.

$port = 8000
# Carpeta donde está este script, así funciona en cualquier equipo
$localPath = $PSScriptRoot
$url = "http://localhost:$port/"

# Extensiones permitidas y su Content-Type. Todo lo demás (incluido server.ps1) se rechaza.
$contentTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".ico"  = "image/x-icon"
    ".txt"  = "text/plain; charset=utf-8"
}

# Raíz del proyecto normalizada, con separador final para comparar por prefijo exacto
$projectRoot = [System.IO.Path]::GetFullPath($localPath).TrimEnd('\') + '\'

function Send-Response($response, [int]$status, [string]$contentType, [byte[]]$bytes) {
    $response.StatusCode = $status
    $response.ContentType = $contentType
    $response.ContentLength64 = $bytes.Length
    $response.OutputStream.Write($bytes, 0, $bytes.Length)
}

function Send-Text($response, [int]$status, [string]$text) {
    Send-Response $response $status "text/plain; charset=utf-8" ([System.Text.Encoding]::UTF8.GetBytes($text))
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($url)

Write-Output "=================================================="
Write-Output "   Iniciando Servidor Web para ConectaYungay"
Write-Output "   Puerto: $port"
Write-Output "   Ruta local: $localPath"
Write-Output "   URL: $url"
Write-Output "=================================================="

try {
    $listener.Start()
    Write-Output "Servidor ejecutándose con éxito."
    Write-Output "Abriendo tu navegador en $url..."

    # Abrir navegador por defecto
    Start-Process $url

    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $response = $context.Response
        $requestPath = $context.Request.Url.AbsolutePath

        try {
            # Decodificar %20 y similares: el navegador envía "Recorrido%20Metro..." para los .txt
            $relative = [System.Uri]::UnescapeDataString($requestPath).TrimStart('/')
            if ($relative -eq '') { $relative = 'index.html' }

            # Bloquear cualquier segmento oculto (.git, .env, ...)
            $segments = $relative -split '[/\\]'
            if ($segments | Where-Object { $_.StartsWith('.') }) {
                Send-Text $response 403 "403 Acceso Prohibido"
                continue
            }

            $filePath = [System.IO.Path]::GetFullPath((Join-Path $projectRoot $relative))

            # Si apunta a una carpeta, buscar index.html
            if (Test-Path -LiteralPath $filePath -PathType Container) {
                $filePath = Join-Path $filePath "index.html"
            }

            # Anti path traversal: la ruta resuelta debe seguir dentro de la raíz del proyecto
            if (-not $filePath.StartsWith($projectRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
                Send-Text $response 403 "403 Acceso Prohibido"
                continue
            }

            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            if (-not $contentTypes.ContainsKey($ext)) {
                Send-Text $response 403 "403 Tipo de archivo no permitido"
                continue
            }

            if (-not (Test-Path -LiteralPath $filePath -PathType Leaf)) {
                Send-Text $response 404 "404 Archivo No Encontrado"
                continue
            }

            # Headers locales. Protecciones como X-Frame-Options o HSTS no aplican a localhost:
            # en producción (GitHub Pages) no son configurables y se documentan en index.html.
            $response.AddHeader("X-Content-Type-Options", "nosniff")
            $response.AddHeader("Referrer-Policy", "strict-origin-when-cross-origin")
            # Sin caché: en desarrollo, los cambios se ven al recargar
            $response.AddHeader("Cache-Control", "no-cache")

            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            Send-Response $response 200 $contentTypes[$ext] $bytes
        }
        catch {
            # Un error en una request (cliente desconectado, archivo bloqueado) no debe detener el servidor
            Write-Warning "Error al atender $requestPath : $_"
            try { Send-Text $response 500 "500 Error interno" } catch { }
        }
        finally {
            try { $response.Close() } catch { }
        }
    }
}
catch {
    Write-Error $_
}
finally {
    if ($null -ne $listener) {
        $listener.Stop()
        $listener.Close()
        Write-Output "Servidor detenido."
    }
}
