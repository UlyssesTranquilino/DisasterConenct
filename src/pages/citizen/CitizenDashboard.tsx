// src/pages/citizen/CitizenDashboard.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { AlertTriangle, ShieldCheck, Clock, MapPin, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../lib/auth";
import { citizenService, type HelpRequest } from "../../services/citizenService";
import { toast } from "sonner"; // Assuming you use sonner for toast notifications

// --- FIX: Helper to format Firestore dates safely ---
const formatDate = (dateVal: any) => {
  if (!dateVal) return "Just now";

  // Case 1: Firestore Timestamp (has seconds)
  const seconds = dateVal.seconds || dateVal._seconds;
  if (seconds) {
    return new Date(seconds * 1000).toLocaleString();
  }

  // Case 2: String or Date object
  const date = new Date(dateVal);
  return isNaN(date.getTime()) ? "Just now" : date.toLocaleString();
};
// ----------------------------------------------------

export default function CitizenDashboard() {
  const { currentUser } = useAuth();
  const [activeRequest, setActiveRequest] = useState<HelpRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false); 

  // Fetch active requests on mount
  useEffect(() => {
    const fetchStatus = async () => {
      setLoading(true);
      try {
        const requests = await citizenService.getMyActiveRequests();
        
        // ✅ FIX 1: Filter out requests marked as 'Closed' or 'Filled' from the client side.
        // NOTE: The status from the backend must match these strings (e.g., 'Closed' != 'closed').
        // We ensure we only display requests that are truly active.
        const activeRequests = requests.filter(r => 
            r.status !== 'Closed' && r.status !== 'Filled' && r.status !== 'resolved'
        );

        // Just grab the most recent one for the main dashboard status
        if (activeRequests && activeRequests.length > 0) {
          setActiveRequest(activeRequests[0]);
        } else {
            setActiveRequest(null); 
        }
      } catch (err) {
        console.error("Failed to fetch requests", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);


  // ⭐ NEW LOGIC: Function to resolve the request from the civilian side
  const markRequestAsResolved = async () => {
    if (!activeRequest) return;
    setResolving(true);

    try {
        // Calls the new service function
        await citizenService.resolveRequest(activeRequest.id);

        setActiveRequest(null);
        toast.success("Request Resolved!", {
            description: "Your help request has been closed, and your safety status is updated.",
        });

    } catch (error) {
        console.error("Failed to resolve request:", error);
        toast.error("Resolution Failed", {
            description: "Could not close the request. Please try again.",
        });
    } finally {
        setResolving(false);
    }
  };


  // Status badge helper
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
      case "pending":
        return <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs font-bold border border-yellow-500/30">WAITING FOR RESPONDER</span>;
      case "acknowledged":
        return <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-bold border border-blue-500/30">RESPONDER ACKNOWLEDGED</span>;
      case "in_progress":
        return <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-500/30">HELP IS ON THE WAY</span>;
      case "closed":
      case "resolved":
          return <span className="bg-neutral-700 text-neutral-300 px-3 py-1 rounded-full text-xs font-bold">RESOLVED</span>;
      default:
        return <span className="bg-neutral-700 text-neutral-300 px-3 py-1 rounded-full text-xs font-bold">UNKNOWN</span>;
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Civilian Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Welcome back, {currentUser?.displayName || "Citizen"}. Stay connected and safe.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Status Card */}
        <Card className={`border-0 shadow-lg relative overflow-hidden ${activeRequest ? 'bg-gradient-to-br from-neutral-800 to-neutral-900' : 'bg-green-900/10 border-green-800/20'}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {activeRequest ? (
                <>
                  <Clock className="text-yellow-500" /> Current Status
                </>
              ) : (
                <>
                  <ShieldCheck className="text-green-500" /> Current Status
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2 text-neutral-400">
                <Loader2 className="animate-spin h-4 w-4" /> Updating status...
              </div>
            ) : activeRequest ? (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm text-neutral-400 mb-1">Latest Request:</div>
                    <div className="font-semibold text-lg capitalize text-white">{activeRequest.type} Assistance</div>
                  </div>
                  {getStatusBadge(activeRequest.status)}
                </div>
                
                <div className="bg-white/5 rounded-lg p-3 text-sm space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="text-neutral-400 mt-0.5" />
                    <span className="text-neutral-200">{activeRequest.location}</span>
                  </div>
                  <div className="text-neutral-400 text-xs pt-2 border-t border-white/10">
                    Requested on: {formatDate(activeRequest.createdAt)}
                  </div>
                  {/* Option for the civilian to manually close the loop if help arrived/issue resolved */}
                  {/* The button is visible if there is an active request */}
                      <Button
                          onClick={markRequestAsResolved}
                          disabled={resolving}
                          className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white"
                      >
                          {resolving ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                              <>
                                  <CheckCircle2 size={16} className="mr-2" />
                                  Mark Issue as Resolved / Safe
                              </>
                          )}
                      </Button>
                </div>
              </div>
            ) : (
              <div className="py-4">
                <div className="text-lg font-medium text-green-400 mb-2">You are currently safe</div>
                <div className="text-sm text-neutral-400">
                  No active distress signals found. Keep monitoring official announcements for updates.
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Card */}
        <Card className="border-0 bg-gradient-to-br from-blue-900/20 to-neutral-900 shadow-lg">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link to="/citizen/request-help">
              <Button 
                  className={`w-full h-14 text-lg font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/20 ${activeRequest ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!!activeRequest}
              >
                <AlertTriangle size={20} className="mr-2" />
                Request Emergency Help
              </Button>
            </Link>
            
            <div className="grid grid-cols-2 gap-3">
              <Link to="/citizen/centers">
                <Button variant="outline" className="w-full bg-transparent border-neutral-700 hover:bg-white/5">
                  <MapPin size={16} className="mr-2" />
                  Evacuation Centers
                </Button>
              </Link>
              {/* 🎯 MARK AS SAFE BUTTON (Functional) */}
              <Button 
                  variant="outline" 
                  className={`w-full bg-transparent border-neutral-700 hover:bg-green-600/50 ${!activeRequest ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={markRequestAsResolved}
                  disabled={!activeRequest || resolving}
              >
                  {resolving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                      <>
                          <ShieldCheck size={16} className="mr-2" />
                          Mark as Safe
                      </>
                  )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}