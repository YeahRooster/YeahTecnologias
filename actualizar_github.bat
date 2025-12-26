@echo off
color 0A
echo ==========================================
echo   ACTUALIZAR - FIX COMPLETO TYPESCRIPT
echo ==========================================
echo.

cd /d "C:\Users\Rooster\.gemini\antigravity\scratch\tienda-mayorista"

echo [1] Agregando todos los cambios...
git add -A
echo.

echo [2] Creando commit...
git commit -m "Fix: Corregir TODOS los errores TypeScript - tipos explicitos"
echo.

echo [3] Subiendo a GitHub...
git push origin main

echo.
echo ==========================================
if %errorlevel% equ 0 (
    echo.
    echo *** CODIGO ACTUALIZADO! ***
    echo.
    echo Vercel redesplegara automaticamente en 1-2 minutos
    echo Revisa: https://vercel.com/yeahrooster-s-projects/yeahtecnologias
    echo.
) else (
    echo Hubo un error
)
echo ==========================================
echo.
pause
