import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import Logout from "./components/Logout";

export const dynamic = "force-dynamic";

const DashboardPage = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div>
      Welcome back: <pre>{JSON.stringify(user, null, 2)}</pre>
      <Logout />
    </div>
  );
};

export default DashboardPage;
