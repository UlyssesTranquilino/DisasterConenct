import { useState, useEffect } from "react";
import {
  organizationService,
  Announcement,
} from "../../services/organizationService";
import { Button } from "../../components/ui/button";
import { Plus, Loader2, Pencil, Trash2 } from "lucide-react";
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

export default function OrgAnnouncementsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    status: "Published" as "Draft" | "Published",
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditing(null);
    setFormData({ title: "", body: "", status: "Published" });
    setDialogOpen(true);
  };

  const handleOpenEdit = (a: Announcement) => {
    setEditing(a);
    setFormData({
      title: a.title,
      body: a.body,
      status: (a.status as "Draft" | "Published") || "Published",
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
        await organizationService.updateAnnouncement(editing.id, {
          title: formData.title,
          body: formData.body,
          status: formData.status,
        });
        toast.success("Announcement updated", { description: formData.title });
      } else {
        await organizationService.createAnnouncement({
          title: formData.title,
          body: formData.body,
          status: formData.status,
        });
        toast.success("Announcement published", {
          description: formData.title,
        });
      }

      setDialogOpen(false);
      await fetchAnnouncements();
    } catch (err) {
      console.error("Error saving announcement:", err);
      toast.error("Failed to save announcement", {
        description:
          err instanceof Error ? err.message : "Something went wrong.",
      });
    }
  };

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await organizationService.getAnnouncements();
      setAnnouncements(res.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch announcements"
      );
      console.error("Error fetching announcements:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreateAnnouncement = async (title: string, body: string) => {
    try {
      await organizationService.createAnnouncement({
        title,
        body,
        status: "Published", // or "Draft" if you prefer
      });

      toast.success("Announcement published", {
        description: title,
      });

      await fetchAnnouncements();
    } catch (err) {
      console.error("Error creating announcement:", err);
      setError(
        err instanceof Error ? err.message : "Failed to create announcement"
      );
      toast.error("Failed to create announcement", {
        description:
          err instanceof Error ? err.message : "Something went wrong.",
      });
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;

    try {
      await organizationService.deleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      toast.success("Announcement deleted");
    } catch (err) {
      console.error("Error deleting announcement:", err);
      toast.error("Failed to delete announcement", {
        description:
          err instanceof Error ? err.message : "Something went wrong.",
      });
    }
  };

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
        <Button onClick={fetchAnnouncements}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-2 md:px-4 text-white">
      {/* --- Header --- */}
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold text-white">Announcements</h1>
        <Button
          size="sm"
          onClick={handleOpenAdd}
          className="flex items-center gap-1 bg-blue-700 hover:bg-blue-500"
        >
          <Plus size={14} /> Add Announcement
        </Button>
      </div>

      {/* --- Table of Announcements --- */}
      <Card className="border-0" style={cardGradientStyle}>
        <CardHeader>
          <CardTitle className="text-white text-sm font-medium">
            Announcement List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm text-left text-neutral-300">
            <thead className="text-xs uppercase text-neutral-400 border-b border-neutral-700">
              <tr>
                <th className="py-2 px-3">Title</th>
                <th className="py-2 px-3">Body</th>
                <th className="py-2 px-3">Date</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {announcements.map((a) => (
                <tr
                  key={a.id}
                  className="border-b border-neutral-800 hover:bg-neutral-900/40"
                >
                  <td className="py-2 px-3 font-medium text-white">
                    {a.title}
                  </td>
                  <td className="py-2 px-3 text-neutral-400">
                    {a.body.length > 80
                      ? `${a.body.substring(0, 80)}...`
                      : a.body}
                  </td>
                  <td className="py-2 px-3">
                    {(() => {
                      // Handle Firestore Timestamp object
                      if (
                        a.date &&
                        typeof a.date === "object" &&
                        "_seconds" in a.date
                      ) {
                        return new Date(
                          a.date._seconds * 1000
                        ).toLocaleDateString();
                      }
                      // Handle regular date string
                      const dateField = a.date || a.createdAt;
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
                    {a.status === "Published" ? (
                      <span className="text-green-400">Published</span>
                    ) : (
                      <span className="text-yellow-400">Draft</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-right space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => handleOpenEdit(a)}
                    >
                      <Pencil size={14} />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs text-red-400 border-red-800 hover:bg-red-900/50"
                      onClick={() => handleDeleteAnnouncement(a.id!)}
                    >
                      <Trash2 size={12} className="mr-1" /> Delete
                    </Button>
                  </td>
                </tr>
              ))}
              {announcements.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-4 px-3 text-center text-neutral-400"
                  >
                    No announcements yet.
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
              {editing ? "Edit Announcement" : "Add Announcement"}
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
                placeholder="Enter announcement title"
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
                placeholder="Write announcement details..."
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
                    status: e.target.value as "Draft" | "Published",
                  })
                }
                className="bg-neutral-900 border border-neutral-700 text-white text-sm rounded-md p-2"
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
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
