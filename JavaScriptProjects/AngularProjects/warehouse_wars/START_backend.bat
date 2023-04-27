cmd /c xcopy /F /Y .\configs.json .\back-end
cd back-end
cmd /k mvn compile && mvn exec:java
PAUSE