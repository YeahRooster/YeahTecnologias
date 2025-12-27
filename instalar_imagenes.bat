@echo off
echo ===========================================
echo   INSTALANDO IMAGENES PREMIUM AL BLOG
echo ===========================================
echo.

set "ORIGEN=C:\Users\Rooster\.gemini\antigravity\brain\c38ee20f-d17b-4e9a-a0b6-9893afc756ea"
set "DESTINO=C:\Users\Rooster\.gemini\antigravity\scratch\tienda-mayorista\public\blog"

if not exist "%DESTINO%" mkdir "%DESTINO%"

echo [1/3] Copiando Auriculares...
copy "%ORIGEN%\blog_headphones_gamer_1766840989293.png" "%DESTINO%\headphones.png"

echo [2/3] Copiando PC Cleaning...
copy "%ORIGEN%\blog_pc_maintenance_1766841006080.png" "%DESTINO%\pc-cleaning.png"

echo [3/3] Copiando Smartwatch...
copy "%ORIGEN%\blog_smartwatch_comparison_1766841021416.png" "%DESTINO%\smartwatch.png"

echo.
echo ===========================================
echo   IMAGENES INSTALADAS CON EXITO
echo ===========================================
echo.
timeout /t 3
