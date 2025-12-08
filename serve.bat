if "%1"=="" (set DIR=dist) else (set DIR=%1)
php -S 127.0.0.1:8000 -t %DIR%