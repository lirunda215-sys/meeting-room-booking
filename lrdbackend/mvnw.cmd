@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.  See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership.  The ASF licenses this file
@REM to you under the Apache License, Version 2.0 (the
@REM "License"); you may not use this file except in compliance
@REM with the License.  You may obtain a copy of the License at
@REM
@REM    http://www.apache.org/licenses/LICENSE-2.0
@REM
@REM Unless required by applicable law or agreed to in writing,
@REM software distributed under the License is distributed on an
@REM "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@REM KIND, either express or implied.  See the License for the
@REM specific language governing permissions and limitations
@REM under the License.
@REM ----------------------------------------------------------------------------

@REM ----------------------------------------------------------------------------
@REM Apache Maven Wrapper startup batch script, version 3.2.0
@REM ----------------------------------------------------------------------------

@IF "%__MVNW_ARG0_NAME__%"=="" (SET __MVNW_ARG0_NAME__=%~nx0)
@SET __MVNW_CMD__=
@SET __MVNW_ERROR__=
@SET __MVNW_PSMODULEP_SAVE=%PSModulePath%
@SET PSModulePath=
@FOR /F "usebackq tokens=1,2 delims==" %%A IN (`powershell -noprofile "& {$scriptDir='%~dp0'; $proxy=''; [Net.WebRequest]::DefaultWebProxy.Credentials=[Net.CredentialCache]::DefaultCredentials; try{Invoke-WebRequest -Headers @{'User-Agent'='maven-wrapper/3.2.0'} -Proxy $proxy -ProxyUseDefaultCredentials -Uri 'https://raw.githubusercontent.com/apache/maven-wrapper/maven-wrapper-3.2.0/maven/wrapper/maven-wrapper.properties' -OutFile '%TEMP%\mvnw.properties'}catch{}; if(Test-Path '%TEMP%\mvnw.properties'){(Get-Content '%TEMP%\mvnw.properties' | ConvertFrom-StringData).distributionUrl}else{'https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.6/apache-maven-3.9.6-bin.zip'}}"`) DO @SET "distributionUrl=%%B"

@SET PSModulePath=%__MVNW_PSMODULEP_SAVE%

@IF NOT "%distributionUrl%"=="" (
    @SET "distributionUrl=%distributionUrl: =%"
    @SET "distributionUrl=%distributionUrl:<=%"
    @SET "distributionUrl=%distributionUrl:>=%"
)

@SET MAVEN_PROJECTBASEDIR=%MAVEN_BASEDIR%
@IF NOT "%MAVEN_PROJECTBASEDIR%"=="" goto endDetectBaseDir

@SET MAVEN_PROJECTBASEDIR=%~dp0

:endDetectBaseDir

@IF NOT EXIST "%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar" (
    @ECHO Maven Wrapper JAR not found. Downloading...
    @SET "downloadUrl=https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar"
    powershell -Command "Invoke-WebRequest -Uri '%downloadUrl%' -OutFile '%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar'"
)

@SET MAVEN_CMD_LINE_ARGS=%*

@SET MAVEN_JAVA_EXE=java
@IF NOT "%JAVA_HOME%"=="" @SET "MAVEN_JAVA_EXE=%JAVA_HOME%\bin\java.exe"

@SET "MAVEN_OPTS=%MAVEN_OPTS% -Dfile.encoding=UTF-8"

"%MAVEN_JAVA_EXE%" %MAVEN_OPTS% -classpath "%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar" org.apache.maven.wrapper.MavenWrapperMain %MAVEN_CMD_LINE_ARGS%
