
@echo off

set port=4200

for /f "tokens=1,2 delims=:{} " %%A in (configs.json) do (
    If "%%~A"=="port" set port=%%~B
)
echo %port%



REM cmd /k http-server -p %port% dist\ww-angular --proxy http://localhost:%port%?

pause