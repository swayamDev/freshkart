import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  if (!user) redirect("/sign-in?redirect_url=/admin");

  const isAdmin = user.publicMetadata?.isAdmin === true;
  if (!isAdmin) redirect("/");

  return (
    <div className="min-h-screen flex bg-[hsl(var(--muted))]">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
