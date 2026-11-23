// encrypt-config.js
import CryptoJS from 'crypto-js';
import fs from 'fs';

const secretKey = 'my>K5J2=4e8c-zSD%N"M+<';

const config = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  projectId: import.meta.env.VITE_GOOGLE_PROJECT_ID,
  clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
  redirectUri: import.meta.env.VITE_GOOGLE_REDIRECT_URI,
  origin: import.meta.env.VITE_GOOGLE_ORIGIN,
  folderId: import.meta.env.VITE_GOOGLE_FOLDER_ID
};

const encrypted = CryptoJS.AES.encrypt(JSON.stringify(config), secretKey).toString();

fs.writeFileSync('public/encrypted-config.json', encrypted);
console.log('encrypted-config.json generado');
