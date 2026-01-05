@echo off
echo ==========================================
echo INSTALANDO BANNERS EN LA WEB (Yeah! Tecnologias)
echo ==========================================

if not exist "public\banners" mkdir "public\banners"

echo Copiando Banner de Redes Sociales...
copy "C:\Users\Rooster\.gemini\antigravity\brain\c38ee20f-d17b-4e9a-a0b6-9893afc756ea\banner_social_media_1767453957630.png" "public\banners\social_media.png" /Y

echo Copiando Banner de Ofertas (Desactivado por ahora pero se guarda)...
copy "C:\Users\Rooster\.gemini\antigravity\brain\c38ee20f-d17b-4e9a-a0b6-9893afc756ea\banner_offers_sale_1767453980653.png" "public\banners\offers_sale.png" /Y

echo Copiando Banner de Perifericos (NUEVO)...
copy "C:\Users\Rooster\.gemini\antigravity\brain\c38ee20f-d17b-4e9a-a0b6-9893afc756ea\banner_peripherals_1767649361968.png" "public\banners\peripherals.png" /Y

echo.
echo ==========================================
echo LISTO! Las imagenes estan en su lugar.
echo Ahora ejecuta SUBIDA_TOTAL.bat para ver los cambios online.
echo ==========================================
pause
