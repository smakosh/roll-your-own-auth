import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <main className="grid place-items-center h-screen">
      <div className="flex items-center self-center">
        <Link to="/signup" className="mr-4 underline text-blue-500">
          Signup
        </Link>
        <Link to="/login" className="mr-4 underline text-blue-500">
          Login
        </Link>
        <Link to="/dashboard" className="underline text-blue-500">
          Protected Dashboard
        </Link>
      </div>
    </main>
  );
}
