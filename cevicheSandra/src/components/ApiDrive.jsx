import { gapi } from 'gapi-script';

// Inicializar el cliente de Google Drive
export const initClient = () => {
  return new Promise((resolve, reject) => {
    gapi.load('client:auth2', () => {
      gapi.client.init({
        apiKey: 'AIzaSyC6oMNtV_mkVg-bOh1g6HCKKKfmRYYGbKw',
        clientId: '451125740462-og73e2qjephku5qlpnr10qi3kqeo82sd.apps.googleusercontent.com',
        scope: 'https://www.googleapis.com/auth/drive.file'
      }).then(() => {
        gapi.auth2.getAuthInstance().signIn().then(resolve).catch(reject);
      }).catch(reject);
    });
  });
};

export const uploadToGoogleDrive = async (file) => {
    // Verificar si gapi está cargado e inicializado
    const authInstance = gapi.auth2.getAuthInstance();
    if (!authInstance) {
      throw new Error('Google API client is not initialized');
    }
  
    const accessToken = gapi.auth.getToken().access_token;
    if (!accessToken) {
      throw new Error('No access token found');
    }
  
    const folderId = '1lgikY7ALT704V6ULFatzzleGxoi1Hn2U'; // Reemplaza con el ID de tu carpeta en Google Drive
    const uniqueFileName = `${new Date().toISOString()}_${file.name}`;
    const metadata = {
      name: uniqueFileName,
      mimeType: file.type,
      parents: [folderId]
    };
  
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);
  
    try {
      // Subir el archivo
      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
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
      await fetch(`https://www.googleapis.com/drive/v3/files/${data.id}/permissions`, {
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
      throw new Error(`Error uploading file to Google Drive: ${error.message}`);
    }
  };
  