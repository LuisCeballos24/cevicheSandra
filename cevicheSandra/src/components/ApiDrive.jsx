import { gapi } from 'gapi-script';
import CryptoJS from 'crypto-js';

// Cargar la clave secreta desde el archivo .env
const secretKey = 'my>K5J2=4e8c-zSD%N"M+<';

// Función para desencriptar la configuración
const decryptConfig = (encryptedConfig) => {
  const bytes = CryptoJS.AES.decrypt(encryptedConfig, secretKey);
  const decryptedConfig = bytes.toString(CryptoJS.enc.Utf8);
  return JSON.parse(decryptedConfig);
};

// Función para obtener y desencriptar la configuración
const fetchEncryptedConfig = async () => {
  try {
    const response = await fetch('/encrypted-config.json');
    if (!response.ok) {
      throw new Error('Error fetching encrypted config file');
    }
    const encryptedConfig = await response.text();
    if (!encryptedConfig) {
      throw new Error('Encrypted config file is empty');
    }

    return decryptConfig(encryptedConfig);
  } catch (error) {
    throw new Error(`Error fetching or decrypting config: ${error.message}`);
  }
};

// Función para detectar Safari
const isSafari = () => {
  const ua = navigator.userAgent.toLowerCase();
  return ua.indexOf('safari') !== -1 && ua.indexOf('chrome') === -1;
};

export const initClient = async () => {
  try {
    const config = await fetchEncryptedConfig();

    return new Promise((resolve, reject) => {
      gapi.load('client:auth2', () => {
        gapi.client.init({
          apiKey: config.apiKey,
          clientId: config.clientId,
          scope: 'https://www.googleapis.com/auth/drive.file'
        }).then(() => {
          const authInstance = gapi.auth2.getAuthInstance();
          const signInMethod = isSafari() ? authInstance.signIn.bind(authInstance) : authInstance.signIn.bind(authInstance);
          
          signInMethod()
            .then(resolve)
            .catch((error) => {
              console.error('Error during sign-in:', error);
              reject(error);
            });
        }).catch((error) => {
          console.error('Error initializing Google API client:', error);
          reject(error);
        });
      });
    });
  } catch (error) {
    console.error(`Error initializing client: ${error.message}`);
    throw error;
  }
};

export const uploadToGoogleDrive = async (file) => {
  try {
    // Verificar si gapi está cargado e inicializado
    const authInstance = gapi.auth2.getAuthInstance();
    if (!authInstance) {
      throw new Error('Google API client is not initialized');
    }

    const accessToken = gapi.auth.getToken().access_token;
    if (!accessToken) {
      throw new Error('No access token found');
    }

    const config = await fetchEncryptedConfig();
    const folderId = config.folderId;
    const uniqueFileName = `${new Date().toISOString()}_${file.name}`;
    const metadata = {
      name: uniqueFileName,
      mimeType: file.type,
      parents: [folderId]
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    // Subir el archivo
    const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      },
      body: form
    });

    if (!response.ok) {
      const errorDetails = await response.json();
      throw new Error(`Error uploading file to Google Drive: ${errorDetails.error.message}`);
    }

    const data = await response.json();
    console.log('Datos recibidos:', data); // Verifica el contenido de la respuesta

    // Hacer el archivo accesible públicamente
    const permissionsResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${data.id}/permissions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        role: 'reader',
        type: 'anyone'
      })
    });

    if (!permissionsResponse.ok) {
      throw new Error('Error setting file permissions');
    }

    // Obtener el enlace de visualización
    const fileResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${data.id}?fields=webViewLink,webContentLink`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!fileResponse.ok) {
      throw new Error('Error fetching file details');
    }

    const fileData = await fileResponse.json();
    return fileData.webContentLink || 'Enlace no disponible';
  } catch (error) {
    console.error(`Error uploading file to Google Drive: ${error.message}`);
    throw new Error(`Error uploading file to Google Drive: ${error.message}`);
  }
};