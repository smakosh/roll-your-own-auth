import { Button } from "@/lib/components/button";
import { API_URL } from "@/lib/env";
import { getUser } from "@/lib/getUser";
import { getCurrentUser } from "@/lib/session";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  Navigate,
  redirect,
  useNavigate,
} from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    const user = await getCurrentUser();

    if (!user) {
      throw redirect({ to: "/login" });
    }
  },
  // loader: async ({ context }) => {
  //   await context.queryClient.ensureQueryData({
  //     queryKey: ["USER"],
  //     queryFn: getUser,
  //     retry: 1,
  //   });
  // },
  component: Dashboard,
  pendingComponent: () => <>Loading...</>,
});

function Dashboard() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["USER"],
    queryFn: getUser,
    retry: 1,
  });

  if (isLoading) {
    return <>Loading...</>;
  }

  if (!data) {
    return <Navigate to="/login" />;
  }

  const logout = async () => {
    const res = await fetch(`${API_URL}/auth/logout`);

    if (res.status === 200) {
      navigate({ to: "/login" });
    }
  };

  return (
    <>
      Welcome back: <pre>{JSON.stringify(data, null, 2)}</pre>
      <Button type="button" onClick={logout}>
        Logout
      </Button>
    </>
  );
}
