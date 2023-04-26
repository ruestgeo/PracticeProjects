@echo off

set port=4200

for /f "tokens=1,2 delims=:{} " %%A in (configs.json) do (
    If "%%~A"=="port" set port=%%~B
)
echo %port%

cmd /c xcopy /F /Y .\configs.json .\front-end\ww-angular\src\assets\configs

cd front-end\ww-angular
cmd /c npm run build

REM cmd /k http-server -p %port% dist\ww-angular --proxy http://localhost:%port%?
cmd /k http-server -p 4200 dist\ww-angular --proxy http://localhost:4200?
pause
