import React, { useState, useEffect } from "react";
import { useOrganization } from "../../contexts/OrganizationContext";
import { toast } from "sonner";
import {
  organizationService,
  Resource,
} from "../../services/organizationService";
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
  DialogTrigger,
} from "../../components/components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Plus, Pencil, Loader2, AlertCircle, Trash2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
// Helper function to format date
const formatDate = (date?: any) => {
  if (!date) return "N/A";

  // Handle Firestore Timestamp object
  if (date && typeof date === "object" && "_seconds" in date) {
    return new Date(date._seconds * 1000).toLocaleDateString();
  }

  // Handle regular date string or Date object
  try {
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime())
      ? "N/A"
      : parsedDate.toLocaleDateString();
  } catch {
    return "N/A";
  }
};

const cardGradientStyle = {
  background:
    "linear-gradient(to bottom, rgba(6,11,40,0.7) 0%, rgba(10,14,35,0.7) 100%)",
  backdropFilter: "blur(10px)",
};

// Color palette for different resources
const resourceColors = [
  "#3b82f6", // blue
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f97316", // orange
  "#6366f1", // indigo
  "#84cc16", // lime
];

export const OrgResourcesPage: React.FC = () => {
  const { currentOrgId } = useOrganization();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Resource | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    quantity: "",
    unit: "",
  });

  // Fetch resources from the backend
  // Fetch resources from the backend
  const fetchResources = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await organizationService.getResources();
      // service returns { success, data }
      setResources(res.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch resources"
      );
      console.error("Error fetching resources:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleOpenAdd = () => {
    setEditing(null);
    setFormData({ name: "", quantity: "", unit: "" });
    setDialogOpen(true);
  };

  const handleOpenEdit = (res: Resource) => {
    setEditing(res);
    setFormData({
      name: res.name,
      quantity: res.quantity.toString(),
      unit: res.unit,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const resourceData = {
        name: formData.name,
        quantity: parseInt(formData.quantity, 10),
        unit: formData.unit,
      };

      if (
        !resourceData.name ||
        !resourceData.unit ||
        isNaN(resourceData.quantity)
      ) {
        toast.error("Invalid resource data", {
          description: "Please provide name, quantity, and unit.",
        });
        return;
      }

      if (editing && editing.id) {
        // Update existing resource: PUT /organization/resources/:id
        await organizationService.updateResource(editing.id, resourceData);
        toast.success("Resource updated", {
          description: resourceData.name,
        });
      } else {
        // Create new resource: POST /organization/resources
        await organizationService.createResource(resourceData);
        toast.success("Resource added", {
          description: resourceData.name,
        });
      }

      setDialogOpen(false);
      await fetchResources(); // Refresh the list
    } catch (err) {
      console.error("Error saving resource:", err);
      toast.error("Failed to save resource", {
        description:
          err instanceof Error ? err.message : "Something went wrong.",
      });
    }
  };

  const handleDelete = async (resourceId: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) {
      return;
    }

    try {
      await organizationService.deleteResource(resourceId);
      await fetchResources(); // Refresh the list

      toast.success("Resource deleted", {
        description: "The resource has been removed.",
      });
    } catch (err) {
      console.error("Error deleting resource:", err);
      toast.error("Failed to delete resource", {
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
          <div className="h-6 w-32 bg-neutral-800/80 rounded animate-pulse" />
          <div className="h-9 w-32 bg-blue-900/70 rounded-md animate-pulse" />
        </div>

        {/* Summary cards skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Card key={idx} className="border-0" style={cardGradientStyle}>
              <CardHeader className="pb-2">
                <div className="h-4 w-32 bg-neutral-800/80 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-6 w-24 bg-neutral-800/80 rounded animate-pulse mb-2" />
                <div className="h-3 w-32 bg-neutral-900/80 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table skeleton */}
        <Card className="border-0" style={cardGradientStyle}>
          <CardHeader>
            <div className="h-4 w-40 bg-neutral-800/80 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between border-b border-neutral-800/80 pb-2"
                >
                  <div className="flex-1 space-y-1">
                    <div className="h-3 w-40 bg-neutral-800/80 rounded animate-pulse" />
                    <div className="h-3 w-24 bg-neutral-900/80 rounded animate-pulse" />
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

        {/* Chart skeleton */}
        <Card className="border-0" style={cardGradientStyle}>
          <CardHeader>
            <div className="h-4 w-48 bg-neutral-800/80 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full bg-neutral-900/80 rounded-xl animate-pulse" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center text-red-500 mb-4">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>Error: {error}</span>
        </div>
        <Button onClick={fetchResources}>Retry</Button>
      </div>
    );
  }

  // Data for the chart with colors
  const chartData = resources.map((resource, index) => ({
    name: resource.name,
    quantity: resource.quantity,
    unit: resource.unit,
    fill: resourceColors[index % resourceColors.length],
  }));

  // Calculate total resources
  const totalResources = resources.reduce(
    (sum, resource) => sum + resource.quantity,
    0
  );

  return (
    <div className="space-y-6">
      {/* --- Header --- */}
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Resources</h1>
        <Button
          size="sm"
          onClick={handleOpenAdd}
          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500"
        >
          <Plus size={14} /> Add Resource
        </Button>
      </div>

      {/* --- Top Summary Cards --- */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {resources.map((r) => (
          <Card key={r.id} className="border-0" style={cardGradientStyle}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b-0">
              <CardTitle className="text-sm font-medium text-white">
                {r.name}
              </CardTitle>
              <Pencil
                size={16}
                className="text-neutral-400 hover:text-white cursor-pointer"
                onClick={() => handleOpenEdit(r)}
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {r.quantity} {r.unit}
              </div>
              <p className="text-xs text-neutral-400">
                Updated {formatDate(r.updatedAt)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* --- Middle Table --- */}
      <Card className="border-0" style={cardGradientStyle}>
        <CardHeader>
          <CardTitle className="text-white text-sm font-medium">
            Resources Inventory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm text-left text-neutral-300">
            <thead className="text-xs uppercase text-neutral-400 border-b border-neutral-700">
              <tr>
                <th className="py-2 px-3">Name</th>
                <th className="py-2 px-3">Quantity</th>
                <th className="py-2 px-3">Unit</th>
                <th className="py-2 px-3">Last Updated</th>
                <th className="py-2 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-neutral-800 hover:bg-neutral-900/40"
                >
                  <td className="py-2 px-3">{r.name}</td>
                  <td className="py-2 px-3">{r.quantity}</td>
                  <td className="py-2 px-3">{r.unit}</td>
                  <td className="py-2 px-3">{formatDate(r.updatedAt)}</td>
                  <td className="py-2 px-3 text-right space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenEdit(r)}
                      className="h-7 text-xs"
                    >
                      <Pencil size={14} />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs text-red-400 border-red-800 hover:bg-red-900/50"
                      onClick={() => handleDelete(r.id!)}
                    >
                      <Trash2 size={12} className="mr-1" /> Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* --- Bottom Bar Chart --- */}
      <Card className="border-0" style={cardGradientStyle}>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-white">
            Stock Levels Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <XAxis
                dataKey="name"
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
                      <p>{payload[0].payload.name}</p>
                      <p>{`${payload[0].value} ${payload[0].payload.unit}`}</p>
                    </div>
                  ) : null
                }
              />
              <Bar dataKey="quantity" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* --- Dialog for Add/Edit --- */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#0b0f26] border border-neutral-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editing ? "Edit Resource" : "Add New Resource"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="name">Resource Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g. Bottled Water"
                className="bg-neutral-900 border-neutral-700 text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                placeholder="e.g. 200"
                className="bg-neutral-900 border-neutral-700 text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
                placeholder="e.g. boxes, bottles, kits"
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
