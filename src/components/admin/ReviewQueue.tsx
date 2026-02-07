import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, XCircle, Clock, ExternalLink, TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  getFlaggedMoments, 
  updateMomentStatus, 
  subscribeToFlaggedMoments,
  type FlaggedMoment,
  type DetectionStatus 
} from "@/lib/api/controversy";

const platformColors: Record<string, string> = {
  x: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  reddit: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  youtube: "bg-red-500/20 text-red-400 border-red-500/30",
  tiktok: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  instagram: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

const statusConfig: Record<DetectionStatus, { icon: React.ReactNode; color: string; label: string }> = {
  flagged: { icon: <AlertTriangle className="w-4 h-4" />, color: "text-amber-400", label: "Pending Review" },
  reviewing: { icon: <Clock className="w-4 h-4" />, color: "text-blue-400", label: "Under Review" },
  confirmed: { icon: <CheckCircle className="w-4 h-4" />, color: "text-green-400", label: "Confirmed" },
  dismissed: { icon: <XCircle className="w-4 h-4" />, color: "text-muted-foreground", label: "Dismissed" },
};

const ReviewQueue = () => {
  const [moments, setMoments] = useState<FlaggedMoment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<DetectionStatus | 'all'>('flagged');
  const { toast } = useToast();

  useEffect(() => {
    loadMoments();
    
    // Subscribe to real-time updates
    const unsubscribe = subscribeToFlaggedMoments((newMoment) => {
      setMoments(prev => [newMoment, ...prev]);
      toast({
        title: "New Controversy Detected",
        description: `${newMoment.teams.join(' vs ')} - ${newMoment.league}`,
      });
    });

    return unsubscribe;
  }, [filter]);

  const loadMoments = async () => {
    setLoading(true);
    try {
      const data = await getFlaggedMoments(filter === 'all' ? undefined : filter);
      setMoments(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load review queue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (momentId: string, newStatus: DetectionStatus) => {
    try {
      await updateMomentStatus(momentId, newStatus);
      setMoments(prev => 
        prev.map(m => m.id === momentId ? { ...m, status: newStatus } : m)
      );
      toast({
        title: "Status Updated",
        description: `Moment marked as ${statusConfig[newStatus].label}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Review Queue</h2>
          <p className="text-muted-foreground">Controversy signals detected from social platforms</p>
        </div>
        
        {/* Status filter */}
        <div className="flex gap-2">
          {(['all', 'flagged', 'reviewing', 'confirmed', 'dismissed'] as const).map((status) => (
            <Button
              key={status}
              variant={filter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(status)}
            >
              {status === 'all' ? 'All' : statusConfig[status].label}
            </Button>
          ))}
        </div>
      </div>

      {/* Queue */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : moments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No moments in queue</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {moments.map((moment) => (
            <Card key={moment.id} className="border-border">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={platformColors[moment.platform]}>
                      {moment.platform.toUpperCase()}
                    </Badge>
                    {moment.league && (
                      <Badge className="bg-primary/10 text-primary border-primary/20">
                        {moment.league}
                      </Badge>
                    )}
                    <span className={`flex items-center gap-1 text-sm ${statusConfig[moment.status].color}`}>
                      {statusConfig[moment.status].icon}
                      {statusConfig[moment.status].label}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatTimeAgo(moment.detected_at)}</span>
                </div>
                
                <CardTitle className="text-lg mt-2">
                  {moment.teams.join(' vs ') || 'Unknown Teams'}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Source text */}
                {moment.source_text && (
                  <p className="text-sm text-secondary-foreground bg-secondary/30 rounded-lg p-3 border border-border">
                    "{moment.source_text}"
                  </p>
                )}
                
                {/* Detected keywords */}
                <div className="flex flex-wrap gap-2">
                  {moment.officiating_keywords.map((kw) => (
                    <Badge key={kw} variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs">
                      📢 {kw}
                    </Badge>
                  ))}
                  {moment.rule_keywords.map((kw) => (
                    <Badge key={kw} variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-xs">
                      📖 {kw}
                    </Badge>
                  ))}
                  {moment.emotion_keywords.map((kw) => (
                    <Badge key={kw} variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30 text-xs">
                      🔥 {kw}
                    </Badge>
                  ))}
                </div>
                
                {/* Metrics */}
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Velocity: {moment.engagement_velocity_score.toFixed(1)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    {moment.post_volume} posts
                  </span>
                  <span>
                    {moment.bucket_count} keyword buckets matched
                  </span>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  {moment.status === 'flagged' && (
                    <>
                      <Button 
                        size="sm" 
                        variant="default"
                        onClick={() => handleStatusChange(moment.id, 'confirmed')}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Confirm & Publish
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleStatusChange(moment.id, 'reviewing')}
                      >
                        <Clock className="w-4 h-4 mr-1" />
                        Mark Reviewing
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleStatusChange(moment.id, 'dismissed')}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Dismiss
                      </Button>
                    </>
                  )}
                  
                  {moment.source_url && (
                    <Button size="sm" variant="ghost" asChild className="ml-auto">
                      <a href={moment.source_url} target="_blank" rel="noopener noreferrer">
                        View Source <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewQueue;