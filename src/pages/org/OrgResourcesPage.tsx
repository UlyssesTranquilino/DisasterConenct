import React, { useState, useEffect } from "react";
import { useOrganization } from "../../contexts/OrganizationContext";
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
import { Plus, Pencil, Loader2, AlertCircle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
// Helper function to format date
const formatDate = (date?: Date) => {
  return date ? new Date(date).toLocaleDateString() : "N/A";
};

const cardGradientStyle = {
  background:
    "linear-gradient(to bottom, rgba(6,11,40,0.7) 0%, rgba(10,14,35,0.7) 100%)",
  backdropFilter: "blur(10px)",
};

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
  const fetchResources = async () => {
    if (!currentOrgId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await organizationService.getResources(currentOrgId);
      setResources(data);
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
  }, [currentOrgId]);

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
    if (!currentOrgId) return;

    try {
      const resourceData = {
        name: formData.name,
        quantity: parseInt(formData.quantity, 10),
        unit: formData.unit,
      };

      if (editing && editing.id) {
        // Update existing resource
        await organizationService.updateResource(
          currentOrgId,
          editing.id,
          resourceData
        );
      } else {
        // Create new resource
        await organizationService.createResource(currentOrgId, resourceData);
      }

      setDialogOpen(false);
      await fetchResources(); // Refresh the list
    } catch (err) {
      console.error("Error saving resource:", err);
      // You might want to show an error toast here
    }
  };

  const handleDelete = async (resourceId: string) => {
    if (
      !currentOrgId ||
      !confirm("Are you sure you want to delete this resource?")
    ) {
      return;
    }

    try {
      await organizationService.deleteResource(currentOrgId, resourceId);
      await fetchResources(); // Refresh the list
    } catch (err) {
      console.error("Error deleting resource:", err);
      // You might want to show an error toast here
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading resources...</span>
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

  // Data for the chart
  const chartData = resources.map((resource) => ({
    name: resource.name,
    quantity: resource.quantity,
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
                Updated {formatDate(r.updatedAt as unknown as Date)}
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
                  <td className="py-2 px-3">
                    {formatDate(r.updatedAt as unknown as Date)}
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
