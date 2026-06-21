"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

interface Props {
    openUserDetails: (userId?: string) => void
}

interface User {
    first_name: string
    last_name: string
    email_address: string
    role: string
    user_pic: string | null
}

interface Organization {
    id: string
    user: User
}

export default function AdminGetRoles({ openUserDetails }: Props) {
    const params = useParams<{ org_name: string }>()
    const [invitedUsers, setInvitedUsers] = useState<Organization[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [organizationId, setOrganizationId] = useState<string | null>(null)

    const API_URL = process.env.NEXT_PUBLIC_API_URL

    // Fetch organization ID based on org_name
    useEffect(() => {
        const fetchOrganizationId = async () => {
            try {
                const token = localStorage.getItem("access_token")
                
                const response = await fetch(`${API_URL}/api/organizations/by-name/${params.org_name}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                })

                if (!response.ok) {
                    throw new Error("Failed to fetch organization ID")
                }

                const data = await response.json()
                setOrganizationId(data.id)
            } catch (err) {
                console.error("Failed to fetch organization ID:", err)
                setError("Failed to load organization data")
                setLoading(false)
            }
        }
        
        if (params.org_name) {
            fetchOrganizationId()
        }
    }, [params.org_name, API_URL])

    // Fetch invited users
    useEffect(() => {
        const fetchInvitedUsers = async () => {
            if (!organizationId) return
            
            try {
                setLoading(true)
                const token = localStorage.getItem("access_token")
                
                const response = await fetch(`${API_URL}/fetch-invited-users/${organizationId}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                })

                if (!response.ok) {
                    if (response.status === 404) {
                        setError("Organization not found")
                    } else if (response.status === 401) {
                        setError("Unauthorized. Please login again.")
                    } else {
                        setError("Failed to fetch invited users")
                    }
                    return
                }

                const result = await response.json()
                
                if (result.message === "Invited users fetched successfully") {
                    setInvitedUsers(result.data)
                } else {
                    setError(result.message)
                }
            } catch (err) {
                console.error("Error fetching invited users:", err)
                setError("Network error. Please check your connection.")
            } finally {
                setLoading(false)
            }
        }

        fetchInvitedUsers()
    }, [organizationId, API_URL])

    if (loading) {
        return (
            <div className="dashboard_content_mainbox">
                <div className="flex justify-center items-center py-8">
                    <p>Loading invited users...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="dashboard_content_mainbox">
                <div className="flex justify-center items-center py-8">
                    <p className="text-red-500">{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="dashboard_content_mainbox">
            {invitedUsers.length === 0 ? (
                <div className="flex justify-center items-center py-8">
                    <p>No invited users found</p>
                </div>
            ) : (
                invitedUsers.map((org) => (
                    <div key={org.id}>
                        <div 
                            className="flex justify-between items-start cursor-pointer" 
                            onClick={() => openUserDetails(org.id)}
                        >
                            <div className="flex gap-3 items-center">
                                <div className="h-[44px] w-[44px] rounded-full bg-slate-300 overflow-hidden">
                                    {org.user.user_pic ? (
                                        <img 
                                            src={org.user.user_pic} 
                                            alt={`${org.user.first_name} ${org.user.last_name}`}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-slate-300 flex items-center justify-center">
                                            <span className="text-gray-500 font-medium">
                                                {org.user.first_name?.[0]}{org.user.last_name?.[0]}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col items-start">
                                    <h1 className="font-bold text-[14px] text-[#41415A]">
                                        {org.user.first_name} {org.user.last_name}
                                    </h1>
                                    <p className="text-sm text-gray-600">{org.user.email_address}</p>
                                </div>
                            </div>
                            <span className={`px-[9px] py-[1px] text-[0.8rem] capitalize rounded-[3px] ${
                                org.user.role === 'admin' 
                                    ? 'bg-blue-500 text-white' 
                                    : org.user.role === 'teacher'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-[#30A46F] text-white'
                            }`}>
                                {org.user.role}
                            </span>
                        </div>
                        <div className="dashboard_hr mt-5"></div>
                    </div>
                ))
            )}
        </div>
    )
}