import React, { useEffect, useRef, useState } from "react";
import SubHeader from "../dashboard_subheader";
import { CgChevronDown } from "react-icons/cg";
import { BiPlus } from "react-icons/bi";
import { FaEllipsisVertical } from "react-icons/fa6";
import { v4 as uuidv4 } from "uuid";
import { BsThreeDots } from "react-icons/bs";
import { MdRefresh } from "react-icons/md";
import { AnimatePresence, motion } from "framer-motion";
import { useParams } from "next/navigation";
import Loader from "../loader";

interface Props {
  backFunction: () => void;
}

type Role = "admin" | "member";

interface MemberData {
  id: string;
  email: string;
  role: Role;
}

interface UserWithAccess {
  id: string;
  first_name: string;
  last_name: string;
  email_address: string;
  role: string;
  user_pic?: string;
}

interface InvitedUser {
  id: string;
  email: string;
  role: string;
}

interface FormData {
  role: string;
  email: string;
}

interface Notification {
  type: "success" | "error";
  message: string;
  id: string;
}

export default function DashboardOrgAdminInviteMembers({
  backFunction,
}: Props) {
  const dropDownRef = useRef<HTMLDivElement | null>(null);
  const [memberData, setMemberData] = useState<MemberData[]>([]);
  const [showDropDown, setShowDropDown] = useState<boolean>(false);
  const [showDropDown2, setShowDropDown2] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMultipleLoading, setIsMultipleLoading] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [inviteShowMembersSingle, setInviteShowMemberSingle] =
    useState<boolean>(true);
  const contentRef = useRef<HTMLDivElement>(null);

  // State for fetched data
  const [usersWithAccess, setUsersWithAccess] = useState<UserWithAccess[]>([]);
  const [invitedUsers, setInvitedUsers] = useState<InvitedUser[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(true);

  const role = ["Members", "Admin"];
  const [formData, setFormData] = useState<FormData>({
    role: "",
    email: "",
  });
  const params = useParams<{ org_name: string }>();
  const [showMultipleUserBox, setShowMultipleUsersBox] =
    useState<boolean>(false);

  const [roles, setRoles] = useState<string>("Member");
  const multipleRole = [
    { id: 1, role: "Member" },
    { id: 2, role: "Admin" },
  ];

  // Add notification
  const addNotification = (type: "success" | "error", message: string) => {
    const id = uuidv4();
    setNotifications((prev) => [...prev, { type, message, id }]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Fetch invited users and users with access
  const fetchUsers = async () => {
    setIsFetching(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    try {
      // Fetch users with access (admin and members who accepted)
      const accessResponse = await fetch(
        `${API_URL}/api/organizations/fetch-invited-users-with-access/${params.org_name}`,
        {
          credentials: "include",
        }
      );
      const accessData = await accessResponse.json();
      
      if (accessData.data && Array.isArray(accessData.data)) {
        // Extract users from the response structure
        const users: UserWithAccess[] = [];
        accessData.data.forEach((org: any) => {
          if (org.user && Array.isArray(org.user)) {
            users.push(...org.user);
          }
        });
        setUsersWithAccess(users);
      }

      // Fetch invited users (pending invitations) - using the updated API
      const invitedResponse = await fetch(
        `${API_URL}/api/organizations/fetch-invited-users/${params.org_name}`,
        {
          credentials: "include",
        }
      );
      const invitedData = await invitedResponse.json();
      console.log("Invited users data:", invitedData);
      
      if (invitedData.data && Array.isArray(invitedData.data)) {
        // The API now returns array of { email, role }
        const invited: InvitedUser[] = invitedData.data.map((item: any, index: number) => ({
          id: item.id, // Generate temporary ID since API doesn't return ID
          email: item.email,
          role: item.role,
        }));
        setInvitedUsers(invited);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      addNotification("error", "Failed to fetch users");
    } finally {
      setIsFetching(false);
    }
  };

  // Resend invitation using generate-new-token API
  const resendInvitation = async (invitedUserId: string, email: string) => {
    setIsResending(invitedUserId);
    console.log(invitedUserId)
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    try {
      const response = await fetch(
        `${API_URL}/api/organizations/generate-new-token/${params.org_name}/${invitedUserId}`,
        {
          method: "POST",
          headers: { "Content-type": "application/json" },
          credentials: "include",
        }
      );

      const data = await response.json();
      if (response.ok && data.success) {
        addNotification("success", `New invitation sent to ${email}`);
        // Refresh the list to show updated invitation
        fetchUsers();
      } else {
        addNotification("error", data.message || "Failed to resend invitation");
      }
    } catch (error) {
      console.error("Error resending invitation:", error);
      addNotification("error", "Failed to resend invitation");
    } finally {
      setIsResending(null);
    }
  };

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, [params.org_name]);

  // For single user invitation
  const inviteSingleUser = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    if (!formData.email || formData.email.trim() === "") {
      addNotification("error", "Please enter an email address");
      setIsLoading(false);
      return;
    }

    if (!roles || roles === "") {
      addNotification("error", "Please select a role");
      setIsLoading(false);
      return;
    }

    const currentEmail = formData.email;
    const currentRole = roles;

    try {
      const res = await fetch(
        `${API_URL}/api/organizations/invite-users-to-organization/${params.org_name}`,
        {
          method: "POST",
          headers: { "Content-type": "application/json" },
          body: JSON.stringify({
            users: [
              {
                role: currentRole.toLowerCase(),
                email: currentEmail.trim(),
              },
            ],
          }),
          credentials: "include",
        },
      );

      const data = await res.json();

      if (!res.ok) {
        addNotification("error", data.message || "Failed to invite user");
        setIsLoading(false);
        return;
      }

      if (data.success !== undefined) {
        if (data.success) {
          setFormData({ role: "", email: "" });
          setRoles("Member");
          addNotification("success", data.message || "User invited successfully!");
          fetchUsers(); // Refresh the list
        } else {
          addNotification("error", data.message || "Failed to invite user");
        }
      } else if (data.data && data.data.length > 0) {
        const firstResult = data.data[0];
        if (firstResult.status === "success") {
          setFormData({ role: "", email: "" });
          setRoles("Member");
          addNotification("success", "User invited successfully!");
          fetchUsers(); // Refresh the list
        } else if (firstResult.status === "already_invited") {
          addNotification("error", firstResult.message || "User already has an active invitation");
        } else {
          addNotification("error", "Failed to invite user");
        }
      } else {
        setFormData({ role: "", email: "" });
        setRoles("Member");
        addNotification("success", "User invited successfully!");
        fetchUsers(); // Refresh the list
      }
      
    } catch (error) {
      console.error("Error details:", error);
      addNotification("error", "An error occurred while inviting user");
    } finally {
      setIsLoading(false);
    }
  };

  // For multiple users invitation
  const inviteMultipleUsers = async () => {
    if (isMultipleLoading) return;
    
    setIsMultipleLoading(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    const validMembers = memberData.filter(
      (member) => member.email.trim() !== "",
    );

    if (validMembers.length === 0) {
      addNotification("error", "Please add at least one valid email");
      setIsMultipleLoading(false);
      return;
    }

    const invitingUsers = validMembers.map((member) => ({
      role: member.role,
      email: member.email.trim(),
    }));

    const currentMemberCount = memberData.length;

    try {
      const res = await fetch(
        `${API_URL}/api/organizations/invite-users-to-organization/${params.org_name}`,
        {
          method: "POST",
          headers: { "Content-type": "application/json" },
          body: JSON.stringify({
            users: invitingUsers,
          }),
          credentials: "include",
        },
      );

      const data = await res.json();

      if (!res.ok) {
        addNotification("error", data.message || "Failed to invite users");
        setIsMultipleLoading(false);
        return;
      }

      if (data.success !== undefined) {
        if (data.success) {
          const successfulEmails = data.data?.successful?.map((s: any) => s.email) || [];
          
          if (successfulEmails.length > 0) {
            setMemberData((prev) => 
              prev.filter((member) => !successfulEmails.includes(member.email))
            );
            
            if (currentMemberCount === successfulEmails.length) {
              setShowMultipleUsersBox(false);
              setInviteShowMemberSingle(true);
            }
          }
          
          addNotification("success", data.message);
          fetchUsers(); // Refresh the list
          
          if (data.data?.alreadyInvited?.length > 0) {
            addNotification(
              "error", 
              `${data.data.alreadyInvited.length} user(s) already have active invitations`
            );
          }
          
          if (data.data?.failed?.length > 0) {
            addNotification(
              "error", 
              `${data.data.failed.length} user(s) failed to invite`
            );
          }
        } else {
          addNotification("error", data.message);
        }
        setIsMultipleLoading(false);
        return;
      }

      const successfulInvites = data.data?.filter((item: any) => item.status === "success") || [];
      
      if (successfulInvites.length > 0) {
        const successfulEmails = successfulInvites.map((item: any) => item.email);
        setMemberData((prev) => 
          prev.filter((member) => !successfulEmails.includes(member.email))
        );
        
        if (currentMemberCount === successfulInvites.length) {
          setShowMultipleUsersBox(false);
          setInviteShowMemberSingle(true);
        }
        
        addNotification("success", `Successfully invited ${successfulInvites.length} user(s)!`);
        fetchUsers(); // Refresh the list
      }
      
    } catch (error) {
      console.error("Error details:", error);
      addNotification("error", "An error occurred while inviting users");
    } finally {
      setIsMultipleLoading(false);
    }
  };

  useEffect(() => {
    if (showMultipleUserBox && contentRef.current) {
      // Trigger re-render for height animation
      const height = contentRef.current.scrollHeight;
    }
  }, [showMultipleUserBox, memberData]);

  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());

  const setMultipleRoleFunc = (id: string, role: string) => {
    setMemberData((prev) =>
      prev.map((member) =>
        member.id === id
          ? { ...member, role: role.toLowerCase() as Role }
          : member,
      ),
    );
    setOpenDropdowns((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const handleChange = (id: string, value: string) => {
    setMemberData((prev) =>
      prev.map((user) => (user.id == id ? { ...user, email: value } : user)),
    );
  };

  const handleChangeSingle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, email: e.target.value });
  };

  const toggleDropdown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenDropdowns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const setRoleFunc = (role: string) => {
    setRoles(role);
    setShowDropDown(false);
  };

  const closeDropDown = (e: MouseEvent) => {
    if (
      dropDownRef.current &&
      !dropDownRef.current.contains(e.target as Node)
    ) {
      setShowDropDown(false);
      setShowDropDown2(false);
      setOpenDropdowns(new Set());
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", closeDropDown);
    return () => document.removeEventListener("mousedown", closeDropDown);
  }, []);

  const addMember = () => {
    const newId = uuidv4();
    const newMember: MemberData = {
      id: newId,
      email: "",
      role: "member",
    };
    setMemberData((prev) => [...prev, newMember]);
  };

  const deleteMember = (id: string) => {
    setMemberData((prev) => prev.filter((m) => m.id !== id));
    setOpenDropdowns((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  // Get initials for avatar
  const getInitials = (firstName: string, lastName?: string) => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (firstName) {
      return firstName.charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <div className="relative">
      {/* Notifications Container */}
      <div className="fixed top-4 right-4 z-[9999] space-y-2">
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={`p-4 rounded-lg shadow-lg flex items-center justify-between min-w-[300px] ${
                notification.type === "success"
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              <span>{notification.message}</span>
              <button
                onClick={() => removeNotification(notification.id)}
                className="ml-4 text-white hover:text-gray-200 text-xl font-bold"
              >
                &times;
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <SubHeader header="Invite Members" backFunction={backFunction} />
      <div>
        <p className="text-textGrey-0">
          Easily add new members to your team by entering their email address
          below. Once invited, they'll receive an email with a link to join.
        </p>

        <form className="mt-5 bg-white dark:bg-secondaryColors-0 py-4 px-6">
          {inviteShowMembersSingle && (
            <div>
              <h1 className="dark:text-textSlightDark-0 text-lightBoldText-0/80 font-semibold">
                Upload a member
              </h1>
              <div className="w-full flex justify-between items-center gap-2 my-3 z-20">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChangeSingle}
                  className="w-full h-[40px] px-3 border-none outline-none text-[0.9rem] rounded dark:bg-shadyColor-0 bg-lightWhite-0"
                  placeholder="Email Address"
                  disabled={isLoading}
                />
                <div
                  className="relative md:w-[23%] w-[150px]"
                  onClick={() => !isLoading && setShowDropDown(true)}
                >
                  <div
                    className={`w-full dark:bg-shadyColor-0 flex items-center gap-2 h-[40px] border border-[#41415a]/20 justify-center rounded cursor-pointer md:text-[1rem] text-[0.9rem] px-2 ${
                      isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <p className="text-nearTextColors-0 text-[0.8rem]">
                      {roles}
                    </p>
                    <CgChevronDown color="#41415a" />
                  </div>
                  {showDropDown && (
                    <div
                      ref={dropDownRef}
                      className="absolute left-0 top-[45px] z-10 w-full bg-white drop-shadow-xl"
                    >
                      {role.map((r, i) => (
                        <div
                          key={i}
                          onClick={() => setRoleFunc(r)}
                          className="text-textGrey-0 text-[0.9rem] px-3 py-1 hover:bg-primaryColors-0 hover:text-white transition-all duration-200 cursor-pointer"
                        >
                          {r}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="w-[40%] text-white bg-primaryColors-0 h-[40px] rounded text-[0.8rem] flex items-center justify-center"
                  onClick={inviteSingleUser}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader
                      height={20}
                      width={20}
                      full_border_color="#ffffff"
                      border_width={2}
                      small_border_color="transparent"
                    />
                  ) : (
                    `Add ${roles}`
                  )}
                </button>
                <div className="relative justify-center items-center">
                  <button
                    type="button"
                    onClick={() => setShowDropDown2(true)}
                    disabled={isLoading}
                    className={isLoading ? "opacity-50 cursor-not-allowed" : ""}
                  >
                    <FaEllipsisVertical />
                  </button>
                  {showDropDown2 && (
                    <div
                      ref={dropDownRef}
                      className="absolute w-[200px] bg-white dark:bg-secondaryColors-0 drop-shadow-xl right-0 top-[43px] z-20 rounded"
                    >
                      <p
                        className="p-3 transition-all duration-200 cursor-pointer hover:opacity-55"
                        onClick={() => {
                          setShowDropDown2(false);
                          setShowMultipleUsersBox(true);
                          setInviteShowMemberSingle(false);
                        }}
                      >
                        Invite multiple persons
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="relative">
            <AnimatePresence mode="wait">
              {showMultipleUserBox && (
                <motion.div
                  ref={contentRef}
                  key="multiple-user-box"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="w-full bg-white dark:bg-secondaryColors-0 p-4 top-[50px] drop-shadow-xl rounded left-0 overflow-hidden"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h1>Invite Multiple Members</h1>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={addMember}
                        className="h-[30px] w-[30px] flex justify-center items-center rounded-full bg-primaryColors-0"
                        disabled={isMultipleLoading}
                      >
                        <BiPlus color="white" />
                      </button>
                      <button
                        type="button"
                        onClick={inviteMultipleUsers}
                        className="bg-primaryColors-0 text-white rounded px-3 py-1 text-[0.9rem] flex items-center justify-center min-w-[80px]"
                        disabled={isMultipleLoading || memberData.length === 0}
                      >
                        {isMultipleLoading ? (
                          <Loader
                            height={20}
                            width={20}
                            full_border_color="#ffffff"
                            border_width={2}
                            small_border_color="transparent"
                          />
                        ) : (
                          "Invite All"
                        )}
                      </button>
                      <button
                        type="button"
                        className="border border-nearTextColors-0/20 text-nearTextColors-0 rounded px-2 py-1 text-[0.9rem]"
                        onClick={() => {
                          setShowMultipleUsersBox(false);
                          setInviteShowMemberSingle(true);
                        }}
                        disabled={isMultipleLoading}
                      >
                        Go Back
                      </button>
                    </div>
                  </div>

                  <div>
                    {memberData.length === 0 ? (
                      <div>
                        <p className="text-textGrey-0 text-center my-3">
                          No member added here
                        </p>
                      </div>
                    ) : (
                      <div>
                        {memberData.map((m) => (
                          <motion.div
                            key={m.id}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{
                              duration: 0.3,
                              ease: "easeInOut",
                            }}
                          >
                            <div className="flex items-center justify-between gap-2 mb-3 relative">
                              <input
                                type="email"
                                value={m.email}
                                name="email"
                                onChange={(e) =>
                                  handleChange(m.id, e.target.value)
                                }
                                placeholder="Enter member email"
                                className="h-[40px] w-full bg-lightWhite-0 dark:bg-shadyColor-0 border-none outline-none text-[0.8rem] px-3"
                                disabled={isMultipleLoading}
                              />

                              <div className="relative">
                                <div
                                  className={`w-[150px] flex items-center gap-2 h-[40px] border border-[#41415a]/20 justify-center rounded cursor-pointer bg-white dark:bg-shadyColor-0 ${
                                    isMultipleLoading
                                      ? "opacity-50 cursor-not-allowed"
                                      : ""
                                  }`}
                                  onClick={(e) =>
                                    !isMultipleLoading &&
                                    toggleDropdown(m.id, e)
                                  }
                                >
                                  <p className="text-nearTextColors-0 text-[0.8rem] capitalize">
                                    {m.role}
                                  </p>
                                  <CgChevronDown color="#41415a" />
                                </div>

                                {openDropdowns.has(m.id) && (
                                  <div
                                    className="absolute left-0 top-[45px] z-20 w-full bg-white drop-shadow-xl"
                                    style={{ minWidth: "150px" }}
                                  >
                                    {multipleRole.map((r) => (
                                      <div
                                        key={r.id}
                                        onClick={() => {
                                          setMultipleRoleFunc(m.id, r.role);
                                        }}
                                        className="text-textGrey-0 text-[0.9rem] px-3 py-2 hover:bg-primaryColors-0 hover:text-white transition-all duration-200 cursor-pointer"
                                      >
                                        {r.role}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <span
                                onClick={() =>
                                  !isMultipleLoading && deleteMember(m.id)
                                }
                                className={`text-red-600 text-xl cursor-pointer hover:text-red-800 ${
                                  isMultipleLoading
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                                }`}
                              >
                                &times;
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </form>

        {/* People with Access Section */}
        <div className="bg-white dark:bg-secondaryColors-0 py-4 px-6 my-5">
          <h1 className="dark:text-textSlightDark-0 text-lightBoldText-0/80 font-semibold">
            People with Access ({usersWithAccess.length})
          </h1>
          {isFetching ? (
            <div className="flex justify-center py-8">
              <Loader height={30} width={30} border_width={1} full_border_color="transparent" small_border_color="orange"/>
            </div>
          ) : usersWithAccess.length === 0 ? (
            <p className="text-textGrey-0 text-center py-4">No users with access yet</p>
          ) : (
            <div className="flex flex-col items-start justify-start gap-4 w-full">
              {usersWithAccess.map((user) => (
                <div key={user.id} className="flex justify-between items-center w-full mt-5">
                  <div className="flex gap-2 items-center">
                    {user.user_pic ? (
                      <img
                        src={user.user_pic}
                        alt={`${user.first_name}`}
                        className="h-[50px] w-[50px] rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-[50px] w-[50px] rounded-full bg-primaryColors-0/20 flex items-center justify-center">
                        <h1 className="font-bold text-primaryColors-0">
                          {getInitials(user.first_name, user.last_name)}
                        </h1>
                      </div>
                    )}
                    <div>
                      <h1 className="font-bold dark:text-textSlightDark-0 text-lightBoldText-0/80 text-[1.1rem]">
                        {user.first_name} {user.last_name || ""}
                      </h1>
                      <p className="text-textGrey-0 text-[0.9rem]">
                        {user.email_address}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1 text-[0.9rem] border border-nearTextColors-0/20 rounded-full dark:text-textSlightDark-0 text-lightBoldText-0/80 capitalize">
                      {user.role}
                    </div>
                    <BsThreeDots className="cursor-pointer" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Invited People Section */}
        <div className="bg-white dark:bg-secondaryColors-0 py-4 px-6">
          <h1 className="dark:text-textSlightDark-0 text-lightBoldText-0/80 font-semibold">
            Invited People ({invitedUsers.length})
          </h1>
          {isFetching ? (
            <div className="flex justify-center py-8">
              <Loader height={30} width={30} border_width={1} full_border_color="transparent" small_border_color="orange"/>
            </div>
          ) : invitedUsers.length === 0 ? (
            <p className="text-textGrey-0 text-center py-4">No pending invitations</p>
          ) : (
            <div className="flex flex-col items-start justify-start gap-4 w-full">
              {invitedUsers.map((user) => (
                <div key={user.id} className="flex justify-between items-center w-full mt-5">
                  <div className="flex gap-2 items-center">
                    <div className="h-[50px] w-[50px] rounded-full bg-transparent border-2 border-dashed flex justify-center items-center">
                      <h1 className="font-bold">
                        {getInitials(user.email.charAt(0), "")}
                      </h1>
                    </div>
                    <div>
                      <h1 className="font-bold dark:text-textSlightDark-0 text-lightBoldText-0/80 text-[1.1rem]">
                        {user.email.split('@')[0]}
                      </h1>
                      <p className="text-textGrey-0 text-[0.9rem]">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1 text-[0.9rem] border border-nearTextColors-0/20 rounded-full dark:text-textSlightDark-0 text-lightBoldText-0/80 capitalize">
                      {user.role}
                    </div>
                    <button
                      onClick={() => resendInvitation(user.id, user.email)}
                      disabled={isResending === user.id}
                      className="flex items-center gap-1 px-3 py-1 text-[0.8rem] bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                      {isResending === user.id ? (
                        <Loader height={16} width={16} full_border_color="#ffffff" border_width={2} small_border_color="transparent" />
                      ) : (
                        <MdRefresh className="text-sm" />
                      )}
                      Resend
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}