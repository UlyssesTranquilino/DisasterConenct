import { useState } from "react"
import { mockNeeds } from "../../mock/data"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"

export default function VolunteerNeedsPage() {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")

  const filteredNeeds = mockNeeds.filter((n) => {
    const q = search.trim().toLowerCase()
    const matchesSearch =
      !q ||
      n.type.toLowerCase().includes(q) ||
      n.description.toLowerCase().includes(q) ||
      n.location.toLowerCase().includes(q)
    const matchesFilter = filter === "all" || n.type.toLowerCase() === filter.toLowerCase()
    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b1121] to-[#111c2d] text-white p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold tracking-wide">Active Volunteer Needs</h1>

        <div className="flex gap-3 w-full md:w-auto items-center">
          <Input
            placeholder="Search needs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#1a253a] text-white border-slate-600 w-full md:w-64"
          />

          {/* Native select used to avoid missing exports */}
          <div>
            <label htmlFor="need-filter" className="sr-only">
              Filter type
            </label>
            <select
              id="need-filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-[#1a253a] text-white border border-slate-600 w-40 p-2 rounded-md"
            >
              <option value="all">All</option>
              <option value="medical">Medical</option>
              <option value="food">Food</option>
              <option value="logistics">Logistics</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-[#18263f] border-slate-700 shadow-lg shadow-blue-900/30">
          <CardHeader>
            <CardTitle className="text-blue-400">Total Active Needs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockNeeds.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#18263f] border-slate-700 shadow-lg shadow-blue-900/30">
          <CardHeader>
            <CardTitle className="text-red-400">Urgent Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {mockNeeds.filter((n) => n.priority === "High").length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#18263f] border-slate-700 shadow-lg shadow-blue-900/30">
          <CardHeader>
            <CardTitle className="text-green-400">Fulfilled This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">8</div>
          </CardContent>
        </Card>
      </div>

      {/* Needs List */}
      <div className="grid gap-4">
        {filteredNeeds.map((n) => (
          <Card
            key={n.id}
            className="bg-[#1a253a] border-slate-700 hover:shadow-lg hover:shadow-blue-700/20 transition-all duration-200"
          >
            <CardHeader>
              <CardTitle className="capitalize text-lg flex justify-between items-center">
                <span>{n.type}</span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    n.priority === "High"
                      ? "bg-red-500/20 text-red-300"
                      : n.priority === "Medium"
                      ? "bg-yellow-500/20 text-yellow-300"
                      : "bg-green-500/20 text-green-300"
                  }`}
                >
                  {n.priority}
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="text-sm text-slate-300 mb-2">{n.description}</div>
              <div className="text-xs text-slate-400">📍 {n.location}</div>
              <div className="mt-3">
                <Button className="bg-blue-600 hover:bg-blue-500 text-white text-sm">Respond</Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredNeeds.length === 0 && (
          <div className="text-center text-slate-400 py-12">
            No active needs found matching your criteria.
          </div>
        )}
      </div>
    </div>
  )
}
