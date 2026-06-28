import React, { useEffect, useMemo, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import useMapStore from "../../store/useMapStore";
import "../../styles/map.css";
import {
  getPointLatLng,
  isInsideVenezuela,
  VENEZUELA_CENTER,
  VENEZUELA_INITIAL_ZOOM,
  VENEZUELA_LEAFLET_BOUNDS,
  VENEZUELA_MAX_ZOOM,
  VENEZUELA_MIN_ZOOM,
} from "../../utils/geoValidation";

// Fix para el ícono por defecto de Leaflet con Vite/Webpack.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const CATEGORY_COLORS = {
  refugio: "#16a34a",
  refuge: "#16a34a",
  hospital: "#2563eb",
  agua: "#0284c7",
  comida: "#f59e0b",
  medicinas: "#ef4444",
  medicine: "#ef4444",
  persona: "#7c3aed",
  personas: "#7c3aed",
  danger: "#ef4444",
  peligro: "#ef4444",
  centro_acopio: "#14b8a6",
  acopio: "#14b8a6",
};

const STATUS_LABELS = {
  active: "Activo",
  full: "Saturado",
  danger: "Peligro",
  closed: "Cerrado",
  unverified: "No verificado",
};

const CATEGORY_ICONS = {
  refugio: "🏠",
  refuge: "🏠",
  hospital: "🏥",
  agua: "💧",
  comida: "🍲",
  medicinas: "💊",
  medicine: "💊",
  persona: "👤",
  personas: "👤",
  danger: "⚠️",
  peligro: "⚠️",
  centro_acopio: "📦",
  acopio: "📦",
};

function getMarkerColor(category, status) {
  const slug = category?.slug || category?.name?.toLowerCase?.() || "";
  const baseColor = CATEGORY_COLORS[slug] || category?.color || "#2563eb";

  if (status === "danger") return "#ef4444";
  if (status === "full") return "#f59e0b";
  if (status === "closed") return "#64748b";
  if (status === "unverified") return "#94a3b8";

  return baseColor;
}

// Ícono con emojis para referencias visuales
function createCustomIcon(category, status) {
  const color = getMarkerColor(category, status);
  const slug = category?.slug || category?.name?.toLowerCase?.() || "";
  const emoji = CATEGORY_ICONS[slug] || "📍";
  const pulse = status === "danger" ? "animation: danger-pulse 2s infinite;" : "";

  const html = `
    <div style="
      width: 36px; height: 36px;
      background: #ffffff;
      border-radius: 999px;
      border: 3px solid ${color};
      box-shadow: 0 8px 22px rgba(15,23,42,0.22);
      display: flex; align-items: center; justify-content: center;
      font-size: 18px;
      ${pulse}
    ">
      ${emoji}
    </div>
  `;

  return L.divIcon({
    html,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
    className: "",
  });
}

// Ícono minimalista para bloqueos de vía.
function createRoadBlockIcon(severity) {
  const color =
    severity === "critical"
      ? "#991b1b"
      : severity === "high"
        ? "#dc2626"
        : severity === "medium"
          ? "#d97706"
          : "#78350f";

  const html = `
    <div style="
      width: 32px; height: 32px;
      border-radius: 10px;
      border: 3px solid white;
      box-shadow: 0 8px 20px rgba(15,23,42,0.22);
      background: repeating-linear-gradient(
        45deg,
        ${color},
        ${color} 6px,
        #ffffff 6px,
        #ffffff 10px
      );
      display: flex; align-items: center; justify-content: center;
      font-size: 16px;
    ">
      🚧
    </div>
  `;

  return L.divIcon({
    html,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    className: "",
  });
}

function LocationControl({ location }) {
  const map = useMap();

  useEffect(() => {
    if (!location || !isInsideVenezuela(location.lat, location.lng)) return;

    map.flyTo([location.lat, location.lng], Math.max(map.getZoom(), 14), {
      animate: true,
      duration: 0.8,
    });
  }, [location, map]);

  return null;
}

function MapController() {
  const map = useMap();
  const setMapInstance = useMapStore((s) => s.setMapInstance);

  useEffect(() => {
    setMapInstance(map);
    return () => setMapInstance(null);
  }, [map, setMapInstance]);

  return null;
}

