"use client";

import React, { useState } from "react";
import {
  Building2,
  Trash2,
  X,
  Search,
  Plus,
  MapPin,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { DeletePropertyModal } from "./DeletePropertyModal";

interface ManagePropertiesModalProps {
  isOpen: boolean;
  properties: any[];
  onClose: () => void;
  onRemoveProperty: (propertyId: string) => Promise<void>;
  onOpenAddProperty?: () => void;
}

export const ManagePropertiesModal: React.FC<ManagePropertiesModalProps> = ({
  isOpen,
  properties,
  onClose,
  onRemoveProperty,
  onOpenAddProperty,
}) => {
  const [search, setSearch] = useState("");
  const [propToDelete, setPropToDelete] = useState<any | null>(null);

  if (!isOpen) return null;

  const filteredProperties = properties.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.city?.toLowerCase().includes(q) ||
      p.id?.toLowerCase().includes(q) ||
      p.type?.toLowerCase().includes(q)
    );
  });

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
        <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="px-6 py-4.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-teal-50 border border-teal-200 text-[#0F8B7D] rounded-xl">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900">Manage Portfolio Properties</h3>
                <p className="text-xs text-gray-500">
                  {properties.length} listed commercial properties in your Rent Roll portfolio
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search & Actions Bar */}
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white shrink-0">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by building name, city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-gray-50 hover:bg-white focus:bg-white border border-gray-200 text-gray-900 text-xs rounded-xl pl-8 pr-3 py-1.5 placeholder-gray-400 focus:outline-none focus:border-[#0F8B7D] focus:ring-1 focus:ring-[#0F8B7D] transition-colors"
              />
            </div>

            {onOpenAddProperty && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAddProperty();
                }}
                className="w-full sm:w-auto px-3.5 py-1.5 bg-[#0F8B7D] hover:bg-teal-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Property</span>
              </button>
            )}
          </div>

          {/* Property List Body */}
          <div className="p-4 space-y-2.5 overflow-y-auto flex-1">
            {filteredProperties.length === 0 ? (
              <div className="p-8 text-center text-gray-400 flex flex-col items-center justify-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                <Building2 className="w-8 h-8 text-gray-300 mb-2" />
                <p className="text-xs font-semibold text-gray-500">No properties found matching your search</p>
              </div>
            ) : (
              filteredProperties.map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 bg-white border border-gray-200/90 hover:border-gray-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors shadow-2xs group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 text-[#0F8B7D] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs font-bold text-gray-900 truncate">{p.name}</h4>
                        {p.grade && (
                          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-bold rounded">
                            Grade {p.grade}
                          </span>
                        )}
                        <span className="font-mono text-[10px] text-gray-400">{p.id}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-1 flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          {p.city || "Commercial CBD"}{p.state ? `, ${p.state}` : ""}
                        </span>
                        {p.totalArea > 0 && (
                          <span className="flex items-center gap-1 font-medium">
                            <Layers className="w-3 h-3 text-gray-400" />
                            {p.totalArea.toLocaleString("en-IN")} sq ft
                          </span>
                        )}
                        {p.activeLeasesCount !== undefined && (
                          <span className="text-teal-700 font-semibold bg-teal-50 px-1.5 py-0.5 rounded">
                            {p.activeLeasesCount} Active Lease(s)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => setPropToDelete(p)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-600 border border-rose-200 hover:border-rose-600 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      title={`Remove ${p.name} from portfolio`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 shrink-0">
            <span>Showing {filteredProperties.length} of {properties.length} properties</span>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-200/70 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {propToDelete && (
        <DeletePropertyModal
          isOpen={true}
          property={propToDelete}
          onClose={() => setPropToDelete(null)}
          onConfirm={async (id) => {
            await onRemoveProperty(id);
            setPropToDelete(null);
          }}
        />
      )}
    </>
  );
};
