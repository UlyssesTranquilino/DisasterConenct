import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
// Fixed import path for Textarea (removed double "components")
import { Textarea } from "../../components/components/ui/textarea"; 
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import { citizenService } from "../../services/citizenService";
import { toast } from "sonner";

export default function RequestHelpPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    type: "medical",
    location: "",
    details: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.location) {
      toast.error("Location is required", { description: "Please tell us where you are." });
      return;
    }

    setIsSubmitting(true);

    try {
      // API call to submit the request
      await citizenService.requestHelp({
        type: formData.type,
        location: formData.location,
        description: formData.details, 
        disasterId: null, // Explicitly send null since it is optional
        
        // ⭐ CRITICAL FIX: Set status directly to 'Open' (as requested)
        status: 'Open', 
        
        // Add initial volunteer tracking fields
        volunteersAssigned: 0,
        volunteersNeeded: 1, // Assume one helper needed by default
      });

      toast.success("Help Request Sent!", { 
        description: "Responders have been notified of your location." 
      });
      
      // Redirect to dashboard to see status
      navigate("/citizen/dashboard");
      
    } catch (error) {
      console.error(error);
      toast.error("Request Failed", { 
        description: "Could not send help request. Please try again." 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-6">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)} 
        className="mb-6 pl-0 hover:pl-2 transition-all"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold text-red-500 flex items-center gap-2">
          <AlertTriangle className="h-8 w-8" />
          Request Immediate Help
        </h1>
        <p className="text-neutral-400">
          Fill out this form only in case of emergency. Misuse may delay help for others.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="type">What kind of help do you need?</Label>
          <div className="relative">
            <select
              id="type"
              value={formData.type}
              onChange={handleChange}
              className="flex h-12 w-full items-center justify-between rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="medical">Medical Emergency / Injury</option>
              <option value="trapped">Trapped / Rescue Needed</option>
              <option value="food">Food / Water Shortage</option>
              <option value="evacuation">Evacuation Assistance</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Exact Location</Label>
          <Input 
            id="location" 
            placeholder="e.g. 2nd Floor, 123 Rizal St, Brgy. San Juan" 
            value={formData.location} 
            onChange={handleChange}
            className="bg-neutral-900 border-neutral-700 h-12"
            required
          />
          <p className="text-xs text-neutral-500">Include landmarks if possible.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="details">Additional Details (Optional)</Label>
          <Textarea 
            id="details" 
            placeholder="Describe the situation, number of people, specific needs..." 
            value={formData.details} 
            onChange={handleChange}
            className="bg-neutral-900 border-neutral-700 min-h-[100px]"
          />
        </div>

        <Button 
          type="submit" 
          className="w-full h-14 text-lg font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/20"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Broadcasting Request...
            </>
          ) : (
            "SUBMIT REQUEST"
          )}
        </Button>
      </form>
    </div>
  );
}