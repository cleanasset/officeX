"use client";
import React, { useState } from "react";
import { Calendar, CheckCircle2, Plus, X, Check, Bell, ShieldCheck } from "lucide-react";

export default function OperationsPPM() {
  const [tasks, setTasks] = useState([
    { id: 1, task: "Chiller Descaling & Condenser Flushing", property: "Apex Business Tower", week: "Week 34", assignee: "Sanjay Kumar", status: "Completed", checklist: ["Chemical flushing completed", "Tube eddy current test verified", "Refrigerant pressure checked"] },
    { id: 2, task: "Fire Pump Flow & Pressure Check", property: "Meridian Tech Park", week: "Week 35", assignee: "Vikram Shah", status: "Scheduled", checklist: ["Diesel engine oil level check", "Jockey pump cut-in/cut-out test", "Sprinkler header pressure check"] },
    { id: 3, task: "HT Transformer Oil Filtration", property: "Nexus Hub", week: "Week 36", assignee: "Amit Sharma", status: "Scheduled", checklist: ["Dielectric BDV strength test", "Silica gel breather check", "Winding temperature relay check"] }
  ]);

  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [form, setForm] = useState({
    task: "",
    property: "Apex Business Tower",
    week: "Week 35",
    assignee: "Sanjay Kumar"
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleToggleTask = (id: number) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === "Completed" ? "Scheduled" : "Completed";
        showToast(`PPM Task "${t.task}" marked as ${nextStatus}!`);
        return { ...t, status: nextStatus };
      }
      return t;
    }));
    if (selectedTask && selectedTask.id === id) {
      setSelectedTask(null);
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.task) {
      alert("Please fill task name");
      return;
    }
    const newT = {
      id: tasks.length + 1,
      task: form.task,
      property: form.property,
      week: form.week,
      assignee: form.assignee,
      status: "Scheduled",
      checklist: ["Visual physical check", "Operational test log", "Safety lock verification"]
    };
    setTasks([...tasks, newT]);
    setIsAdding(false);
    setForm({ task: "", property: "Apex Business Tower", week: "Week 35", assignee: "Sanjay Kumar" });
    showToast(`Scheduled new PPM task "${newT.task}"!`);
  };

  return (
    <div className="flex flex-col gap-8 relative">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-gray-800 animate-bounce">
          <Bell size={16} className="text-purple-400" />
          <span>{toast}</span>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">52-Week PPM Calendar</h1>
          <p className="text-sm text-gray-600 font-bold mt-1">Audit scheduled Planned Preventive Maintenance schedules and safety logs checklists.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-colors"
        >
          <Plus size={14} /> Schedule PPM Task
        </button>
      </div>

      <div className="premium-card p-6 border border-gray-200 bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              <th className="py-4">Maintenance Task</th>
              <th className="py-4">Building Property</th>
              <th className="py-4">Scheduled Week</th>
              <th className="py-4">Technician Assigned</th>
              <th className="py-4">Execution Status (Click to toggle)</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr 
                key={t.id} 
                className="border-b border-gray-200 text-xs hover:bg-purple-50/20 transition-colors"
              >
                <td 
                  onClick={() => setSelectedTask(t)}
                  className="py-4 font-bold text-gray-900 flex items-center gap-2 cursor-pointer hover:text-purple-700 hover:underline"
                >
                  <Calendar size={14} className="text-purple-600" />
                  {t.task}
                </td>
                <td className="py-4 text-gray-700 font-semibold">{t.property}</td>
                <td className="py-4 text-purple-600 font-bold">{t.week}</td>
                <td className="py-4 text-gray-700 font-semibold">{t.assignee}</td>
                <td className="py-4">
                  <button 
                    onClick={() => handleToggleTask(t.id)}
                    className={`px-3 py-1 rounded text-[9px] font-bold uppercase tracking-wider cursor-pointer shadow-sm transition-transform active:scale-95 ${
                      t.status === "Completed" 
                        ? "bg-emerald-600 text-white hover:bg-emerald-700" 
                        : "bg-amber-600 text-white hover:bg-amber-700"
                    }`}
                  >
                    {t.status} ⇄
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PPM Task Drawer */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-end z-50 animate-fade-in">
          <div className="w-full max-w-md bg-white h-screen p-8 flex flex-col justify-between shadow-2xl animate-slide-in">
            <div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
                <div>
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${
                    selectedTask.status === "Completed" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                  }`}>
                    {selectedTask.status} ({selectedTask.week})
                  </span>
                  <h3 className="font-extrabold text-gray-900 text-base mt-1">{selectedTask.task}</h3>
                </div>
                <button 
                  onClick={() => setSelectedTask(null)}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-col gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Building Asset</span>
                  <span className="font-bold text-gray-900">{selectedTask.property}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Assigned Technician</span>
                  <span className="font-bold text-gray-900">{selectedTask.assignee}</span>
                </div>

                <div className="mt-2">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-2">Checklist Verification Items</span>
                  <div className="flex flex-col gap-2">
                    {selectedTask.checklist.map((item: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 border border-gray-100">
                        <Check size={14} className="text-emerald-600" />
                        <span className="font-semibold text-gray-800">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-5 flex flex-col gap-3">
              <button 
                onClick={() => handleToggleTask(selectedTask.id)}
                className={`w-full py-3 rounded-xl text-white font-extrabold text-xs shadow-md transition-colors cursor-pointer ${
                  selectedTask.status === "Completed" ? "bg-amber-600 hover:bg-amber-700" : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {selectedTask.status === "Completed" ? "Mark as Incomplete" : "Complete & Sign Off Task"}
              </button>
              <button 
                onClick={() => setSelectedTask(null)}
                className="w-full py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add PPM Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <form 
            onSubmit={handleAdd}
            className="w-full max-w-md bg-white rounded-2xl p-8 flex flex-col gap-5 shadow-2xl animate-scale-up"
          >
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-900 text-base">Schedule Planned Maintenance Task</h3>
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
                <label className="text-[10px] font-bold text-gray-500 uppercase">PPM Task Title</label>
                <input 
                  type="text"
                  placeholder="e.g. DG Set Oil Filter Replacement"
                  value={form.task}
                  onChange={(e) => setForm({ ...form, task: e.target.value })}
                  className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Building Asset</label>
                  <select 
                    value={form.property}
                    onChange={(e) => setForm({ ...form, property: e.target.value })}
                    className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold bg-white cursor-pointer"
                  >
                    <option value="Apex Business Tower">Apex Business Tower</option>
                    <option value="Meridian Tech Park">Meridian Tech Park</option>
                    <option value="Nexus Hub">Nexus Hub</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Schedule Week</label>
                  <input 
                    type="text"
                    placeholder="e.g. Week 37"
                    value={form.week}
                    onChange={(e) => setForm({ ...form, week: e.target.value })}
                    className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Assignee Technician</label>
                <input 
                  type="text"
                  placeholder="e.g. Vikram Shah"
                  value={form.assignee}
                  onChange={(e) => setForm({ ...form, assignee: e.target.value })}
                  className="px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-purple-600"
                />
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
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs shadow-md transition-colors cursor-pointer"
              >
                Schedule Task
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
