
cmd /c xcopy /F /Y .\configs.json .\front-end\ww-angular\src\assets\configs

cd front-end\ww-angular
cmd /c npm run build

cmd /k npx http-server -p 4200 dist\ww-angular --proxy http://localhost:4200?
pause
