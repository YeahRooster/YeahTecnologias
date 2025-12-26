@echo off
color 0E
title FUERZA BRUTA DEPLOY
echo.
echo ╔═══════════════════════════════════════════════════════╗
echo ║  INTENTO DE SUBIDA FORZADA A GITHUB                   ║
echo ╚═══════════════════════════════════════════════════════╝
echo.

cd /d "C:\Users\Rooster\.gemini\antigravity\scratch\tienda-mayorista"

echo [1/4] Status actual...
git status
echo.

echo [2/4] Agregando TODO (force)...
git add .
git add *
git add src/app/catalogo/page.tsx
echo.

echo [3/4] Commit...
git commit -m "FIX DEFINITIVO: Suspense en Catalogo y limpieza Config"
echo.

echo [4/4] Push...
git push origin main

echo.
echo ═══════════════════════════════════════════════════════
echo   SI VEZ "Everything up-to-date", AVISAME.
echo ═══════════════════════════════════════════════════════
pause
