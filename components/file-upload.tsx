"use client";
import { OurFileRouter } from "@/app/api/uploadthing/core";
import { UploadDropzone } from "@uploadthing/react";
import { Trash, Upload, Camera, User } from "lucide-react";
import Image from "next/image";
import { UploadFileResponse } from "uploadthing/client";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface ImageUploadProps {
  onChange: (newFiles: UploadFileResponse[]) => void;
  onRemove: (value: UploadFileResponse[]) => void;
  value: UploadFileResponse[];
}

export default function FileUpload({
  onChange,
  onRemove,
  value
}: ImageUploadProps) {
  const { toast } = useToast();
  
  const onDeleteFile = (key: string) => {
    let filteredFiles = value.filter((item) => item.key !== key);
    onRemove(filteredFiles);
  };
  
  const onUpdateFile = (newFiles: UploadFileResponse[]) => {
    // Pour les profils, on ne garde qu'une seule image
    onChange(newFiles);
  };

  return (
    <div className="space-y-4">
      {/* Affichage de l'image actuelle */}
      {value.length > 0 && (
        <div className="flex flex-col items-center space-y-4">
          {value.map((item) => (
            <div key={item.key} className="relative">
              <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                <AvatarImage 
                  src={item.fileUrl} 
                  alt="Photo de profil"
                  className="object-cover"
                />
                <AvatarFallback className="text-2xl bg-gray-100">
                  <User className="h-12 w-12 text-gray-400" />
                </AvatarFallback>
              </Avatar>
              
              <Button
                type="button"
                onClick={() => onDeleteFile(item.key)}
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-8 w-8 p-0 rounded-full shadow-md"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          ))}
          
          {/* Bouton pour changer l'image */}
          <Button
            type="button"
            variant="outline"
            onClick={() => onRemove([])}
            className="flex items-center gap-2"
          >
            <Camera className="h-4 w-4" />
            Changer la photo
          </Button>
        </div>
      )}

      {/* Zone d'upload */}
      {value.length === 0 && (
        <div className="flex flex-col items-center space-y-4">
          {/* Avatar placeholder */}
          <Avatar className="h-32 w-32 border-4 border-dashed border-gray-300 dark:border-gray-600">
            <AvatarFallback className="bg-gray-50 dark:bg-gray-800">
              <Camera className="h-12 w-12 text-gray-400" />
            </AvatarFallback>
          </Avatar>
          
          {/* Upload zone */}
          <div className="w-full max-w-md">
            <UploadDropzone<OurFileRouter>
              className="dark:bg-zinc-800 py-4 ut-label:text-sm ut-allowed-content:ut-uploading:text-red-300 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg"
              endpoint="videoUpload"
              config={{ mode: "auto" }}
              content={{
                label: "Ajouter une photo de profil",
                allowedContent({ isUploading }) {
                  if (isUploading)
                    return (
                      <>
                        <p className="mt-2 text-sm text-slate-400 animate-pulse">
                          Upload en cours...
                        </p>
                      </>
                    );
                  return (
                    <>
                      <p className="mt-2 text-sm text-slate-400">
                        Glissez-déposez une image ou cliquez pour sélectionner
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        PNG, JPG, JPEG jusqu'à 4MB
                      </p>
                    </>
                  );
                }
              }}
              onClientUploadComplete={(res) => {
                const data: UploadFileResponse[] | undefined = res;
                if (data) {
                  onUpdateFile(data);
                  toast({
                    title: "Succès",
                    description: "Photo de profil uploadée avec succès!",
                  });
                }
              }}
              onUploadError={(error: Error) => {
                toast({
                  title: "Erreur d'upload",
                  variant: "destructive",
                  description: error.message
                });
              }}
              onUploadBegin={() => {
                // Upload commencé
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
