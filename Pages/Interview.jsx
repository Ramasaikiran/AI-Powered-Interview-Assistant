import React, { useState, useEffect } from "react";
import { Candidate, InterviewSession } from "@/entities/all";
import { InvokeLLM } from "@/integrations/Core";
import { motion } from "framer-motion";
import ResumeUpload from "../components/interview/ResumeUpload";
import ChatInterface from "../components/interview/ChatInterface";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const QUESTION_STRUCTURE = [
  { difficulty: "easy", time_limit: 20 },
  { difficulty: "easy", time_limit: 20 },
  { difficulty: "medium", time_limit: 60 },
  { difficulty: "medium", time_limit: 60 },
  { difficulty: "hard", time_limit: 120 },
  { difficulty: "hard", time_limit: 120 }
];

export default function Interview() {
  const [currentCandidate, setCurrentCandidate] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    checkForExistingSession();
  }, []);

  const checkForExistingSession = async () => {
    try {
      const sessions = await InterviewSession.filter({ status: "active" });
      if (sessions.length > 0) {
        const session = sessions[0];
        const candidate = await Candidate.list().then(candidates => 
          candidates.find(c => c.id === session.candidate_id)
        );
        
        if (candidate) {
          setCurrentCandidate(candidate);
          setCurrentSession(session);
        }
      }
    } catch (err) {
      console.error("Error checking for existing session:", err);
    }
  };

  const generateQuestions = async (candidateData) => {
    setIsProcessing(true);
    try {
      const questionsPromise = QUESTION_STRUCTURE.map(async (questionConfig) => {
        const prompt = `Generate a ${questionConfig.difficulty} level Full Stack Developer (React/Node.js) interview question. 
        The candidate's background: Name: ${candidateData.name}, Email: ${candidateData.email}
        
        Make the question specific, practical, and appropriate for the ${questionConfig.difficulty} level.
        For easy questions: focus on basic concepts and syntax
        For medium questions: focus on practical implementation and best practices  
        For hard questions: focus on complex scenarios, performance, and architecture
        
        Return only the question text, no additional formatting.`;
        
        const response = await InvokeLLM({ prompt });
        return {
          question_text: response,
          difficulty: questionConfig.difficulty,
          time_limit: questionConfig.time_limit,
          answer: null,
          score: null,
          ai_feedback: null
        };
      });

      const questions = await Promise.all(questionsPromise);
      return questions;
    } catch (error) {
      setError("Failed to generate interview questions. Please try again.");
      return [];
    }
    setIsProcessing(false);
  };

  const handleDataExtracted = async (candidateData) => {
    setIsProcessing(true);
    try {
      const candidate = await Candidate.create({
        ...candidateData,
        interview_status: "in_progress"
      });

      const questions = await generateQuestions(candidateData);
      
      const session = await InterviewSession.create({
        candidate_id: candidate.id,
        questions: questions,
        current_question_index: 0,
        status: "active",
        start_time: new Date().toISOString()
      });

      setCurrentCandidate(candidate);
      setCurrentSession(session);
    } catch (error) {
      setError("Failed to start interview session. Please try again.");
    }
    setIsProcessing(false);
  };

  const handleAnswerSubmit = async (answer) => {
    if (!currentSession) return;
    
    setIsProcessing(true);
    try {
      const currentQuestion = currentSession.questions[currentSession.current_question_index];
      
      const scoringPrompt = `Score this Full Stack Developer interview answer on a scale of 0-100.
      
      Question (${currentQuestion.difficulty}): ${currentQuestion.question_text}
      Answer: ${answer}
      
      Provide a score based on technical accuracy, completeness, and clarity.
      Also provide brief feedback (max 20 words).`;
      
      const scoringResult = await InvokeLLM({
        prompt: scoringPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            score: { type: "number", minimum: 0, maximum: 100 },
            feedback: { type: "string" }
          }
        }
      });

      const updatedQuestions = [...currentSession.questions];
      updatedQuestions[currentSession.current_question_index] = {
        ...currentQuestion,
        answer: answer,
        score: scoringResult.score,
        ai_feedback: scoringResult.feedback
      };

      const nextIndex = currentSession.current_question_index + 1;
      const isComplete = nextIndex >= 6;

      let finalScore = null;
      let summary = null;

      if (isComplete) {
        const totalScore = updatedQuestions.reduce((sum, q) => sum + (q.score || 0), 0);
        finalScore = Math.round(totalScore / 6);
        
        const summaryPrompt = `Create a brief professional summary (max 100 words) for this Full Stack Developer interview candidate:
        
        Candidate: ${currentCandidate.name}
        Final Score: ${finalScore}/100
        
        Questions and scores: ${updatedQuestions.map((q, i) => 
          `Q${i+1} (${q.difficulty}): ${q.score}/100`
        ).join(', ')}
        
        Focus on strengths, areas for improvement, and overall recommendation.`;
        
        summary = await InvokeLLM({ prompt: summaryPrompt });
      }

      const updatedSession = await InterviewSession.update(currentSession.id, {
        questions: updatedQuestions,
        current_question_index: nextIndex,
        status: isComplete ? "completed" : "active",
        end_time: isComplete ? new Date().toISOString() : currentSession.end_time
      });

      if (isComplete) {
        await Candidate.update(currentCandidate.id, {
          final_score: finalScore,
          summary: summary,
          interview_status: "completed"
        });
      }

      setCurrentSession(updatedSession);
    } catch (error) {
      setError("Failed to process answer. Please try again.");
    }
    setIsProcessing(false);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 flex items-center justify-center">
        <Alert className="max-w-md bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6"
    >
      {!currentSession ? (
        <div className="flex items-center justify-center min-h-[80vh]">
          <ResumeUpload 
            onDataExtracted={handleDataExtracted}
            onError={setError}
          />
        </div>
      ) : (
        <ChatInterface
          session={currentSession}
          onAnswerSubmit={handleAnswerSubmit}
          isProcessing={isProcessing}
        />
      )}
    </motion.div>
  );
}