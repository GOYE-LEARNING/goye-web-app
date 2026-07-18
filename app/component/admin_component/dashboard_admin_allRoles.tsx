"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

interface Props {
    openUserDetails: (userId?: string) => void
}

interface User {
    id: string
    first_name: string
    last_name: string
    email_address: string
    role: string
    user_pic: string | null
}

export default function AdminGetRoles({ openUserDetails }: Props) {
    const params = useParams<{ org_name: string }>()
    const [invitedUsers, setInvitedUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const API_URL = process.env.NEXT_PUBLIC_API_URL
    const organizationId = params.org_name

    useEffect(() => {
        const fetchInvitedUsers = async () => {
            if (!organizationId) return
            if (!API_URL) {
                console.error("NEXT_PUBLIC_API_URL is not defined")
                setError("API URL not configured")
                setLoading(false)
                return
            }

            try {
                setLoading(true)
                const response = await fetch(
                    `${API_URL}/api/organizations/fetch-invited-users-with-access/${organizationId}`,
                    {
                        method: "GET",
                        credentials: "include",
                    }
                )

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

                if (result.success) {
                    setInvitedUsers(result.data?.users || [])
                } else {
                    setError(result.message || "Failed to fetch invited users")
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
                invitedUsers.map((user) => (
                    <div key={user.id}>
                        <div
                            className="flex justify-between items-start cursor-pointer"
                            onClick={() => openUserDetails(user.id)}
                        >
                            <div className="flex gap-3 items-center">
                                <div className="h-[44px] w-[44px] rounded-full bg-slate-300 overflow-hidden">
                                    {user.user_pic ? (
                                        <img
                                            src={user.user_pic}
                                            alt={`${user.first_name} ${user.last_name}`}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-slate-300 flex items-center justify-center">
                                            <span className="text-gray-500 font-medium">
                                                {user.first_name?.[0]}{user.last_name?.[0]}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col items-start">
                                    <h1 className="font-bold text-[14px] text-[#41415A]">
                                        {user.first_name} {user.last_name}
                                    </h1>
                                    <p className="text-sm text-gray-600">{user.email_address}</p>
                                </div>
                            </div>
                            <span className={`px-[9px] py-[1px] text-[0.8rem] capitalize rounded-[3px] ${
                                user.role === 'admin'
                                    ? 'bg-blue-500 text-white'
                                    : user.role === 'teacher'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-[#30A46F] text-white'
                            }`}>
                                {user.role}
                            </span>
                        </div>
                        <div className="dashboard_hr mt-5"></div>
                    </div>
                ))
            )}
        </div>
    )
}
