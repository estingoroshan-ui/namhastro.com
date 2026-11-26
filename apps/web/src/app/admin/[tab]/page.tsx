import SuperAdminDashboardPage from "../page";
import { ADMIN_MODULES } from "@/data/adminModules";

export function generateStaticParams() {
  return ADMIN_MODULES.map((m) => ({ tab: m.id }));
}

export default async function AdminModulePage({
  params,
}: {
  params: Promise<{ tab: string }>;
}) {
  const { tab } = await params;
  return <SuperAdminDashboardPage initialTab={tab} />;
}
