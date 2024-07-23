"use client";

import { APP_URL } from "@/lib/env";
import { Button } from "@/ui/components/button";
import { useRouter } from "next/navigation";

const Logout = () => {
  const router = useRouter();
  const logout = async () => {
    const res = await fetch(`${APP_URL}/api/auth/logout`);

    if (res.status === 200) {
      router.push("/login");
    }
  };

  return (
    <Button type="button" onClick={logout}>
      Logout
    </Button>
  );
};

export default Logout;
