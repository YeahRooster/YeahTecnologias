@echo off
echo ==========================================
echo  Subir Tienda a GitHub
echo ==========================================
echo.

echo Paso 1: Inicializando repositorio Git...
git init

echo.
echo Paso 2: Agregando todos los archivos...
git add .

echo.
echo Paso 3: Creando commit inicial...
git commit -m "Version 1.0 - Tienda Mayorista Completa"

echo.
echo ==========================================
echo LISTO! Ahora sigue estos pasos:
echo.
echo 1. Ve a GitHub.com y crea un nuevo repositorio
echo    (llamalo 'tienda-mayorista' o como prefieras)
echo.
echo 2. NO marques "Initialize with README"
echo.
echo 3. Copia el comando que GitHub te muestra que dice:
echo    git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
echo.
echo 4. Ejecuta ese comando aqui (pega y Enter)
echo.
echo 5. Luego ejecuta: git push -u origin main
echo.
echo ==========================================
echo.
pause
