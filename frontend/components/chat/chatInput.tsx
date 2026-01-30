"use client"
import { Button } from "@/components/ui/button"
import { Mic, Send, Paperclip, Upload, X } from "lucide-react"
import { uploadSQLFile } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

interface ChatInputProps {
  input: string
  setInput: (val: string) => void
  handleSend: () => void
  setIsVoiceActive: (val: boolean) => void
  placeholder?: string
  disabled?: boolean
}

export function ChatInput({ input, setInput, handleSend, setIsVoiceActive, placeholder, disabled = false }: ChatInputProps) {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Vérifier que c'est un fichier SQL
    if (!file.name.endsWith('.sql')) {
      toast({
        title: "Erreur",
        description: "Seuls les fichiers .sql sont acceptés",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    e.target.value = '';
  };

  const handleUploadFile = async () => {
    if (!selectedFile) return;

    console.log('[DEBUG] Debut upload:', selectedFile.name, selectedFile.size);
    setIsUploading(true);
    toast({
      title: "Upload en cours",
      description: `Envoi de ${selectedFile.name}...`,
    });

    try {
      console.log('[DEBUG] Appel uploadSQLFile avec:', selectedFile);
      const response = await uploadSQLFile(selectedFile);
      console.log('[DEBUG] Response reçue:', response);

      if (response.success) {
        console.log('[SUCCESS] Upload terminé');
        toast({
          title: "Succès",
          description: `Fichier ${selectedFile.name} uploadé et exécuté avec succès dans la BDD`,
        });
        setSelectedFile(null);
      } else {
        console.log('[ERROR] Erreur response:', response.error);
        toast({
          title: "Erreur",
          description: response.error || "Erreur lors de l'upload",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.log('[CATCH] Exception:', error);
      toast({
        title: "Erreur",
        description: "Impossible de communiquer avec le serveur",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelFile = () => {
    setSelectedFile(null);
  };

  return (
    <div className="p-6">
      {/* Preview du fichier sélectionné - Ultra compact comme l'input */}
      {selectedFile && (
        <div className="mb-2 max-w-3xl mx-auto">
          <div className="border border-green-500/40 bg-green-500/5 rounded-lg px-3 py-2 flex items-center justify-between gap-2">

            {/* File info */}
            <div className="flex items-center gap-2 min-w-0">
              <Paperclip className="w-4 h-4 text-green-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-white text-xs font-medium truncate">
                  {selectedFile.name}
                </p>
                <p className="text-white/40 text-[10px]">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <Button
                onClick={handleUploadFile}
                disabled={isUploading}
                size="icon"
                className="h-7 w-7 bg-green-500 hover:bg-green-600 text-white"
              >
                <Upload className="w-3.5 h-3.5" />
              </Button>

              <Button
                onClick={handleCancelFile}
                disabled={isUploading}
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-white/40 hover:text-white hover:bg-white/10"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}


      <div className="max-w-3xl mx-auto relative group">
        <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
        <div className="relative flex items-end bg-white/5 border border-white/10 rounded-2xl p-2 focus-within:border-primary/50 transition-all">
          <div className="flex gap-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsVoiceActive(true)}
              className="text-white/40 hover:text-primary transition-colors h-10 w-10 shrink-0 mb-2"
              disabled={disabled}
            >
              <Mic className="w-5 h-5" />
            </Button>

            {/* Input caché pour importer les fichiers SQL */}
            <input
              type="file"
              id="fileInput"
              className="hidden"
              accept=".sql"
              onChange={handleFileSelect}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => document.getElementById("fileInput")?.click()}
              className="text-white/40 hover:text-primary transition-colors h-10 w-10 shrink-0"
              disabled={disabled || isUploading}
              title="Sélectionner un fichier SQL"
            >
              <Paperclip className="w-5 h-5" />
            </Button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder={placeholder || "Type a message..."}
            className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-white placeholder:text-white/20 py-3 px-1 resize-none min-h-[52px] max-h-48 overflow-y-auto"
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || disabled}
            className="mb-1 rounded-xl h-10 w-10 p-0 shrink-0 transition-all active:scale-90 bg-primary hover:bg-primary/80 disabled:bg-white/5 disabled:text-white/20"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
