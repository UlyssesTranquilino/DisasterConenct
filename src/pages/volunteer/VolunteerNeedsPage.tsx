import { useState } from "react";
import { mockNeeds } from "../../mock/data";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

export default function VolunteerNeedsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filteredNeeds = mockNeeds.filter((n) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      n.type.toLowerCase().includes(q) ||
      n.description.toLowerCase().includes(q) ||
      n.location.toLowerCase().includes(q);
    const matchesFilter = filter === "all" || n.type.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-6 space-y-6 h-screen overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold tracking-wide text-white">Active Volunteer Needs</h1>

        <div className="flex gap-3 w-full md:w-auto items-center">
          <Input
            placeholder="Search needs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-64 border-white/10 bg-transparent text-white placeholder:text-gray-400"
          />

          {/* Filter Dropdown */}
          <div>
            <label htmlFor="need-filter" className="sr-only">
              Filter type
            </label>
            <select
              id="need-filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-white/10 w-40 p-2 rounded-md bg-transparent text-white"
            >
              <option value="all" className="bg-gray-800 text-white">All</option>
              <option value="medical" className="bg-gray-800 text-white">Medical</option>
              <option value="food" className="bg-gray-800 text-white">Food</option>
              <option value="logistics" className="bg-gray-800 text-white">Logistics</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-transparent border border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Total Active Needs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{mockNeeds.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-transparent border border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Urgent Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {mockNeeds.filter((n) => n.priority === "High").length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-transparent border border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Fulfilled This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">8</div>
          </CardContent>
        </Card>
      </div>

      {/* Needs List */}
      <div className="grid gap-4 overflow-y-auto pb-6">
        {filteredNeeds.map((n) => (
          <Card
            key={n.id}
            className="bg-transparent border border-white/10 hover:border-white/20 transition-all duration-200"
          >
            <CardHeader>
              <CardTitle className="capitalize text-lg flex justify-between items-center text-white">
                <span>{n.type}</span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    n.priority === "High"
                      ? "bg-red-500/20 text-red-400"
                      : n.priority === "Medium"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-green-500/20 text-green-400"
                  }`}
                >
                  {n.priority}
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="text-sm text-gray-300 mb-2">{n.description}</div>
              <div className="text-xs text-gray-400">📍 {n.location}</div>
              <div className="mt-3">
                <Button className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm">
                  Respond
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredNeeds.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            No active needs found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}