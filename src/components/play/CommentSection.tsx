import { useState } from "react";
import { MessageSquare, ThumbsUp, Clock, BookOpen, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Comment {
  id: string;
  user: string;
  avatar: string;
  timestamp: string;
  content: string;
  likes: number;
  ruleReference?: string;
  timestampReference?: string;
  replies?: Comment[];
}

const mockComments: Comment[] = [
  {
    id: "1",
    user: "RefExpert22",
    avatar: "RE",
    timestamp: "2 hours ago",
    content: "Looking at frame 847, you can clearly see the defender's left foot is still sliding when contact initiates. According to Rule 12B, Section II, this fails the 'both feet planted' requirement.",
    likes: 234,
    ruleReference: "Rule 12B, Section II",
    timestampReference: "0:35",
    replies: [
      {
        id: "1a",
        user: "HoopsAnalyst",
        avatar: "HA",
        timestamp: "1 hour ago",
        content: "I see your point, but I'd argue the slide was complete by the time the shoulder contact occurred. The initial hip contact is what's being called.",
        likes: 89,
        timestampReference: "0:34",
      }
    ]
  },
  {
    id: "2",
    user: "GameTapeBreakdown",
    avatar: "GT",
    timestamp: "4 hours ago",
    content: "Great analysis on this play. The key question is whether we consider the moment of 'established position' to be when the feet stop moving, or when the torso is squared. The rulebook is ambiguous here.",
    likes: 156,
    ruleReference: "Rule 12B, Section II(a)",
  }
];

const CommentSection = () => {
  const [expandedReplies, setExpandedReplies] = useState<string[]>([]);

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => 
      prev.includes(commentId) 
        ? prev.filter(id => id !== commentId)
        : [...prev, commentId]
    );
  };

  const CommentCard = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
    <div className={`${isReply ? 'ml-12 mt-4' : ''}`}>
      <div className="flex gap-3">
        <Avatar className="h-9 w-9">
          <AvatarFallback className="bg-secondary text-xs font-medium">
            {comment.avatar}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">{comment.user}</span>
            <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
          </div>
          
          {/* Evidence badges */}
          <div className="flex flex-wrap gap-2 mb-2">
            {comment.ruleReference && (
              <Badge variant="outline" className="text-xs gap-1 bg-accent/10 border-accent/30 text-accent">
                <BookOpen className="w-3 h-3" />
                {comment.ruleReference}
              </Badge>
            )}
            {comment.timestampReference && (
              <Badge variant="outline" className="text-xs gap-1 bg-primary/10 border-primary/30 text-primary">
                <Clock className="w-3 h-3" />
                {comment.timestampReference}
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-secondary-foreground leading-relaxed">
            {comment.content}
          </p>
          
          <div className="flex items-center gap-4 mt-3">
            <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>{comment.likes}</span>
            </button>
            <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Reply
            </button>
            {comment.replies && comment.replies.length > 0 && (
              <button 
                onClick={() => toggleReplies(comment.id)}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedReplies.includes(comment.id) ? 'rotate-180' : ''}`} />
                {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Replies */}
      {comment.replies && expandedReplies.includes(comment.id) && (
        <div className="space-y-4 mt-4">
          {comment.replies.map(reply => (
            <CommentCard key={reply.id} comment={reply} isReply />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Evidence-Based Discussion</h3>
          <Badge variant="secondary" className="text-xs">47</Badge>
        </div>
        <select className="bg-secondary text-sm rounded-md px-2 py-1 border border-border">
          <option>Top Evidence</option>
          <option>Most Recent</option>
          <option>Most Debated</option>
        </select>
      </div>

      {/* Add comment */}
      <div className="p-4 border-b border-border">
        <div className="flex gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary text-xs font-medium text-primary-foreground">
              YO
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <textarea 
              placeholder="Add evidence-based analysis... Reference a rule or timestamp to strengthen your argument."
              className="w-full bg-secondary/50 border border-border rounded-lg p-3 text-sm placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              rows={3}
            />
            <div className="flex justify-between items-center mt-3">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="text-xs gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  Cite Rule
                </Button>
                <Button variant="outline" size="sm" className="text-xs gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Add Timestamp
                </Button>
              </div>
              <Button size="sm">Post Analysis</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments list */}
      <div className="p-4 space-y-6">
        {mockComments.map(comment => (
          <CommentCard key={comment.id} comment={comment} />
        ))}
        
        <Button variant="ghost" className="w-full text-muted-foreground">
          Load more comments
        </Button>
      </div>
    </div>
  );
};

export default CommentSection;
