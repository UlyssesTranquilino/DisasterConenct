// VolunteerOrganizations.tsx
import React, { useState, useEffect } from 'react';
import { apiService, Organization, Assignment } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { 
  Building2, Calendar, MapPin, Phone, Mail, 
  Users, CheckCircle, Clock, AlertCircle,
  ExternalLink, Briefcase, Star, RefreshCw,
  Shield, TrendingUp, Target
} from "lucide-react";

const VolunteerOrganizations = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'orgs' | 'tasks'>('orgs');
  const [stats, setStats] = useState({
    totalOrganizations: 0,
    totalAssignments: 0,
    completedTasks: 0,
    activeTasks: 0
  });

  useEffect(() => {
    fetchVolunteerData();
  }, []);

  const fetchVolunteerData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch volunteer's linked organizations
      const orgsResponse = await apiService.getVolunteerOrganizations();
      
      // Fetch assignments from organizations
      const assignmentsResponse = await apiService.getAssignments();
      
      if (orgsResponse.success) {
        setOrganizations(orgsResponse.data || []);
      } else {
        setError(orgsResponse.message || 'Failed to load organizations');
      }
      
      if (assignmentsResponse.success) {
        setAssignments(assignmentsResponse.data || []);
        
        // Calculate stats
        const completedTasks = assignmentsResponse.data?.filter(a => a.status === 'Completed').length || 0;
        const activeTasks = assignmentsResponse.data?.filter(a => 
          a.status === 'Pending' || a.status === 'In Progress'
        ).length || 0;
        
        setStats({
          totalOrganizations: orgsResponse.data?.length || 0,
          totalAssignments: assignmentsResponse.data?.length || 0,
          completedTasks,
          activeTasks
        });
      }
      
    } catch (err: any) {
      setError(`Error: ${apiService.getErrorMessage(err)}`);
      console.error('Error fetching volunteer data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelfAssign = async (orgId: string, needId: string) => {
    try {
      const response = await apiService.selfAssign({ orgId, needId });
      
      if (response.success) {
        alert('Successfully volunteered for this task!');
        fetchVolunteerData(); // Refresh data
      } else {
        alert(`Error: ${response.message}`);
      }
    } catch (err: any) {
      alert(`Error: ${apiService.getErrorMessage(err)}`);
    }
  };

  const handleSetAvailability = async () => {
    try {
      // Example availability data
      const availabilityData = {
        date: new Date().toISOString().split('T')[0],
        status: "Available" as const,
        startTime: "08:00",
        endTime: "17:00",
        notes: "Available for emergency response"
      };
      
      const response = await apiService.setAvailability(availabilityData);
      
      if (response.success) {
        alert('Availability set successfully! Organizations can now see when you\'re available.');
      } else {
        alert(`Error: ${response.message}`);
      }
    } catch (err: any) {
      alert(`Error: ${apiService.getErrorMessage(err)}`);
    }
  };

  const handleViewOrganizationDetails = async (orgId: string) => {
    try {
        const response = await apiService.getOrganizationDetails(orgId);
        
        if (response.success && response.data) {
        const org = response.data;
        // Check if org is defined before accessing properties
        const orgName = org?.name || 'Unknown Organization';
        const orgType = org?.type || 'N/A';
        const contactEmail = org?.contactEmail || org?.email || 'No email';
        const orgStatus = org?.status || 'Unknown';
        
        // You could open a modal or navigate to a details page
        alert(`Organization Details:\n\nName: ${orgName}\nType: ${orgType}\nContact: ${contactEmail}\nStatus: ${orgStatus}`);
        } else {
        alert(`Error: ${response.message || 'Failed to load organization details'}`);
        }
    } catch (err: any) {
        alert(`Error: ${apiService.getErrorMessage(err)}`);
    }
    };

  const handleUpdateAssignmentStatus = async (assignmentId: string, newStatus: Assignment['status']) => {
    try {
      // Note: You'll need to add an updateAssignment method to your apiService
      // For now, we'll just update the UI state
      setAssignments(prev => 
        prev.map(a => 
          a.id === assignmentId ? { ...a, status: newStatus } : a
        )
      );
      
      alert(`Task status updated to: ${newStatus}`);
    } catch (err: any) {
      alert(`Error: ${apiService.getErrorMessage(err)}`);
    }
  };

  const formatDate = (dateString: string) => {
    return apiService.formatApiDate(dateString);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-neutral-400">Loading your organizations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header with Stats */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">My Organizations</h1>
            <p className="text-neutral-400 mt-2">
              View and manage your connections with disaster response organizations
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleSetAvailability}
              className="bg-green-600 hover:bg-green-700 text-white whitespace-nowrap"
            >
              <Calendar size={16} className="mr-2" />
              Set Availability
            </Button>
            <Button
              onClick={fetchVolunteerData}
              variant="outline"
              className="border-neutral-600 text-neutral-300 hover:bg-neutral-700 hover:text-white"
            >
              <RefreshCw size={16} className="mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-blue-900/20 border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center">
                <Building2 className="h-8 w-8 text-blue-400 mr-3" />
                <div>
                  <p className="text-sm text-blue-300">Linked Organizations</p>
                  <p className="text-2xl font-bold text-white">{stats.totalOrganizations}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-900/20 border-purple-800">
            <CardContent className="p-4">
              <div className="flex items-center">
                <Briefcase className="h-8 w-8 text-purple-400 mr-3" />
                <div>
                  <p className="text-sm text-purple-300">Total Assignments</p>
                  <p className="text-2xl font-bold text-white">{stats.totalAssignments}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-900/20 border-green-800">
            <CardContent className="p-4">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-400 mr-3" />
                <div>
                  <p className="text-sm text-green-300">Completed Tasks</p>
                  <p className="text-2xl font-bold text-white">{stats.completedTasks}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-yellow-900/20 border-yellow-800">
            <CardContent className="p-4">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-yellow-400 mr-3" />
                <div>
                  <p className="text-sm text-yellow-300">Active Tasks</p>
                  <p className="text-2xl font-bold text-white">{stats.activeTasks}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg">
          <p className="text-red-400">{error}</p>
          <Button
            onClick={fetchVolunteerData}
            className="mt-2 bg-red-600 hover:bg-red-700 text-white text-sm"
          >
            Retry Loading
          </Button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-neutral-700 mb-6">
        <button
          onClick={() => setActiveTab('orgs')}
          className={`flex items-center px-4 py-2 font-medium text-sm ${activeTab === 'orgs' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-neutral-400 hover:text-neutral-300'}`}
        >
          <Building2 size={16} className="mr-2" />
          Organizations ({organizations.length})
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center px-4 py-2 font-medium text-sm ${activeTab === 'tasks' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-neutral-400 hover:text-neutral-300'}`}
        >
          <Briefcase size={16} className="mr-2" />
          Tasks ({assignments.length})
        </button>
      </div>

      {/* Organizations Tab */}
      {activeTab === 'orgs' && (
        <div className="space-y-6">
          {organizations.length === 0 ? (
            <Card className="bg-neutral-900/50 border-neutral-700">
              <CardContent className="p-8 text-center">
                <Building2 size={48} className="mx-auto text-neutral-600 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Organizations Connected</h3>
                <p className="text-neutral-400 mb-6">
                  You haven't connected with any organizations yet. Here's how to get started:
                </p>
                <div className="max-w-lg mx-auto text-left space-y-4">
                  <div className="flex items-start">
                    <div className="bg-blue-900/30 rounded-full p-2 mr-3">
                      <Shield className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">Browse Available Tasks</h4>
                      <p className="text-sm text-neutral-400">Go to the "Help Wanted" feed to find tasks from organizations</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-green-900/30 rounded-full p-2 mr-3">
                      <Target className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">Self-Assign to Tasks</h4>
                      <p className="text-sm text-neutral-400">When you volunteer for a task, you'll be connected to the organization</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-purple-900/30 rounded-full p-2 mr-3">
                      <TrendingUp className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">Set Your Availability</h4>
                      <p className="text-sm text-neutral-400">Organizations can see when you're available and may reach out directly</p>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => window.location.href = '/volunteer/needs'}
                  className="mt-6 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Browse Available Tasks
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {organizations.map((org) => (
                <Card key={org.id} className="bg-neutral-900/50 border border-neutral-700 hover:border-neutral-600 transition-colors group">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-semibold text-white line-clamp-1">
                        {org.name}
                      </CardTitle>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        org.status === 'Active' 
                          ? 'bg-green-900/30 text-green-400' 
                          : 'bg-gray-900/30 text-gray-400'
                      }`}>
                        {org.status}
                      </span>
                    </div>
                    {org.type && (
                      <p className="text-sm text-neutral-400">{org.type}</p>
                    )}
                    {org.description && (
                      <p className="text-sm text-neutral-300 mt-2 line-clamp-2">{org.description}</p>
                    )}
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    {/* Contact Info */}
                    <div className="space-y-2">
                      {org.contactEmail && (
                        <div className="flex items-center">
                          <Mail size={14} className="text-neutral-500 mr-2 flex-shrink-0" />
                          <span className="text-neutral-300 text-sm truncate">{org.contactEmail}</span>
                        </div>
                      )}
                      
                      {org.contactPhone && (
                        <div className="flex items-center">
                          <Phone size={14} className="text-neutral-500 mr-2 flex-shrink-0" />
                          <span className="text-neutral-300 text-sm">{org.contactPhone}</span>
                        </div>
                      )}
                      
                      {org.address && (
                        <div className="flex items-start">
                          <MapPin size={14} className="text-neutral-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-neutral-300 text-sm line-clamp-2">{org.address}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Stats */}
                    <div className="flex justify-between pt-3 border-t border-neutral-700">
                      <div className="text-center">
                        <div className="text-white font-bold">{org.tasksAssigned || 0}</div>
                        <div className="text-xs text-neutral-400">Tasks</div>
                      </div>
                      <div className="text-center">
                        <div className="text-white font-bold">{org.tasksCompleted || 0}</div>
                        <div className="text-xs text-neutral-400">Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-white font-bold">{org.joinedDate ? new Date(org.joinedDate).getFullYear() : 'N/A'}</div>
                        <div className="text-xs text-neutral-400">Joined</div>
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3 border-blue-600 text-blue-400 hover:bg-blue-900/30 hover:text-blue-300"
                      onClick={() => handleViewOrganizationDetails(org.id)}
                    >
                      <ExternalLink size={14} className="mr-2" />
                      View Organization Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          {assignments.length === 0 ? (
            <Card className="bg-neutral-900/50 border-neutral-700">
              <CardContent className="p-8 text-center">
                <Briefcase size={48} className="mx-auto text-neutral-600 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Tasks Assigned</h3>
                <p className="text-neutral-400 mb-6">
                  You don't have any tasks from organizations yet. Organizations will assign tasks to you
                  after you connect with them through the "Help Wanted" feed.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => window.location.href = '/volunteer/needs'}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Browse Available Tasks
                  </Button>
                  <Button
                    onClick={handleSetAvailability}
                    variant="outline"
                    className="border-green-600 text-green-400 hover:bg-green-900/30"
                  >
                    Set Availability
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {assignments.map((task) => (
                <Card key={task.id} className="bg-neutral-900/50 border border-neutral-700 hover:border-neutral-600 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <Building2 size={14} className="text-neutral-400 mr-2" />
                          <span className="text-sm text-neutral-400">{task.organization}</span>
                        </div>
                        <h4 className="font-semibold text-white text-lg">{task.title}</h4>
                        <p className="text-sm text-neutral-300 mt-2">{task.description}</p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ml-2 ${
                        task.status === 'Completed' ? 'bg-green-900/30 text-green-400' :
                        task.status === 'In Progress' ? 'bg-blue-900/30 text-blue-400' :
                        task.status === 'Pending' ? 'bg-yellow-900/30 text-yellow-400' :
                        'bg-red-900/30 text-red-400'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-neutral-400 mb-4">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-2 flex-shrink-0" />
                        <div>
                          <div className="text-xs text-neutral-500">Assigned</div>
                          <div>{formatDate(task.assignedDate)}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Clock size={14} className="mr-2 flex-shrink-0" />
                        <div>
                          <div className="text-xs text-neutral-500">Due Date</div>
                          <div>{formatDate(task.dueDate)}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <AlertCircle size={14} className="mr-2 flex-shrink-0" />
                        <div>
                          <div className="text-xs text-neutral-500">Priority</div>
                          <div className={`${
                            task.priority === 'High' ? 'text-red-400' :
                            task.priority === 'Medium' ? 'text-yellow-400' :
                            'text-green-400'
                          }`}>
                            {task.priority}
                          </div>
                        </div>
                      </div>
                      {task.location && (
                        <div className="flex items-center">
                          <MapPin size={14} className="mr-2 flex-shrink-0" />
                          <div>
                            <div className="text-xs text-neutral-500">Location</div>
                            <div className="truncate">{task.location}</div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Skills and Requirements */}
                    {task.requiredSkills && task.requiredSkills.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-neutral-400 mb-1">Required Skills:</p>
                        <div className="flex flex-wrap gap-1">
                          {task.requiredSkills.map((skill, index) => (
                            <span 
                              key={index}
                              className="px-2 py-1 bg-blue-900/30 text-blue-300 text-xs rounded"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-3 pt-4 border-t border-neutral-700">
                      {task.status !== 'Completed' && task.status !== 'Cancelled' && (
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => handleUpdateAssignmentStatus(
                            task.id, 
                            task.status === 'Pending' ? 'In Progress' : 'Completed'
                          )}
                        >
                          {task.status === 'Pending' ? 'Start Task' : 'Mark Complete'}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-neutral-600 text-neutral-300 hover:bg-neutral-700 hover:text-white"
                        onClick={() => handleViewOrganizationDetails(task.organizationId)}
                      >
                        <ExternalLink size={14} className="mr-2" />
                        View Organization
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VolunteerOrganizations;