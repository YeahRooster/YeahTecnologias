@echo off
echo ==========================================
echo INSTALANDO PUBLICIDADES (Partners)
echo ==========================================

if not exist "public\ads" mkdir "public\ads"

echo Copiando Banner de Rooster (Cuadrado - Logo Original)...
copy "C:\Users\Rooster\.gemini\antigravity\brain\c38ee20f-d17b-4e9a-a0b6-9893afc756ea\uploaded_image_1767651217410.jpg" "public\ads\rooster_banner.png" /Y

echo Copiando Banner de Rexy (Version Logo Original)...
copy "C:\Users\Rooster\.gemini\antigravity\brain\c38ee20f-d17b-4e9a-a0b6-9893afc756ea\banner_rexy_v2_logo_1767651515872.png" "public\ads\rexy_banner.png" /Y

echo.
echo ==========================================
echo LISTO! Ejecuta ahora SUBIDA_TOTAL.bat
echo ==========================================
pause
