@echo off
color 0D
title FIX DE SUSPENSE FINAL
echo.
echo ╔═══════════════════════════════════════════════════════╗
echo ║  SUBIENDO EL FIX DE SUSPENSE PARA CATALOGO         ║
echo ╚═══════════════════════════════════════════════════════╝
echo.

cd /d "C:\Users\Rooster\.gemini\antigravity\scratch\tienda-mayorista"

echo [1/3] Git Add...
git add src/app/catalogo/page.tsx

echo.
echo [2/3] Git Commit...
git commit -m "Fix: Agregar Suspense en Catalogo Page para build Vercel"

echo.
echo [3/3] Git Push...
git push origin main

echo.
echo ═══════════════════════════════════════════════════════
if %errorlevel% equ 0 (
    color 0A
    echo.
    echo    ¡FIX SUBIDO EXITOSAMENTE!
    echo.
    echo    Vercel detectara el cambio y comenzara el build.
    echo    Este era el ultimo error conocido.
    echo.
    echo    Espera 2 minutos y revisa Vercel.
    echo.
) else (
    echo    HUBO UN ERROR AL SUBIR
)
echo.
pause
