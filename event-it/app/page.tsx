'use client'

import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-4">Meine erste Seite 🎉</h1>

      <Link href="/gruppen">
        <Button>
          Gruppen
        </Button>
      </Link>
    </main>
  );
}
