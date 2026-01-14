@echo off
title Reiniciar Servidor - Yeah! Tecnologias
echo ==========================================
echo   REINICIANDO SERVIDOR YEAH! TECNOLOGIAS
echo ==========================================
echo.

echo 1. Cerrando procesos de Node previos...
taskkill /f /im node.exe >nul 2>&1

echo 2. Iniciando servidor de desarrollo...
echo.
npm run dev

pause
