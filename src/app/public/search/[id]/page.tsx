import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SearchPropertyDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams?.id || "apex-bkc";
  redirect(`/public/property/${id}`);
}
