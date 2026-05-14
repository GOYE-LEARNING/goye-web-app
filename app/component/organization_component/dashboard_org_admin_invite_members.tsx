import React, { useEffect, useRef, useState } from "react";
import SubHeader from "../dashboard_subheader";
import { CgChevronDown } from "react-icons/cg";
import { BiPlus } from "react-icons/bi";
import { FaEllipsisVertical } from "react-icons/fa6";
import { v4 as uuidv4 } from "uuid";
import { BsThreeDots } from "react-icons/bs";
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

interface Users {
  userPic?: string;
  first_name: string;
  last_name?: string;
  email_address?: string;
  role?: string;
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [inviteShowMembersSingle, setInviteShowMemberSingle] =
    useState<boolean>(true);
  //For smooth animation height
  const [contentHeight, setContentHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const [invitedUsers, setInvitedUsers] = useState<Users[]>([]);
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

    // Auto remove after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  };

  // Remove notification
  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // For single user invitation
  const inviteSingleUser = async () => {
    // Prevent multiple submissions
    if (isLoading) return;
    
    setIsLoading(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    // Validate email
    if (!formData.email || formData.email.trim() === "") {
      addNotification("error", "Please enter an email address");
      setIsLoading(false);
      return;
    }

    // Validate role
    if (!roles || roles === "") {
      addNotification("error", "Please select a role");
      setIsLoading(false);
      return;
    }

    // Store current values for clearing after success
    const currentEmail = formData.email;
    const currentRole = roles;

    try {
      console.log("Sending request...");
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

      console.log("Response status:", res.status);
      const data = await res.json();
      console.log("Response data:", data);

      if (!res.ok) {
        addNotification("error", data.message || "Failed to invite user");
        setIsLoading(false);
        return;
      }

      // Handle new backend structure (with success field)
      if (data.success !== undefined) {
        if (data.success) {
          // Clear form first (these updates are batched)
          setFormData({ role: "", email: "" });
          setRoles("Member");
          
          // Use Promise.resolve().then() to ensure notification renders after form clear
          // This breaks out of React's batching and makes notification appear immediately
          Promise.resolve().then(() => {
            addNotification("success", data.message || "User invited successfully!");
          });
        } else {
          addNotification("error", data.message || "Failed to invite user");
        }
        setIsLoading(false);
        return;
      }

      // Handle old backend structure
      if (data.data && data.data.length > 0) {
        const firstResult = data.data[0];
        if (firstResult.status === "success") {
          // Clear form first
          setFormData({ role: "", email: "" });
          setRoles("Member");
          
          // Show success notification in next tick for immediate feedback
          Promise.resolve().then(() => {
            addNotification("success", data.message || "User invited successfully!");
          });
        } else if (firstResult.status === "already_invited") {
          addNotification("error", firstResult.message || "User already has an active invitation");
        } else {
          addNotification("error", "Failed to invite user");
        }
      } else {
        // Clear form first
        setFormData({ role: "", email: "" });
        setRoles("Member");
        
        // Show success notification in next tick
        Promise.resolve().then(() => {
          addNotification("success", data.message || "User invited successfully!");
        });
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
    // Prevent multiple submissions
    if (isMultipleLoading) return;
    
    setIsMultipleLoading(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    // Filter out empty emails
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

    // Store current member count for comparison
    const currentMemberCount = memberData.length;

    try {
      console.log("Sending multiple users request...");
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

      console.log("Response status:", res.status);
      const data = await res.json();
      console.log("Response data:", data);

      if (!res.ok) {
        addNotification("error", data.message || "Failed to invite users");
        setIsMultipleLoading(false);
        return;
      }

      // Handle new backend structure (with success field)
      if (data.success !== undefined) {
        if (data.success) {
          // Track if we need to close the box
          let shouldCloseBox = false;
          
          // Remove successful invites from the list
          const successfulEmails = data.data?.successful?.map((s: any) => s.email) || [];
          
          if (successfulEmails.length > 0) {
            setMemberData((prev) => 
              prev.filter((member) => !successfulEmails.includes(member.email))
            );
            
            // Check if all members were successful
            if (currentMemberCount === successfulEmails.length) {
              shouldCloseBox = true;
            }
          }
          
          // Show success message in next tick
          Promise.resolve().then(() => {
            addNotification("success", data.message);
          });
          
          // Show warnings for already invited users (immediate)
          if (data.data?.alreadyInvited?.length > 0) {
            addNotification(
              "error", 
              `${data.data.alreadyInvited.length} user(s) already have active invitations`
            );
          }
          
          // Show errors for failed invites (immediate)
          if (data.data?.failed?.length > 0) {
            addNotification(
              "error", 
              `${data.data.failed.length} user(s) failed to invite`
            );
          }
          
          // Close box if needed (after notifications)
          if (shouldCloseBox) {
            setTimeout(() => {
              setShowMultipleUsersBox(false);
              setInviteShowMemberSingle(true);
            }, 100);
          }
        } else {
          addNotification("error", data.message);
        }
        setIsMultipleLoading(false);
        return;
      }

      // Handle old backend structure
      const successfulInvites = data.data?.filter((item: any) => item.status === "success") || [];
      const alreadyInvited = data.data?.filter((item: any) => item.status === "already_invited") || [];
      
      // Track if we need to close the box
      let shouldCloseBox = false;
      
      // Only clear form if at least one was successful
      if (successfulInvites.length > 0) {
        // Remove only the successfully invited users from the list
        const successfulEmails = successfulInvites.map((item: any) => item.email);
        setMemberData((prev) => 
          prev.filter((member) => !successfulEmails.includes(member.email))
        );
        
        // Check if all members were successful
        if (currentMemberCount === successfulInvites.length) {
          shouldCloseBox = true;
        }
      }
      
      // Show success message in next tick
      if (successfulInvites.length > 0) {
        Promise.resolve().then(() => {
          addNotification("success", `Successfully invited ${successfulInvites.length} user(s)!`);
        });
      }
      
      // Show warnings for already invited users (immediate)
      if (alreadyInvited.length > 0) {
        addNotification("error", `${alreadyInvited.length} user(s) already have active invitations`);
      }
      
      // Close box if needed
      if (shouldCloseBox) {
        setTimeout(() => {
          setShowMultipleUsersBox(false);
          setInviteShowMemberSingle(true);
        }, 100);
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
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [showMultipleUserBox, memberData]);

  // Track which dropdowns are open using Set of IDs
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());

  //  Correctly update role for specific member
  const setMultipleRoleFunc = (id: string, role: string) => {
    setMemberData((prev) =>
      prev.map((member) =>
        member.id === id
          ? { ...member, role: role.toLowerCase() as Role }
          : member,
      ),
    );
    // Close dropdown after selection
    setOpenDropdowns((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  //To get the specific value of the input
  const handleChange = (id: string, value: string) => {
    setMemberData((prev) =>
      prev.map((user) => (user.id == id ? { ...user, email: value } : user)),
    );
  };

  const handleChangeSingle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, email: e.target.value });
  };

  //Toggle dropdown for specific member
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

  //To add a Member
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

        <form className="mt-5 bg-white py-4 px-6">
          {inviteShowMembersSingle && (
            <div>
              <h1 className="text-textSlightDark-0 font-semibold">
                Upload a member
              </h1>
              <div className="w-full flex justify-between items-center gap-2 my-3 z-20">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChangeSingle}
                  className="w-full h-[40px] px-3 border-none outline-none text-[0.9rem] rounded bg-slate-50"
                  placeholder="Email Address"
                  disabled={isLoading}
                />
                <div
                  className="relative md:w-[23%] w-[150px]"
                  onClick={() => !isLoading && setShowDropDown(true)}
                >
                  <div
                    className={`w-full flex items-center gap-2 h-[40px] border border-[#41415a]/20 justify-center rounded cursor-pointer md:text-[1rem] text-[0.9rem] px-2 ${
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
                          onClick={() => {
                            setRoleFunc(r);
                          }}
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
                      className="absolute w-[200px] bg-white drop-shadow-xl right-0 top-[43px] z-20 rounded"
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
                  className="w-full bg-white p-4 top-[50px] drop-shadow-xl rounded left-0 overflow-hidden"
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
                                className="h-[40px] w-full bg-slate-50 border-none outline-none text-[0.8rem] px-3"
                                disabled={isMultipleLoading}
                              />

                              <div className="relative">
                                <div
                                  className={`w-[150px] flex items-center gap-2 h-[40px] border border-[#41415a]/20 justify-center rounded cursor-pointer ${
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

        {/* Rest of your component */}
        <div className="bg-white py-4 px-6 my-5">
          <h1 className="text-textSlightDark-0 font-semibold">
            People with access
          </h1>
          <div className="flex flex-col items-start justify-start gap-4 w-full">
            <div className="flex justify-between items-center w-full mt-5">
              <div className="flex gap-2 items-center">
                <div className="h-[50px] w-[50px] rounded-full bg-slate-100"></div>
                <div>
                  <h1 className="font-bold text-textSlightDark-0 text-[1.1rem]">
                    Matthew Peter
                  </h1>
                  <p className="text-textGrey-0 text-[0.9rem]">
                    matthew@gmail.com
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 text-[0.9rem] border border-nearTextColors-0/20 rounded-full text-textSlightDark-0">
                  Admin
                </div>
                <BsThreeDots />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white py-4 px-6">
          <h1 className="text-textSlightDark-0 font-semibold">
            Invited People
          </h1>
          <div className="flex flex-col items-start justify-start gap-4 w-full">
            <div className="flex justify-between items-center w-full mt-5">
              <div className="flex gap-2 items-center">
                <div className="h-[50px] w-[50px] rounded-full bg-transparent border-2 border-dashed flex justify-center items-center">
                  <h1 className="font-bold">MP</h1>
                </div>
                <div>
                  <h1 className="font-bold text-textSlightDark-0 text-[1.1rem]">
                    Matthew Peter
                  </h1>
                  <p className="text-textGrey-0 text-[0.9rem]">
                    matthew@gmail.com
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 text-[0.9rem] border border-nearTextColors-0/20 rounded-full text-textSlightDark-0">
                  Admin
                </div>
                <BsThreeDots />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}