function VenezuelaViewportGuard() {
  const map = useMap();

  useEffect(() => {
    const bounds = L.latLngBounds(VENEZUELA_LEAFLET_BOUNDS);

    map.setMaxBounds(bounds);
    map.setMinZoom(VENEZUELA_MIN_ZOOM);
    map.setMaxZoom(VENEZUELA_MAX_ZOOM);
    map.fitBounds(bounds, { padding: [18, 18], animate: false });

    const keepInside = () => {
      map.panInsideBounds(bounds, { animate: false });
    };

    map.on("drag", keepInside);
    map.on("moveend", keepInside);
    map.on("zoomend", keepInside);

    return () => {
      map.off("drag", keepInside);
      map.off("moveend", keepInside);
      map.off("zoomend", keepInside);
    };
  }, [map]);

  return null;
}

function MapEventsHandler() {
  const setClickedLocation = useMapStore((s) => s.setClickedLocation);
  const map = useMap();

  useMapEvents({
    click(e) {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;

      if (!isInsideVenezuela(lat, lng)) {
        alert("Solo puedes reportar ubicaciones dentro de Venezuela.");
        return;
      }

      setClickedLocation({ lat, lng });

      // Calculate offset so the point is placed in the upper half of the screen
      // (because the MapClickPanel takes up the bottom space)
      const zoom = Math.max(map.getZoom(), 14);
      const targetPoint = map.project([lat, lng], zoom);
      // Offset by roughly 20% of the screen height down, so the point moves UP
      const offsetPoint = L.point(targetPoint.x, targetPoint.y - map.getSize().y * 0.15);
      const targetLatLng = map.unproject(offsetPoint, zoom);

      map.flyTo(targetLatLng, zoom, {
        animate: true,
        duration: 0.45,
      });
    },
  });

  return null;
}

const tempIcon = L.divIcon({
  html: `<div style="
    width: 34px; height: 34px;
    background: #dc2626;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    transform-origin: center;
    border: 4px solid white;
    box-shadow: 0 10px 24px rgba(127,29,29,0.42);
    position: relative;
  ">
    <span style="
      position: absolute;
      inset: 7px;
      border-radius: 999px;
      background: white;
      opacity: .95;
    "></span>
  </div>`,
  iconSize: [42, 42],
  iconAnchor: [21, 39],
  popupAnchor: [0, -36],
  className: "",
});

