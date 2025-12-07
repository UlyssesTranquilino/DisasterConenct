import { useState, useEffect } from "react";
import {
  organizationService,
  Report,
} from "../../services/organizationService";
import { Button } from "../../components/ui/button";
import { Plus, Loader2, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
} from "../../components/components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

const cardGradientStyle = {
  background:
    "linear-gradient(to bottom, rgba(6,11,40,0.7) 0%, rgba(10,14,35,0.7) 100%)",
  backdropFilter: "blur(10px)",
};

const statusColors = {
  Pending: "text-yellow-400",
  Reviewed: "text-blue-400",
  Closed: "text-green-400",
};

export default function OrgReportsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Report | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    status: "Pending" as "Pending" | "Reviewed" | "Closed",
  });

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Pending" | "Reviewed" | "Closed"
  >("All");

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await organizationService.getReports();
      setReports(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch reports");
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleOpenAdd = () => {
    setEditing(null);
    setFormData({ title: "", body: "", status: "Pending" });
    setDialogOpen(true);
  };

  const handleOpenEdit = (r: Report) => {
    setEditing(r);
    setFormData({
      title: r.title,
      body: r.body,
      status: (r.status as "Pending" | "Reviewed" | "Closed") || "Pending",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.title || !formData.body) {
        toast.error("Title and body are required");
        return;
      }

      if (editing && editing.id) {
        await organizationService.updateReport(editing.id, {
          title: formData.title,
          body: formData.body,
          status: formData.status,
        });
        toast.success("Report updated", { description: formData.title });
      } else {
        await organizationService.createReport({
          title: formData.title,
          body: formData.body,
          status: formData.status,
        });
        toast.success("Report created", {
          description: formData.title,
        });
      }

      setDialogOpen(false);
      await fetchReports();
    } catch (err) {
      console.error("Error saving report:", err);
      toast.error("Failed to save report", {
        description:
          err instanceof Error ? err.message : "Something went wrong.",
      });
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (!confirm("Delete this report?")) return;

    try {
      await organizationService.deleteReport(id);
      setReports((prev) => prev.filter((r) => r.id !== id));
      toast.success("Report deleted");
    } catch (err) {
      console.error("Error deleting report:", err);
      toast.error("Failed to delete report", {
        description:
          err instanceof Error ? err.message : "Something went wrong.",
      });
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.body.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || report.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-6 px-2 md:px-4 text-white">
        {/* Header skeleton */}
        <div className="flex justify-between items-center">
          <div className="h-6 w-40 bg-neutral-800/80 rounded animate-pulse" />
          <div className="h-9 w-32 bg-blue-900/70 rounded-md animate-pulse" />
        </div>

        {/* Table skeleton */}
        <Card className="border-0" style={cardGradientStyle}>
          <CardHeader>
            <div className="h-4 w-48 bg-neutral-800/80 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between border-b border-neutral-800/80 pb-2"
                >
                  <div className="space-y-1 flex-1">
                    <div className="h-3 w-40 bg-neutral-800/80 rounded animate-pulse" />
                    <div className="h-3 w-64 bg-neutral-900/80 rounded animate-pulse" />
                  </div>
                  <div className="flex gap-2 ml-4">
                    <div className="h-7 w-16 bg-neutral-800/80 rounded animate-pulse" />
                    <div className="h-7 w-16 bg-neutral-900/80 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-500 mb-4">Error: {error}</div>
        <Button onClick={fetchReports}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-2 md:px-4 text-white">
      {/* --- Header --- */}
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold text-white">Reports</h1>
        <Button
          size="sm"
          onClick={handleOpenAdd}
          className="flex items-center gap-1 bg-blue-700 hover:bg-blue-500"
        >
          <Plus size={14} /> New Report
        </Button>
      </div>

      {/* --- Search and Filter --- */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-neutral-900 border-neutral-700 text-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value as "All" | "Pending" | "Reviewed" | "Closed"
            )
          }
          className="bg-neutral-900 border border-neutral-700 text-white text-sm rounded-md p-2"
        >
          <option value="All">Status (All)</option>
          <option value="Pending">Pending</option>
          <option value="Reviewed">Reviewed</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      {/* --- Table of Reports --- */}
      <Card className="border-0" style={cardGradientStyle}>
        <CardHeader>
          <CardTitle className="text-white text-sm font-medium">
            Report List
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
              {filteredReports.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-neutral-800 hover:bg-neutral-900/40"
                >
                  <td className="py-2 px-3 font-medium text-white">
                    {r.title}
                  </td>
                  <td className="py-2 px-3 text-neutral-400">{r.author}</td>
                  <td className="py-2 px-3">
                    {(() => {
                      // Handle Firestore Timestamp object
                      if (
                        r.date &&
                        typeof r.date === "object" &&
                        "_seconds" in r.date
                      ) {
                        return new Date(
                          r.date._seconds * 1000
                        ).toLocaleDateString();
                      }
                      // Handle regular date string
                      const dateField = r.date || r.createdAt;
                      if (!dateField) return "N/A";
                      try {
                        const date = new Date(dateField);
                        return isNaN(date.getTime())
                          ? "N/A"
                          : date.toLocaleDateString();
                      } catch {
                        return "N/A";
                      }
                    })()}
                  </td>
                  <td className="py-2 px-3 font-semibold">
                    <span
                      className={
                        statusColors[r.status as keyof typeof statusColors] ||
                        "text-neutral-400"
                      }
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => handleOpenEdit(r)}
                    >
                      <Pencil size={14} />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs text-red-400 border-red-800 hover:bg-red-900/50"
                      onClick={() => handleDeleteReport(r.id!)}
                    >
                      <Trash2 size={12} className="mr-1" /> Delete
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredReports.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-4 px-3 text-center text-neutral-400"
                  >
                    No reports found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* --- Add/Edit Dialog --- */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#0b0f26] border border-neutral-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editing ? "Edit Report" : "New Report"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter report title"
                className="bg-neutral-900 border-neutral-700 text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="body">Body</Label>
              <textarea
                id="body"
                value={formData.body}
                onChange={(e) =>
                  setFormData({ ...formData, body: e.target.value })
                }
                placeholder="Write report details..."
                className="bg-neutral-900 border border-neutral-700 rounded-md text-sm p-2 text-white h-28 resize-none"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as "Pending" | "Reviewed" | "Closed",
                  })
                }
                className="bg-neutral-900 border border-neutral-700 text-white text-sm rounded-md p-2"
              >
                <option value="Pending">Pending</option>
                <option value="Reviewed">Reviewed</option>
                <option value="Closed">Closed</option>
              </select>
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
}
