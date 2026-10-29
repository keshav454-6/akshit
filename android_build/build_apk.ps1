$ErrorActionPreference = "Stop"

$BUILD_TOOLS = "C:\Users\agarw\AppData\Local\Android\Sdk\build-tools\34.0.0"
$ANDROID_JAR = "C:\Users\agarw\AppData\Local\Android\Sdk\platforms\android-34\android.jar"
$JDK_BIN = "C:\Program Files\Android\Android Studio\jbr\bin"

if (-not (Test-Path $JDK_BIN)) {
    # Check alternate Java locations
    $JAVA_EXEC = (Get-Command java -ErrorAction SilentlyContinue).Source
    if ($JAVA_EXEC) {
        $JDK_BIN = Split-Path -Parent $JAVA_EXEC
    }
}

$AAPT2 = "$BUILD_TOOLS\aapt2.exe"
$D8 = "$BUILD_TOOLS\d8.bat"
$ZIPALIGN = "$BUILD_TOOLS\zipalign.exe"
$APKSIGNER = "$BUILD_TOOLS\apksigner.bat"
$JAVAC = "$JDK_BIN\javac.exe"
$JAR = "$JDK_BIN\jar.exe"

Set-Location "$PSScriptRoot"
Write-Host "Compiling resources with aapt2..."
& $AAPT2 compile --dir res -o res.zip

Write-Host "Linking package with aapt2..."
& $AAPT2 link res.zip -I $ANDROID_JAR --manifest AndroidManifest.xml -o unaligned.apk -A assets --min-sdk-version 21 --target-sdk-version 34

Write-Host "Compiling Java sources..."
New-Item -ItemType Directory -Force -Path bin\classes | Out-Null
& $JAVAC -d bin\classes -cp $ANDROID_JAR src\com\cybershield\one\MainActivity.java

Write-Host "Converting bytecode to DEX with d8..."
$CLASS_FILES = Get-ChildItem -Path bin\classes\com\cybershield\one\*.class | Select-Object -ExpandProperty FullName
& $D8 $CLASS_FILES --lib $ANDROID_JAR --output bin\ --min-api 21

Write-Host "Adding classes.dex into unaligned.apk..."
& $JAR uf unaligned.apk -C bin classes.dex

Write-Host "Aligning APK with zipalign..."
Remove-Item -Force aligned.apk -ErrorAction SilentlyContinue
& $ZIPALIGN -p -f 4 unaligned.apk aligned.apk

Write-Host "Signing APK with apksigner..."
Remove-Item -Force CyberShield-One.apk -ErrorAction SilentlyContinue
Remove-Item -Force CyberShield-One.apk.idsig -ErrorAction SilentlyContinue
& $APKSIGNER sign --ks debug.keystore --ks-pass pass:android --out CyberShield-One.apk aligned.apk

Write-Host "Verifying signature..."
& $APKSIGNER verify --verbose CyberShield-One.apk

Write-Host "APK Build Complete: CyberShield-One.apk"
Get-Item CyberShield-One.apk | Select-Object Name, Length, LastWriteTime
