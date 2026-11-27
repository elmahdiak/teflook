import { redirect } from "next/navigation";
import { ADMIN_FUNNEL_ANALYTICS_PATH } from "@/lib/admin-config";

export default function AdminAnalyticsIndexPage() {
  redirect(ADMIN_FUNNEL_ANALYTICS_PATH);
}
