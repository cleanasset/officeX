"use client";
import React, { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Compass, Layers, ZoomIn, ZoomOut, Crosshair } from "lucide-react";

interface MapPinPickerProps {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
}

export default function MapPinPicker({ lat, lng, onChange }: MapPinPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);

  const [currentLat, setCurrentLat] = useState<number>(lat || 23.0225);
  const [currentLng, setCurrentLng] = useState<number>(lng || 72.5714);
  const [isSatellite, setIsSatellite] = useState<boolean>(false);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Sync internal state when props update from external autocomplete
  useEffect(() => {
    if (lat && lng && (lat !== currentLat || lng !== currentLng)) {
      setCurrentLat(lat);
      setCurrentLng(lng);
      if (mapInstanceRef.current && markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
        mapInstanceRef.current.setView([lat, lng], 17);
      }
    }
  }, [lat, lng]);

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === "undefined" || !mapContainerRef.current) return;
      if (mapInstanceRef.current) return;

      try {
        let L = leafletRef.current;
        if (!L) {
          L = (await import("leaflet")).default;
          leafletRef.current = L;
        }

        if (!isMounted || !mapContainerRef.current) return;

        const initialLat = lat || 23.0225;
        const initialLng = lng || 72.5714;

        const map = L.map(mapContainerRef.current, {
          center: [initialLat, initialLng],
          zoom: lat && lng ? 17 : 14,
          zoomControl: false,
          attributionControl: false,
        });

        // Add Google Maps High-Res Tile Layer (Roadmap by default)
        const tileLayer = L.tileLayer("https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
          maxZoom: 20,
          subdomains: ["mt0", "mt1", "mt2", "mt3"],
        }).addTo(map);
        tileLayerRef.current = tileLayer;

        // Custom Draggable Pin Icon
        const pinIcon = L.divIcon({
          className: "custom-pin-picker-marker",
          html: `
            <div style="transform: translate(-50%, -100%); cursor: grab;">
              <div style="
                background: #0F8B7D;
                color: white;
                font-family: system-ui, sans-serif;
                font-weight: 800;
                font-size: 11px;
                padding: 6px 12px;
                border-radius: 12px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.35);
                display: flex;
                align-items: center;
                gap: 6px;
                border: 2px solid white;
                white-space: nowrap;
              ">
                <span style="display:inline-block; width:8px; height:8px; background:#4ADE80; border-radius:50%; border:1px solid white;"></span>
                <span>📍 Property Pin Location</span>
              </div>
              <div style="
                position: absolute;
                bottom: -5px;
                left: 50%;
                transform: translateX(-50%) rotate(45deg);
                width: 10px;
                height: 10px;
                background-color: #0F8B7D;
                border-right: 2px solid white;
                border-bottom: 2px solid white;
              "></div>
            </div>
          `,
          iconSize: [160, 42],
          iconAnchor: [80, 42],
        });

        const marker = L.marker([initialLat, initialLng], {
          icon: pinIcon,
          draggable: true,
        }).addTo(map);

        // Marker drag handler
        marker.on("dragend", () => {
          const newPos = marker.getLatLng();
          setCurrentLat(newPos.lat);
          setCurrentLng(newPos.lng);
          onChange(newPos.lat, newPos.lng);
        });

        // Map click handler (move marker to clicked position)
        map.on("click", (e: any) => {
          const clickedLat = e.latlng.lat;
          const clickedLng = e.latlng.lng;
          marker.setLatLng([clickedLat, clickedLng]);
          setCurrentLat(clickedLat);
          setCurrentLng(clickedLng);
          onChange(clickedLat, clickedLng);
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;

        setTimeout(() => {
          try {
            map.invalidateSize();
          } catch (_) {}
        }, 200);
      } catch (err) {
        console.error("MapPinPicker initialization error:", err);
      }
    }

    initMap();

    return () => {
      isMounted = false;
    };
  }, []);

  // Switch between Google Maps Roadmap and Google Satellite/Hybrid View
  const toggleMapLayer = (satellite: boolean) => {
    setIsSatellite(satellite);
    const L = leafletRef.current;
    const map = mapInstanceRef.current;
    if (!L || !map || !tileLayerRef.current) return;

    map.removeLayer(tileLayerRef.current);
    // lyrs=y is Google Hybrid (Satellite + Road / Landmark Labels)
    // lyrs=m is Google Standard Roadmap
    const tileUrl = satellite
      ? "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
      : "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";

    const newLayer = L.tileLayer(tileUrl, {
      maxZoom: 20,
      subdomains: ["mt0", "mt1", "mt2", "mt3"],
    }).addTo(map);
    tileLayerRef.current = newLayer;
  };

  // Browser Geolocation / GPS locator
  const handleLocateMe = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        setCurrentLat(latitude);
        setCurrentLng(longitude);
        if (mapInstanceRef.current && markerRef.current) {
          markerRef.current.setLatLng([latitude, longitude]);
          mapInstanceRef.current.setView([latitude, longitude], 18);
        }
        onChange(latitude, longitude);
      },
      (err) => {
        setIsLocating(false);
        console.warn("Geolocation lookup error:", err);
        alert("Could not detect GPS location. Please allow location permissions in your browser.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
          <MapPin size={13} className="text-[#0F8B7D]" />
          <span>Interactive Building Pinpoint (Drag Pin or Click Exact Building)</span>
        </label>
        <div className="flex items-center gap-2">
          {/* Map / Satellite Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px] font-bold">
            <button
              type="button"
              onClick={() => toggleMapLayer(false)}
              className={`px-2 py-0.5 rounded-md transition cursor-pointer ${
                !isSatellite ? "bg-white text-teal-900 shadow-2xs font-black" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Roadmap
            </button>
            <button
              type="button"
              onClick={() => toggleMapLayer(true)}
              className={`px-2 py-0.5 rounded-md transition cursor-pointer flex items-center gap-1 ${
                isSatellite ? "bg-white text-teal-900 shadow-2xs font-black" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>🛰️ Satellite</span>
            </button>
          </div>
          <span className="text-[10px] font-mono font-bold text-[#0F8B7D] bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
            {currentLat.toFixed(5)}, {currentLng.toFixed(5)}
          </span>
        </div>
      </div>

      <div className="relative w-full h-[280px] rounded-2xl border border-gray-200 overflow-hidden shadow-xs group">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Instruction Banner */}
        <div className="absolute top-2.5 left-2.5 right-2.5 z-[400] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-gray-200/90 shadow-sm flex items-center justify-between gap-2 pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0F8B7D] animate-ping" />
            <span className="text-[11px] font-bold text-gray-800">
              {isSatellite
                ? "Zoom in to see the building rooftop from satellite, then click or drag the pin directly onto it."
                : "Click or drag the green pin directly onto your building to pinpoint exact coordinates."}
            </span>
          </div>
          <span className="text-[9px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
            {isSatellite ? "Google Satellite" : "Google Roadmap"}
          </span>
        </div>

        {/* Zoom Controls */}
        <div className="absolute top-14 right-2.5 z-[400] flex flex-col gap-1">
          <button
            type="button"
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="w-8 h-8 rounded-lg bg-white/95 backdrop-blur-md shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 hover:text-[#0F8B7D] transition cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn size={14} />
          </button>
          <button
            type="button"
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="w-8 h-8 rounded-lg bg-white/95 backdrop-blur-md shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50 hover:text-[#0F8B7D] transition cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>
        </div>

        {/* Bottom controls */}
        <div className="absolute bottom-2.5 right-2.5 z-[400] flex items-center gap-2">
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={isLocating}
            className="px-2.5 py-1.5 bg-white/95 backdrop-blur-md rounded-xl text-[11px] font-bold text-gray-700 shadow-md border border-gray-200 hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Detect your current location via GPS"
          >
            <Crosshair size={13} className={`text-teal-600 ${isLocating ? "animate-spin" : ""}`} />
            <span>{isLocating ? "Detecting GPS..." : "My Location"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (mapInstanceRef.current && markerRef.current) {
                mapInstanceRef.current.setView([currentLat, currentLng], 18);
              }
            }}
            className="px-2.5 py-1.5 bg-white/95 backdrop-blur-md rounded-xl text-[11px] font-bold text-gray-700 shadow-md border border-gray-200 hover:bg-gray-50 flex items-center gap-1 cursor-pointer"
          >
            <Compass size={12} className="text-[#0F8B7D]" /> Recenter Pin
          </button>
        </div>
      </div>
    </div>
  );
}
