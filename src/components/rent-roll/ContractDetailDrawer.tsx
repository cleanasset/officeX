"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  FileText,
  Calendar,
  DollarSign,
  Clock,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  Eye,
  Send,
  Check,
  Ban,
  User,
  Building,
  Layers,
  History,
} from "lucide-react";

interface ContractDetailDrawerProps {
  contractId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  onOpenDocViewer: (doc: any) => void;
  currentUserId?: string;
  userRole?: string;
}

export default function ContractDetailDrawer({
  contractId,
  isOpen,
  onClose,
  onRefresh,
  onOpenDocViewer,
  currentUserId = "00000000-0000-0000-0000-000000000003",
  userRole = "property_manager",
}: ContractDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "charges" | "dates" | "outstanding" | "documents" | "activity">("summary");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Approval modal state
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    if (contractId && isOpen) {
      fetchContractDetail(contractId);
    } else {
      setData(null);
      setActionError(null);
    }
  }, [contractId, isOpen]);

  async function fetchContractDetail(id: string) {
    try {
      setLoading(true);
      setActionError(null);
      const res = await fetch(`/api/contracts/${id}`);
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        setActionError(json.error || "Failed to load contract details");
      }
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!contractId) return;
    try {
      setActionLoading(true);
      setActionError(null);
      const res = await fetch(`/api/contracts/${contractId}/submit`, {
        method: "POST",
        headers: { "x-user-id": currentUserId },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to submit contract");
      await fetchContractDetail(contractId);
      onRefresh();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleApprove() {
    if (!contractId) return;
    try {
      setActionLoading(true);
      setActionError(null);
      const res = await fetch(`/api/contracts/${contractId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": currentUserId },
        body: JSON.stringify({ comment: commentText }),
      });
      const json = await res.json();
      if (!res.ok) {
        const errorMsg = json.details ? json.details.map((d: any) => d.message).join("; ") : json.error;
        throw new Error(errorMsg || "Failed to approve contract");
      }
      setShowApproveModal(false);
      setCommentText("");
      await fetchContractDetail(contractId);
      onRefresh();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject() {
    if (!contractId || !commentText.trim()) {
      setActionError("A reason is required to reject a contract");
      return;
    }
    try {
      setActionLoading(true);
      setActionError(null);
      const res = await fetch(`/api/contracts/${contractId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": currentUserId },
        body: JSON.stringify({ reason: commentText }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to reject contract");
      setShowRejectModal(false);
      setCommentText("");
      await fetchContractDetail(contractId);
      onRefresh();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  if (!isOpen) return null;

  const isMaker = data?.created_by === currentUserId;
  const canApprove = !isMaker && ["super_admin", "owner", "property_manager", "approver", "finance"].includes(userRole);

  const statusColors: Record<string, string> = {
    draft: "bg-slate-100 text-slate-700 border-slate-300",
    future: "bg-blue-100 text-blue-800 border-blue-300",
    active: "bg-emerald-100 text-emerald-800 border-emerald-300",
    notice_served: "bg-amber-100 text-amber-800 border-amber-300",
    holding_over: "bg-purple-100 text-purple-800 border-purple-300",
    expired: "bg-rose-100 text-rose-800 border-rose-300",
    terminated: "bg-zinc-200 text-zinc-700 border-zinc-400",
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity"
      />

      {/* Right Drawer: 480px per §S-22 */}
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white shadow-2xl border-l border-slate-200 flex flex-col transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-slate-900 tracking-tight">
                {data?.contract_code || "Contract Detail"}
              </span>
              {data && (
                <span
                  className={`text-[11px] uppercase font-semibold px-2 py-0.5 rounded-full border ${
                    statusColors[data.contract_status] || "bg-slate-100 text-slate-700"
                  }`}
                >
                  {data.contract_status?.replace(/_/g, " ")}
                </span>
              )}
              {data && (
                <span className="text-[10px] text-slate-500 font-medium bg-slate-200 px-1.5 py-0.5 rounded">
                  v{data.version || 1}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Subheader summary stats */}
          {data && (
            <div className="mt-4 grid grid-cols-3 gap-2 text-center bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-xs">
              <div>
                <p className="text-[10px] font-medium text-slate-400 uppercase">Approval</p>
                <p className="text-xs font-semibold capitalize text-slate-800">
                  {data.approval_status}
                </p>
              </div>
              <div className="border-x border-slate-100">
                <p className="text-[10px] font-medium text-slate-400 uppercase">Deposit</p>
                <p className="text-xs font-semibold text-emerald-700">
                  ₹{Number(data.deposit_amount_inr || 0).toLocaleString("en-IN")}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-medium text-slate-400 uppercase">Area</p>
                <p className="text-xs font-semibold text-slate-800">
                  {data.space?.chargeable_area_sqft || 0} sqft
                </p>
              </div>
            </div>
          )}

          {/* Workflow Action Bar */}
          {data && (
            <div className="mt-3 flex items-center gap-2">
              {data.approval_status === "draft" && (
                <button
                  disabled={actionLoading}
                  onClick={handleSubmit}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-sm transition disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  Submit for Approval
                </button>
              )}

              {data.approval_status === "submitted" && canApprove && (
                <>
                  <button
                    disabled={actionLoading}
                    onClick={() => setShowApproveModal(true)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Approve
                  </button>
                  <button
                    disabled={actionLoading}
                    onClick={() => setShowRejectModal(true)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg transition disabled:opacity-50"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    Reject
                  </button>
                </>
              )}

              {data.approval_status === "submitted" && !canApprove && isMaker && (
                <div className="flex-1 text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200 text-center font-medium">
                  Awaiting Approver Action (RR-CON-09: Maker cannot self-approve)
                </div>
              )}
            </div>
          )}

          {actionError && (
            <div className="mt-2.5 p-2.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{actionError}</span>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-4 bg-white overflow-x-auto text-xs font-medium scrollbar-none">
          {[
            { id: "summary", label: "Summary" },
            { id: "charges", label: "Charges" },
            { id: "dates", label: "Key Dates" },
            { id: "outstanding", label: "Outstanding" },
            { id: "documents", label: "Documents" },
            { id: "activity", label: "Timeline" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3 border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "border-teal-700 text-teal-800 font-semibold"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center h-48 text-slate-400 text-xs">
              Loading contract profile...
            </div>
          ) : !data ? (
            <div className="text-center py-12 text-slate-400 text-xs">No contract selected</div>
          ) : (
            <>
              {/* Tab 1: Summary */}
              {activeTab === "summary" && (
                <div className="space-y-5 text-xs">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      Occupant / Lessee
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-slate-600">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Name:</span>
                        <strong className="text-slate-900">{data.occupant?.occupant_name || "—"}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Code / PAN:</span>
                        <span>{data.occupant?.occupant_code || "—"} / {data.occupant?.pan_number || "—"}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Status:</span>
                        <span className="capitalize font-medium text-emerald-700">{data.occupant?.occupant_status || "—"}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">GSTIN:</span>
                        <span>{data.occupant?.gst_number || "—"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-500" />
                      Premises Allocation
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-slate-600">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Property:</span>
                        <strong className="text-slate-900">{data.property?.property_name || "—"}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Building / Floor:</span>
                        <span>{data.building?.building_name || "—"} • {data.space?.floor_name || "—"}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Space Code:</span>
                        <strong className="text-teal-800">{data.space?.space_code || "—"}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Chargeable Area:</span>
                        <span>{data.space?.chargeable_area_sqft || 0} sqft</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-slate-500" />
                      Contract Terms
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-slate-600">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Type:</span>
                        <span className="capitalize">{data.contract_type?.replace(/_/g, " ")}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Billing Model:</span>
                        <span className="capitalize">{data.billing_model}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Lock-in Period:</span>
                        <span>{data.lock_in_period_days ? `${Math.round(data.lock_in_period_days / 30)} Months` : "None"}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Notice Period:</span>
                        <span>{data.notice_period_days ? `${data.notice_period_days} Days` : "None"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Charges & Rent Steps */}
              {activeTab === "charges" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                      Contract Charges ({data.charges?.length || 0})
                    </h4>
                  </div>
                  {data.charges?.map((ch: any) => (
                    <div key={ch.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <strong className="text-slate-900 capitalize">{ch.component?.replace(/_/g, " ")}</strong>
                          <p className="text-[10px] text-slate-400 capitalize">{ch.calc_basis} • {ch.billing_mode} billing</p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-teal-800">
                            ₹{Number(ch.rate || 0).toLocaleString("en-IN")}
                          </span>
                          <span className="text-[10px] text-slate-400 block">/ {ch.rate_period}</span>
                        </div>
                      </div>

                      {/* Associated Rent Steps / Escalation schedule */}
                      {ch.rent_steps?.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-200">
                          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-teal-600" />
                            Escalation Step-ups ({ch.rent_steps.length})
                          </p>
                          <div className="space-y-1">
                            {ch.rent_steps.map((st: any) => (
                              <div key={st.id} className="flex justify-between text-[11px] bg-white p-1.5 rounded border border-slate-100">
                                <span>Step #{st.step_no}: {st.effective_date}</span>
                                <span className="font-semibold text-slate-800">
                                  ₹{st.rate} ({st.escalation_type} +{st.escalation_value}%)
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 3: Key Dates */}
              {activeTab === "dates" && (
                <div className="space-y-3 text-xs">
                  {[
                    { label: "Lease Start Date", date: data.start_date },
                    { label: "Commencement Date", date: data.commencement_date || data.start_date },
                    { label: "Lease Expiry Date", date: data.end_date },
                    { label: "Renewal Notice Date", date: data.renewal_date || "—" },
                  ].map((d, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-slate-600 font-medium">{d.label}</span>
                      <span className="font-mono font-semibold text-slate-900">{d.date}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 4: Outstanding & Deposits */}
              {activeTab === "outstanding" && (
                <div className="space-y-4 text-xs">
                  <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200">
                    <p className="text-emerald-800 text-[10px] uppercase font-semibold">Security Deposit Agreed</p>
                    <p className="text-xl font-bold text-emerald-950 mt-1">
                      ₹{Number(data.deposit_amount_inr || 0).toLocaleString("en-IN")}
                    </p>
                    <p className="text-[11px] text-emerald-700 capitalize mt-1">
                      Status: {data.deposit_status || "pending"}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-500">
                    <p className="font-medium text-slate-700">Billing & Payment Invoicing</p>
                    <p className="text-[11px] mt-1">Invoice calculations and collections are tracked in Phase P2 & P3.</p>
                  </div>
                </div>
              )}

              {/* Tab 5: Documents Repository */}
              {activeTab === "documents" && (
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                      Contract Documents ({data.documents?.length || 0})
                    </h4>
                  </div>
                  {data.documents?.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      No documents uploaded yet. Contract activation requires an executed lease deed (RR-CON-05).
                    </div>
                  ) : (
                    data.documents?.map((doc: any) => (
                      <div key={doc.id} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-5 h-5 text-slate-400" />
                          <div>
                            <p className="font-semibold text-slate-900">{doc.file_name}</p>
                            <p className="text-[10px] text-slate-400 capitalize">
                              {doc.doc_type?.replace(/_/g, " ")} • v{doc.version} • {doc.status}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => onOpenDocViewer(doc)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 6: Activity & Audit Timeline */}
              {activeTab === "activity" && (
                <div className="space-y-3 text-xs">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-slate-500" />
                    Audit Log & Workflow Timeline
                  </h4>
                  <div className="relative pl-6 border-l-2 border-slate-200 space-y-4 my-3">
                    <div className="relative">
                      <div className="absolute -left-[31px] top-1 w-3 h-3 bg-teal-600 rounded-full border-2 border-white" />
                      <p className="font-semibold text-slate-900">Contract Created (Version {data.version})</p>
                      <p className="text-[10px] text-slate-400">{new Date(data.created_at).toLocaleString()}</p>
                    </div>
                    {data.remarks && (
                      <div className="relative">
                        <div className="absolute -left-[31px] top-1 w-3 h-3 bg-slate-400 rounded-full border-2 border-white" />
                        <p className="font-semibold text-slate-900">Remarks / Approval Note</p>
                        <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-200 mt-1">
                          {data.remarks}
                        </p>
                      </div>
                    )}
                    {data.tasks?.map((t: any) => (
                      <div key={t.id} className="relative">
                        <div className="absolute -left-[31px] top-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-white" />
                        <p className="font-semibold text-slate-900">{t.title}</p>
                        <p className="text-[10px] text-slate-400">Status: {t.status} • Priority: {t.priority}</p>
                        {t.resolution_comment && (
                          <p className="text-[11px] text-slate-600 italic mt-0.5">"{t.resolution_comment}"</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Approval Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              Approve Contract {data?.contract_code}
            </h3>
            <p className="text-xs text-slate-500">
              Approving will activate or set status to future based on the commencement date. Please provide an audit comment.
            </p>
            <textarea
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Approval comment or reference note..."
              className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowApproveModal(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading}
                onClick={handleApprove}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
              >
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Ban className="w-5 h-5 text-rose-600" />
              Reject Contract {data?.contract_code}
            </h3>
            <p className="text-xs text-slate-500">
              Rejecting will revert the contract status back to draft. A clear rejection reason is mandatory.
            </p>
            <textarea
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Reason for rejection (mandatory)..."
              className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading || !commentText.trim()}
                onClick={handleReject}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
