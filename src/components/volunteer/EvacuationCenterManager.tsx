import { useState, useEffect } from 'react';
import EvacuationCenterPopup from './EvacuationCenterPopup'; 
import { apiService } from '../../lib/api'; 
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Edit, Trash2, MapPin, Users, Phone, RefreshCw } from "lucide-react";

// Define TypeScript interfaces
interface CenterCoordinates {
  lat: number;
  lng: number;
}

interface EvacuationCenter {
  id: string;
  name: string;
  location: string;
  capacity?: number;
  currentOccupants?: number;
  contact?: string;
  status?: 'active' | 'inactive' | 'full';
  supplies?: string[];
  coordinates?: CenterCoordinates;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

const EvacuationCentersManager = () => {
  const [centers, setCenters] = useState<EvacuationCenter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  // Popup states
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  const [editingCenter, setEditingCenter] = useState<EvacuationCenter | null>(null);
  const [popupMode, setPopupMode] = useState<'add' | 'edit'>('add');

  // Fetch centers on component mount
  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = async (): Promise<void> => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching evacuation centers...');
      const response: ApiResponse<EvacuationCenter[]> = await apiService.getCenters();
      
      console.log('API Response:', response);
      
      if (response.success && response.data) {
        setCenters(response.data);
      } else {
        setError(response.message || 'Failed to load centers');
      }
    } catch (err: any) {
      setError(`Error: ${err.message || 'Network error'}`);
      console.error('Error fetching centers:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle popup submission (both add and edit)
  const handlePopupSubmit = async (formData: any): Promise<void> => {
    try {
      if (popupMode === 'add') {
        // Create new center
        const response: ApiResponse = await apiService.createCenter(formData);
        
        if (response.success) {
          await fetchCenters(); // Refresh the list
          alert('Evacuation center created successfully!');
        } else {
          alert(`Error: ${response.message}`);
        }
      } else if (editingCenter) {
        // Update existing center
        const response: ApiResponse = await apiService.updateCenter(editingCenter.id, formData);
        
        if (response.success) {
          await fetchCenters(); // Refresh the list
          alert('Evacuation center updated successfully!');
        } else {
          alert(`Error: ${response.message}`);
        }
      }
      
      setIsPopupOpen(false);
      setEditingCenter(null);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  // Handle edit button click
  const handleEdit = (center: EvacuationCenter): void => {
    setEditingCenter(center);
    setPopupMode('edit');
    setIsPopupOpen(true);
  };

  // Handle delete button click
  const handleDelete = async (id: string): Promise<void> => {
    if (!window.confirm('Are you sure you want to delete this evacuation center?')) {
      return;
    }

    try {
      const response: ApiResponse = await apiService.deleteCenter(id);
      
      if (response.success) {
        await fetchCenters(); // Refresh the list
        alert('Center deleted successfully!');
      } else {
        alert(`Error: ${response.message}`);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  // Open add new center popup
  const openAddPopup = (): void => {
    setEditingCenter(null);
    setPopupMode('add');
    setIsPopupOpen(true);
  };

  // Format date if available
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-neutral-400">Loading evacuation centers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Evacuation Centers</h1>
          <p className="text-neutral-400 mt-2">
            Manage evacuation centers for disaster response
          </p>
        </div>
        <Button
          onClick={openAddPopup}
          className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap"
        >
          + Add New Center
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg">
          <p className="text-red-400">{error}</p>
          <Button
            onClick={fetchCenters}
            className="mt-2 bg-red-600 hover:bg-red-700 text-white text-sm"
          >
            Retry Loading
          </Button>
        </div>
      )}

      {/* Centers Grid */}
      {centers.length === 0 ? (
        <div className="text-center py-12 bg-neutral-900/50 rounded-lg border border-neutral-700">
          <MapPin size={48} className="mx-auto text-neutral-600 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Evacuation Centers</h3>
          <p className="text-neutral-400 mb-6">
            Get started by adding your first evacuation center
          </p>
          <Button
            onClick={openAddPopup}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Add First Center
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-neutral-400">
              Showing <span className="text-white font-semibold">{centers.length}</span> evacuation centers
            </p>
            <Button
              onClick={fetchCenters}
              variant="ghost"
              size="sm"
              className="text-neutral-400 hover:text-white"
            >
              <RefreshCw size={16} className="mr-2" />
              Refresh
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {centers.map((center) => (
              <Card key={center.id} className="bg-neutral-900/50 border border-neutral-700 hover:border-neutral-600 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold text-white line-clamp-1">
                      {center.name}
                    </CardTitle>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${
                      center.status === 'active' 
                        ? 'bg-green-900/30 text-green-400' 
                        : center.status === 'full'
                        ? 'bg-red-900/30 text-red-400'
                        : 'bg-yellow-900/30 text-yellow-400'
                    }`}>
                      {center.status || 'active'}
                    </span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {/* Location */}
                  <div className="flex items-start">
                    <MapPin size={16} className="text-neutral-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-neutral-300 text-sm line-clamp-2">{center.location}</span>
                  </div>
                  
                  {/* Capacity */}
                  <div className="flex items-center">
                    <Users size={16} className="text-neutral-500 mr-2 flex-shrink-0" />
                    <span className="text-neutral-300 text-sm">
                      Capacity: <span className="text-white">{center.capacity || 'N/A'}</span>
                      {center.currentOccupants !== undefined && (
                        <span className="text-neutral-400 ml-1">
                          ({center.currentOccupants} occupied)
                        </span>
                      )}
                    </span>
                  </div>
                  
                  {/* Contact */}
                  {center.contact && (
                    <div className="flex items-center">
                      <Phone size={16} className="text-neutral-500 mr-2 flex-shrink-0" />
                      <span className="text-neutral-300 text-sm">{center.contact}</span>
                    </div>
                  )}
                  
                  {/* Supplies (if available) */}
                  {center.supplies && center.supplies.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-neutral-400 mb-1">Available Supplies:</p>
                      <div className="flex flex-wrap gap-1">
                        {center.supplies.slice(0, 3).map((supply, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-blue-900/30 text-blue-300 text-xs rounded"
                          >
                            {supply.trim()}
                          </span>
                        ))}
                        {center.supplies.length > 3 && (
                          <span className="px-2 py-1 bg-neutral-800 text-neutral-400 text-xs rounded">
                            +{center.supplies.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Coordinates */}
                  {center.coordinates && (
                    <p className="text-xs text-neutral-500">
                      📍 {center.coordinates.lat?.toFixed(4)}, {center.coordinates.lng?.toFixed(4)}
                    </p>
                  )}
                  
                  {/* Timestamps */}
                  <div className="text-xs text-neutral-500 pt-2 border-t border-neutral-700">
                    {center.updatedAt && (
                      <p>Updated: {formatDate(center.updatedAt)}</p>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-2 pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(center)}
                      className="border-neutral-600 text-neutral-300 hover:bg-neutral-700 hover:text-white"
                    >
                      <Edit size={14} className="mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(center.id)}
                      className="border-red-800 text-red-400 hover:bg-red-900/30 hover:text-red-300"
                    >
                      <Trash2 size={14} className="mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Popup Component */}
      <EvacuationCenterPopup
        isOpen={isPopupOpen}
        onClose={() => {
          setIsPopupOpen(false);
          setEditingCenter(null);
        }}
        onSubmit={handlePopupSubmit}
        editingCenter={editingCenter}
        mode={popupMode}
      />
    </div>
  );
};

export default EvacuationCentersManager;