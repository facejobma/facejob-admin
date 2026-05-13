@echo off
echo Installation des dependances TipTap pour RichTextEditor...
echo.

cd /d "%~dp0"

echo Installation de @tiptap/react...
call npm install @tiptap/react

echo Installation de @tiptap/starter-kit...
call npm install @tiptap/starter-kit

echo Installation de @tiptap/extension-link...
call npm install @tiptap/extension-link

echo Installation de @tiptap/extension-placeholder...
call npm install @tiptap/extension-placeholder

echo.
echo ========================================
echo Installation terminee avec succes!
echo ========================================
echo.
echo Vous pouvez maintenant utiliser le formulaire d'edition admin.
echo.
pause
