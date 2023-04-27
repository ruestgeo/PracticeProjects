cd back-end
REM start cmd /c mvn compile && mvn exec:java
cd ..




cd front-end
cmd /k http-server -p 4200 dist\ww-angular --proxy http://localhost:4200?
pause
