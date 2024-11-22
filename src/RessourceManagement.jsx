import { useState, useEffect } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function RessourceManagement() {
    const [resources, setResources] = useState([]);
    const [editingResource, setEditingResource] = useState(null);
    const [newUserName, setNewUserName] = useState('');
    const [newName, setNewName] = useState('');
    const [newRessource, setNewRessource] = useState('');
    const [newAz, setNewAz] = useState('');
    const [newDw, setNewDw] = useState('');
    const [newSecret, setNewSecret] = useState('');

    const fetchResources = async () => {
        try {
            const response = await fetch('http://localhost:3520/api/user/getUserData');
            if (!response.ok) {
                throw new Error('Fehler beim Abrufen der Ressourcen');
            }
            const data = await response.json();
            setResources(data);
        } catch (error) {
            console.error('Fehler beim Abrufen der Ressourcen:', error);
            toast.error('Fehler beim Abrufen der Ressourcen');
        }
    };

    useEffect(() => {
        fetchResources();
    }, []);

    const handleEdit = (resource) => {
        setEditingResource(resource);
        setNewUserName(resource.username || '');
        setNewName(resource.name || '');
        setNewRessource(resource.ressource || '');
        setNewAz(resource.az || '');
        setNewDw(resource.dw || '');
        setNewSecret(resource.secret || '');
        const editModal = new window.bootstrap.Modal(document.getElementById('editModal'));
        editModal.show();
    };

    const handleCreate = async () => {
        try {
            const response = await fetch('http://localhost:3520/api/user/createRessource', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: newUserName,
                    name: newName,
                    ressource: newRessource,
                    az: newAz,
                    dw: newDw,
                    secret: newSecret,
                }),
            });
            if (!response.ok) {
                throw new Error('Fehler beim Erstellen der Ressource');
            }
            const data = await response.json();
            fetchResources();
            const createModal = window.bootstrap.Modal.getInstance(document.getElementById('createModal'));
            if (createModal) {
                createModal.hide();
            }
            setNewUserName('');
            setNewName('');
            setNewRessource('');
            setNewAz('');
            setNewDw('');
            setNewSecret('');
            toast.success('Neue Ressource erfolgreich erstellt!');
        } catch (error) {
            console.error('Fehler beim Erstellen der Ressource:', error);
            toast.error('Fehler beim Erstellen der Ressource');
        }
    };

    const handleCreateModal = () => {
        const createModal = new window.bootstrap.Modal(document.getElementById('createModal'));
        createModal.show();
        setNewUserName('');
        setNewName('');
        setNewRessource('');
        setNewAz('');
        setNewDw('');
        setNewSecret('');
    };

    const handleSaveEdit = async () => {
        try {
            const response = await fetch('http://localhost:3520/api/user/updateResource', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: editingResource.id,
                    newUserName,
                    newName,
                    newRessource,
                    newAz,
                    newDw,
                    newSecret,
                }),
            });
            if (!response.ok) {
                throw new Error('Fehler beim Bearbeiten der Ressource');
            }
            const data = await response.json();
            fetchResources();
            const editModal = window.bootstrap.Modal.getInstance(document.getElementById('editModal'));
            if (editModal) {
                editModal.hide();
            }
            setEditingResource(null);
            toast.success('Ressource erfolgreich bearbeitet!');
        } catch (error) {
            console.error('Fehler beim Bearbeiten der Ressource:', error);
            toast.error('Fehler beim Bearbeiten der Ressource');
        }
    };

    // Löschen-Funktion
    const handleDelete = (id) => {
        if (window.confirm('Möchten Sie diese Ressource wirklich löschen?')) {
            deleteResource(id);
        }
    };

    const deleteResource = async (id) => {
        try {
            const response = await fetch(`http://localhost:3520/api/user/deleteResource/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Fehler beim Löschen der Ressource');
            }
            fetchResources();
            toast.success('Ressource erfolgreich gelöscht!');
        } catch (error) {
            console.error('Fehler beim Löschen der Ressource:', error);
            toast.error('Fehler beim Löschen der Ressource');
        }
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
                                <a className="nav-link" aria-current="page" href="/admin">Webansicht</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link active" href="/ressource-management">Ressourcenverwaltung</a>
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
                <h2>Ressourcenverwaltung</h2>
                <hr />
                <button
                    className="btn btn-success mb-4"
                    onClick={handleCreateModal}
                    style={{ position: 'fixed', bottom: '20px', right: '20px', fontSize: '30px' }}
                >
                    <i className="fas fa-plus"></i>
                </button>

                <div className="row">
                    {resources.length > 0 ? (
                        resources.map((resource, index) => (
                            <div className="col-md-4 mb-4" key={index}>
                                <div className="card h-100 position-relative">
                                    <div className="card-body">
                                        <i
                                            className="fas fa-pen position-absolute"
                                            style={{ top: '10px', right: '10px', cursor: 'pointer', color: '#007bff' }}
                                            onClick={() => handleEdit(resource)}
                                        ></i>

                                        {/* Löschen-Icon */}
                                        <i
                                            className="fas fa-trash position-absolute"
                                            style={{ top: '10px', right: '40px', cursor: 'pointer', color: '#dc3545' }}
                                            onClick={() => handleDelete(resource.id)}
                                        ></i>

                                        <h5 className="card-title">
                                            <i className="fas fa-cogs me-2"></i>{resource.ressource}
                                        </h5>
                                        <p className="card-text">
                                            <strong><i className="fas fa-user me-2"></i>Username:</strong> {resource.username || 'Unbekannt'}<br />
                                            <strong><i className="fas fa-clock me-2"></i>Az:</strong> {resource.az || 'Unbekannt'}<br />
                                            <strong><i className="fas fa-cogs me-2"></i>Dw:</strong> {resource.dw || 'Unbekannt'}<br />
                                            <strong><i className="fas fa-key me-2"></i>Secret:</strong> {resource.secret || 'Unbekannt'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>Es sind keine Ressourcen vorhanden.</p>
                    )}
                </div>

                {/* Edit Modal */}
                <div className="modal fade" id="editModal" tabIndex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="editModalLabel">Bearbeite Ressource</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <form>
                                    <div className="mb-3">
                                        <label htmlFor="editUsername" className="form-label">Username</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="editUsername"
                                            value={newUserName}
                                            onChange={(e) => setNewUserName(e.target.value)}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="editName" className="form-label">Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="editName"
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="editRessource" className="form-label">Ressource</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="editRessource"
                                            value={newRessource}
                                            onChange={(e) => setNewRessource(e.target.value)}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="editAz" className="form-label">Az</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="editAz"
                                            value={newAz}
                                            onChange={(e) => setNewAz(e.target.value)}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="editDw" className="form-label">Dw</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="editDw"
                                            value={newDw}
                                            onChange={(e) => setNewDw(e.target.value)}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="editSecret" className="form-label">Secret</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="editSecret"
                                            value={newSecret}
                                            onChange={(e) => setNewSecret(e.target.value)}
                                        />
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Abbrechen</button>
                                <button type="button" className="btn btn-primary" onClick={handleSaveEdit}>Speichern</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Create Modal */}
                <div className="modal fade" id="createModal" tabIndex="-1" aria-labelledby="createModalLabel" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="createModalLabel">Neue Ressource erstellen</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <form>
                                    <div className="mb-3">
                                        <label htmlFor="createUsername" className="form-label">Username</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="createUsername"
                                            value={newUserName}
                                            onChange={(e) => setNewUserName(e.target.value)}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="createName" className="form-label">Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="createName"
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="createRessource" className="form-label">Ressource</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="createRessource"
                                            value={newRessource}
                                            onChange={(e) => setNewRessource(e.target.value)}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="createAz" className="form-label">Az</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="createAz"
                                            value={newAz}
                                            onChange={(e) => setNewAz(e.target.value)}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="createDw" className="form-label">Dw</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="createDw"
                                            value={newDw}
                                            onChange={(e) => setNewDw(e.target.value)}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="createSecret" className="form-label">Secret</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="createSecret"
                                            value={newSecret}
                                            onChange={(e) => setNewSecret(e.target.value)}
                                        />
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Abbrechen</button>
                                <button type="button" className="btn btn-primary" onClick={handleCreate}>Erstellen</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RessourceManagement;
