"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  LayoutDashboard,
  Activity,
  Terminal,
  Settings,
  Shield,
  Server,
  Zap,
  AlertCircle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ArrowUpRight,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const MOCK_STATS = [
  { name: "Active Sessions", value: "2,842", trend: "+12.5%", icon: Activity },
  { name: "Neural Queries", value: "84.2k", trend: "+5.2%", icon: Zap },
  { name: "System Uptime", value: "99.99%", trend: "Stable", icon: Server },
  { name: "Security Alerts", value: "0", trend: "Nominal", icon: Shield },
];

const MOCK_LOGS = [
  {
    id: "1",
    type: "success",
    action: "DB_SYNC",
    target: "Quantum Ledger",
    time: "2s ago",
    user: "system",
  },
  {
    id: "2",
    type: "warning",
    action: "HIGH_LATENCY",
    target: "Neural Nexus",
    time: "15s ago",
    user: "system",
  },
  {
    id: "3",
    type: "error",
    action: "AUTH_FAILURE",
    target: "Admin Console",
    time: "1m ago",
    user: "unknown_ip",
  },
  {
    id: "4",
    type: "success",
    action: "BACKUP_COMPLETE",
    target: "Archival Core",
    time: "5m ago",
    user: "cron_job",
  },
];

const CHART_DATA = [
  { time: "00:00", value: 30 },
  { time: "04:00", value: 45 },
  { time: "08:00", value: 85 },
  { time: "12:00", value: 65 },
  { time: "16:00", value: 95 },
  { time: "20:00", value: 70 },
  { time: "23:59", value: 40 },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const startScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#050505] flex flex-col">
        <div className="p-6">
          <div
            className="flex items-center gap-2 font-bold tracking-tighter text-xl cursor-pointer"
            onClick={() => (window.location.href = "/")}
          >
            <Shield className="w-5 h-5 text-primary" />
            AI{" "}
            <span className="text-primary/50 text-xs font-mono border border-primary/20 px-1 rounded">
              ROOT
            </span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start",
              activeTab === "overview"
                ? "bg-primary/10 text-primary"
                : "text-white/40"
            )}
            onClick={() => setActiveTab("overview")}
          >
            <LayoutDashboard className="w-4 h-4 mr-3" /> Overview
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start",
              activeTab === "metrics"
                ? "bg-primary/10 text-primary"
                : "text-white/40"
            )}
            onClick={() => setActiveTab("metrics")}
          >
            <Activity className="w-4 h-4 mr-3" /> Metrics
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start",
              activeTab === "logs"
                ? "bg-primary/10 text-primary"
                : "text-white/40"
            )}
            onClick={() => setActiveTab("logs")}
          >
            <Terminal className="w-4 h-4 mr-3" /> System Logs
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start",
              activeTab === "settings"
                ? "bg-primary/10 text-primary"
                : "text-white/40"
            )}
            onClick={() => setActiveTab("settings")}
          >
            <Settings className="w-4 h-4 mr-3" /> Global Config
          </Button>
        </nav>

        <div className="p-4 mt-auto">
          <Card className="bg-primary/5 border-primary/20 p-3 space-y-2">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-primary/60 font-bold">
              <span>System Health</span>
              <span>88%</span>
            </div>
            <Progress value={88} className="h-1" />
          </Card>
        </div>
      </aside>

      {/* Admin Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-black/40 backdrop-blur-md">
          <h2 className="text-sm font-medium text-white/60">
            AI Strategic Command Center
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-mono text-white/40 uppercase">
                Cluster: 0x8F2A
              </span>
            </div>
            <Badge variant="outline" className="border-primary/20 text-primary">
              v4.0.2 Stable
            </Badge>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {activeTab === "overview" ? (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {MOCK_STATS.map((stat, i) => (
                    <Card key={i} className="glass border-white/5">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-xs font-medium text-white/40 uppercase tracking-widest">
                          {stat.name}
                        </CardTitle>
                        <stat.icon className="w-4 h-4 text-primary" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-xs text-primary mt-1 flex items-center gap-1">
                          {stat.trend} <ArrowUpRight className="w-3 h-3" />
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Performance Chart */}
                <Card className="glass border-white/5">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Neural Processing Latency
                    </CardTitle>
                    <CardDescription className="text-white/40">
                      Response times across the global node network.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={CHART_DATA}>
                        <XAxis
                          dataKey="time"
                          stroke="#ffffff20"
                          fontSize={12}
                        />
                        <YAxis stroke="#ffffff20" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0a0a0a",
                            border: "1px solid #ffffff10",
                            borderRadius: "8px",
                          }}
                          itemStyle={{ color: "#3b82f6" }}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* System Logs Table */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <Card className="lg:col-span-2 glass border-white/5">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>System Activity</CardTitle>
                        <CardDescription>
                          Live telemetry from active instances.
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 border-white/10 bg-transparent"
                          onClick={() => alert("Deep Search Initialized...")}
                        >
                          <Search className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 border-white/10 bg-transparent"
                          onClick={() => alert("Applying Activity Filters...")}
                        >
                          <Filter className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader className="border-white/5">
                          <TableRow className="hover:bg-transparent border-white/5">
                            <TableHead className="text-white/40 uppercase text-[10px] tracking-widest">
                              Status
                            </TableHead>
                            <TableHead className="text-white/40 uppercase text-[10px] tracking-widest">
                              Action
                            </TableHead>
                            <TableHead className="text-white/40 uppercase text-[10px] tracking-widest">
                              Target
                            </TableHead>
                            <TableHead className="text-white/40 uppercase text-[10px] tracking-widest">
                              Timestamp
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {MOCK_LOGS.map((log) => (
                            <TableRow
                              key={log.id}
                              className="border-white/5 hover:bg-white/5"
                            >
                              <TableCell>
                                {log.type === "success" && (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                )}
                                {log.type === "warning" && (
                                  <AlertCircle className="w-4 h-4 text-amber-500" />
                                )}
                                {log.type === "error" && (
                                  <AlertCircle className="w-4 h-4 text-red-500" />
                                )}
                              </TableCell>
                              <TableCell className="font-mono text-xs">
                                {log.action}
                              </TableCell>
                              <TableCell className="text-white/60 text-xs">
                                {log.target}
                              </TableCell>
                              <TableCell className="text-white/40 text-xs flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {log.time}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  {/* Security Status Card */}
                  <Card className="glass border-white/5">
                    <CardHeader>
                      <CardTitle>Security Posture</CardTitle>
                      <CardDescription>
                        Real-time threat assessment.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex flex-col items-center justify-center py-6">
                        <div className="relative w-32 h-32 flex items-center justify-center">
                          <div
                            className={cn(
                              "absolute inset-0 bg-emerald-500/10 rounded-full",
                              isScanning ? "animate-ping" : "animate-pulse"
                            )}
                          />
                          {isScanning ? (
                            <div className="relative flex flex-col items-center">
                              <ShieldAlert className="w-12 h-12 text-primary animate-bounce" />
                              <span className="text-[10px] font-mono mt-2 text-primary">
                                {scanProgress}%
                              </span>
                            </div>
                          ) : (
                            <Shield className="w-12 h-12 text-emerald-500" />
                          )}
                        </div>
                        <div className="mt-4 text-center">
                          <div className="text-lg font-bold">
                            {isScanning ? "Scanning..." : "Threat Level: Zero"}
                          </div>
                          <div className="text-xs text-white/40">
                            {isScanning
                              ? "Analyzing neural patterns"
                              : "Last scan completed 12s ago"}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/40">Neural Firewall</span>
                          <Badge className="bg-emerald-500/10 text-emerald-500 border-none">
                            Secure
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/40">IP Reputation</span>
                          <Badge className="bg-emerald-500/10 text-emerald-500 border-none">
                            Clean
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/40">Active Threats</span>
                          <span className="font-mono">0</span>
                        </div>
                      </div>
                      <Button
                        className="w-full bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-50"
                        onClick={startScan}
                        disabled={isScanning}
                      >
                        {isScanning ? "Analyzing..." : "Full System Scan"}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-40 space-y-4">
                <Terminal className="w-12 h-12 text-primary/40 animate-pulse" />
                <h3 className="text-xl font-bold">Encrypted Terminal Area</h3>
                <p className="text-white/40 max-w-md text-center">
                  Section "{activeTab}" requires higher clearance level. Mock
                  synchronization in progress.
                </p>
                <Button
                  variant="ghost"
                  className="text-primary"
                  onClick={() => setActiveTab("overview")}
                >
                  Return to Overview
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
