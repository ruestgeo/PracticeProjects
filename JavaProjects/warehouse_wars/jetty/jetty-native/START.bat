@echo off

set port=8080

for /f "tokens=1,2 delims=:{} " %%A in (../../static/assets/configs/configs.json) do (
    If "%%~A"=="port" set port=%%~B
)
echo %port%
cd ../../http-server
rem start cmd /k npx http-server -p %port% static --proxy http://localhost:%port%?
start cmd /k npx http-server -p 8080 ..\..\static --proxy http://localhost:8080?

cd ../jetty/jetty-native

cmd /k "mvn compile && mvn exec:java"
PAUSE