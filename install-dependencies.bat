@echo off
echo Installing dependencies for Secure Voter Verification System...

echo Installing React dependencies...
npm install react react-dom react-router-dom react-scripts typescript @types/react @types/react-dom @types/node

echo Installing UI libraries...
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled

echo Installing Firebase and Google Cloud dependencies...
npm install firebase

echo Installing additional dependencies...
npm install chart.js react-chartjs-2 qrcode.react react-webcam axios web-vitals

echo All dependencies installed successfully!
echo To start the development server, run: npm start 