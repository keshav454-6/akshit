$ErrorActionPreference = "Stop"

$BUILD_TOOLS = "C:\Users\agarw\AppData\Local\Android\Sdk\build-tools\34.0.0"
$ANDROID_JAR = "C:\Users\agarw\AppData\Local\Android\Sdk\platforms\android-34\android.jar"
$JDK_BIN = "C:\Program Files\Android\Android Studio\jbr\bin"

if (-not (Test-Path $JDK_BIN)) {
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

Set-Location "$PSScriptRoot"

Write-Host "1. Compiling resources with aapt2..."
Remove-Item -Force res.zip, unaligned.apk, aligned.apk, CyberShield-One.apk -ErrorAction SilentlyContinue
& $AAPT2 compile --dir res -o res.zip

Write-Host "2. Linking package with aapt2..."
& $AAPT2 link res.zip -I $ANDROID_JAR --manifest AndroidManifest.xml -o unaligned.apk --min-sdk-version 21 --target-sdk-version 34

Write-Host "3. Compiling Java sources..."
New-Item -ItemType Directory -Force -Path bin\classes | Out-Null
& $JAVAC -d bin\classes -cp $ANDROID_JAR src\com\cybershield\one\MainActivity.java

Write-Host "4. Converting bytecode to DEX with d8..."
$CLASS_FILES = Get-ChildItem -Path bin\classes\com\cybershield\one\*.class | Select-Object -ExpandProperty FullName
& $D8 $CLASS_FILES --lib $ANDROID_JAR --output bin\ --min-api 21

Write-Host "5. Packaging assets and classes.dex into unaligned.apk..."
python package_assets.py unaligned.apk assets

Write-Host "6. Aligning APK with zipalign..."
Remove-Item -Force aligned.apk -ErrorAction SilentlyContinue
& $ZIPALIGN -p -f 4 unaligned.apk aligned.apk

Write-Host "7. Signing APK with apksigner..."
Remove-Item -Force CyberShield-One.apk.idsig -ErrorAction SilentlyContinue
& $APKSIGNER sign --ks debug.keystore --ks-pass pass:android --out CyberShield-One.apk aligned.apk

Write-Host "8. Verifying signature..."
& $APKSIGNER verify --verbose CyberShield-One.apk

Write-Host "APK Build Complete: CyberShield-One.apk"
Get-Item CyberShield-One.apk | Select-Object Name, Length, LastWriteTime
