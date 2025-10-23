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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold tracking-wide">Active Volunteer Needs</h1>

        <div className="flex gap-3 w-full md:w-auto items-center">
          <Input
            placeholder="Search needs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-64"
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
              className="border border-slate-700 w-40 p-2 rounded-md bg-transparent"
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
        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle>Total Active Needs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockNeeds.length}</div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle>Urgent Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {mockNeeds.filter((n) => n.priority === "High").length}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle>Fulfilled This Week</CardTitle>
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
            className="hover:shadow-md hover:border-slate-400 transition-all duration-200"
          >
            <CardHeader>
              <CardTitle className="capitalize text-lg flex justify-between items-center">
                <span>{n.type}</span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    n.priority === "High"
                      ? "bg-red-100 text-red-600"
                      : n.priority === "Medium"
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-green-100 text-green-600"
                  }`}
                >
                  {n.priority}
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="text-sm text-slate-700 mb-2">{n.description}</div>
              <div className="text-xs text-slate-500">📍 {n.location}</div>
              <div className="mt-3">
                <Button className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm">
                  Respond
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredNeeds.length === 0 && (
          <div className="text-center text-slate-500 py-12">
            No active needs found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
