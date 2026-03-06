"use client"

import { useRouter } from "next/navigation"
import { removeCookie } from "@/lib/client-cookies"

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  LogOut,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

type NavUserProps = {
  user: {
    name: string
    username: string
    avatar?: string
  }
}

export function NavUser({ user }: NavUserProps) {

  const router = useRouter()
  const { isMobile } = useSidebar()

  const handleLogout = () => {
    removeCookie("token")
    router.replace("/login")
  }

  return (
    <SidebarMenu>

      <SidebarMenuItem>

        <DropdownMenu>

          <DropdownMenuTrigger asChild>

            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >

              <Avatar className="h-8 w-8 rounded-lg">

                <AvatarImage
                  src={user.avatar || ""}
                  alt={user.name}
                />

                <AvatarFallback className="rounded-lg">
                  {user.name.charAt(0)}
                </AvatarFallback>

              </Avatar>

              <div className="grid flex-1 text-left text-sm leading-tight">

                <span className="truncate font-medium">
                  {user.name}
                </span>

                <span className="truncate text-xs text-muted-foreground">
                  @{user.username}
                </span>

              </div>

              <ChevronsUpDown className="ml-auto size-4" />

            </SidebarMenuButton>

          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >

            <DropdownMenuLabel className="p-0 font-normal">

              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">

                <Avatar className="h-8 w-8 rounded-lg">

                  <AvatarImage
                    src={user.avatar || ""}
                    alt={user.name}
                  />

                  <AvatarFallback className="rounded-lg">
                    {user.name.charAt(0)}
                  </AvatarFallback>

                </Avatar>

                <div className="grid flex-1 text-left text-sm leading-tight">

                  <span className="truncate font-medium">
                    {user.name}
                  </span>

                  <span className="truncate text-xs text-muted-foreground">
                    @{user.username}
                  </span>

                </div>

              </div>

            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>

              <DropdownMenuItem
                onClick={() => router.push("/dashboard/profile")}
                className="cursor-pointer"
              >
                <BadgeCheck className="mr-2 h-4 w-4" />
                Account
              </DropdownMenuItem>

              <DropdownMenuItem className="cursor-pointer">
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </DropdownMenuItem>

            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-red-600 focus:text-red-600"
            >

              <LogOut className="mr-2 h-4 w-4" />
              Log out

            </DropdownMenuItem>

          </DropdownMenuContent>

        </DropdownMenu>

      </SidebarMenuItem>

    </SidebarMenu>
  )
}