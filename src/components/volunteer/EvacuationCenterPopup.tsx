import { X } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface EvacuationCenterPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editingCenter?: any | null;
  mode: 'add' | 'edit';
}

const cardGradientStyle = {
  background: "linear-gradient(to bottom, rgba(6,11,40,0.9) 0%, rgba(10,14,35,0.95) 100%)",
  backdropFilter: "blur(20px)",
};

export default function EvacuationCenterPopup({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingCenter, 
  mode 
}: EvacuationCenterPopupProps) {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      name: formData.get('name'),
      location: formData.get('location'),
      capacity: parseInt(formData.get('capacity') as string),
      contact: formData.get('contact'),
      supplies: (formData.get('supplies') as string).split(',').map(s => s.trim()),
      coordinates: {
        lat: parseFloat(formData.get('lat') as string),
        lng: parseFloat(formData.get('lng') as string)
      }
    };
    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <Card 
        className="w-full max-w-2xl mx-4 border border-neutral-700 relative"
        style={cardGradientStyle}
      >
        {/* Header */}
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-neutral-700">
          <CardTitle className="text-lg font-semibold text-white">
            {mode === 'add' ? 'Add New Evacuation Center' : 'Edit Evacuation Center'}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-neutral-700"
          >
            <X size={16} className="text-neutral-400" />
          </Button>
        </CardHeader>

        {/* Form Content */}
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Center Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300">
                  Center Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={editingCenter?.name || ''}
                  className="w-full bg-neutral-800/50 border border-neutral-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter center name"
                />
              </div>

              {/* Capacity */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300">
                  Capacity *
                </label>
                <input
                  type="number"
                  name="capacity"
                  required
                  min="1"
                  defaultValue={editingCenter?.capacity || ''}
                  className="w-full bg-neutral-800/50 border border-neutral-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Maximum capacity"
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  required
                  defaultValue={editingCenter?.location || ''}
                  className="w-full bg-neutral-800/50 border border-neutral-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter address"
                />
              </div>

              {/* Contact */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300">
                  Contact *
                </label>
                <input
                  type="text"
                  name="contact"
                  required
                  defaultValue={editingCenter?.contact || ''}
                  className="w-full bg-neutral-800/50 border border-neutral-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Contact number"
                />
              </div>

              {/* Coordinates */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300">
                  Latitude *
                </label>
                <input
                  type="number"
                  step="any"
                  name="lat"
                  required
                  defaultValue={editingCenter?.coordinates?.lat || ''}
                  className="w-full bg-neutral-800/50 border border-neutral-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="14.5995"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300">
                  Longitude *
                </label>
                <input
                  type="number"
                  step="any"
                  name="lng"
                  required
                  defaultValue={editingCenter?.coordinates?.lng || ''}
                  className="w-full bg-neutral-800/50 border border-neutral-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="120.9842"
                />
              </div>
            </div>

            {/* Supplies */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">
                Available Supplies
              </label>
              <input
                type="text"
                name="supplies"
                defaultValue={editingCenter?.supplies?.join(', ') || ''}
                className="w-full bg-neutral-800/50 border border-neutral-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Food, Water, Medicine, Blankets (comma separated)"
              />
              <p className="text-xs text-neutral-500">
                Separate supplies with commas
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-neutral-700">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-neutral-600 text-neutral-300 hover:bg-neutral-700 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white"
              >
                {mode === 'add' ? 'Add Center' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}