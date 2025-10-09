import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
} from "../../components/components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Plus, Pencil } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "../../lib/utils";

const cardGradientStyle = {
  background:
    "linear-gradient(to bottom, rgba(6,11,40,0.7) 0%, rgba(10,14,35,0.7) 100%)",
  backdropFilter: "blur(10px)",
};

type Report = {
  id: number;
  title: string;
  author: string;
  date: string;
  status: string;
};

export const OrgReportsPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([
    {
      id: 1,
      title: "Flood Relief Distribution",
      author: "John Doe",
      date: "2025-10-08",
      status: "Completed",
    },
    {
      id: 2,
      title: "Medical Mission - Barangay 12",
      author: "Jane Smith",
      date: "2025-10-07",
      status: "Ongoing",
    },
    {
      id: 3,
      title: "Evacuation Center Setup",
      author: "Michael Cruz",
      date: "2025-10-06",
      status: "Completed",
    },
    {
      id: 4,
      title: "Supply Inventory Check",
      author: "Maria Santos",
      date: "2025-10-05",
      status: "Pending",
    },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Report | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    status: "",
  });

  const handleOpenAdd = () => {
    setEditing(null);
    setFormData({ title: "", author: "", status: "" });
    setDialogOpen(true);
  };

  const handleOpenEdit = (rep: Report) => {
    setEditing(rep);
    setFormData({
      title: rep.title,
      author: rep.author,
      status: rep.status,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (editing) {
      setReports((prev) =>
        prev.map((r) =>
          r.id === editing.id
            ? {
                ...r,
                ...formData,
                date: new Date().toISOString().split("T")[0],
              }
            : r
        )
      );
    } else {
      setReports((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          ...formData,
          date: new Date().toISOString().split("T")[0],
        },
      ]);
    }
    setDialogOpen(false);
  };

  const evacueeTrendData = [
    { day: "Mon", value: 320 },
    { day: "Tue", value: 280 },
    { day: "Wed", value: 450 },
    { day: "Thu", value: 390 },
    { day: "Fri", value: 520 },
    { day: "Sat", value: 610 },
    { day: "Sun", value: 580 },
  ];

  return (
    <div className="space-y-6">
      {/* --- Header --- */}
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold text-white">Reports Overview</h1>
        <Button
          size="sm"
          onClick={handleOpenAdd}
          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500"
        >
          <Plus size={14} /> New Report
        </Button>
      </div>

      {/* --- Summary Cards --- */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Evacuees", value: "4,320" },
          { label: "Active Centers", value: "12" },
          { label: "Volunteers", value: "184" },
          { label: "Distributed Supplies", value: "7,520" },
        ].map((card, i) => (
          <Card key={i} className="border-0" style={cardGradientStyle}>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm text-neutral-400">
                {card.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* --- Reports Table --- */}
      <Card className="border-0" style={cardGradientStyle}>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-white">
            Reports List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm text-left text-neutral-300">
            <thead className="text-xs uppercase text-neutral-400 border-b border-neutral-700">
              <tr>
                <th className="py-2 px-3">Title</th>
                <th className="py-2 px-3">Author</th>
                <th className="py-2 px-3">Date</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-neutral-800 hover:bg-neutral-900/40"
                >
                  <td className="py-2 px-3">{r.title}</td>
                  <td className="py-2 px-3">{r.author}</td>
                  <td className="py-2 px-3">{r.date}</td>
                  <td className="py-2 px-3">
                    <span
                      className={cn(
                        "px-2 py-1 rounded text-xs font-medium",
                        r.status === "Completed"
                          ? "bg-green-600/30 text-green-400"
                          : r.status === "Ongoing"
                          ? "bg-yellow-600/30 text-yellow-400"
                          : "bg-neutral-700 text-neutral-300"
                      )}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenEdit(r)}
                    >
                      <Pencil size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* --- Evacuees Trend Chart --- */}
      <Card className="border-0" style={cardGradientStyle}>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-white">
            Evacuee Trend (Past 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={evacueeTrendData}>
              <XAxis
                dataKey="day"
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#9ca3af", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
                content={({ active, payload }) =>
                  active && payload && payload.length ? (
                    <div className="p-2 bg-neutral-900 border border-neutral-700 rounded-md text-white text-xs">
                      <p>{payload[0].payload.day}</p>
                      <p>{`${payload[0].value} evacuees`}</p>
                    </div>
                  ) : null
                }
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* --- Add/Edit Dialog --- */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#0b0f26] border border-neutral-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editing ? "Edit Report" : "Add New Report"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="title">Report Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g. Supply Distribution Report"
                className="bg-neutral-900 border-neutral-700 text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) =>
                  setFormData({ ...formData, author: e.target.value })
                }
                placeholder="e.g. John Doe"
                className="bg-neutral-900 border-neutral-700 text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Input
                id="status"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                placeholder="e.g. Ongoing / Completed"
                className="bg-neutral-900 border-neutral-700 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-500"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