const userIcon = L.divIcon({
  html: `<div style="
    width: 16px; height: 16px;
    background: #2563eb;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.3);
  "></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  className: "",
});

function ClickedLocationMarker({ location }) {
  const markerRef = useRef(null);

  useEffect(() => {
    markerRef.current?.openPopup();
  }, [location.lat, location.lng]);

  return (
    <Marker
      ref={markerRef}
      position={[location.lat, location.lng]}
      icon={tempIcon}
      zIndexOffset={2500}
      riseOnHover
    >
      <Popup autoPan={false} closeButton={false}>
        <div style={{ padding: "6px 8px", textAlign: "center" }}>
          <strong>Punto seleccionado</strong>
          <p style={{ margin: "4px 0 0", fontSize: "11px", color: "#64748b" }}>
            Puedes hacer click en otra zona para corregirlo.
          </p>
        </div>
      </Popup>
    </Marker>
  );
}

function PointMarker({ point, onPointSelect, getDistanceFromMe, location }) {
  const map = useMap();
  const coords = getPointLatLng(point);

  if (!coords) return null;

  const { lat, lng } = coords;
  const distance = getDistanceFromMe?.(lat, lng);
  const statusLabel = STATUS_LABELS[point.status] || "No verificado";

  const focusPoint = () => {
    onPointSelect(point);
    map.flyTo([lat, lng], Math.max(map.getZoom(), 14), {
      animate: true,
      duration: 0.45,
    });
  };

  return (
    <Marker
      position={[lat, lng]}
      icon={createCustomIcon(point.category, point.status)}
      eventHandlers={{ click: focusPoint }}
    >
      <Popup autoPan={false} closeButton={false}>
        <div
          style={{ padding: "12px", minWidth: "200px", cursor: "pointer" }}
          onClick={focusPoint}
        >
          <div style={{ display: "flex", gap: "6px", marginBottom: "6px", flexWrap: "wrap" }}>
            <span
              style={{
                padding: "2px 8px",
                borderRadius: "999px",
                fontSize: "11px",
                fontWeight: 700,
                background:
                  point.status === "active"
                    ? "#dcfce7"
                    : point.status === "full"
                      ? "#fef3c7"
                      : point.status === "danger"
                        ? "#fee2e2"
                        : "#f3f4f6",
                color:
                  point.status === "active"
                    ? "#14532d"
                    : point.status === "full"
                      ? "#78350f"
                      : point.status === "danger"
                        ? "#7f1d1d"
                        : "#374151",
              }}
            >
              {statusLabel}
            </span>
          </div>
          <strong style={{ fontSize: "13px", display: "block", marginBottom: "4px" }}>
            {point.name}
          </strong>
          {point.address && (
            <p style={{ fontSize: "11px", color: "#6b7280", margin: 0, marginBottom: "4px" }}>
              {point.address}
            </p>
          )}
          {location && distance && (
            <p style={{ fontSize: "11px", color: "#2563eb", fontWeight: 700, margin: 0 }}>
              A {distance}
            </p>
          )}
          <p style={{ fontSize: "11px", color: "#2563eb", margin: "6px 0 0", fontWeight: 700 }}>
            Ver detalles
          </p>
        </div>
      </Popup>
    </Marker>
  );
}

export default function MapView({
  onPointSelect,
  userLocation,
  getDistanceFromMe,
}) {
  const { points, roadBlocks, clickedLocation } = useMapStore();

  const visiblePoints = useMemo(() => points.filter(getPointLatLng), [points]);
  const visibleRoadBlocks = useMemo(
    () =>
      roadBlocks.filter((block) =>
        isInsideVenezuela(block.latitude, block.longitude),
      ),
    [roadBlocks],
  );

  return (
    <MapContainer
      center={VENEZUELA_CENTER}
      zoom={VENEZUELA_INITIAL_ZOOM}
      style={{ height: "100%", width: "100%" }}
      zoomControl={false}
      attributionControl={true}
      maxBounds={VENEZUELA_LEAFLET_BOUNDS}
      maxBoundsViscosity={1.0}
      minZoom={VENEZUELA_MIN_ZOOM}
      maxZoom={VENEZUELA_MAX_ZOOM}
      zoomSnap={0.25}
      zoomDelta={0.5}
      wheelPxPerZoomLevel={80}
      worldCopyJump={false}
      bounceAtZoomLimits={false}
      scrollWheelZoom
      doubleClickZoom
      touchZoom
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        maxZoom={19}
        noWrap
        bounds={VENEZUELA_LEAFLET_BOUNDS}
      />
      <ZoomControl position="bottomleft" />
      <MapController />
      <VenezuelaViewportGuard />
      <MapEventsHandler />
      {userLocation && <LocationControl location={userLocation} />}

      {clickedLocation &&
        isInsideVenezuela(clickedLocation.lat, clickedLocation.lng) && (
          <ClickedLocationMarker location={clickedLocation} />
        )}

      {userLocation &&
        isInsideVenezuela(userLocation.lat, userLocation.lng) && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={userIcon}
            zIndexOffset={2200}
          >
            <Popup>
              <div style={{ textAlign: "center", padding: "4px" }}>
                <strong>Tu ubicación</strong>
              </div>
            </Popup>
          </Marker>
        )}

      {visiblePoints.map((point) => (
        <PointMarker
          key={point.id}
          point={point}
          onPointSelect={onPointSelect}
          getDistanceFromMe={getDistanceFromMe}
          location={userLocation}
        />
      ))}

      {visibleRoadBlocks.map((block) => (
        <Marker
          key={`rb-${block.id}`}
          position={[Number(block.latitude), Number(block.longitude)]}
          icon={createRoadBlockIcon(block.severity)}
        >
          <Popup autoPan={false}>
            <div style={{ padding: "10px", minWidth: "180px" }}>
              <strong style={{ fontSize: "13px", display: "block", marginBottom: "4px" }}>
                {block.title}
              </strong>
              {block.description && (
                <p style={{ fontSize: "11px", color: "#6b7280", margin: 0 }}>
                  {block.description}
                </p>
              )}
              <span
                style={{
                  display: "inline-block",
                  marginTop: "6px",
                  padding: "2px 8px",
                  borderRadius: "999px",
                  fontSize: "11px",
                  fontWeight: 700,
                  background: block.severity === "critical" ? "#fee2e2" : "#fef3c7",
                  color: block.severity === "critical" ? "#7f1d1d" : "#78350f",
                }}
              >
                {block.severity === "critical"
                  ? "Crítico"
                  : block.severity === "high"
                    ? "Alto"
                    : block.severity === "medium"
                      ? "Medio"
                      : "Bajo"}
              </span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
