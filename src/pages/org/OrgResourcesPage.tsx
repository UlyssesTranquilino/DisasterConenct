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
  DialogTrigger,
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

const cardGradientStyle = {
  background:
    "linear-gradient(to bottom, rgba(6,11,40,0.7) 0%, rgba(10,14,35,0.7) 100%)",
  backdropFilter: "blur(10px)",
};

type Resource = {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  updatedAt: string;
};

export const OrgResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([
    {
      id: 1,
      name: "Food Packs",
      quantity: 250,
      unit: "boxes",
      updatedAt: "2025-10-09",
    },
    {
      id: 2,
      name: "Bottled Water",
      quantity: 480,
      unit: "bottles",
      updatedAt: "2025-10-08",
    },
    {
      id: 3,
      name: "Medical Kits",
      quantity: 120,
      unit: "kits",
      updatedAt: "2025-10-07",
    },
    {
      id: 4,
      name: "Blankets",
      quantity: 350,
      unit: "pcs",
      updatedAt: "2025-10-06",
    },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Resource | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    quantity: "",
    unit: "",
  });

  const handleOpenAdd = () => {
    setEditing(null);
    setFormData({ name: "", quantity: "", unit: "" });
    setDialogOpen(true);
  };

  const handleOpenEdit = (res: Resource) => {
    setEditing(res);
    setFormData({
      name: res.name,
      quantity: String(res.quantity),
      unit: res.unit,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (editing) {
      setResources((prev) =>
        prev.map((r) =>
          r.id === editing.id
            ? {
                ...r,
                name: formData.name,
                quantity: Number(formData.quantity),
                unit: formData.unit,
                updatedAt: new Date().toISOString().split("T")[0],
              }
            : r
        )
      );
    } else {
      setResources((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          name: formData.name,
          quantity: Number(formData.quantity),
          unit: formData.unit,
          updatedAt: new Date().toISOString().split("T")[0],
        },
      ]);
    }
    setDialogOpen(false);
  };

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
              <p className="text-xs text-neutral-400">Updated {r.updatedAt}</p>
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
                  <td className="py-2 px-3">{r.updatedAt}</td>
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
            <BarChart data={resources}>
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
