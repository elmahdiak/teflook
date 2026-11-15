import { Folder, Calendar, Activity } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProjectCardProps {
  name: string;
  description: string;
  status: "draft" | "active" | "archived";
  updatedAt: string;
  tableCount?: number;
}

export function ProjectCard({
  name,
  description,
  status,
  updatedAt,
  tableCount = 4,
}: ProjectCardProps) {
  const statusColors = {
    active: "success" as const,
    draft: "default" as const,
    archived: "secondary" as const,
  };

  return (
    <Card className="hover:border-slate-700 transition-all hover:shadow-indigo-950/20 duration-200">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Folder className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">{name}</CardTitle>
            <CardDescription className="text-xs mt-1">{description}</CardDescription>
          </div>
        </div>
        <Badge variant={statusColors[status]} className="capitalize">
          {status}
        </Badge>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-1.5">
            <Activity className="h-3.5 w-3.5 text-indigo-400" />
            <span>{tableCount} tables configured</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Calendar className="h-3.5 w-3.5 text-slate-500" />
            <span>Updated {updatedAt}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
