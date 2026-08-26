"use client";
import React, { useState } from "react";
import { Users, Check, X, Plus, Bell, Clock, Phone, ShieldCheck } from "lucide-react";

export default function OperationsAttendance() {
  const [staff, setStaff] = useState([
    { id: 1, name: "Sanjay Kumar", role: "Electrician", shift: "Morning", status: "Present", phone: "+91 98450 11223", checkIn: "06:55 AM", property: "Apex Business Tower" },
    { id: 2, name: "Vikram Shah", role: "Plumbing Tech", shift: "Night", status: "Present", phone: "+91 98450 44556", checkIn: "10:50 PM", property: "Meridian Tech Park" },
    { id: 3, name: "Ramesh Dev", role: "HVAC Tech", shift: "Morning", status: "Absent", phone: "+91 98450 77889", checkIn: "--", property: "Nexus Hub" },
    { id: 4, name: "Amit Sharma", role: "Fire Safety Specialist", shift: "Morning", status: "Present", phone: "+91 98450 99001", checkIn: "07:10 AM", property: "Crystal Tower" }
  ]);

  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    role: "Electrician",
    shift: "Morning",
    property: "Apex Business Tower",
    phone: ""
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const toggleStatus = (id: number) => {
    setStaff(staff.map(s => {
      if (s.id === id) {
        const nextStatus = s.status === "Present" ? "Absent" : "Present";
        const nextCheckIn = nextStatus === "Present" ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--";
        showToast(`Updated ${s.name} attendance to: ${nextStatus}`);
        return { ...s, status: nextStatus, checkIn: nextCheckIn };
      }
      return s;
    }));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) {
      alert("Please fill required fields");
      return;
    }
    const newS = {
      id: staff.length + 1,
      name: form.name,
      role: form.role,
      shift: form.shift,
      status: "Present",
      phone: form.phone,
      checkIn: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      property: form.property
    };
    setStaff([...staff, newS]);
    setIsAdding(false);
    setForm({ name: "", role: "Electrician", shift: "Morning", property: "Apex Business Tower", phone: "" });
    showToast(`Logged shift entry for ${newS.name}!`);
  };

  return (
    <div className="flex flex-col gap-8 relative">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-gray-800 animate-bounce">
          <Bell size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Staff Attendance Logger</h1>
          <p className="text-sm text-gray-600 font-bold mt-1">Monitor technician shift rosters, logs checks, and attendance metrics. (Click status badge to toggle)</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-colors"
        >
          <Plus size={14} /> Log Staff Check-In
        </button>
      </div>

      <div className="premium-card p-6 border border-gray-200 bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-4">Staff Name</th>
              <th className="py-4">Role</th>
              <th className="py-4">Assigned Shift</th>
              <th className="py-4">Building Site</th>
              <th className="py-4">Check-In Time</th>
              <th className="py-4">Status (Click to toggle)</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr 
                key={s.id} 
                className="border-b border-gray-200 text-xs hover:bg-amber-50/20 transition-colors"
              >
                <td 
                  onClick={() => setSelectedStaff(s)}
                  className="py-4 font-bold text-gray-900 flex items-center gap-2 cursor-pointer hover:text-amber-600 hover:underline"
                >
                  <Users size={14} className="text-amber-600" />
                  {s.name}
                </td>
                <td className="py-4 text-gray-700 font-semibold">{s.role}</td>
                <td className="py-4 text-gray-700 font-semibold">{s.shift}</td>
                <td className="py-4 text-gray-700 font-semibold">{s.property}</td>
                <td className="py-4 font-mono font-bold text-gray-900">{s.checkIn}</td>
                <td className="py-4">
                  <button 
                    onClick={() => toggleStatus(s.id)}
                    className={`px-3 py-1 rounded text-[9px] font-bold uppercase tracking-wider cursor-pointer shadow-sm transition-transform active:scale-95 ${
                      s.status === "Present" 
                        ? "bg-emerald-600 text-white hover:bg-emerald-700" 
                        : "bg-red-600 text-white hover:bg-red-700"
                    }`}
                  >
                    {s.status} ⇄
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Staff Profile Modal */}
      {selectedStaff && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-end z-50 animate-fade-in">
          <div className="w-full max-w-md bg-white h-screen p-8 flex flex-col justify-between shadow-2xl animate-slide-in">
            <div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
                <div>
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Technician Profile</span>
                  <h3 className="font-extrabold text-gray-900 text-base mt-1">{selectedStaff.name}</h3>
                </div>
                <button 
                  onClick={() => setSelectedStaff(null)}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-col gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Trade Specialization</span>
                  <span className="font-bold text-gray-900">{selectedStaff.role}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Assigned Property</span>
                  <span className="font-bold text-gray-900">{selectedStaff.property}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Contact Phone</span>
                  <span className="font-bold text-gray-900">{selectedStaff.phone}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Active Shift</span>
                  <span className="font-bold text-purple-700">{selectedStaff.shift} Shift (Check-in: {selectedStaff.checkIn})</span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-5 flex flex-col gap-3">
              <button 
                onClick={() => {
                  toggleStatus(selectedStaff.id);
                  setSelectedStaff(null);
                }}
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md transition-colors cursor-pointer"
              >
                Toggle Attendance Status
              </button>
              <button 
                onClick={() => setSelectedStaff(null)}
                className="w-full py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <form 
            onSubmit={handleAdd}
            className="w-full max-w-md bg-white rounded-2xl p-8 flex flex-col gap-5 shadow-2xl animate-scale-up"
          >
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-base">Log Staff Shift Check-In</h3>
              <button 
                type="button" 
                onClick={() => setIsAdding(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-3.5 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Technician Full Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Rahul Verma"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Role Trade</label>
                  <select 
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold bg-white cursor-pointer"
                  >
                    <option value="Electrician">Electrician</option>
                    <option value="Plumbing Tech">Plumbing Tech</option>
                    <option value="HVAC Tech">HVAC Tech</option>
                    <option value="Fire Safety Specialist">Fire Safety Specialist</option>
                    <option value="Housekeeping Supervisor">Housekeeping Supervisor</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Assigned Shift</label>
                  <select 
                    value={form.shift}
                    onChange={(e) => setForm({ ...form, shift: e.target.value })}
                    className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold bg-white cursor-pointer"
                  >
                    <option value="Morning">Morning (07:00 - 15:00)</option>
                    <option value="Evening">Evening (15:00 - 23:00)</option>
                    <option value="Night">Night (23:00 - 07:00)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Building Site</label>
                  <select 
                    value={form.property}
                    onChange={(e) => setForm({ ...form, property: e.target.value })}
                    className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold bg-white cursor-pointer"
                  >
                    <option value="Apex Business Tower">Apex Business Tower</option>
                    <option value="Meridian Tech Park">Meridian Tech Park</option>
                    <option value="Nexus Hub">Nexus Hub</option>
                    <option value="Crystal Tower">Crystal Tower</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Phone Number</label>
                  <input 
                    type="text"
                    placeholder="+91 98000 00000"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shadow-md transition-colors cursor-pointer"
              >
                Confirm Check-In
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
