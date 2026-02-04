"use client";

import { getMenuItems, createMenuItem, MenuItemWithChildren } from "@/app/actions/menu"
import { MenuSortableList } from "@/components/admin/menu-editor"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"

export default function MenuManagerPage() {
  const [menuItems, setMenuItems] = useState<MenuItemWithChildren[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  const fetchMenuItems = async () => {
    const items = await getMenuItems()
    setMenuItems(items)
    setLoading(false)
  }

  useEffect(() => {
    fetchMenuItems()
  }, [])

  async function handleCreate(formData: FormData) {
    const label = formData.get("label") as string
    const path = formData.get("path") as string
    const parentId = formData.get("parentId") as string
    
    if (!label) return
    
    await createMenuItem({
        label,
        path,
        parentId: parentId === "none" ? undefined : parentId
    })
    
    setDialogOpen(false)
    await fetchMenuItems()
  }

  if (loading) {
      return (
          <div className="flex justify-center items-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
      )
  }

  return (
    <div className="space-y-6 max-w-4xl">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Menu Manager</h1>
                <p className="text-muted-foreground">Manage the navigation bar structure.</p>
            </div>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                    <Button><Plus className="mr-2 h-4 w-4"/> Add Item</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Menu Item</DialogTitle>
                        <DialogDescription>
                            Create a new link for the navigation bar.
                        </DialogDescription>
                    </DialogHeader>
                    <form action={handleCreate}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="label" className="text-right">Label</Label>
                                <Input id="label" name="label" placeholder="e.g. About Us" className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="path" className="text-right">Path</Label>
                                <Input id="path" name="path" placeholder="e.g. /about" className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="parentId" className="text-right">Parent</Label>
                                <select id="parentId" name="parentId" className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm">
                                    <option value="none">No Parent (Top Level)</option>
                                    {menuItems.map(item => (
                                        <option key={item.id} value={item.id}>{item.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Save changes</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Navigation Structure</CardTitle>
                <CardDescription>Drag and drop to reorder top-level items.</CardDescription>
            </CardHeader>
            <CardContent>
                <MenuSortableList initialItems={menuItems} />
            </CardContent>
        </Card>
    </div>
  )
}
