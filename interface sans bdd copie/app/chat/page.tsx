"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { MessageList } from "@/components/chat/messageList";
import { ChatInput } from "@/components/chat/chatInput";
import { VoiceOverlay } from "@/components/chat/voiceOverlay";
import { RenameDialog } from "@/components/dialogs/renameDialog";
import { SettingsDialog } from "@/components/dialogs/settingDialog";
import { ProfileDialog } from "@/components/dialogs/profileDialog";
import { 
  sendTextMessage, 
  getMessages, 
  AudioRecorder, 
  sendAudioMessage,
  getConversations,
  createConversation,
  getConversation,
  updateConversation,
  deleteConversation,
  Conversation
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

type Lang = "en" | "fr";

interface Message {
  id?: number;
  role: "user" | "assistant";
  content: string;
}

const translations = {
  en: {
    orbit: "Return to Orbit",
    newChat: "New Objective",
    language: "Language: EN",
    syncing: "AI Core Online",
    placeholder: "Synchronize command...",
    listening: "AI Listening",
    neuralLink: "Neural Link Established",
    profile: "Profile",
    settings: "Settings",
    logout: "Disconnect",
    rename: "Rename",
    delete: "Delete",
  },
  fr: {
    orbit: "Retour en Orbite",
    newChat: "Nouvel Objectif",
    language: "Langue: FR",
    syncing: "Cœur AI En Ligne",
    placeholder: "Synchroniser commande...",
    listening: "AI à l'Écoute",
    neuralLink: "Lien Neural Établi",
    profile: "Profil",
    settings: "Paramètres",
    logout: "Déconnexion",
    rename: "Renommer",
    delete: "Supprimer",
  },
};

export default function ChatPage() {
  // -------------------- States --------------------
  const [lang, setLang] = useState<Lang>("en");
  const t = translations[lang];
  const { toast } = useToast();
  const audioRecorder = useRef(new AudioRecorder());

  const searchParams = useSearchParams();
  const dbName = searchParams.get("db") || "";

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Conversations
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [isRenaming, setIsRenaming] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // -------------------- Effects --------------------
  // Charger les conversations au démarrage
  useEffect(() => {
    loadConversations();
  }, []);

  // Charger les messages quand une conversation est active
  useEffect(() => {
    if (activeConversationId) {
      loadMessagesForConversation(activeConversationId);
    }
  }, [activeConversationId]);

  // Auto-scroll vers le dernier message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // -------------------- Functions --------------------
  const loadConversations = async () => {
    try {
      const response = await getConversations();
      if (response.success && response.conversations) {
        setConversations(response.conversations);
        // Définir la première conversation comme active
        if (response.conversations.length > 0) {
          setActiveConversationId(response.conversations[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les conversations",
        variant: "destructive",
      });
    }
  };

  const loadMessagesForConversation = async (conversationId: number) => {
    try {
      const response = await getMessages();
      if (response.success && response.messages) {
        // Filtrer les messages pour la conversation active
        const filteredMessages = response.messages
          .filter((msg: any) => msg.conversation_id === conversationId)
          .map((msg: any) => ({
            id: msg.id,
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.contenu,
          }))
          .reverse(); // Les plus anciens en premier
        setMessages(filteredMessages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleCreateNewConversation = async () => {
    try {
      const response = await createConversation("Nouvelle Discussion");
      
      if (response.success && response.data) {
        // Ajouter immédiatement à la liste
        const newConversation = response.data;
        setConversations((prev) => [newConversation, ...prev]);
        setActiveConversationId(newConversation.id);
        setMessages([]);
        toast({
          title: "Succès",
          description: "Nouvelle discussion créée",
        });
      } else {
        toast({
          title: "Erreur",
          description: response.error || "Impossible de créer une nouvelle discussion",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer une nouvelle discussion",
        variant: "destructive",
      });
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || !activeConversationId) {
      if (!activeConversationId) {
        toast({
          title: "Erreur",
          description: "Créez une discussion d'abord",
          variant: "destructive",
        });
      }
      return;
    }

    const userMessage = input.trim();
    setInput("");
    
    // Ajouter le message utilisateur à l'interface
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      // Envoyer le message au backend
      const response = await sendTextMessage(userMessage, activeConversationId);
      
      if (response.success) {
        toast({
          title: "Message envoyé",
          description: "Votre message a été envoyé avec succès",
        });

        // TODO: Ici vous intégrerez la réponse de l'IA
        // Pour l'instant, on simule une réponse
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `Analyse terminée. J'ai traité votre demande concernant "${userMessage}". Voulez-vous continuer ?`,
            },
          ]);
        }, 1000);
      } else {
        toast({
          title: "Erreur",
          description: response.error || "Erreur lors de l'envoi du message",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de communiquer avec le serveur",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceToggle = async () => {
    if (!isVoiceActive) {
      // Démarrer l'enregistrement
      if (!activeConversationId) {
        toast({
          title: "Erreur",
          description: "Créez une discussion d'abord",
          variant: "destructive",
        });
        return;
      }

      try {
        await audioRecorder.current.startRecording();
        setIsVoiceActive(true);
        toast({
          title: "Enregistrement",
          description: "Enregistrement audio en cours...",
        });
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible d'accéder au microphone",
          variant: "destructive",
        });
      }
    } else {
      // Arrêter l'enregistrement et envoyer
      try {
        setIsLoading(true);
        const audioBlob = await audioRecorder.current.stopRecording();
        setIsVoiceActive(false);
        
        toast({
          title: "Transcription",
          description: "Transcription de l'audio en cours...",
        });

        const response = await sendAudioMessage(audioBlob, activeConversationId!);
        
        if (response.success && response.data) {
          // Ajouter le message transcrit
          setMessages((prev) => [
            ...prev,
            { role: "user", content: response.data!.contenu },
          ]);

          toast({
            title: "Transcription réussie",
            description: "Votre audio a été transcrit avec succès",
          });

          // TODO: Réponse de l'IA
          setTimeout(() => {
            setMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                content: `J'ai bien reçu votre message audio : "${response.data!.contenu}"`,
              },
            ]);
          }, 1000);
        } else {
          toast({
            title: "Erreur",
            description: response.error || "Erreur lors de la transcription",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Erreur lors du traitement de l'audio",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // -------------------- CONVERSATION MANAGEMENT --------------------
  const handleSelectConversation = (conversationId: number) => {
    setActiveConversationId(conversationId);
  };

  const handleDeleteConversation = async (conversationId: number) => {
    try {
      const response = await deleteConversation(conversationId);
      if (response.success) {
        // Supprimer de la liste
        setConversations(prev => prev.filter(c => c.id !== conversationId));
        
        // Si c'était la conversation active, en sélectionner une autre
        if (activeConversationId === conversationId) {
          const remaining = conversations.filter(c => c.id !== conversationId);
          if (remaining.length > 0) {
            setActiveConversationId(remaining[0].id);
          } else {
            setActiveConversationId(null);
            setMessages([]);
          }
        }
        
        toast({
          title: "Succès",
          description: "Discussion supprimée",
        });
      } else {
        toast({
          title: "Erreur",
          description: response.error || "Impossible de supprimer la discussion",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la discussion",
        variant: "destructive",
      });
    }
  };

  const handleRenameConversation = (conversationId: number) => {
    setIsRenaming(conversationId);
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setRenameValue(conversation.titre);
    }
  };

  const handleSaveRename = async () => {
    if (!renameValue.trim() || !isRenaming) return;
    
    const renamingId = isRenaming;
    
    try {
      // Mettre à jour immédiatement dans l'interface
      setConversations(prevConversations =>
        prevConversations.map(c => 
          c.id === renamingId 
            ? { ...c, titre: renameValue } 
            : c
        )
      );
      
      // Appeler l'API pour mettre à jour le titre
      const response = await updateConversation(renamingId, renameValue);
      
      if (response.success) {
        toast({
          title: "Succès",
          description: "Discussion renommée",
        });
      } else {
        // Si l'API échoue, recharger les conversations
        await loadConversations();
        toast({
          title: "Erreur",
          description: response.error || "Impossible de renommer la discussion",
          variant: "destructive",
        });
      }
      
      setIsRenaming(null);
    } catch (error) {
      console.error('Error renaming conversation:', error);
      // Recharger les conversations en cas d'erreur
      await loadConversations();
      toast({
        title: "Erreur",
        description: "Impossible de renommer la discussion",
        variant: "destructive",
      });
    }
  };

  // -------------------- Render --------------------
  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        chats={conversations.map(conv => ({
          id: conv.id.toString(),
          title: conv.titre,
          active: activeConversationId === conv.id,
          content: "",
        }))}
        sidebarOpen={sidebarOpen}
        t={t}
        selectChat={(id) => handleSelectConversation(parseInt(id))}
        createChat={handleCreateNewConversation}
        startRename={(chat) => handleRenameConversation(parseInt(chat.id))}
        deleteChat={(id) => handleDeleteConversation(parseInt(id))}
        setLang={setLang}
        lang={lang}
        setIsSettingsOpen={setIsSettingsOpen}
        setIsProfileOpen={setIsProfileOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <Header t={t} dbName={dbName} />
        <MessageList messages={messages} scrollRef={scrollRef} />
        <ChatInput
          input={input}
          setInput={setInput}
          handleSend={handleSend}
          setIsVoiceActive={handleVoiceToggle}
          placeholder={t.placeholder}
          disabled={isLoading}
        />
        {isVoiceActive && (
          <VoiceOverlay t={t} setIsVoiceActive={handleVoiceToggle} />
        )}
      </main>

      {/* Dialogs */}
      <RenameDialog
        isRenaming={isRenaming}
        renameValue={renameValue}
        setRenameValue={setRenameValue}
        setIsRenaming={setIsRenaming}
        handleRename={handleSaveRename}
      />
      <SettingsDialog open={isSettingsOpen} setOpen={setIsSettingsOpen} t={t} />
      <ProfileDialog open={isProfileOpen} setOpen={setIsProfileOpen} />
    </div>
  );
}
