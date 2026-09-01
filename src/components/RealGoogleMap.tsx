"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Layers, Plus, Minus, Navigation, Maximize2, Compass, ArrowRight, X } from "lucide-react";

export interface PropertyListing {
  id: string;
  title: string;
  buildingName: string;
  location: string;
  subLocation: string;
  area: string;
  capacity: string;
  furnishing: string;
  price: string;
  pricePerSqft: string;
  pricePerSeat: string;
  propertyScore: number;
  readiness: string;
  commuteScore: number;
  energyRating: string;
  image: string;
  lat: number;
  lng: number;
}

interface MapProps {
  properties: PropertyListing[];
  selectedProperty: PropertyListing | null;
  onSelectProperty: (property: PropertyListing | null) => void;
}

export default function RealGoogleMap({ properties, selectedProperty, onSelectProperty }: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [id: string]: any }>({});
  const tileLayerRef = useRef<any>(null);
  const leafletModuleRef = useRef<any>(null);

  const [mapType, setMapType] = useState<"roadmap" | "satellite" | "terrain">("roadmap");
  const [zoomLevel, setZoomLevel] = useState(14);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Map Tile Providers (Google Maps High-Res Tile Endpoints)
  const tileLayers = {
    roadmap: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
    satellite: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}", // Hybrid Satellite with roads
    terrain: "https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}" // Topographical Terrain
  };

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === "undefined" || !mapContainerRef.current) return;

      try {
        const L = (await import("leaflet")).default;
        leafletModuleRef.current = L;

        if (!mapInstanceRef.current && mapContainerRef.current) {
          const map = L.map(mapContainerRef.current, {
            center: [19.0664, 72.8665], // Center of BKC Financial District
            zoom: 14,
            zoomControl: false,
            attributionControl: false
          });

          const initialLayer = L.tileLayer(tileLayers.roadmap, {
            maxZoom: 20,
            subdomains: ["mt0", "mt1", "mt2", "mt3"]
          }).addTo(map);

          tileLayerRef.current = initialLayer;
          mapInstanceRef.current = map;

          setTimeout(() => {
            if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
          }, 200);

          map.on("zoomend", () => {
            setZoomLevel(map.getZoom());
          });

          if (isMounted) setMapLoaded(true);
        }

        const map = mapInstanceRef.current;
        if (map) {
          setTimeout(() => map.invalidateSize(), 150);

          // Clear existing markers
          Object.values(markersRef.current).forEach((m: any) => m.remove());
          markersRef.current = {};

          // Render custom Google Maps styled Price Badges with Property Score
          properties.forEach((prop) => {
            const isSelected = selectedProperty?.id === prop.id;

            const customIcon = L.divIcon({
              className: "custom-property-pin",
              html: `
                <div class="relative group cursor-pointer" style="transform: translate(-50%, -100%);">
                  <div style="
                    background-color: ${isSelected ? "#090D14" : "#0F8B7D"};
                    color: white;
                    font-family: system-ui, sans-serif;
                    font-weight: 800;
                    font-size: 11px;
                    padding: 5px 9px;
                    border-radius: 12px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    border: 2px solid white;
                    transition: all 0.2s ease;
                    ${isSelected ? "transform: scale(1.18); border-color: #0F8B7D;" : ""}
                  ">
                    <span>${prop.price}</span>
                    <span style="
                      background: rgba(255,255,255,0.25);
                      color: #FDE047;
                      font-size: 9px;
                      padding: 1px 4px;
                      border-radius: 6px;
                      font-weight: 900;
                    ">★${prop.propertyScore}</span>
                  </div>
                  <div style="
                    position: absolute;
                    bottom: -5px;
                    left: 50%;
                    transform: translateX(-50%) rotate(45deg);
                    width: 10px;
                    height: 10px;
                    background-color: ${isSelected ? "#090D14" : "#0F8B7D"};
                    border-right: 2px solid white;
                    border-bottom: 2px solid white;
                  "></div>
                </div>
              `,
              iconSize: [80, 40],
              iconAnchor: [40, 40]
            });

            const marker = L.marker([prop.lat, prop.lng], { icon: customIcon }).addTo(map);

            marker.on("click", () => {
              onSelectProperty(prop);
            });

            markersRef.current[prop.id] = marker;
          });
        }
      } catch (err) {
        console.error("Leaflet initialization error:", err);
      }
    }

    initMap();

    return () => {
      isMounted = false;
    };
  }, [properties, selectedProperty]);

  // Handle Layer switching (Map / Satellite / Terrain)
  const switchLayer = (type: "roadmap" | "satellite" | "terrain") => {
    setMapType(type);
    const L = leafletModuleRef.current;
    if (mapInstanceRef.current && tileLayerRef.current && L) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
      const newLayer = L.tileLayer(tileLayers[type], {
        maxZoom: 20,
        subdomains: ["mt0", "mt1", "mt2", "mt3"]
      }).addTo(mapInstanceRef.current);
      tileLayerRef.current = newLayer;
    }
  };

  // Zoom helpers
  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([19.0664, 72.8665], 14, { duration: 1 });
    }
  };

  // Fly to selected property when clicked on the left feed
  useEffect(() => {
    if (selectedProperty && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedProperty.lat, selectedProperty.lng], 15, {
        duration: 0.8
      });
    }
  }, [selectedProperty]);

  return (
    <div className="relative w-full h-full bg-[#E5E3DF] overflow-hidden select-none">
      {/* Real Leaflet / Google Maps Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Left: Google Maps Style Layer Switcher */}
      <div className="absolute top-4 left-4 z-[400] flex items-center bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-200/90 p-1">
        <button
          onClick={() => switchLayer("roadmap")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            mapType === "roadmap" ? "bg-[#0F8B7D] text-white shadow-xs" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          Map
        </button>
        <button
          onClick={() => switchLayer("satellite")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            mapType === "satellite" ? "bg-[#0F8B7D] text-white shadow-xs" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          Satellite
        </button>
        <button
          onClick={() => switchLayer("terrain")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            mapType === "terrain" ? "bg-[#0F8B7D] text-white shadow-xs" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          Terrain
        </button>
      </div>

      {/* Top Right: Google Maps Navigation & Zoom Controls */}
      <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
        <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-200 flex flex-col overflow-hidden">
          <button
            onClick={handleZoomIn}
            className="p-2.5 hover:bg-gray-100 text-gray-700 border-b border-gray-100 cursor-pointer"
            title="Zoom In"
          >
            <Plus size={16} strokeWidth={2.5} />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2.5 hover:bg-gray-100 text-gray-700 cursor-pointer"
            title="Zoom Out"
          >
            <Minus size={16} strokeWidth={2.5} />
          </button>
        </div>

        <button
          onClick={handleRecenter}
          className="p-2.5 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-200 hover:bg-gray-100 text-gray-700 cursor-pointer"
          title="Recenter BKC"
        >
          <Navigation size={16} />
        </button>
      </div>

      {/* Selected Property Google Maps InfoWindow Popup */}
      {selectedProperty && (
        <div className="absolute bottom-6 left-6 z-[400] w-80 bg-white rounded-2xl p-4 shadow-2xl border border-gray-200 animate-in fade-in zoom-in duration-200">
          <div className="relative h-36 rounded-xl overflow-hidden mb-3">
            <img src={selectedProperty.image} alt={selectedProperty.title} className="w-full h-full object-cover" />
            <button
              onClick={(e) => { e.stopPropagation(); onSelectProperty(null as any); }}
              className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer z-10"
              title="Close popup"
            >
              <X size={12} />
            </button>
            <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
              <span>Score:</span>
              <span className="text-yellow-400 font-black">{selectedProperty.propertyScore}/100</span>
            </div>
            <div className="absolute bottom-2.5 right-2.5 bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-xs">
              {selectedProperty.readiness}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold text-[#0F8B7D] uppercase tracking-wider">{selectedProperty.buildingName}</span>
            <h4 className="font-bold text-gray-900 text-sm leading-snug">{selectedProperty.title}</h4>
            <p className="text-xs text-gray-500 mt-0.5">{selectedProperty.location}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-gray-100 text-[11px]">
            <div>
              <span className="text-gray-400 block text-[9px] font-bold uppercase">MONTHLY RENT</span>
              <span className="text-sm font-black text-gray-900">{selectedProperty.price}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[9px] font-bold uppercase">COMMUTE & ESG</span>
              <span className="font-bold text-emerald-700">{selectedProperty.commuteScore}/100</span>
            </div>
          </div>

          <div className="mt-3">
            <Link
              href={`/public/property/${selectedProperty.id}`}
              className="w-full py-2.5 rounded-xl bg-[#0F8B7D] hover:bg-[#0D7A6E] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              View Property Details <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      )}

      {/* Bottom Right: Google Maps Attribution Bar */}
      <div className="absolute bottom-2 right-4 z-[400] bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded text-[9px] text-gray-600 font-mono flex items-center gap-2 shadow-xs">
        <span>Map data ©2026 Google / Imagery ©2026 CNES/Airbus, Maxar</span>
        <span>·</span>
        <span className="text-[#0F8B7D] font-bold">Zoom: {zoomLevel}x</span>
      </div>
    </div>
  );
}
