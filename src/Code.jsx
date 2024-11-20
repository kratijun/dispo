import React, { useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const QrCodePage = () => {
    const [secret, setSecret] = useState(null); // Speichert den Secret-Schlüssel
    const [qrCodeUrl, setQrCodeUrl] = useState(''); // Speichert die URL für den QR-Code

    // Secret-Schlüssel vom Backend abrufen
    const fetchSecret = async () => {
        try {
            const response = await fetch('http://localhost:3520/api/auth/generate-secret');
            const data = await response.json();

            setSecret(data.base32); // Secret-Schlüssel speichern
            setQrCodeUrl(data.otpauth_url); // QR-Code-URL speichern
        } catch (error) {
            console.error('Fehler beim Abrufen des Secret-Schlüssels:', error);
        }
    };

    // Beim Laden der Komponente den Secret-Schlüssel abrufen
    useEffect(() => {
        fetchSecret();
    }, []);

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>2-Faktor-Authentifizierung</h1>
            <p>Scanne den QR-Code mit deiner Google Authenticator App:</p>

            {/* Zeige den QR-Code an */}
            {qrCodeUrl ? (
                <QRCodeCanvas value={qrCodeUrl} size={200} />
            ) : (
                <p>QR-Code wird geladen...</p>
            )}

            {/* Zeige den Secret-Schlüssel an */}
            {secret && (
                <div style={{ marginTop: '20px' }}>
                    <p><strong>Geheimer Schlüssel (Backup):</strong></p>
                    <code>{secret}</code>
                </div>
            )}
        </div>
    );
};

export default QrCodePage;
