@echo off
color 0A
echo ==========================================
echo   PUSH CON RAMA MASTER
echo ==========================================
echo.

cd /d "%~dp0"
git push -u origin master

echo.
echo ==========================================
if %errorlevel% equ 0 (
    echo EXITO! Tu codigo esta en GitHub
) else (
    echo Hubo un problema. Revisa los mensajes arriba.
)
echo ==========================================
echo.
pause
