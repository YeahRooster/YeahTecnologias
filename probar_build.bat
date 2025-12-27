@echo off
color 0B
echo ================================================
echo   PRUEBA DE CONSTRUCCION LOCAL (SIMULANDO VERCEL)
echo ================================================
echo.
echo Esto va a revisar si tu codigo tiene errores antes de subirlo.
echo.

cd /d "C:\Users\Rooster\.gemini\antigravity\scratch\tienda-mayorista"

call npm run build

echo.
echo ================================================
if %errorlevel% equ 0 (
    color 0A
    echo   EXITO TOTAL: El sitio esta listo para Vercel.
    echo   Ahora si podemos subirlo con confianza.
) else (
    color 0C
    echo   ERROR ENCONTRADO.
    echo   Por favor, sacale una foto a los errores de arriba.
    echo   No subas nada todavia.
)
echo ================================================
pause
