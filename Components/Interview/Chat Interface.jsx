
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { AlertTriangle, Bot, CheckCircle, Clock, Mic, MicOff, Send, User } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export default function ChatInterface({ 
  session, 
  onAnswerSubmit, 
  onInterviewComplete,
  isProcessing 
}) {
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const messagesEndRef = useRef(null);
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);

  const currentQuestion = session.questions[session.current_question_index];
  const progress = ((session.current_question_index + 1) / 6) * 100;

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSpeechSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setCurrentAnswer(prev => prev + finalTranscript + ' ');
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleTimeUp = useCallback(() => {
    setIsTimerActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    onAnswerSubmit(currentAnswer || "No answer provided");
    setCurrentAnswer("");
  }, [currentAnswer, onAnswerSubmit, isListening]);

  useEffect(() => {
    scrollToBottom();
  }, [session.questions]);

  useEffect(() => {
    if (currentQuestion && session.status === 'active') {
      setTimeLeft(currentQuestion.time_limit);
      setIsTimerActive(true);
      setCurrentAnswer("");
      
      // Stop any ongoing speech recognition
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      }
      
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentQuestion, session.status, session.current_question_index, handleTimeUp, isListening]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!currentAnswer.trim() || !isTimerActive || isProcessing) return;
    
    setIsTimerActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    onAnswerSubmit(currentAnswer.trim());
    setCurrentAnswer("");
  };

  const toggleVoiceRecognition = () => {
    if (!speechSupported) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleTextareaChange = (e) => {
    // e.preventDefault(); // Removed as it prevents text input
    e.stopPropagation(); // Keep if necessary for parent listeners, otherwise it can be removed
    setCurrentAnswer(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { // Ctrl+Enter for Windows/Linux, Cmd+Enter for Mac
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (session.status === 'completed') {
    return (
      <Card className="max-w-4xl mx-auto border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-2">Interview Complete!</h2>
              <p className="text-slate-600">Thank you for completing the interview. Your responses have been submitted successfully.</p>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Full Stack Developer Interview
            </h2>
            <Badge variant="outline" className="px-3 py-1">
              Question {session.current_question_index + 1} of 6
            </Badge>
          </div>
          <Progress value={progress} className="h-2 bg-slate-100" />
        </CardContent>
      </Card>

      {/* Chat Messages */}
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm min-h-[500px] flex flex-col">
        <CardContent className="flex-1 p-0">
          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            {session.questions.slice(0, session.current_question_index + 1).map((question, index) => (
              <div key={index} className="space-y-4">
                {/* AI Question */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 max-w-3xl">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl rounded-tl-sm p-4 border border-blue-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getDifficultyColor(question.difficulty)}>
                          {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {question.time_limit}s to answer
                        </span>
                      </div>
                      <p className="text-slate-800 font-medium">{question.question_text}</p>
                    </div>
                  </div>
                </motion.div>

                {/* User Answer */}
                {question.answer && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-3 justify-end"
                  >
                    <div className="flex-1 max-w-3xl">
                      <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl rounded-tr-sm p-4 border border-slate-200">
                        <p className="text-slate-800">{question.answer}</p>
                        {question.score !== undefined && (
                          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200">
                            <Badge variant={question.score >= 70 ? "default" : "secondary"}>
                              Score: {question.score}/100
                            </Badge>
                            {question.ai_feedback && (
                              <span className="text-xs text-slate-500">
                                {question.ai_feedback}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="w-8 h-8 bg-gradient-to-r from-slate-400 to-gray-400 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Answer Input */}
          {currentQuestion && !currentQuestion.answer && session.status === 'active' && (
            <div className="border-t border-slate-200 p-6">
              {isTimerActive && (
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">Time remaining:</span>
                  </div>
                  <Badge variant={timeLeft <= 10 ? "destructive" : "outline"} className="font-mono">
                    {formatTime(timeLeft)}
                  </Badge>
                  {timeLeft <= 10 && (
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  )}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="flex gap-4">
                <div className="flex-1">
                  <Textarea
                    placeholder="Type your answer here or use voice input... (Ctrl+Enter to submit)"
                    value={currentAnswer}
                    onChange={handleTextareaChange}
                    onKeyDown={handleKeyDown}
                    className="min-h-[100px] resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!isTimerActive || isProcessing}
                    autoFocus
                  />
                  {isListening && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-blue-600">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span>Listening... Speak now</span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-2">
                  {speechSupported && (
                    <Button
                      type="button"
                      variant={isListening ? "destructive" : "outline"}
                      size="icon"
                      onClick={toggleVoiceRecognition}
                      disabled={!isTimerActive || isProcessing}
                      className="h-12 w-12"
                      title={isListening ? "Stop listening" : "Start voice input"}
                    >
                      {isListening ? (
                        <MicOff className="w-5 h-5" />
                      ) : (
                        <Mic className="w-5 h-5" />
                      )}
                    </Button>
                  )}
                  
                  <Button
                    type="submit"
                    disabled={!currentAnswer.trim() || !isTimerActive || isProcessing}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-12 w-12"
                    size="icon"
                    title="Submit answer"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </form>
              
              <div className="flex justify-between items-center mt-3 text-xs text-slate-500">
                <span>Press Ctrl+Enter to submit quickly</span>
                {!speechSupported && (
                  <span>Voice input not supported in this browser</span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
