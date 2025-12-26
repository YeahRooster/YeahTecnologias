@echo off
echo ==========================================
echo  Subiendo codigo a GitHub...
echo ==========================================
echo.

git push -u origin main

echo.
echo ==========================================
echo Si hubo error, puede ser que tu rama se llame 'master' en vez de 'main'
echo En ese caso, ejecuta:  git push -u origin master
echo ==========================================
echo.
pause
