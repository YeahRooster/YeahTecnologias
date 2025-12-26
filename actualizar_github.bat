@echo off
color 0A
echo ==========================================
echo   ACTUALIZAR CODIGO EN GITHUB
echo ==========================================
echo.

cd /d "C:\Users\Rooster\.gemini\antigravity\scratch\tienda-mayorista"

echo [1] Agregando cambios...
git add .
echo.

echo [2] Creando commit...
git commit -m "Fix: Corregir error TypeScript en googleSheets.ts"
echo.

echo [3] Subiendo a GitHub...
git push origin main

echo.
echo ==========================================
if %errorlevel% equ 0 (
    echo.
    echo *** EXITO! ***
    echo.
    echo Vercel detectara el cambio y redesplegara automaticamente
    echo Ve a https://vercel.com/yeahrooster-s-projects/yeahtecnologias
    echo.
) else (
    echo Hubo un error al subir
)
echo ==========================================
echo.
pause
