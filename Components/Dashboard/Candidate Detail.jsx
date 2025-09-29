import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { ArrowLeft, Bot, Clock, FileText, Mail, MessageCircle, Phone, Star, User } from "lucide-react";

export default function CandidateDetail({ candidate, session, onBack }) {
  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack} className="shrink-0">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-4 flex-1">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-slate-800">{candidate.name}</h1>
                <p className="text-slate-500 mt-1">
                  Interview completed on {format(new Date(candidate.created_date), "MMMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
              {candidate.final_score !== undefined && (
                <div className="text-right">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-lg ${getScoreColor(candidate.final_score)}`}>
                    <Star className="w-5 h-5" />
                    {candidate.final_score}/100
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Candidate Information */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5" />
              Candidate Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-700">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="font-medium">{candidate.email}</span>
              </div>
              {candidate.phone && (
                <div className="flex items-center gap-3 text-slate-700">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="font-medium">{candidate.phone}</span>
                </div>
              )}
              {candidate.resume_url && (
                <div className="flex items-center gap-3 text-slate-700">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <a 
                    href={candidate.resume_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:text-blue-800 underline"
                  >
                    View Resume
                  </a>
                </div>
              )}
            </div>
            
            {candidate.summary && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <Bot className="w-4 h-4" />
                    AI Summary
                  </h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {candidate.summary}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Interview Chat History */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageCircle className="w-5 h-5" />
                Interview Chat History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 max-h-[600px] overflow-y-auto">
              {session?.questions?.map((question, index) => (
                <div key={index} className="space-y-4">
                  {/* AI Question */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl rounded-tl-sm p-4 border border-blue-100">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getDifficultyColor(question.difficulty)}>
                            Question {index + 1} - {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Clock className="w-3 h-3" />
                            {question.time_limit}s
                          </div>
                        </div>
                        <p className="text-slate-800 font-medium">{question.question_text}</p>
                      </div>
                    </div>
                  </div>

                  {/* User Answer */}
                  {question.answer && (
                    <div className="flex items-start gap-3 justify-end">
                      <div className="flex-1 max-w-3xl">
                        <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl rounded-tr-sm p-4 border border-slate-200">
                          <p className="text-slate-800 mb-3">{question.answer}</p>
                          {question.score !== undefined && (
                            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                              <Badge className={`${getScoreColor(question.score)} font-semibold`}>
                                <Star className="w-3 h-3 mr-1" />
                                {question.score}/100
                              </Badge>
                              {question.ai_feedback && (
                                <span className="text-xs text-slate-500 max-w-xs">
                                  {question.ai_feedback}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="w-8 h-8 bg-gradient-to-r from-slate-400 to-gray-400 rounded-full flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                  
                  {index < session.questions.length - 1 && (
                    <Separator className="my-6" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}