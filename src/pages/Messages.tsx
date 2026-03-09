import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import { useAuth } from "@/hooks/useAuth";
import { useConversations } from "@/hooks/useConversations";
import { useMessages } from "@/hooks/useMessages";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";
import { Button } from "@/components/ui/button";
import ConversationSidebar from "@/components/messages/ConversationSidebar";
import ChatArea from "@/components/messages/ChatArea";

const Messages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeConvo, setActiveConvo] = useState<string | null>(null);
  const [showNewChat, setShowNewChat] = useState(false);

  const { conversations, fetchConversations, createConversation, getConvoName } =
    useConversations(user?.id);
  const { messages, messagesEndRef, loadMessages, sendMessage } =
    useMessages(activeConvo, user?.id);
  const { typingUsers, handleTyping, clearTyping } =
    useTypingIndicator(activeConvo, user?.id);

  const activeConversation = conversations.find(c => c.id === activeConvo);

  // Fetch conversations and auto-select from URL param
  useEffect(() => {
    const init = async () => {
      await fetchConversations();
      const convoParam = searchParams.get("convo");
      if (convoParam) {
        setActiveConvo(convoParam);
        loadMessages(convoParam);
      }
    };
    init();
  }, [fetchConversations]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectConvo = (id: string) => {
    setActiveConvo(id);
    loadMessages(id);
  };

  const handleConvoCreated = (id: string) => {
    setShowNewChat(false);
    setActiveConvo(id);
    loadMessages(id);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 text-center">
          <p className="text-muted-foreground">Please sign in to use messages.</p>
          <Button className="mt-4" onClick={() => navigate("/auth")}>Sign In</Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16 h-[calc(100vh-0px)]">
        <div className="flex h-full">
          <ConversationSidebar
            conversations={conversations}
            activeConvoId={activeConvo}
            userId={user.id}
            showNewChat={showNewChat}
            getConvoName={getConvoName}
            onSelectConvo={handleSelectConvo}
            onNewChat={() => setShowNewChat(true)}
            onCancelNewChat={() => setShowNewChat(false)}
            onConvoCreated={handleConvoCreated}
            createConversation={createConversation}
          />

          <div className={`flex-1 flex flex-col ${!activeConvo ? "hidden md:flex" : "flex"}`}>
            {activeConvo && activeConversation ? (
              <ChatArea
                conversation={activeConversation}
                messages={messages}
                userId={user.id}
                displayName={getConvoName(activeConversation)}
                typingUsers={typingUsers}
                messagesEndRef={messagesEndRef}
                onBack={() => setActiveConvo(null)}
                onSend={sendMessage}
                onTyping={handleTyping}
                onClearTyping={clearTyping}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <p>Select a conversation or start a new one</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Messages;
