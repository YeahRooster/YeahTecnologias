@echo off
color 0B
echo ==========================================
echo  SINCRONIZAR Y SUBIR
echo ==========================================
echo.

cd /d "C:\Users\Rooster\.gemini\antigravity\scratch\tienda-mayorista"

echo [1] Bajando cambios de GitHub...
git pull origin main
echo.

echo [2] Agregando cambios locales...
git add -A
echo.

echo [3] Creando commit...
git commit -m "Simplificar codigo para deployment"
echo.

echo [4] Subiendo todo...
git push origin main

echo.
echo ==========================================
if %errorlevel% equ 0 (
    echo.
    echo *** SINCRONIZADO Y SUBIDO! ***
    echo.
    echo Vercel desplegara en 2 minutos
    echo Ve a: https://vercel.com/yeahrooster-s-projects/yeahtecnologias
    echo.
) else (
    echo Hubo un problema
)
echo ==========================================
pause
