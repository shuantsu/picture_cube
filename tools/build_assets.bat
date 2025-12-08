@echo off
echo Building assets...
echo.

echo [1/3] Generating thumbnails...
python "%~dp0generate-thumbnails.py"
if errorlevel 1 (
    echo ERROR: Failed to generate thumbnails
    exit /b 1
)
echo.

echo [2/3] Generating backgrounds index...
python "%~dp0generate-backgrounds-index.py"
if errorlevel 1 (
    echo ERROR: Failed to generate backgrounds index
    exit /b 1
)
echo.

echo [3/3] Generating examples index...
python "%~dp0generate-examples-index.py"
if errorlevel 1 (
    echo ERROR: Failed to generate examples index
    exit /b 1
)
echo.

echo Build completed successfully!
