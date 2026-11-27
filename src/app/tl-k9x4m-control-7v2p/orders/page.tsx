"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Coins,
  ExternalLink,
  Filter,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  Trash2,
  Truck,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  deleteCODOrder,
  fetchSyncedCODOrders,
  getCODOrders,
  updateCODOrderStatus,
  type CODOrder,
  type OrderStatus,
} from "@/lib/cod-service";

const STATUS_OPTIONS: { value: OrderStatus; label: string; color: string }[] = [
  { value: "pending", label: "En attente d'appel", color: "bg-amber-100 text-amber-800 border-amber-300" },
  { value: "confirmed", label: "Confirmée (Validée)", color: "bg-blue-100 text-blue-800 border-blue-300" },
  { value: "shipped", label: "En cours d'expédition", color: "bg-purple-100 text-purple-800 border-purple-300" },
  { value: "delivered", label: "Livrée & Encaissée (COD)", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  { value: "cancelled", label: "Annulée", color: "bg-rose-100 text-rose-800 border-rose-300" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<CODOrder[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<CODOrder | null>(null);

  useEffect(() => {
    setOrders(getCODOrders());
    fetchSyncedCODOrders().then((synced) => {
      setOrders(synced);
    });
  }, []);

  function handleStatusChange(orderId: string, newStatus: OrderStatus) {
    updateCODOrderStatus(orderId, newStatus);
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    if (selectedOrder?.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  }

  function handleDelete(orderId: string) {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette commande ?")) {
      deleteCODOrder(orderId);
      setOrders((prev) => prev.filter((order) => order.id !== orderId));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null);
      }
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesFilter =
      activeFilter === "all" || order.status === activeFilter;
    const query = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !query ||
      order.id.toLowerCase().includes(query) ||
      order.customerName.toLowerCase().includes(query) ||
      order.customerPhone.includes(query) ||
      order.customerCity.toLowerCase().includes(query) ||
      order.customerAddress.toLowerCase().includes(query) ||
      (order.notes && order.notes.toLowerCase().includes(query)) ||
      Boolean(
        order.customFieldsSummary?.some(
          (entry) =>
            entry.labelFr.toLowerCase().includes(query) ||
            entry.labelAr.toLowerCase().includes(query) ||
            entry.value.toLowerCase().includes(query)
        )
      );

    return matchesFilter && matchesSearch;
  });

  const getCount = (status: string) => {
    if (status === "all") return orders.length;
    return orders.filter((o) => o.status === status).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-foreground">
            Gestion des Commandes Cash on Delivery (COD)
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Suivi des appels de confirmation, expéditions et encaissements en espèces à la livraison.
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: "all", label: "Toutes" },
            { id: "pending", label: "En attente" },
            { id: "confirmed", label: "Confirmées" },
            { id: "shipped", label: "Expédiées" },
            { id: "delivered", label: "Livrées" },
            { id: "cancelled", label: "Annulées" },
          ].map((tab) => {
            const isSelected = activeFilter === tab.id;
            const count = getCount(tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? "bg-brand-teal text-white shadow-xs"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    isSelected ? "bg-white/20 text-white" : "bg-secondary text-foreground"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute inset-y-0 left-3 my-auto text-muted-foreground pointer-events-none" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher client, tél, ville, #N°..."
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-border bg-card text-xs outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20 transition-all"
          />
        </div>
      </div>

      {/* Orders List Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-[#F9F8F6] text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                <th className="py-3.5 px-4 sm:px-6">N° & Date</th>
                <th className="py-3.5 px-4">Destinataire (Maroc)</th>
                <th className="py-3.5 px-4">Articles commandés</th>
                <th className="py-3.5 px-4">Montant COD</th>
                <th className="py-3.5 px-4">Statut Commande</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground text-sm">
                    Aucune commande trouvée correspondant à vos critères.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const statusOpt =
                    STATUS_OPTIONS.find((s) => s.value === order.status) || STATUS_OPTIONS[0];

                  const cleanPhone = order.customerPhone.replace(/\D/g, "");
                  const whatsappUrl = `https://wa.me/212${cleanPhone.replace(/^0/, "")}?text=${encodeURIComponent(
                    `Bonjour ${order.customerName}, nous vous contactons depuis la maison TefLook concernant votre commande #${order.id} d'un montant de ${order.totalMad} MAD à livrer à ${order.customerCity}. Confirmez-vous la livraison ?`
                  )}`;

                  return (
                    <tr key={order.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="py-4 px-4 sm:px-6">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="font-bold text-foreground text-sm hover:text-brand-teal transition-colors block text-left"
                        >
                          #{order.id}
                        </button>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-bold text-foreground">{order.customerName}</div>
                        <div className="text-[11px] text-brand-teal font-semibold flex items-center gap-1 mt-0.5">
                          <MapPin size={12} />
                          <span>{order.customerCity}</span>
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                          {order.customerAddress}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-semibold text-foreground">
                          {order.items.reduce((s, i) => s + i.quantity, 0)} article(s)
                        </div>
                        <div className="text-[11px] text-muted-foreground max-w-[220px] truncate">
                          {order.items.map((i) => `${i.quantity}x ${i.title}`).join(" • ")}
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-extrabold text-brand-orange-deep text-sm">
                          {order.totalMad} MAD
                        </div>
                        <span className="text-[10px] text-emerald-700 font-semibold block">
                          Paiement en espèces
                        </span>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleStatusChange(order.id, e.target.value as OrderStatus)
                          }
                          className={`rounded-xl border px-3 py-1.5 text-xs font-bold outline-none cursor-pointer transition-all ${statusOpt.color}`}
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* WhatsApp Client Direct Contact */}
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="grid size-8 place-items-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                            title="Contacter le client sur WhatsApp"
                          >
                            <MessageCircle size={15} />
                          </a>

                          {/* Order Details button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                            className="h-8 px-2.5 rounded-lg text-xs"
                          >
                            Détails
                          </Button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDelete(order.id)}
                            className="grid size-8 place-items-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            title="Supprimer la commande"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setSelectedOrder(null)}
          />
          <div className="relative z-10 w-full max-w-xl rounded-2xl bg-card border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border p-5 bg-[#F9F8F6]">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-brand-teal">
                  Bordereau Commande COD
                </span>
                <h3 className="font-display text-xl font-bold text-foreground">
                  Commande #{selectedOrder.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
              {/* Customer Box */}
              <div className="rounded-xl border border-border bg-secondary/30 p-4 space-y-2">
                <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <User size={15} className="text-brand-teal" />
                  Informations Client & Expédition
                </h4>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Nom complet :</span>
                    <strong className="text-foreground text-xs">{selectedOrder.customerName}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Téléphone :</span>
                    <strong className="text-foreground text-xs">{selectedOrder.customerPhone}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Ville :</span>
                    <strong className="text-brand-teal text-xs">{selectedOrder.customerCity}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Mode de paiement :</span>
                    <strong className="text-emerald-700 text-xs">Espèces à la livraison</strong>
                  </div>
                </div>
                <div className="border-t border-border/60 pt-2">
                  <span className="text-muted-foreground block text-[11px]">Adresse exacte :</span>
                  <p className="text-foreground font-medium mt-0.5">{selectedOrder.customerAddress}</p>
                </div>
                {selectedOrder.notes && (
                  <div className="border-t border-border/60 pt-2">
                    <span className="text-muted-foreground block text-[11px]">Instructions client :</span>
                    <p className="text-amber-800 font-medium italic mt-0.5">{selectedOrder.notes}</p>
                  </div>
                )}
                {selectedOrder.customFieldsSummary &&
                  selectedOrder.customFieldsSummary.length > 0 && (
                    <div className="border-t border-border/60 pt-2 space-y-1.5">
                      <span className="text-muted-foreground block text-[11px] font-semibold">
                        Détails du formulaire checkout :
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {selectedOrder.customFieldsSummary.map((entry, idx) => (
                          <div
                            key={`${entry.key}-${idx}`}
                            className="rounded-lg bg-white/80 border border-border/60 px-2.5 py-1.5 text-[11px]"
                          >
                            <span className="text-muted-foreground block">
                              {entry.labelFr || entry.labelAr || entry.key}
                            </span>
                            <span className="font-semibold text-foreground break-words">
                              {entry.value || "-"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              {/* Items List */}
              <div>
                <h4 className="font-bold text-foreground text-sm mb-3">
                  Articles inclus ({selectedOrder.items.reduce((s, i) => s + i.quantity, 0)})
                </h4>
                <div className="divide-y divide-border border rounded-xl overflow-hidden">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between gap-3 bg-card">
                      <div className="flex items-center gap-3 min-w-0">
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt=""
                            className="size-11 rounded-lg object-cover bg-secondary border border-border shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-foreground truncate">{item.title}</p>
                          {item.variantTitle && (
                            <p className="text-[11px] text-muted-foreground">{item.variantTitle}</p>
                          )}
                          <p className="text-[11px] text-muted-foreground">
                            {item.quantity} x {item.price} MAD
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-brand-orange-deep text-sm whitespace-nowrap">
                        {item.price * item.quantity} MAD
                      </span>
                    </div>
                  ))}
                  <div className="p-3 bg-[#F9F8F6] flex justify-between items-center font-bold text-sm">
                    <span>Total à encaisser par le livreur :</span>
                    <span className="text-brand-orange-deep text-base">{selectedOrder.totalMad} MAD</span>
                  </div>
                </div>
              </div>

              {/* Status Update */}
              <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
                <span className="font-bold text-foreground text-xs">Modifier le statut :</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) =>
                    handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)
                  }
                  className="rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold outline-none focus:border-brand-teal"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
