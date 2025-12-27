@echo off
color 0B
echo ========================================================
echo        PANEL DE CONTROL - YEAH TECNOLOGIAS
echo ========================================================
echo.
echo  Paso 1: Sincronizando con la nube...
echo.

cd /d "C:\Users\Rooster\.gemini\antigravity\scratch\tienda-mayorista"
git pull origin main

echo.
echo  Paso 2: Verificando que el codigo no tenga errores...
echo.

call npm run build

if %errorlevel% neq 0 (
    color 0C
    echo.
    echo  [!] ALERTA: Hay errores en el codigo.
    echo  NO SE SUBIRA NADA para proteger tu sitio online.
    echo  Revisa los errores rojos arriba.
    echo.
    pause
    exit /b
)

color 0A
echo.
echo  [OK] El codigo esta perfecto.
echo.

set /p mensaje="Escribe una breve frase de lo que cambiaste (ej: cambiar color fondo): "

echo.
echo  Paso 3: Subiendo a Vercel...
echo.

git add .
git commit -m "%mensaje%"
git push origin main

echo.
echo ========================================================
echo   ¡LISTO! Tu sitio se actualizara en 2 minutos.
echo ========================================================
echo.
pause
