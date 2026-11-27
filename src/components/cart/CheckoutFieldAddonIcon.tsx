"use client";

import React from "react";
import {
  Calendar,
  Clock,
  Edit3,
  FileText,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import type { CheckoutFieldConfig } from "@/lib/checkout-fields";

export const DEFAULT_SHIPPING_FEE_MAD = 20;

export const SPLIT_INPUT_GROUP_CLASS =
  "flex items-stretch rounded-xl border border-[#4B9393]/25 bg-white overflow-hidden focus-within:border-[#4B9393] focus-within:ring-2 focus-within:ring-[#4B9393]/15 transition-all";

export function getAddonBoxClass(isRtl: boolean): string {
  return `bg-[#F3EFE6]/80 px-3.5 flex items-center justify-center ${
    isRtl ? "border-l" : "border-r"
  } border-[#4B9393]/15 text-[#1A3C34] shrink-0`;
}

export function CheckoutFieldAddonIcon({
  field,
  size = 16,
}: {
  field: Pick<CheckoutFieldConfig, "field_key" | "field_type">;
  size?: number;
}) {
  const key = field.field_key.toLowerCase();
  const type = field.field_type;

  if (
    key.includes("phone") ||
    key.includes("tel") ||
    key.includes("whatsapp") ||
    type === "tel"
  ) {
    return <Phone size={size} />;
  }

  if (key.includes("email") || key.includes("mail") || type === "email") {
    return <Mail size={size} />;
  }

  if (
    key === "full_name" ||
    key.includes("name") ||
    key.includes("nom") ||
    key.includes("prenom")
  ) {
    return <User size={size} />;
  }

  if (
    key === "city" ||
    key === "address" ||
    key === "neighborhood" ||
    key.includes("ville") ||
    key.includes("adresse") ||
    key.includes("quartier") ||
    key.includes("location")
  ) {
    return <MapPin size={size} />;
  }

  if (type === "date" || key.includes("date")) {
    return <Calendar size={size} />;
  }

  if (
    type === "time" ||
    key.includes("time") ||
    key.includes("heure") ||
    key.includes("creneau")
  ) {
    return <Clock size={size} />;
  }

  if (
    key.includes("note") ||
    key.includes("message") ||
    key.includes("comment") ||
    type === "textarea"
  ) {
    return <FileText size={size} />;
  }

  return <Edit3 size={size} />;
}
