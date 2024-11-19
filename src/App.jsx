import { useState, useEffect, useRef } from 'react';
import './App.css';
import L from 'leaflet'; // Importiere Leaflet für die Karte
import 'leaflet/dist/leaflet.css'; // Importiere die Leaflet-CSS-Datei
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap CSS
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Bootstrap JS (inkl. Popper.js)

function App() {
    const [sessionName, setSessionName] = useState('UserName');
    const [tableData, setTableData] = useState([]);
    const [gpsData, setGpsData] = useState(null); // Zustand für GPS-Daten

    const gpsModalRef = useRef(null); // Ref für das GPS-Modal
    const mapRef = useRef(null); // Ref für die Leaflet-Karte

    useEffect(() => {
        fetchMitarbeiter();

        // WebSocket-Verbindung zum Server herstellen
        const ws = new WebSocket('ws://localhost:5000');

        // Bei Empfang einer Nachricht wird `fetchMitarbeiter` erneut aufgerufen
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.message === 'update') {
                fetchMitarbeiter();
            }
        };

        // WebSocket-Verbindung schließen, wenn Component unmounted wird
        // return () => ws.close();
    }, []);

    // Funktion zum Abrufen der Mitarbeiterdaten
    const fetchMitarbeiter = () => {
        fetch('http://localhost:5000/api/fetchMitarbeiter')
            .then((response) => response.json())
            .then((data) => setTableData(data))
            .catch((error) => console.error('Fehler beim Abrufen der Mitarbeiterdaten:', error));
    };

    // Abrufen der GPS-Daten für einen Benutzer
    const fetchGpsData = (usernummer) => {
        setGpsData(null); // Setze gpsData auf null, bevor neue Daten geladen werden

        fetch(`http://localhost:5000/api/fetchGps/${usernummer}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Fehler beim Abrufen der GPS-Daten');
                }
                return response.json();
            })
            .then((data) => {
                if (data && data.lat && data.lng) {
                    setGpsData(data); // Nur setzen, wenn gültige Daten vorhanden sind
                } else {
                    setGpsData(null); // Null setzen, wenn ungültig
                }
            })
            .catch(() => {
                // Einfach still bleiben, keine Fehlermeldung anzeigen
                setGpsData(null);
            });
    };

    // Funktion, um das GPS Modal zu öffnen und die GPS-Daten zu laden
    const openGpsModal = (usernummer) => {
        fetchGpsData(usernummer); // GPS-Daten abrufen, bevor Modal angezeigt wird

        // Bootstrap Modal mit Ref steuern
        const modal = new window.bootstrap.Modal(gpsModalRef.current);
        modal.show(); // Modal öffnen
    };

// Funktion zum Setzen der Karte
    const initMap = (lat, lon) => {
        if (lat === undefined || lon === undefined) {
            return; // Keine Aktion, wenn Daten ungültig sind
        }

        // Karte initialisieren oder aktualisieren
        if (!mapRef.current._leaflet_id) {
            // Erstelle eine neue Karte, wenn sie noch nicht existiert
            const map = L.map(mapRef.current).setView([lat, lon], 13);
            mapRef.current._leaflet_id = true; // Setze ein Flag, um mehrfaches Initialisieren zu verhindern

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(map);

            L.marker([lat, lon]).addTo(map) // Marker hinzufügen
                .bindPopup('Aktueller Standort')
                .openPopup();
        } else {
            // Wenn die Karte existiert, zentriere sie auf die neuen Koordinaten
            const map = mapRef.current._leaflet_map; // Zugriff auf die bestehende Leaflet-Instanz
            map.setView([lat, lon], 13); // Zentriere die Karte auf die neuen Koordinaten

            // Marker neu setzen (alte Marker sollten optional gelöscht werden)
            L.marker([lat, lon]).addTo(map)
                .bindPopup('Aktueller Standort')
                .openPopup();
        }
    };

    // Funktion zum Rendern der Karte, wenn gpsData vorhanden ist
    useEffect(() => {
        if (gpsData && gpsData.lat !== undefined && gpsData.lng !== undefined) {
            initMap(gpsData.lat, gpsData.lng);
        }
    }, [gpsData]); // Nur wenn gpsData aktualisiert wird

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
                                <a className="nav-link active" aria-current="page" href="/">Webansicht Staplerfahrer</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link disabled" href="/pwnressources">Ressourcenverwaltung</a>
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
                <input type="hidden" id="name" value={sessionName} />
                <br />
                <hr />
                <h2>Webansicht</h2>
                <hr />
                <table className="table-pwn">
                    <thead>
                    <tr>
                        <th>Usernummer</th>
                        <th>Fahrer</th>
                        <th style={{ textAlign: 'center' }}>Status</th>
                        <th style={{ textAlign: 'center' }}>Zusatz</th>
                        <th style={{ textAlign: 'center' }}>seit</th>
                        <th style={{ textAlign: 'center' }}>GPS</th>
                    </tr>
                    </thead>
                    <tbody>
                    {tableData
                        .filter((row) => row.status !== 'Abgemeldet') // Filtert "Abgemeldete" aus
                        .map((row, index) => (
                            <tr key={index}>
                                <td>{row.usernummer}</td>
                                <td>{row.name}</td>
                                <td className={`status-cell ${row.status}`} style={{ textAlign: 'center' }}>
                                    {row.status}
                                </td>
                                <td style={{ textAlign: 'center' }}>{row.text}</td>
                                <td style={{ textAlign: 'center' }}>{row.seit}</td>
                                <td style={{ textAlign: 'center' }}>
                                    <i
                                        onClick={() => openGpsModal(row.usernummer)}
                                        className="fas fa-map-marker-alt"
                                        style={{ cursor: 'pointer', fontSize: '24px', color: '#17a2b8' }}
                                    ></i>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* GPS Modal */}
            <div className="modal fade" ref={gpsModalRef} tabIndex="-1" aria-labelledby="gpsModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-xl">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="gpsModalLabel">GPS Standort</h5>
                        </div>
                        <div className="modal-body">
                            {gpsData ? (
                                <div ref={mapRef} style={{ height: '500px' }}></div> // Karte anzeigen
                            ) : (
                                <p>Keine GPS-Daten verfügbar</p> // Freundliche Nachricht
                            )}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Schließen</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
