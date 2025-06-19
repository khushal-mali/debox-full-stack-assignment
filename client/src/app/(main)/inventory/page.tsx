"use client";

import { InventoryList } from "@/components/inventory/inventory-list";
import { InventoryForm } from "@/components/inventory/inventory-form";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function InventoryPage() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) {
    return <div>Access Denied</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inventory</h1>
        {user.role === "MASTER" && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Inventory
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Inventory</DialogTitle>
              </DialogHeader>
              <InventoryForm onSuccess={() => setOpen(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>
      <InventoryList />
    </div>
  );
}
