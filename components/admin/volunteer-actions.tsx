"use client";

import { deleteVolunteerApplication, updateVolunteerStatus } from "@/app/actions/volunteer";
import { Button } from "@/components/ui/button";
import { Trash2, CheckCircle, Archive, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function DeleteVolunteerButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this application?")) return;
    setLoading(true);
    const result = await deleteVolunteerApplication(id);
    setLoading(false);
    if (result.success) {
      toast.success("Application deleted");
      router.refresh();
    } else {
      toast.error("Failed to delete application");
    }
  }

  return (
    <Button variant="destructive" size="sm" onClick={handleDelete} disabled={loading}>
      {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
      Delete
    </Button>
  );
}

export function UpdateStatusButton({ 
  id, 
  status, 
  currentStatus 
}: { 
  id: string, 
  status: string,
  currentStatus: string 
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleUpdate() {
    setLoading(true);
    const result = await updateVolunteerStatus(id, status);
    setLoading(false);
    if (result.success) {
      toast.success(`Status updated to ${status}`);
      router.refresh();
    } else {
      toast.error("Failed to update status");
    }
  }

  if (status === "CONTACTED") {
    return (
      <Button 
        variant="default" 
        size="sm" 
        onClick={handleUpdate} 
        disabled={loading}
      >
        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
        Mark Contacted
      </Button>
    );
  }

  if (status === "ARCHIVED") {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleUpdate} 
        disabled={loading}
      >
        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Archive className="w-4 h-4 mr-2" />}
        Archive
      </Button>
    );
  }

  return null;
}
