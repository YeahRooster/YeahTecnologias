@echo off
color 0E
echo ================================================
echo   FORZAR RE-DEPLOY LIMPIO EN VERCEL
echo ================================================
echo.

cd /d "C:\Users\Rooster\.gemini\antigravity\scratch\tienda-mayorista"

echo [1] Preparando envio...
git add .

echo [2] Creando marca de tiempo para forzar actualizacion...
git commit --allow-empty -m "INTENTO FINAL: Forzar deploy limpio - %date% %time%"

echo [3] Enviando a GitHub...
git push origin main

echo.
echo ================================================
if %errorlevel% equ 0 (
    color 0A
    echo   ENVIADO CORRECTAMENTE.
    echo   Ve AHORA a Vercel y revisa el deployment nuevo.
    echo   Deberia llamarse "INTENTO FINAL..."
) else (
    color 0C
    echo   Hubo un error al subir.
)
echo ================================================
pause
