@echo off
color 0A
echo ==========================================
echo   SUBIR A GITHUB - VERSION COMPLETA
echo ==========================================
echo.

cd /d "C:\Users\Rooster\.gemini\antigravity\scratch\tienda-mayorista"

echo [1] Configurando usuario de Git...
git config --global user.email "tu_email@example.com"
git config --global user.name "Yeahgalle"
echo.

echo [2] Verificando estado...
git status
echo.

echo [3] Agregando TODOS los archivos...
git add -A
echo.

echo [4] Verificando que archivos se agregaron...
git status
echo.

echo [5] Creando commit...
git commit -m "Version inicial - Tienda Mayorista Yeah Tecnologias"
echo.

echo [6] Verificando commits...
git log --oneline -n 5
echo.

echo [7] Conectando con GitHub...
git remote remove origin 2>nul
git remote add origin https://github.com/Yeahgalle/yeahtecnologias.git
echo.

echo [8] Subiendo codigo...
git push -u origin master
if %errorlevel% neq 0 (
    echo.
    echo Intentando con 'main' en vez de 'master'...
    git branch -M main
    git push -u origin main
)

echo.
echo ==========================================
if %errorlevel% equ 0 (
    echo *** EXITO! Tu codigo esta en GitHub ***
    echo Ahora ve a tu repositorio:
    echo https://github.com/Yeahgalle/yeahtecnologias
) else (
    echo Hubo un problema. Revisa los mensajes arriba.
)
echo ==========================================
echo.
pause
