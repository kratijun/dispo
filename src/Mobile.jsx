import React, { useState, useEffect } from 'react';
import './Mobile.css';

// Dummy-API-Response für Status
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
    const [tableData, setTableData] = useState([]);  // Für Mitarbeiter-Daten
    const [selectedUser, setSelectedUser] = useState(null);  // Den aktuellen User speichern
    const [usernummer, setUsernummer] = useState(null); // Aktuelle Usernummer
    const [userName, setUserName] = useState(''); // Benutzername
    const [currentStatus, setCurrentStatus] = useState(''); // Aktueller Status

    // Funktion, um Mitarbeiter-Daten zu holen
    const fetchMitarbeiter = () => {
        fetch('http://localhost:5000/api/fetchMitarbeiter')
            .then((response) => response.json())
            .then((data) => setTableData(data))
            .catch((error) => console.error('Fehler beim Abrufen der Mitarbeiterdaten:', error));
    };

    // Funktion, um den gespeicherten Namen zu laden
    const loadUserName = () => {
        const savedName = localStorage.getItem('userName');
        if (savedName) {
            setUserName(savedName);
        }
    };

    // Funktion, um den Namen zu speichern
    const saveUserName = (name) => {
        localStorage.setItem('userName', name);
    };

    // Funktion, die die Uhrzeit im Format 'HH:mm' zurückgibt
    const getCurrentTime = () => {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    // Status setzen (API-Call)
    const setStatus = async (status) => {
        const seit = getCurrentTime();

        try {
            const response = await fetch('http://localhost:5000/api/updateStatus', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: status,
                    usernummer: usernummer, // Aktuelle Usernummer
                    seit: seit,
                }),
            });

            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || 'Fehler beim Aktualisieren des Status');
            }
            setCurrentStatus(status); // Aktuellen Status setzen
        } catch (error) {
            console.error('Fehler:', error.message);
            alert(`Fehler: ${error.message}`);
        }
    };

    // Funktion, um den Namen im Backend zu aktualisieren (bei Anmeldung)
    // const updateName = async (name) => {
    //     if (!usernummer || !name) {
    //         console.log('Fehler: Usernummer oder Name fehlen');
    //         return;
    //     }
    //
    //     console.log('Sende Update-Request für den Namen:', name);
    //
    //     try {
    //         const response = await fetch('http://localhost:5000/api/updateName', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({
    //                 usernummer: usernummer,
    //                 name: name
    //             }),
    //         });
    //
    //         if (!response.ok) {
    //             const message = await response.text();
    //             throw new Error(message || 'Fehler beim Aktualisieren des Namens');
    //         }
    //
    //         console.log('Name erfolgreich aktualisiert');
    //     } catch (error) {
    //         console.error('Fehler beim Update des Namens:', error.message);
    //         alert(`Fehler: ${error.message}`);
    //     }
    // };

    // Funktion, um den Namen im Backend zu löschen (bei Abmeldung)
    const deleteName = async () => {
        if (!usernummer) return;

        try {
            const response = await fetch('http://localhost:5000/api/deleteName', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    usernummer: usernummer
                }),
            });

            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || 'Fehler beim Löschen des Namens');
            }

            console.log('Name erfolgreich gelöscht');
        } catch (error) {
            console.error('Fehler:', error.message);
        }
    };

    // Logout-Funktion
    const logoutUser = () => {
        setSelectedUser(null); // Zurück zur Auswahl
        setUsernummer(null);   // Usernummer zurücksetzen
        deleteName();          // Name im Backend löschen
    };

    // Initial die Mitarbeiter-Daten abrufen
    useEffect(() => {
        fetchMitarbeiter();
        loadUserName(); // Benutzername beim Laden der Seite einlesen
    }, []);

    // Wenn kein User ausgewählt wurde, zeigt die Auswahl der Mitarbeiter
    if (!selectedUser) {
        return (
            <div className="container" style={{ marginTop: '5%' }}>
                <h2>Ressource anmelden</h2>
                <select
                    onChange={async (e) => {
                        const usernummer = parseInt(e.target.value);  // Usernummer aus der Auswahl holen
                        const user = tableData.find((user) => user.usernummer === usernummer);

                        console.log('Usernummer:', usernummer);  // Log für Debugging
                        console.log('User:', user);              // Log für Debugging

                        if (user) {
                            setSelectedUser(user);  // User auswählen
                            setUsernummer(usernummer); // Setze die Usernummer

                            // Log, um den Namen zu prüfen
                            console.log('Benutzername:', userName);

                            if (userName) {
                                try {
                                    const response = await fetch('http://localhost:5000/api/updateName', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({
                                            usernummer: usernummer,
                                            name: userName // Verwende userName statt name
                                        }),
                                    });

                                    if (!response.ok) {
                                        const message = await response.text();
                                        throw new Error(message || 'Fehler beim Aktualisieren des Namens');
                                    }
                                    console.log('Name erfolgreich aktualisiert');
                                } catch (error) {
                                    console.error('Fehler beim Aktualisieren des Namens:', error.message);
                                    alert(`Fehler: ${error.message}`);
                                }
                            } else {
                                console.log('Fehler: Benutzername ist leer');
                            }
                        } else {
                            console.log('Fehler: User nicht gefunden');
                        }
                    }}
                >
                    <option value="">-- Bitte auswählen --</option>
                    {tableData.map((user) => (
                        <option key={`${user.id}`} value={user.usernummer}>
                            Usernummer {user.usernummer}
                        </option>
                    ))}
                </select>

                {/* Textfeld für den Namen */}
                <div>
                    <input
                        type="text"
                        id="userName"
                        value={userName}
                        onChange={(e) => {
                            const name = e.target.value;
                            setUserName(name);
                            saveUserName(name); // Speichern des Namens
                        }}
                        placeholder="Geben Sie Ihren Namen ein"
                    />
                </div>
            </div>
        );
    }

    // Wenn ein User ausgewählt wurde, zeige den Status und Usernummer an
    return (
        <div className="container" style={{ marginTop: '5%' }}>
            <h2>Usernummer: {usernummer}</h2>
            <p>Name: {userName || "Nicht gesetzt"}</p>
            <p>Status: {currentStatus || "Nicht gesetzt"}</p>
            <button onClick={logoutUser}>Abmelden</button>
            <div className="status-container">
                {statuses.map((status) => (
                    <div
                        key={status.id}
                        className={`box ${status.text}`}
                        onClick={() => setStatus(status.text)}
                    >
                        <div className="box-number">{status.id}</div>
                        <div className="status-text">{status.text}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Mobile;
