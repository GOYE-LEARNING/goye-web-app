// components/org-admin/ManageMembers.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  HiOutlineUserAdd,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineChevronDown,
  HiOutlineUser,
  HiOutlineX,
  HiOutlineMail,
  HiOutlineTrash,
  HiOutlinePencilAlt,
  HiOutlineUserGroup,
  HiOutlineCheck,
  HiOutlineXCircle,
  HiOutlineEye,
  HiOutlineSignal,
} from "react-icons/hi";
import { FaSpinner } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import Portal from "../Portal";
import DashboardAdminUserDetails from "../admin_component/dashboard_admin_user_details";
import { useModal } from "@/app/context/SimpleModalContext";
import { useSocket } from "@/app/context/SocketContext";

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email_address: string;
  role: string;
  user_pic?: string;
  isOnline?: boolean;
  lastActive?: string;
  joinedAt?: string;
  joinedVia?: string;
  isActive?: boolean;
  isSuspended?: boolean;
}

interface ManageMembersProps {
  onBack: () => void;
}

export default function ManageMembers({ onBack }: ManageMembersProps) {
  const params = useParams<{ org_name: string }>();
  const { showModal } = useModal();
  const { organizationOnlineUsers, joinOrganization } = useSocket();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [isInviting, setIsInviting] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [showSuspendUserModal, setShowSuspendUserModal] = useState(false);
  const [suspendUser, setSuspendUser] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const organizationId = params.org_name;

  // Sync online status from Socket
  useEffect(() => {
    joinOrganization(organizationId);
  }, [organizationId, joinOrganization]);

  // Update member online status based on socket data
  useEffect(() => {
    if (organizationOnlineUsers && members.length > 0) {
      const onlineUserIds = new Set(organizationOnlineUsers.map((u) => u.userId));
      setMembers((prevMembers) =>
        prevMembers.map((member) => ({
          ...member,
          isOnline: onlineUserIds.has(member.id),
        }))
      );
    }
  }, [organizationOnlineUsers]);

  useEffect(() => {
    fetchMembers();
  }, [organizationId]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API_URL}/api/organizations/fetch-invited-users-with-access/${organizationId}`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (data.success) {
        setMembers(data.data.users || []);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
      showModal("Error", "Failed to fetch members", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      showModal("Invalid Email", "Please enter a valid email address", "error");
      return;
    }

    setIsInviting(true);
    try {
      const res = await fetch(
        `${API_URL}/api/organizations/invite-users-to-organization/${organizationId}`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            users: [{ email: inviteEmail.trim(), role: inviteRole }],
          }),
        }
      );
      const data = await res.json();

      if (data.success) {
        // Check if there were any issues
        if (data.data?.alreadyMembers && data.data.alreadyMembers.length > 0) {
          const memberEmails = data.data.alreadyMembers.map((m: any) => m.email).join(", ");
          showModal(
            "Already Members",
            `The following users are already members: ${memberEmails}`,
            "info"
          );
        } else if (data.data?.alreadyInvited && data.data.alreadyInvited.length > 0) {
          const invitedEmails = data.data.alreadyInvited.map((m: any) => m.email).join(", ");
          showModal(
            "Already Invited",
            `The following users already have active invitations: ${invitedEmails}`,
            "info"
          );
        } else if (data.data?.failed && data.data.failed.length > 0) {
          const failedEmails = data.data.failed.map((m: any) => m.email).join(", ");
          showModal(
            "Invitation Failed",
            `Failed to send invitations to: ${failedEmails}`,
            "error"
          );
        } else {
          const successCount = data.data?.successful?.length || 0;
          showModal(
            "Invitation Sent! 🎉",
            `Successfully invited ${successCount} user(s) to the organization.`,
            "success"
          );
        }

        setInviteEmail("");
        setShowInviteModal(false);
        fetchMembers();
      } else {
        showModal("Error", data.message || "Failed to send invitation", "error");
      }
    } catch (error) {
      console.error("Error inviting user:", error);
      showModal("Error", "An unexpected error occurred. Please try again.", "error");
    } finally {
      setIsInviting(false);
    }
  };

  const handleViewUser = (userId: string) => {
    setSelectedUserId(userId);
    setShowUserDetails(true);
  };

  const handleSuspendUser = async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/organizations/members/${organizationId}/${selectedUserId}/suspend`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ suspend: !suspendUser }),
        }
      );
      const data = await res.json();
      if (data.success) {
        setSuspendUser(!suspendUser);
        showModal(
          suspendUser ? "User Restored" : "User Suspended",
          data.message,
          "success"
        );
        fetchMembers();
      } else {
        showModal("Error", data.message || "Failed to update user status.", "error");
      }
    } catch (error) {
      showModal("Error", "An error occurred. Please try again.", "error");
    } finally {
      setShowSuspendUserModal(false);
    }
  };

  const handleRemoveMember = (member: Member) => {
    showModal(
      "Remove Member",
      `Are you sure you want to remove ${member.first_name} ${member.last_name} from the organization? This action cannot be undone.`,
      "confirm",
      async () => {
        try {
          const res = await fetch(
            `${API_URL}/api/organizations/members/${organizationId}/${member.id}`,
            {
              method: "DELETE",
              credentials: "include",
            }
          );
          const data = await res.json();
          if (data.success) {
            showModal("Success", `${member.first_name} has been removed from the organization.`, "success");
            fetchMembers();
          } else {
            showModal("Error", data.message || "Failed to remove member.", "error");
          }
        } catch (error) {
          showModal("Error", "Failed to remove member. Please try again.", "error");
        }
      }
    );
  };

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email_address?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || member.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const roles = ["all", "admin", "org_admin", "member", "instructor", "student"];

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
      case "org_admin":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      case "instructor":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "student":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  return (
    <>
      <div className="min-h-screen bg-lightWhite-0/80 backdrop-blur-md dark:bg-secondaryColors-0/60 backdrop-blur-sm rounded-[20px]">
        {/* Header */}
        <div className="bg-white dark:bg-secondaryColors-0 border-b border-[#ccc]/10 dark:border-[#ccc]/10 p-4 rounded-tl-[20px] rounded-tr-[20px]">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 dark:hover:bg-shadyColor-0 rounded-lg transition-colors"
              >
                <HiOutlineChevronDown className="w-5 h-5 rotate-90 text-gray-600 dark:text-gray-300" />
              </button>
              <h1 className="text-xl font-semibold dark:text-white">
                Manage Members
              </h1>
              <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">
                ({filteredMembers.length} members)
              </span>
            </div>
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primaryColors-0 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm sm:text-base"
            >
              <HiOutlineUserAdd className="w-5 h-5" />
              <span>Invite Member</span>
            </button>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="p-4 dark:bg-secondaryColors-0 bg-white border-b border-[#ccc]/10 dark:border-[#ccc]/10">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#ccc]/10 rounded-lg bg-lightWhite-0 dark:bg-shadyColor-0 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <HiOutlineFilter className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-2 border border-[#ccc]/10 rounded-lg bg-lightWhite-0 dark:bg-shadyColor-0 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              >
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role === "all" ? "All Roles" : role.charAt(0).toUpperCase() + role.slice(1).replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="p-4 overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <FaSpinner className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <HiOutlineUserGroup className="w-16 h-16 text-gray-300 dark:text-gray-600" />
              <p className="mt-4 text-gray-500 dark:text-gray-400">
                No members found
              </p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto scrollbar_x">
              <table className="w-full min-w-[800px] border-collapse">
                <thead>
                  <tr className="border-b border-[#ccc]/10 dark:border-[#ccc]/10">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Member
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member) => (
                    <tr
                      key={member.id}
                      className="border-b border-[#ccc]/10 dark:border-[#ccc]/10 hover:bg-gray-50 dark:hover:bg-shadyColor-0/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {member.user_pic ? (
                              <img
                                src={member.user_pic}
                                alt={member.first_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <HiOutlineUser className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900 dark:text-white text-sm">
                                {member.first_name} {member.last_name}
                              </span>
                              {member.isOnline && (
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">
                        {member.email_address}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getRoleBadgeColor(
                            member.role
                          )}`}
                        >
                          {member.role === 'org_admin' ? 'MAIN ADMIN' : 
                           member.role === 'invited_user' ? 'MEMBER' : 
                           member.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-medium ${
                            member.isActive
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {member.isActive ? (
                            <HiOutlineCheck className="w-3 h-3" />
                          ) : (
                            <HiOutlineXCircle className="w-3 h-3" />
                          )}
                          {member.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex flex-col">
                          <span>
                            {formatDistanceToNow(new Date(member.joinedAt), {
                              addSuffix: true,
                            })}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            via {member.joinedVia}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleViewUser(member.id)}
                            className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="View user details"
                          >
                            <HiOutlineEye className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                          </button>
                          <button
                            className="p-2 hover:bg-gray-100 dark:hover:bg-shadyColor-0 rounded-lg transition-colors"
                            title="Edit member"
                          >
                            <HiOutlinePencilAlt className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          </button>
                          <button
                            onClick={() => handleRemoveMember(member)}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Remove member"
                          >
                            <HiOutlineTrash className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* User Details Slide-in Panel */}
      <Portal>
        <div
          className={`fixed top-0 right-0 h-full bg-white dark:bg-secondaryColors-0 md:w-[390px] w-full transform transition-transform duration-300 ease-in-out z-[80] shadow-2xl
            ${showUserDetails ? "translate-x-0" : "translate-x-full"}`}
        >
          <DashboardAdminUserDetails
            checkSuspendedUser={suspendUser}
            suspendUserFunc={() => {
              setShowSuspendUserModal(true);
            }}
            userId={selectedUserId}
            cancel={() => setShowUserDetails(false)}
          />
        </div>
      </Portal>

      {/* Suspend User Confirmation Modal */}
      <Portal>
        {showSuspendUserModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[90] p-4">
            <div className="bg-white dark:bg-secondaryColors-0 rounded-xl max-w-md w-full p-6 shadow-xl">
              <h3 className="text-xl font-semibold dark:text-white mb-2">
                {suspendUser ? "Restore User" : "Suspend User"}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {suspendUser 
                  ? "Are you sure you want to restore this user's access? They will be able to access the platform again."
                  : "Are you sure you want to suspend this user's access? They will not be able to access the platform until restored."}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSuspendUserModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-shadyColor-0 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSuspendUser}
                  className={`flex-1 px-4 py-2 rounded-lg text-white transition-colors ${
                    suspendUser 
                      ? "bg-green-600 hover:bg-green-700" 
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {suspendUser ? "Restore" : "Suspend"}
                </button>
              </div>
            </div>
          </div>
        )}
      </Portal>

      {/* Invite Modal */}
      <Portal>
        {showInviteModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
            <div className="bg-white dark:bg-secondaryColors-0 rounded-xl max-w-md w-full p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold dark:text-white">
                  Invite Member
                </h2>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-shadyColor-0 rounded-lg transition-colors"
                >
                  <HiOutlineX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full pl-3 pr-4 py-2 border border-[#ccc]/10 rounded-lg bg-lightWhite-0 dark:bg-shadyColor-0 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Role
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full pl-3 pr-4 py-2 border border-[#ccc]/10 rounded-lg bg-lightWhite-0 dark:bg-shadyColor-0 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  >
                    <option value="member">Member</option>
                    <option value="instructor">Instructor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <button
                  onClick={handleInvite}
                  disabled={isInviting || !inviteEmail.trim()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primaryColors-0 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isInviting ? (
                    <FaSpinner className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <HiOutlineMail className="w-5 h-5" />
                      <span>Send Invitation</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </Portal>
    </>
  );
}