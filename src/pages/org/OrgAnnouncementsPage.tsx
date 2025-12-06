import { useState, useEffect } from "react";
import { organizationService } from "../../services/organizationService";
import { useOrganization } from "../../contexts/OrganizationContext";
import { Announcement } from "../../services/organizationService";
import { Button } from "../../components/ui/button";
import { Plus, Loader2 } from "lucide-react";

export default function OrgAnnouncementsPage() {
  const { currentOrgId } = useOrganization();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnnouncements = async () => {
    if (!currentOrgId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await organizationService.getAnnouncements(currentOrgId);
      setAnnouncements(data);
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
  }, [currentOrgId]);

  const handleCreateAnnouncement = async (title: string, body: string) => {
    if (!currentOrgId) return;

    try {
      await organizationService.createAnnouncement(currentOrgId, {
        title,
        body,
        status: "Draft",
      });
      await fetchAnnouncements(); // Refresh the list
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create announcement"
      );
    }
  };

  if (loading) {
    return <div className="p-6">Loading announcements...</div>;
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Announcements</h1>
        <Button
          onClick={() =>
            handleCreateAnnouncement("New Announcement", "Announcement content")
          }
        >
          <Plus className="w-4 h-4 mr-2" />
          New Announcement
        </Button>
      </div>

      <div className="space-y-4">
        {announcements.map((announcement) => (
          <div key={announcement.id} className="border rounded-lg p-4">
            <h3 className="font-medium">{announcement.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{announcement.body}</p>
            <div className="flex items-center mt-2 text-xs text-gray-500">
              <span>{new Date(announcement.date).toLocaleDateString()}</span>
              <span className="mx-2">•</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs ${
                  announcement.status === "Published"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {announcement.status}
              </span>
            </div>
          </div>
        ))}
        {announcements.length === 0 && (
          <p className="text-gray-500">No announcements yet.</p>
        )}
      </div>
    </div>
  );
}
