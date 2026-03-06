"use client"

import * as React from "react"
import {
  BookOpen,
  Bot,
  Command,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { Admin } from "@/types/admin"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  admin: Admin | null
}

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: SquareTerminal,
    },
  ],
}

export function AppSidebar({ admin, ...props }: AppSidebarProps) {

  return (

    <Sidebar variant="inset" {...props} >
      <SidebarHeader>
        <div className="flex gap-2">
          <div className="flex aspect-square size-12 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Command className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-2xl leading-tight">
            <span className="truncate font-medium">
              PDAM Smart
            </span>
            <span className="truncate text-sm">
              Dashboard
            </span>
          </div>
        </div>
        
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        {admin && (
          <NavUser
            user={{
              name: admin.name,
              username: admin.user.username,
              avatar: "",
            }}
          />
        )}
      </SidebarFooter>
    </Sidebar>
  )
}