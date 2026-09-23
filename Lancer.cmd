@echo off
setlocal
cd /d "%~dp0"
set "CODEX_REPAIR_NODE="
for /d %%D in ("%LOCALAPPDATA%\OpenAI\Codex\runtimes\cua_node\*") do if exist "%%~fD\bin\node.exe" set "CODEX_REPAIR_NODE=%%~fD\bin\node.exe"
if not defined CODEX_REPAIR_NODE for /f "delims=" %%N in ('where node.exe 2^>nul') do if not defined CODEX_REPAIR_NODE set "CODEX_REPAIR_NODE=%%N"
if not defined CODEX_REPAIR_NODE (
  echo Node.js introuvable. Node.js 22 minimum est necessaire.
  pause
  exit /b 1
)
"%CODEX_REPAIR_NODE%" -e "process.exit(Number(process.versions.node.split('.')[0]) >= 22 ? 0 : 1)"
if errorlevel 1 (
  echo Runtime Node.js trop ancien. Version 22 minimum.
  pause
  exit /b 1
)
"%CODEX_REPAIR_NODE%" "%~dp0launch-repaired.mjs"
if errorlevel 1 (
  echo Echec. Consultez launcher.log. Quittez Codex avant de reessayer.
) else (
  echo Requetes locales disponibles. Testez deux messages dans le meme fil.
)
pause
