import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CheckSquare,
  XSquare,
  // Edit,
  MoreHorizontal,
  View,
} from "lucide-react";

import { useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Job } from "@/types";

interface CellActionProps {
  data: Job;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  // const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState("");
  const { toast } = useToast();
  const authToken = Cookies.get("authToken");
  const router = useRouter();

  const onVerify = async (is_verified: string) => {
    try {
      if (is_verified === "Declined" && !comment) {
        toast({
          title: "Error!",
          variant: "destructive",
          description: "Please provide a comment.",
        });
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/job/accept/${data.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${authToken}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            is_verified,
            comment,
          }),
        },
      );

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Job a été vérifiée avec succès.",
        });
        data.is_verified = is_verified;
      } else {
        data.is_verified = "Pending";
      }
    } catch (error) {
      toast({
        title: "Whoops!",
        variant: "destructive",
        description:
          error?.toString() || "Erreur lors de la récupération des données.",
      });
    }
  };

  return (
    <>
      {/* <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      /> */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() => {
              onVerify("Accepted");
            }}
          >
            <CheckSquare className="mr-2 h-4 w-4" /> Accept
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setOpen(true);
            }}
          >
            <XSquare className="mr-2 h-4 w-4" /> Decline
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              router.push(`/dashboard/jobs/${data.id}`);
            }}
          >
            <View className="mr-2 h-4 w-4" /> Consult
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {open && (
        <div className="mt-4">
          <Input
            className="mb-2"
            placeholder="Enter comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <Button
            onClick={() => {
              onVerify("Declined" as string);
              setOpen(false);
            }}
          >
            Confirm Decline
          </Button>
        </div>
      )}
    </>
  );
};
