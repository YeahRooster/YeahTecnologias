@echo off
color 0C
title DEPLOYMENT FINAL - CODIGO LIMPIO
echo.
echo ╔═══════════════════════════════════════════════════════╗
echo ║  DEPLOYMENT FINAL - FUNCIONES PROBLEMAT delete  ║
echo ╚═══════════════════════════════════════════════════════╝
echo.

cd /d "C:\Users\Rooster\.gemini\antigravity\scratch\tienda-mayorista"

echo [1/3] Agregando cambios...
git add -A

echo.
echo [2/3] Guardando commit...
git commit -m "DEPLOYMENT: Eliminar updateOrderStatus para deployment exitoso"

echo.
echo [3/3] Subiendo a GitHub...
git push origin main

echo.
echo ═══════════════════════════════════════════════════════
if %errorlevel% equ 0 (
    color 0A
    echo.
    echo    ██████╗ ███████╗██████╗ ██╗      ██████╗ ██╗   ██╗
    echo    ██╔══██╗██╔════╝██╔══██╗██║     ██╔═══██╗╚██╗ ██╔╝
    echo    ██║  ██║█████╗  ██████╔╝██║     ██║   ██║ ╚████╔╝ 
    echo    ██║  ██║██╔══╝  ██╔═══╝ ██║     ██║   ██║  ╚██╔╝  
    echo    ██████╔╝███████╗██║     ███████╗╚██████╔╝   ██║   
    echo    ╚═════╝ ╚══════╝╚═╝     ╚══════╝ ╚═════╝    ╚═╝   
    echo.
    echo    TU SITIO SE DESPLEGARA EN 2-3 MINUTOS!
    echo.
    echo    Ve a Vercel: https://vercel.com/yeahrooster-s-projects/yeahtecnologias
    echo.
    echo ═══════════════════════════════════════════════════════
) else (
    echo    ERROR al subir cambios
)
echo.
pause
