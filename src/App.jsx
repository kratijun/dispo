import { useState, useEffect } from 'react';
import './App.css'; // Stelle sicher, dass die CSS-Datei hier importiert wird
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap CSS
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Bootstrap JS

function App() {
    const [tableData, setTableData] = useState([]);
    const [hoveredRessource, setHoveredRessource] = useState(null); // Zustand für die hoverende Ressource
    const [editingRow, setEditingRow] = useState(null); // Zustand für die Bearbeitung
    const [updatedText, setUpdatedText] = useState(''); // Zustand für den bearbeiteten Text

    useEffect(() => {
        fetchMitarbeiter();

        // WebSocket-Verbindung zum Server herstellen
        const ws = new WebSocket('ws://forum.alpenreich.eu:3520');

        // Bei Empfang einer Nachricht wird `fetchMitarbeiter` erneut aufgerufen
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.message === 'update') {
                fetchMitarbeiter();
            }
        };

        // WebSocket-Verbindung schließen, wenn Component unmounted wird
        return () => ws.close();
    }, []);

    // Funktion zum Abrufen der Mitarbeiterdaten
    const fetchMitarbeiter = () => {
        fetch(import.meta.env.BASE_URL +'/api/user/getUserData')
            .then((response) => response.json())
            .then((data) => setTableData(data))
            .catch((error) => console.error('Fehler beim Abrufen der Mitarbeiterdaten:', error));
    };

    // Funktion zum Setzen der Hover-Ressource
    const handleMouseEnter = (row) => {
        setHoveredRessource(row); // Setze die aktuelle Ressource, wenn die Maus drüber ist
    };

    // Funktion zum Entfernen der Hover-Ressource
    const handleMouseLeave = () => {
        setHoveredRessource(null); // Setze den Hover-Zustand zurück, wenn die Maus die Ressource verlässt
    };

    // Funktion für die Bearbeitung des Zusatztextes
    const handleEdit = (row) => {
        setEditingRow(row); // Setze die Ressource, die bearbeitet wird
        setUpdatedText(row.text || ''); // Setze den Text (leer, wenn kein Text vorhanden)
        // Öffne das Modal
        const modal = new window.bootstrap.Modal(document.getElementById('editModal'));
        modal.show(); // Zeige das Modal an
    };

    // Funktion zum Speichern der Änderungen
    const handleSave = () => {
        if (!editingRow) return;

        // Update im Backend durchführen
        fetch(import.meta.env.BASE_URL +'/api/user/updateZusatz', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ressource: editingRow.ressource,
                newText: updatedText,
            }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Fehler beim Speichern der Änderungen');
                }
                return response.json(); // Antworte als JSON parsen
            })
            .then((data) => {
                console.log(data); // Erfolgsnachricht vom Backend (optional)
                // WebSocket-Update senden
                const ws = new WebSocket('ws://localhost:3520');
                ws.onopen = () => {
                    ws.send(JSON.stringify({ message: 'update' }));
                };
                // Nach dem Speichern das Modal schließen
                const modal = window.bootstrap.Modal.getInstance(document.getElementById('editModal'));
                modal.hide();
                // Bearbeitungsstatus zurücksetzen
                setEditingRow(null);
                setUpdatedText('');
            })
            .catch((error) => {
                console.error('Fehler beim Speichern der Änderungen:', error);
            });
    };

    return (
        <div>
            <nav className="navbar navbar-dark bg-primary navbar-expand-lg">
                <div className="container-fluid">
                    <a className="navbar-brand" href="#">DISPO</a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText"
                            aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarText">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <a className="nav-link active" aria-current="page" href="/admin">Webansicht</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="/ressource-management">Ressourcenverwaltung</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link disabled" href="/pwngps">GPS-Ansicht</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link disabled" href="/pwndisponenten">aktive Disponenten</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            <div className="container-fluid" style={{ width: '90%' }}>
                <br />
                <hr />
                <h2>Webansicht</h2>
                <hr />
                <table className="table-pwn">
                    <thead>
                    <tr>
                        <th>Ressource</th>
                        <th>Fahrer</th>
                        <th style={{ textAlign: 'center' }}>Status</th>
                        <th style={{ textAlign: 'center' }}>Zusatz</th>
                        <th style={{ textAlign: 'center' }}>seit</th>
                    </tr>
                    </thead>
                    <tbody>
                    {tableData
                        .map((row, index) => (
                            <tr key={index}>
                                <td
                                    style={{position: 'relative'}}
                                    onMouseEnter={() => handleMouseEnter(row)} // Hover-Daten setzen
                                    onMouseLeave={handleMouseLeave} // Hover-Daten löschen
                                >
                                    {row.ressource}
                                    {hoveredRessource && hoveredRessource.ressource === row.ressource && (
                                        <div className="hover-box">
                                            <p><i className="fas fa-user"></i> <strong>Fahrer:</strong> {row.name}</p>
                                            <p><i className="fas fa-phone-alt"></i> <strong>DW od. KW:</strong> {row.dw}
                                            </p>
                                            <p><i className="fas fa-clock"></i> <strong>Arbeitszeit:</strong> {row.az}
                                            </p>
                                        </div>
                                    )}
                                </td>
                                <td>{row.name}</td>
                                <td className={`status-cell ${row.status}`} style={{textAlign: 'center'}}>
                                    {row.status}
                                </td>
                                <td style={{textAlign: 'center'}}>
                                    {row.text || <span>&nbsp;</span>}
                                    <i
                                        className="fas fa-pen"
                                        style={{
                                            cursor: 'pointer', // Zeigt den Zeiger an, um Interaktivität zu signalisieren
                                            fontSize: '0.8rem', // Größe des Stift-Icons anpassen
                                            marginLeft: '8px', // Platz zwischen Text und Icon
                                            color: '#007bff' // Optional: Stiftfarbe (z.B. Blau für Bootstrap-Theme)
                                        }}
                                        onClick={() => handleEdit(row)} // Klick-Event für das Icon
                                        title="Bearbeiten" // Tooltip beim Überfahren mit der Maus
                                    ></i>
                                </td>

                                <td style={{textAlign: 'center'}}>{row.seit}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal für die Textbearbeitung */}
            <div className="modal fade" id="editModal" tabIndex="-1" aria-labelledby="editModalLabel"
                 aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="editModalLabel">Zusatz bearbeiten</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <textarea
                                className="form-control"
                                value={updatedText}
                                onChange={(e) => setUpdatedText(e.target.value)} // Text aktualisieren
                                rows="5"
                            ></textarea>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Abbrechen</button>
                            <button type="button" className="btn btn-primary" onClick={handleSave}>Speichern</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
