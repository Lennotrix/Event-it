'use client'

export default function GruppenPage() {
  return (
    <main className="p-10">
      <h1 className="text-2xl font-bold mb-6">Gruppenseite</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-64 overflow-y-scroll p-4 border rounded-lg shadow">
          <p>Meine Gruppen</p>
          <div className="h-96 bg-gray-100 mt-2" />
        </div>

        <div className="h-64 overflow-y-scroll p-4 border rounded-lg shadow">
          <p>Erstelle Gruppe</p>
          <div className="h-96 bg-gray-100 mt-2" />
        </div>

        <div className="h-64 overflow-y-scroll p-4 border rounded-lg shadow">
          <p>Einladungscode</p>
          <div className="h-96 bg-gray-100 mt-2" />
        </div>
      </div>
    </main>
  )
}
