@echo off
color 0A
echo ==========================================
echo   SUBIR TIENDA A GITHUB - CUENTA NUEVA
echo ==========================================
echo.

cd /d "C:\Users\Rooster\.gemini\antigravity\scratch\tienda-mayorista"

echo [1] Limpiando configuracion anterior...
rmdir /s /q .git 2>nul
echo.

echo [2] Inicializando repositorio Git...
git init
echo.

echo [3] Configurando usuario...
git config user.email "yeahrooster@github.com"
git config user.name "YeahRooster"
echo.

echo [4] Agregando TODOS los archivos...
git add -A
echo.

echo [5] Creando commit inicial...
git commit -m "Version 1.0 - Tienda Mayorista Yeah Tecnologias"
echo.

echo [6] Conectando con tu repositorio en GitHub...
git remote add origin https://github.com/YeahRooster/YeahTecnologias.git
echo.

echo [7] Subiendo codigo a GitHub...
echo (Puede pedirte usuario y contrasena de GitHub)
echo.
git branch -M main
git push -u origin main

echo.
echo ==========================================
if %errorlevel% equ 0 (
    echo.
    echo *** EXITO TOTAL! ***
    echo.
    echo Tu tienda esta ahora en:
    echo https://github.com/YeahRooster/YeahTecnologias
    echo.
    echo SIGUIENTE PASO: Conectar con Vercel
    echo Ve a https://vercel.com y sigue las instrucciones
    echo.
) else (
    echo.
    echo Hubo un error. Revisa los mensajes arriba.
    echo Si pide credenciales, usa tu usuario: YeahRooster
    echo.
)
echo ==========================================
echo.
pause
