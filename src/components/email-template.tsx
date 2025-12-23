import * as React from "react";

interface EmailTemplateProps {
  fullName: string;
  email: string;
  message: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  fullName,
  email,
  message,
}) => (
  <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
    <h1 style={{ color: '#333', borderBottom: '2px solid #4F46E5', paddingBottom: '10px' }}>
      New Message from Portfolio Contact Form
    </h1>
    <div style={{ marginTop: '20px' }}>
      <p><strong>From:</strong> {fullName}</p>
      <p><strong>Email:</strong> {email}</p>
    </div>
    <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
      <h2 style={{ color: '#333', marginTop: '0' }}>Message:</h2>
      <p style={{ color: '#555', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{message}</p>
    </div>
    <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#e8f4f8', borderRadius: '5px', fontSize: '12px', color: '#666' }}>
      <p>This message was sent through your portfolio contact form.</p>
    </div>
  </div>
);
