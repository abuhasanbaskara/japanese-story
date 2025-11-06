'use client'

import { useState } from 'react'
import { AppSidebar } from "@/components/layout/app-sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { TipForm } from '@/components/dashboard/tip-form'
import { TipList } from '@/components/dashboard/tip-list'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function TipsPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-6 px-4 lg:px-6">
              <div>
                <h1 className="text-4xl font-bold tracking-tight">Tip of the Day</h1>
                <p className="text-muted-foreground mt-2">
                  Create and manage daily tips for Japanese learners
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Create New Tip</CardTitle>
                </CardHeader>
                <CardContent>
                  <TipForm onSuccess={handleSuccess} />
                </CardContent>
              </Card>

              <Separator />

              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-semibold mb-4">All Tips</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Manage your tips below. You can delete tips that are no longer needed.
                  </p>
                </div>
                <TipList refreshKey={refreshKey} onDelete={handleSuccess} />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

