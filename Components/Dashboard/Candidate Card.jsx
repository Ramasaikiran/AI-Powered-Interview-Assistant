import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Mail, Phone, Star, Eye } from "lucide-react";
import { format } from "date-fns";

export default function CandidateCard({ candidate, onViewDetails }) {
  const getScoreColor = (score) => {
    if (score >= 80) return "bg-green-100 text-green-800 border-green-200";
    if (score >= 60) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return "bg-green-100 text-green-800 border-green-200";
      case 'in_progress': return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm border-0">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">{candidate.name}</h3>
              <p className="text-sm text-slate-500">
                {format(new Date(candidate.created_date), "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {candidate.final_score !== undefined && (
              <Badge className={`${getScoreColor(candidate.final_score)} font-semibold`}>
                <Star className="w-3 h-3 mr-1" />
                {candidate.final_score}/100
              </Badge>
            )}
            <Badge className={getStatusColor(candidate.interview_status)}>
              {candidate.interview_status.replace('_', ' ')}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <Mail className="w-4 h-4" />
            <span className="truncate">{candidate.email}</span>
          </div>
          {candidate.phone && (
            <div className="flex items-center gap-2 text-slate-600">
              <Phone className="w-4 h-4" />
              <span>{candidate.phone}</span>
            </div>
          )}
        </div>
        
        {candidate.summary && (
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-sm text-slate-700 line-clamp-3">
              {candidate.summary}
            </p>
          </div>
        )}
        
        <div className="flex justify-end pt-2">
          <Button
            variant="outline"
            onClick={() => onViewDetails(candidate)}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-blue-200"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}