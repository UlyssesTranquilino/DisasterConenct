import { useState, useEffect } from "react";
import { organizationService } from "../../services/organizationService";
import { useOrganization } from "../../contexts/OrganizationContext";
import { Report, ReportStatus } from "../../services/organizationService";
import { Button } from "../../components/ui/button";
import { Plus, FileText, Loader2, Search } from "lucide-react";

const statusColors = {
  Completed: "bg-green-100 text-green-800",
  Ongoing: "bg-blue-100 text-blue-800",
  Pending: "bg-yellow-100 text-yellow-800",
};

export default function OrgReportsPage() {
  const { currentOrgId } = useOrganization();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "All">("All");

  const fetchReports = async () => {
    if (!currentOrgId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await organizationService.getReports(currentOrgId);
      setReports(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch reports");
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [currentOrgId]);

  const handleCreateReport = async (title: string, content: string) => {
    if (!currentOrgId) return;

    try {
      await organizationService.createReport(currentOrgId, {
        title,
        content,
        author: "Current User", // Replace with actual user name
        status: "Pending",
      });
      await fetchReports();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create report");
      console.error("Error creating report:", err);
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || report.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-gray-500">View and manage incident reports</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports..."
              className="pl-10 pr-4 py-2 border rounded-md w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as ReportStatus | "All")
            }
            className="border rounded-md px-3 py-2"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
          </select>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Report
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {filteredReports.length > 0 ? (
          filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              <div className="p-4 border-b flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">{report.title}</h3>
                  <div className="flex items-center mt-1 text-sm text-gray-500">
                    <span>By {report.author}</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(report.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    statusColors[report.status as keyof typeof statusColors] ||
                    "bg-gray-100 text-gray-800"
                  }`}
                >
                  {report.status}
                </div>
              </div>
              <div className="p-4">
                <p className="text-gray-700 whitespace-pre-line">
                  {report.content}
                </p>
                <div className="mt-4 flex justify-end space-x-2">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button
                    variant={
                      report.status === "Completed" ? "outline" : "default"
                    }
                    size="sm"
                    onClick={() => {
                      // Implement status update
                      const newStatus =
                        report.status === "Completed" ? "Ongoing" : "Completed";
                      // You would call an update function here
                    }}
                  >
                    {report.status === "Completed" ? "Reopen" : "Mark Complete"}
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FileText className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500">No reports found</p>
            {(searchTerm || statusFilter !== "All") && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("All");
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
