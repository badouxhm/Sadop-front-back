"use client";
import { Button } from "@/components/ui/button";
import { Chat } from "@/components/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Database,
  Plus,
  PanelLeft,
  MessageSquare,
  MoreVertical,
  Edit2,
  Trash2,
  Languages,
  Moon,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SidebarProps {
  chats: Chat[];
  sidebarOpen: boolean;
  t: any;
  selectChat: (chatId: string) => void;
  createChat: () => void;
  startRename: (chat: Chat) => void;
  deleteChat: (chatId: string) => void;
  setLang: (lang: "en" | "fr") => void;
  lang: "en" | "fr";
  setIsSettingsOpen: (open: boolean) => void;
  setIsProfileOpen: (open: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
}

export function Sidebar({
  chats,
  sidebarOpen,
  t,
  selectChat,
  createChat,
  startRename,
  deleteChat,
  setLang,
  lang,
  setIsSettingsOpen,
  setIsProfileOpen,
  setSidebarOpen,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex flex-col border-r border-white/5 transition-all duration-300 bg-[#050505]",
        sidebarOpen ? "w-72" : "w-16",
      )}
    >
      {/* Top bar */}
      <div className="p-4 flex items-center justify-between">
        {sidebarOpen && (
          <div className="flex items-left">
            <img src="/logo3.png" alt="AI Logo" className="h-4 w-auto" />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-white/40 hover:text-white"
        >
          <PanelLeft className="w-4 h-4" />
        </Button>
      </div>

      {/* New Chat button */}
      <div className="px-3 mb-4">
        <Button
          className={cn(
            "w-full bg-white/5 border text-white border-white/10 hover:bg-white/10 transition-all",
            !sidebarOpen && "px-0",
          )}
          onClick={createChat}
        >
          <Plus className={cn("w-4 h-4", sidebarOpen && "mr-2")} />
          {sidebarOpen && t.newChat}
        </Button>
      </div>

      {/* Chats list */}
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => selectChat(chat.id)}
              className={cn(
                "group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer",
                chat.active
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-white/40 hover:bg-white/5",
              )}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <MessageSquare className="w-4 h-4 shrink-0" />
                {sidebarOpen && <span className="truncate">{chat.title}</span>}
              </div>
              {sidebarOpen && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    >
                      <MoreVertical className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="glass border-white/10"
                  >
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        startRename(chat);
                      }}
                      className="text-white hover:bg-white/10"
                    >
                      <Edit2 className="w-4 h-4 mr-2" /> {t.rename}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(chat.id);
                      }}
                      className="text-red-400 hover:bg-red-400/10"
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> {t.delete}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Bottom controls */}
      <div className="p-3 border-t border-white/5 flex flex-col gap-1">
        

        <Button
          variant="ghost"
          onClick={() => setLang(lang === "en" ? "fr" : "en")}
          className={cn(
            "w-full justify-start text-white/40 hover:text-white",
            !sidebarOpen && "px-0 justify-center",
          )}
        >
          <Languages className={cn("w-4 h-4", sidebarOpen && "mr-2")} />
          {sidebarOpen && t.language}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div
              className={cn(
                "flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors mt-2",
                !sidebarOpen && "justify-center px-0",
              )}
            >
              <Avatar className="w-8 h-8 ring-1 ring-white/10">
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              {sidebarOpen && (
                <div className="flex-1 overflow-hidden">
                  <div className="text-sm font-medium truncate">
                    Commander Shepard
                  </div>
                  <div className="text-xs text-white/40 truncate">
                    Premium Access
                  </div>
                </div>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            side={sidebarOpen ? "bottom" : "right"}
            className="glass border-white/10 w-48"
          >
            <DropdownMenuItem
              onClick={() => setIsProfileOpen(true)}
              className="text-white hover:bg-white/10"
            >
              <User className="w-4 h-4 mr-2" /> {t.profile}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setIsSettingsOpen(true)}
              className="text-white hover:bg-white/10"
            >
              <Settings className="w-4 h-4 mr-2" /> {t.settings}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/5" />
            <DropdownMenuItem
              onClick={() => (window.location.href = "/")}
              className="text-red-400 hover:bg-red-400/10"
            >
              <LogOut className="w-4 h-4 mr-2" /> {t.logout}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
