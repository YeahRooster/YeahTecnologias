@echo off
color 0D
title SUBIDA TOTAL - YEAH TECNOLOGIAS
echo.
echo ========================================================
echo        PROCESO DE ACTUALIZACION COMPLETO
echo ========================================================
echo.

echo [1/3] Instalando nuevas imagenes del Blog...
call instalar_imagenes.bat
if %errorlevel% neq 0 (
    echo Error al instalar imagenes.
    pause
    exit /b
)

echo.
echo [2/3] Verificando codigo (Build local)...
cd /d "C:\Users\Rooster\.gemini\antigravity\scratch\tienda-mayorista"
call npm run build
if %errorlevel% neq 0 (
    color 0C
    echo Error en el codigo. Revisa arriba.
    pause
    exit /b
)

echo.
echo [3/3] Subiendo cambios a Vercel (Online)...
git add .
git commit -m "BLOG FINAL: Diseno, Imagenes, Textos y WhatsApp"
git push origin main

color 0A
echo.
echo ========================================================
echo   ¡TODO LISTO! TU PAGINA SE ACTUALIZARA EN 2 MINUTOS.
echo   Disfruta tu nuevo Blog y Home mejorada.
echo ========================================================
echo.
pause
