@echo off
rem  Double-cliquez sur ce fichier pour lancer MATCH POINT.
rem  Le serveur tourne dans cette fenetre : fermez-la pour arreter le jeu.
title MATCH POINT
cd /d "%~dp0"
start "" "http://localhost:8124/"
node serveur.js 8124
pause
