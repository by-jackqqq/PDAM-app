"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Search, Settings, ChevronDown, Menu, X, Sun, Moon, Command } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Notification {
    id: number;
    title: string;
    desc: string;
    time: string;
    read: boolean;
    type: "info" | "warning" | "success";
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const NOTIFICATIONS: Notification[] = [
    { id: 1, title: "New deployment", desc: "Production build #482 completed", time: "2m ago", read: false, type: "success" },
    { id: 2, title: "Storage warning", desc: "Disk usage exceeded 85%", time: "1h ago", read: false, type: "warning" },
    { id: 3, title: "New user joined", desc: "john@company.com signed up", time: "3h ago", read: true, type: "info" },
    { id: 4, title: "API limit reached", desc: "Rate limit hit on /api/data", time: "5h ago", read: true, type: "warning" },
];

// ─── Search Command Palette ───────────────────────────────────────────────────

function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
    const suggestions = ["Dashboard", "Analytics", "Users", "Settings", "Reports", "Billing", "Integrations"];

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        if (open) window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [open, onClose]);

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: -8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -8 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2"
                    >
                        <div className="rounded-2xl border border-white/10 bg-[#0f1117] shadow-2xl overflow-hidden">
                            <div className="flex items-center gap-3 border-b border-white/8 px-4 py-3">
                                <Search className="h-4 w-4 text-zinc-400 shrink-0" />
                                <input
                                    autoFocus
                                    placeholder="Search anything..."
                                    className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-500 outline-none"
                                />
                                <kbd className="text-[10px] text-zinc-500 bg-white/5 border border-white/10 rounded px-1.5 py-0.5">ESC</kbd>
                            </div>
                            <div className="p-2">
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 px-3 pb-1.5 pt-1">
                                    Quick Access
                                </p>
                                {suggestions.map((item, i) => (
                                    <motion.button
                                        key={item}
                                        initial={{ opacity: 0, x: -6 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.03 }}
                                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-white/6 hover:text-white transition-colors"
                                        onClick={onClose}
                                    >
                                        <Command className="h-3.5 w-3.5 text-zinc-500" />
                                        {item}
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// ─── Notification Panel ────────────────────────────────────────────────────────

function NotificationItem({ notif }: { notif: Notification }) {
    const dot = { info: "bg-blue-400", warning: "bg-amber-400", success: "bg-emerald-400" }[notif.type];

    return (
        <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex gap-3 rounded-lg px-3 py-2.5 cursor-pointer transition-colors hover:bg-white/5 ${!notif.read ? "bg-white/[0.03]" : ""}`}
        >
            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dot} ${notif.read ? "opacity-30" : ""}`} />
            <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium ${notif.read ? "text-zinc-400" : "text-white"}`}>{notif.title}</p>
                <p className="text-[11px] text-zinc-500 truncate">{notif.desc}</p>
            </div>
            <span className="text-[10px] text-zinc-600 shrink-0 mt-0.5">{notif.time}</span>
        </motion.div>
    );
}

// ─── Main Topbar ──────────────────────────────────────────────────────────────

interface TopbarProps {
    onMenuToggle?: () => void;
    sidebarOpen?: boolean;
}

export default function Topbar({ onMenuToggle, sidebarOpen = true }: TopbarProps) {
    const [searchOpen, setSearchOpen] = useState(false);
    const [dark, setDark] = useState(true);
    const [notifsOpen, setNotifsOpen] = useState(false);
    const unread = NOTIFICATIONS.filter((n) => !n.read).length;

    // ⌘K shortcut
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setSearchOpen(true);
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    return (
        <>
            <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />

            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.1 }}
                className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-white/[0.07] bg-[#0a0c10]/90 backdrop-blur-xl px-4"
            >
                {/* Sidebar toggle */}
                <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.93 }}
                    onClick={onMenuToggle}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/8 hover:text-white transition-colors"
                >
                    <motion.div
                        animate={{ rotate: sidebarOpen ? 0 : 180 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                        {sidebarOpen ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    </motion.div>
                </motion.button>

                {/* Breadcrumb */}
                <div className="hidden md:flex items-center gap-1.5 text-xs text-zinc-500">
                    <span className="text-zinc-300 font-medium">Dashboard</span>
                    <span>/</span>
                    <span>Overview</span>
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Search trigger */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSearchOpen(true)}
                    className="hidden sm:flex items-center gap-2.5 h-8 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 text-xs text-zinc-500 hover:border-white/15 hover:bg-white/[0.07] hover:text-zinc-300 transition-all"
                >
                    <Search className="h-3.5 w-3.5" />
                    <span>Search...</span>
                    <kbd className="ml-2 text-[10px] bg-white/5 border border-white/10 rounded px-1 py-0.5 text-zinc-600">⌘K</kbd>
                </motion.button>

                {/* Mobile search */}
                <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => setSearchOpen(true)}
                    className="flex sm:hidden h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/8 hover:text-white transition-colors"
                >
                    <Search className="h-4 w-4" />
                </motion.button>

                {/* Dark mode toggle */}
                <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => setDark(!dark)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/8 hover:text-white transition-colors"
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={dark ? "moon" : "sun"}
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                        >
                            {dark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                        </motion.div>
                    </AnimatePresence>
                </motion.button>

                {/* Settings */}
                <motion.button
                    whileHover={{ scale: 1.08, rotate: 45 }}
                    whileTap={{ scale: 0.93 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/8 hover:text-white transition-colors"
                >
                    <Settings className="h-4 w-4" />
                </motion.button>

                {/* Notifications */}
                <Popover open={notifsOpen} onOpenChange={setNotifsOpen}>
                    <PopoverTrigger asChild>
                        <motion.button
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.93 }}
                            className="relative flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/8 hover:text-white transition-colors"
                        >
                            <Bell className="h-4 w-4" />
                            {unread > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-violet-500 text-[9px] font-bold text-white"
                                >
                                    {unread}
                                </motion.span>
                            )}
                        </motion.button>
                    </PopoverTrigger>
                    <PopoverContent
                        align="end"
                        sideOffset={8}
                        className="w-80 border-white/10 bg-[#0f1117] p-0 shadow-2xl rounded-xl"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        >
                            <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
                                <span className="text-sm font-semibold text-white">Notifications</span>
                                <Badge variant="secondary" className="bg-violet-500/20 text-violet-300 border-violet-500/30 text-[10px]">
                                    {unread} new
                                </Badge>
                            </div>
                            <div className="p-2 space-y-0.5 max-h-72 overflow-y-auto">
                                {NOTIFICATIONS.map((n, i) => (
                                    <motion.div
                                        key={n.id}
                                        initial={{ opacity: 0, x: 8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <NotificationItem notif={n} />
                                    </motion.div>
                                ))}
                            </div>
                            <div className="border-t border-white/8 px-4 py-2.5">
                                <button className="w-full text-center text-xs text-violet-400 hover:text-violet-300 transition-colors">
                                    View all notifications
                                </button>
                            </div>
                        </motion.div>
                    </PopoverContent>
                </Popover>

                {/* Divider */}
                <div className="h-5 w-px bg-white/10 mx-0.5" />

                {/* User menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-white/6 transition-colors group"
                        >
                            <Avatar className="h-7 w-7 ring-1 ring-violet-500/50">
                                <AvatarImage src="https://api.dicebear.com/9.x/notionists/svg?seed=Felix" />
                                <AvatarFallback className="bg-violet-600 text-[11px] text-white">JD</AvatarFallback>
                            </Avatar>
                            <div className="hidden md:flex flex-col items-start">
                                <span className="text-xs font-medium text-white leading-none">John Doe</span>
                                <span className="text-[10px] text-zinc-500 leading-none mt-0.5">Admin</span>
                            </div>
                            <motion.div
                                className="text-zinc-500 group-hover:text-zinc-300 transition-colors"
                                animate={{ rotate: 0 }}
                            >
                                <ChevronDown className="h-3 w-3" />
                            </motion.div>
                        </motion.button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        sideOffset={8}
                        className="w-52 border-white/10 bg-[#0f1117] text-zinc-300 rounded-xl shadow-2xl"
                    >
                        <DropdownMenuLabel className="text-zinc-500 text-xs font-normal px-3 pt-2 pb-1">
                            john@company.com
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-white/8" />
                        {["Profile", "Billing", "Team", "Settings"].map((item) => (
                            <DropdownMenuItem
                                key={item}
                                className="text-xs text-zinc-300 hover:bg-white/8 hover:text-white focus:bg-white/8 focus:text-white rounded-lg mx-1 cursor-pointer"
                            >
                                {item}
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator className="bg-white/8" />
                        <DropdownMenuItem className="text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300 focus:bg-red-500/10 focus:text-red-300 rounded-lg mx-1 mb-1 cursor-pointer">
                            Sign out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </motion.header>
        </>
    );
}