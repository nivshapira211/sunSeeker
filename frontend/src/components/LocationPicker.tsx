import React, { useState, useCallback, useRef } from 'react';
import {
    GoogleMap,
    useJsApiLoader,
    Marker,
    Autocomplete,
} from '@react-google-maps/api';
import { MapPin, Search, Loader } from 'lucide-react';

const libraries: ('places')[] = ['places'];

const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '300px',
    borderRadius: 'var(--radius-md)',
};

const darkMapStyles: google.maps.MapTypeStyle[] = [
    { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#8a8a9a' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2a2a3e' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1a2b' }] },
    { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
];

const defaultCenter = { lat: 32.0853, lng: 34.7818 }; // Tel Aviv

export interface LocationPickerValue {
    location: string;
    coordinates: { lat: number; lng: number };
}

interface LocationPickerProps {
    value?: LocationPickerValue;
    onChange: (value: LocationPickerValue) => void;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ value, onChange }) => {
    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
        libraries,
    });

    const [marker, setMarker] = useState<{ lat: number; lng: number }>(
        value?.coordinates?.lat ? value.coordinates : defaultCenter
    );
    const [searchText, setSearchText] = useState(value?.location || '');
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const mapRef = useRef<google.maps.Map | null>(null);

    const onMapLoad = useCallback((map: google.maps.Map) => {
        mapRef.current = map;
    }, []);

    const onMapClick = useCallback(
        (e: google.maps.MapMouseEvent) => {
            if (!e.latLng) return;
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            setMarker({ lat, lng });

            // Reverse-geocode to get a human-readable name
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                if (status === 'OK' && results && results[0]) {
                    const name = results[0].formatted_address;
                    setSearchText(name);
                    onChange({ location: name, coordinates: { lat, lng } });
                } else {
                    const fallback = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                    setSearchText(fallback);
                    onChange({ location: fallback, coordinates: { lat, lng } });
                }
            });
        },
        [onChange]
    );

    const onAutocompleteLoad = useCallback((ac: google.maps.places.Autocomplete) => {
        autocompleteRef.current = ac;
    }, []);

    const onPlaceChanged = useCallback(() => {
        const place = autocompleteRef.current?.getPlace();
        if (!place?.geometry?.location) return;
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const name = place.formatted_address || place.name || '';

        setMarker({ lat, lng });
        setSearchText(name);
        mapRef.current?.panTo({ lat, lng });
        mapRef.current?.setZoom(14);
        onChange({ location: name, coordinates: { lat, lng } });
    }, [onChange]);

    if (loadError) {
        return (
            <div style={{ color: 'var(--color-danger)', padding: '12px' }}>
                Failed to load Google Maps. Check your API key.
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '40px',
                    color: 'var(--color-text-secondary)',
                }}
            >
                <Loader size={18} className="spin" />
                Loading map...
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Autocomplete search bar */}
            <div style={{ position: 'relative' }}>
                <Search
                    size={18}
                    style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--color-text-muted)',
                        zIndex: 1,
                    }}
                />
                <Autocomplete onLoad={onAutocompleteLoad} onPlaceChanged={onPlaceChanged}>
                    <input
                        type="text"
                        placeholder="Search for a location..."
                        className="glass-input"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 10px 10px 40px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 'var(--radius-md)',
                            color: 'white',
                        }}
                    />
                </Autocomplete>
            </div>

            {/* Google Map */}
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={marker}
                zoom={12}
                onClick={onMapClick}
                onLoad={onMapLoad}
                options={{
                    styles: darkMapStyles,
                    disableDefaultUI: true,
                    zoomControl: true,
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: false,
                }}
            >
                <Marker
                    position={marker}
                    draggable
                    onDragEnd={(e) => {
                        if (e.latLng) {
                            onMapClick(e as google.maps.MapMouseEvent);
                        }
                    }}
                />
            </GoogleMap>

            {/* Selected location display */}
            {value?.location && (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: 'var(--color-primary)',
                        fontSize: '0.85rem',
                    }}
                >
                    <MapPin size={14} />
                    <span>{value.location}</span>
                </div>
            )}
        </div>
    );
};

export default LocationPicker;
