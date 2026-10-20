import { redirect } from "next/navigation";

export default async function VirtualOfficeCityPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  redirect(`/marketplace/search?city=${encodeURIComponent(city)}&vertical=virtual_office`);
}
