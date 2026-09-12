import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Admin sign-in — TopPick.pro",
  description: "Private operator access. This page is not a public account.",
  path: "/admin/login",
  noIndex: true,
});

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}