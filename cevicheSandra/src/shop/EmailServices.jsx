import emailjs from 'emailjs-com';

export const sendEmail = async ({ to, subject, body, attachment }) => {
  const serviceID = 'service_g5payzo'; // Reemplaza con tu service ID
  const templateID = 'template_z40xbbg'; // Reemplaza con tu template ID
  const userID = '-pNylqk6yaRDlxkJP'; // Reemplaza con tu user ID

  const templateParams = {
    to_email: to,
    subject: subject,
    message: body,
    pdf: attachment
  };
  console.log(templateParams)
  try {
    const response = await emailjs.send(serviceID, templateID, templateParams, userID);
    console.log('Email sent successfully:', response);
    return response; // Devuelve la respuesta para manejo adicional si es necesario
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send email: ${error.message}`); // Propaga el error para manejarlo en el lugar de llamada
  }
};
