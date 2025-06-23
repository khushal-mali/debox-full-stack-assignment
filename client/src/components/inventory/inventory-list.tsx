"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash, Edit, ArrowUpDown } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InventoryForm } from "./inventory-form";
import { Inventory } from "@/types";
import { useInventory } from "@/hooks/use-inventory";

type SortKey = keyof Inventory | "product";
type SortOrder = "asc" | "desc";

export function InventoryList() {
  const { user } = useAuth();
  const { inventories, isLoading, deleteInventory } = useInventory();
  const [editInventory, setEditInventory] = useState<Inventory | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("product");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const sortedInventories = [...inventories].sort((a, b) => {
    if (sortKey === "product") {
      const aValue = a?.productId._id;
      const bValue = b.productId.name;
      return sortOrder === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    const aValue = a[sortKey as keyof Inventory];
    const bValue = b[sortKey as keyof Inventory];
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    }
    return sortOrder === "asc"
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

  const totalPages = Math.ceil(inventories.length / itemsPerPage);
  const paginatedInventories = sortedInventories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort("product")}>
                  Product
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort("available")}>
                  Quantity
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              {user?.role === "MASTER" && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={user?.role === "MASTER" ? 3 : 2}
                  className="h-24 text-center"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : paginatedInventories.length ? (
              paginatedInventories.map((inventory) => (
                <TableRow key={inventory._id}>
                  <TableCell>{inventory?.productId?.name}</TableCell>
                  <TableCell>{inventory.available}</TableCell>
                  {user?.role === "MASTER" && (
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setEditInventory(inventory)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => deleteInventory(inventory._id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={user?.role === "MASTER" ? 3 : 2}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-between items-center mt-4">
        <Button
          variant="outline"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Previous
        </Button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </Button>
      </div>
      {editInventory && (
        <Dialog open={!!editInventory} onOpenChange={() => setEditInventory(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Inventory</DialogTitle>
            </DialogHeader>
            <InventoryForm
              inventory={editInventory}
              onSuccess={() => setEditInventory(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
