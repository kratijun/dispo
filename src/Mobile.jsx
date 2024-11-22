import React, { useState, useEffect } from 'react';
import './Mobile.css';

const statuses = [
    { id: 0, text: 'Abgemeldet' },
    { id: 1, text: 'Frei' },
    { id: 2, text: 'in Arbeit' },
    { id: 3, text: 'Beschäftigt' },
    { id: 4, text: 'Erhalten' },
    { id: 5, text: 'Sprechwunsch' },
    { id: 6, text: 'Pause' },
    { id: 9, text: 'Übernommen' },
];

const Mobile = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [is2FAVerified, setIs2FAVerified] = useState(false);
    const [username, setUsername] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState(null); // Fehlerstatus
    const [isLoading, setIsLoading] = useState(false); // Ladezustand

    // Login-Handler
    const handleLogin = async () => {
        setError(null); // Fehler zurücksetzen
        try {
            const response = await fetch('http://localhost:3520/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username }),
            });

            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || 'Login fehlgeschlagen');
            }

            const { username: user } = await response.json();
            localStorage.setItem('username', username);
            setIsLoggedIn(true);
        } catch (error) {
            console.error('Fehler beim Login:', error.message);
            setError(error.message); // Fehler anzeigen
        }
    };

    // 2FA-Handler
    const handleVerifyOTP = async () => {
        setError(null);
        try {
            const response = await fetch('http://localhost:3520/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ otpCode }),
            });

            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || 'OTP-Überprüfung fehlgeschlagen');
            }

            setIs2FAVerified(true);
            fetchUserData();
        } catch (error) {
            console.error('Fehler bei der OTP-Überprüfung:', error.message);
            setError(error.message);
        }
    };

    // Benutzer-Daten abrufen
    const fetchUserData = async () => {
        setError(null);
        setIsLoading(true);
        try {
            const username = localStorage.getItem('username');
            if (!username) {
                setError('Benutzername fehlt. Bitte erneut einloggen.');
                setIsLoading(false);
                return;
            }

            const response = await fetch(`http://localhost:3520/api/user/getUserData/${username}`, {
                method: 'GET',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Fehler beim Abrufen der Benutzerdaten');
            }

            const data = await response.json();
            setUserData(data);
        } catch (error) {
            console.error('Fehler beim Abrufen der Benutzerdaten:', error.message);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Status-Änderung
    const setStatus = async (status) => {
        if (!userData) return;

        try {
            const response = await fetch('http://localhost:3520/api/status/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: userData.username,
                    status,
                    seit: new Date().toLocaleTimeString(),
                }),
            });

            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || 'Fehler beim Setzen des Status');
            }

            setUserData((prevData) => ({
                ...prevData,
                status,
            }));
        } catch (error) {
            console.error('Fehler beim Setzen des Status:', error.message);
            alert(error.message);
        }
    };

    // Fehleranzeige
    const getErrorMessage = (message) => {
        switch (message) {
            case 'Benutzername fehlt. Bitte erneut einloggen.':
                return 'Der Benutzername konnte nicht gefunden werden. Bitte melden Sie sich erneut an.';
            case 'Fehler beim Abrufen der Benutzerdaten':
                return 'Es gab ein Problem beim Abrufen Ihrer Daten. Versuchen Sie es später erneut.';
            case 'Ungültiger OTP-Code':
                return 'Ungültiger OTP-Code.';
            default:
                return message;
        }
    };

    const showError = error && <p className="error">{getErrorMessage(error)}</p>;

    // Logout-Handler
    const handleLogout = () => {
        localStorage.removeItem('username'); // Benutzernamen aus dem localStorage entfernen
        setIsLoggedIn(false);
        setIs2FAVerified(false);
        setUsername('');
        setUserData(null);

        setOtpCode('');
    };

    // Login-Screen
    if (!isLoggedIn) {
        return (
            <div className="container">
                <h2>Ressourcen-Anmeldung</h2>
                {showError}
                <input
                    type="text"
                    placeholder="Benutzername"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <button onClick={handleLogin}>Einloggen</button>
            </div>
        );
    }

    // 2FA-Screen
    if (!is2FAVerified) {
        return (
            <div className="container">
                <h2>2FA-Überprüfung</h2>
                {showError}
                <input
                    type="text"
                    placeholder="OTP-Code"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                />
                <button onClick={handleVerifyOTP}>Bestätigen</button>
            </div>
        );
    }

    // Hauptansicht nach erfolgreichem Login und 2FA
    if (isLoading) {
        return <p>Lade Benutzerdaten...</p>;
    }

    if (!userData) {
        return <p>Benutzerdaten konnten nicht geladen werden.</p>;
    }

    return (
        <div className="container">
            <h2>Benutzerinformationen</h2>
            {showError}
            <div className="user-info">
                <p><strong>Name:</strong> {userData.name}</p>
                <p><strong>Status:</strong> {userData.status}</p>
                <p><strong>Ressource:</strong> {userData.ressource}</p>
            </div>
            <h3>Status ändern</h3>
            <div className="status-container">
                {statuses.map((status) => (
                    <div
                        key={status.id}
                        className={`box ${status.text}`}
                        onClick={() => setStatus(status.text)}
                    >
                        <p>{status.text}</p>
                    </div>
                ))}
            </div>
            <button className="logout-button" onClick={handleLogout}>
                Logout
            </button>
        </div>
    );
};

export default Mobile;
