@echo off

set port=8080

for /f "tokens=1,2 delims=:{} " %%A in (static/assets/configs/configs.json) do (
    If "%%~A"=="port" set port=%%~B
)
echo %port%

pause