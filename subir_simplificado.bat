@echo off
color 0E
echo ==========================================
echo  SIMPLIFICAR CODIGO - QUITAR COMPLEJIDAD
echo ==========================================
echo.

cd /d "C:\Users\Rooster\.gemini\antigravity\scratch\tienda-mayorista"

echo Subiendo version simplificada...
git add -A
git commit -m "Simplificar updateOrderStatus para evitar errores TS"
git push origin main

echo.
if %errorlevel% equ 0 (
    echo.
    echo CODIGO SIMPLIFICADO SUBIDO
    echo Vercel intentara desplegar en 2 min
    echo.
) else (
    echo Error
)
pause
