import { useState, useEffect, useRef } from 'react';
import './App.css';
import L from 'leaflet'; // Importiere Leaflet für die Karte
import 'leaflet/dist/leaflet.css'; // Importiere die Leaflet-CSS-Datei
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap CSS
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Bootstrap JS (inkl. Popper.js)

function App() {
    const [tableData, setTableData] = useState([]);


    useEffect(() => {
        fetchMitarbeiter();

        // WebSocket-Verbindung zum Server herstellen
        const ws = new WebSocket('ws://localhost:3520');

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
        fetch('http://localhost:3520/api/mitarbeiter/fetchMitarbeiter')
            .then((response) => response.json())
            .then((data) => setTableData(data))
            .catch((error) => console.error('Fehler beim Abrufen der Mitarbeiterdaten:', error));
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
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default App;
