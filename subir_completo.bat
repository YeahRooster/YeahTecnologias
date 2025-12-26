@echo off
color 0A
echo ==========================================
echo   SUBIR TIENDA A GITHUB - PROCESO COMPLETO
echo ==========================================
echo.

echo [1/6] Verificando Git...
git --version
if %errorlevel% neq 0 (
    echo ERROR: Git no esta instalado. Descargalo de https://git-scm.com/
    pause
    exit /b 1
)
echo OK - Git encontrado
echo.

echo [2/6] Inicializando repositorio...
git init
echo.

echo [3/6] Agregando archivos...
git add .
echo.

echo [4/6] Creando commit...
git commit -m "Version 1.0 - Tienda Mayorista Yeah Tecnologias"
echo.

echo [5/6] Conectando con GitHub...
echo IMPORTANTE: Pega aqui la URL de tu repositorio de GitHub
echo Ejemplo: https://github.com/TU_USUARIO/tienda-mayorista.git
echo.
set /p REPO_URL="URL del repositorio: "

git remote remove origin 2>nul
git remote add origin %REPO_URL%
echo.

echo [6/6] Subiendo codigo a GitHub...
echo Esto puede tardar unos minutos...
echo.
git branch -M main
git push -u origin main

echo.
echo ==========================================
if %errorlevel% equ 0 (
    echo EXITO! Tu codigo esta en GitHub
    echo Ahora ve a https://vercel.com para publicarlo
) else (
    echo Hubo un problema. Lee los mensajes arriba.
    echo Si dice 'master' en vez de 'main', ejecuta:
    echo git push -u origin master
)
echo ==========================================
echo.
pause
