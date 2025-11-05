import * as React from "react"
import { cn } from "../../lib/utils-cn"

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "h-screen w-64 bg-slate-900 text-white flex flex-col border-r border-slate-800",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
Sidebar.displayName = "Sidebar"

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-1 overflow-y-auto p-4 space-y-2", className)}
    {...props}
  />
))
SidebarContent.displayName = "SidebarContent"

const SidebarItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer transition-colors",
      className
    )}
    {...props}
  />
))
SidebarItem.displayName = "SidebarItem"

export { Sidebar, SidebarContent, SidebarItem }

