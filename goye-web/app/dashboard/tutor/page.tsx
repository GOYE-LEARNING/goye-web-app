'use client'

import DashboardTutorActivities from "@/app/component/dashboard_tutor_activities"
import DashboardTutorOverview from "@/app/component/dashboard_tutor_overview"
import DashboardTutorQuickAction from "@/app/component/dashboard_tutor_quick_action"

export default function TutorDashboard() {
    return (
        <>
        <div>
            <h1 className="dashboard_h1">Dashboard</h1>
            <DashboardTutorOverview />
            <DashboardTutorQuickAction />
            <DashboardTutorActivities />
        </div>
        </>
    )
}