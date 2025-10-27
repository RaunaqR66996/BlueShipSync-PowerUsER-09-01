'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Send, Bot, User, Loader2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  metadata?: any;
}

interface ChatInterfaceProps {
  className?: string;
}

const demoMessages: ChatMessage[] = [
  {
    id: '1',
    content: 'Hello! I\'m your AI logistics assistant. I can help you track shipments, manage inventory, analyze warehouse performance, and answer questions about your logistics operations. How can I assist you today?',
    role: 'assistant',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: '2',
    content: 'Can you show me the current inventory levels for the Chicago DC warehouse?',
    role: 'user',
    timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
  },
  {
    id: '3',
    content: 'I can see that Chicago DC currently has 30 inventory items across 10 different products. The warehouse is operating at 70% capacity with 35,000 sq ft used out of 50,000 sq ft total. Would you like me to show you specific product details or help you identify any low-stock items?',
    role: 'assistant',
    timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000 + 30 * 1000),
    metadata: {
      warehouseId: 'chicago-dc',
      inventoryCount: 30,
      utilization: 70,
    },
  },
  {
    id: '4',
    content: 'What\'s the status of shipment 1Z999AA1234567890?',
    role: 'user',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
  },
  {
    id: '5',
    content: 'Shipment 1Z999AA1234567890 is currently IN_TRANSIT with UPS. It was shipped from Chicago DC on December 15th and is expected to be delivered by December 17th. The package contains 2 iPhone 15s and 1 MacBook Air M3, weighing 3.1 lbs total. Would you like me to set up tracking notifications for this shipment?',
    role: 'assistant',
    timestamp: new Date(Date.now() - 45 * 60 * 1000 + 20 * 1000),
    metadata: {
      trackingNumber: '1Z999AA1234567890',
      status: 'IN_TRANSIT',
      carrier: 'UPS',
      estimatedDelivery: '2024-12-17',
    },
  },
];

export function ChatInterface({ className }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(demoMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response with realistic delay
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'I understand your request. Let me analyze that information for you. Based on your current data, I can help you optimize your logistics operations. Would you like me to provide specific recommendations?',
        role: 'assistant',
        timestamp: new Date(),
        metadata: {
          responseType: 'general_assistance',
          confidence: 0.85,
        },
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={cn('flex flex-col h-full bg-background', className)}>
      <Card className="flex-1 flex flex-col border-0 shadow-none">
        <CardHeader className="pb-3 border-b">
          <CardTitle className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-primary" />
            <span>AI Logistics Assistant</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex items-start space-x-3',
                  message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                )}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  {message.role === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </Avatar>
                <div className={cn(
                  'flex-1 space-y-1',
                  message.role === 'user' ? 'text-right' : ''
                )}>
                  <div
                    className={cn(
                      'inline-block max-w-[80%] rounded-lg px-3 py-2 text-sm',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    )}
                  >
                    {message.content}
                  </div>
                  <div className={cn(
                    'text-xs text-muted-foreground',
                    message.role === 'user' ? 'text-right' : ''
                  )}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex items-start space-x-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <Bot className="h-4 w-4" />
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="inline-block bg-muted rounded-lg px-3 py-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-muted/30">
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about shipments, warehouses, inventory, or logistics..."
                  className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  rows={1}
                  style={{
                    minHeight: '40px',
                    maxHeight: '120px',
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
                  }}
                />
              </div>
              <Button 
                onClick={handleSendMessage} 
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-10 w-10"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2 text-xs text-muted-foreground text-center">
              Press Enter to send, Shift+Enter for new line
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}