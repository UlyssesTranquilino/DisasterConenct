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
import { cn } from "../../lib/utils";

export default function OrgAnnouncementsPage() {
  // --- Mock data ---
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: "Relief Drive This Weekend",
      body: "Join us at the central gym on Saturday 9 AM for a relief goods drive.",
      date: "2025-10-08",
      status: "Published",
    },
    {
      id: 2,
      title: "Evacuation Drill",
      body: "All volunteers are required to attend the evacuation drill on Tuesday.",
      date: "2025-10-06",
      status: "Draft",
    },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    status: "Draft",
  });

  const handleOpenAdd = () => {
    setEditing(null);
    setFormData({ title: "", body: "", status: "Draft" });
    setDialogOpen(true);
  };

  const handleOpenEdit = (a: any) => {
    setEditing(a);
    setFormData({
      title: a.title,
      body: a.body,
      status: a.status,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (editing) {
      setAnnouncements((prev) =>
        prev.map((a) =>
          a.id === editing.id
            ? {
                ...a,
                ...formData,
                date: new Date().toISOString().split("T")[0],
              }
            : a
        )
      );
    } else {
      setAnnouncements((prev) => [
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

  const cardGradientStyle = {
    background:
      "linear-gradient(to bottom, rgba(6,11,40,0.7) 0%, rgba(10,14,35,0.7) 100%)",
    backdropFilter: "blur(10px)",
  };

  return (
    <div className="space-y-6">
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
                    {a.body.length > 50
                      ? `${a.body.substring(0, 50)}...`
                      : a.body}
                  </td>
                  <td className="py-2 px-3">{a.date}</td>
                  <td
                    className={cn(
                      "py-2 px-3 font-semibold",
                      a.status === "Published"
                        ? "text-green-400"
                        : "text-yellow-400"
                    )}
                  >
                    {a.status}
                  </td>
                  <td className="py-2 px-3 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenEdit(a)}
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
                  setFormData({ ...formData, status: e.target.value })
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
