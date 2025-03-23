import { redirect } from "next/navigation";

import { getCurrentUserCached } from "@/lib/session";
import Logout from "./components/Logout";

const DashboardPage = async () => {
  const user = await getCurrentUserCached();

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
