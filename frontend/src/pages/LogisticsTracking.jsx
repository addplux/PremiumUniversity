import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './LogisticsTracking.css';

// Fix Leaflet marker icon issue
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const LogisticsTracking = () => {
    const [trackingNumber, setTrackingNumber] = useState('');
    const [shipment, setShipment] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleTrack = async () => {
        if (!trackingNumber) return;
        try {
            setLoading(true);
            const res = await axios.get(`/api/logistics/track/${trackingNumber}`);
            if (res.data.success) {
                setShipment(res.data.data);
            }
        } catch (error) {
            alert('Shipment not found');
            setShipment(null);
        } finally {
            setLoading(false);
        }
    };

    // Default center (San Francisco) if no shipment
    const defaultPosition = [37.7749, -122.4194];
    const shipmentPosition = shipment?.currentLocation?.coordinates
        ? [shipment.currentLocation.coordinates.lat, shipment.currentLocation.coordinates.lng]
        : defaultPosition;

    return (
        <div className="logistics-page">
            <div className="page-header">
                <h1>Logistics Tracking</h1>
                <p>Track inbound shipments and supplier deliveries in real-time.</p>
            </div>

            <div className="tracking-bar">
                <input
                    type="text"
                    placeholder="Enter Tracking Number (e.g. TRK-12345)"
                    value={trackingNumber}
                    onChange={e => setTrackingNumber(e.target.value)}
                />
                <button className="btn btn-primary" onClick={handleTrack} disabled={loading}>
                    {loading ? 'Tracking...' : 'Track Shipment'}
                </button>
            </div>

            <div className="logistics-grid">
                {/* Map View */}
                <div className="map-container">
                    <MapContainer center={shipmentPosition} zoom={13} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {shipment && shipment.currentLocation?.coordinates && (
                            <Marker position={shipmentPosition}>
                                <Popup>
                                    Current Location: <br /> {shipment.currentLocation.address}
                                </Popup>
                            </Marker>
                        )}
                    </MapContainer>
                </div>

                {/* Details Side Panel */}
                <div className="details-panel card">
                    {shipment ? (
                        <>
                            <div className="status-header">
                                <h3>{shipment.status}</h3>
                                <span>Est. Delivery: {new Date(shipment.estimatedDeliveryDate).toLocaleDateString()}</span>
                            </div>

                            <div className="shipment-meta">
                                <p><strong>Carrier:</strong> {shipment.carrier}</p>
                                <p><strong>From:</strong> {shipment.supplierId?.name}</p>
                            </div>

                            <div className="timeline">
                                <h4>Shipment History</h4>
                                {shipment.events.map((event, idx) => (
                                    <div key={idx} className="timeline-item">
                                        <div className="timeline-dot"></div>
                                        <div className="timeline-content">
                                            <span className="time">{new Date(event.timestamp).toLocaleString()}</span>
                                            <p>{event.description}</p>
                                            <small>{event.location}</small>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="empty-state">
                            <p>Enter a tracking number to view shipment details.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LogisticsTracking;
