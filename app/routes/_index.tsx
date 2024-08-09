import { Button } from "~/components/ui/button";
import type { MetaFunction } from "@remix-run/cloudflare";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Box-Maison" },
    {
      name: "description",
      content: "Welcome to Box-Maison!",
    },
  ];
};

export default function Index() {
  return (
    <div className="font-sans p-4">
      <h1 className="text-3xl">Welcome to Box-Maison!</h1>
      <Link to="/@hoge">hoge room</Link>
      <Button>hoge room</Button>
    </div>
  );
}
