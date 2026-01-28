"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { GripVertical, Trash2 } from "lucide-react";
import {
  MenuItemWithChildren,
  updateMenuOrder,
  deleteMenuItem,
} from "@/app/actions/menu";

// Child Item Component (Dropdown Item)
function SortableChildItem({
  item,
  onDelete,
}: {
  item: MenuItemWithChildren;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center p-2 bg-muted/50 rounded-sm mb-1 text-sm border"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-move mr-2 text-muted-foreground hover:text-foreground"
      >
        <GripVertical size={16} />
      </button>
      <span className="flex-1">{item.label}</span>
      <span className="text-xs text-muted-foreground mr-4">{item.path}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 text-destructive"
        onClick={() => onDelete(item.id)}
      >
        <Trash2 size={12} />
      </Button>
    </div>
  );
}

// Parent Item Component (Top Level)
function SortableItem({
  item,
  onDelete,
}: {
  item: MenuItemWithChildren;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-card border rounded-md mb-2"
    >
      <div className="flex items-center p-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-move mr-3 text-muted-foreground hover:text-foreground"
        >
          <GripVertical size={20} />
        </button>
        <div className="flex-1">
          <span className="font-medium">{item.label}</span>
          <span className="text-xs text-muted-foreground ml-2">
            {item.path}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(item.id)}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 size={16} />
        </Button>
      </div>

      {/* Render Children (Sub-menu) */}
      {item.children.length > 0 && (
        <div className="pl-12 pr-3 pb-3">
          <div className="text-xs font-semibold text-muted-foreground mb-2">
            DROPDOWN ITEMS
          </div>
          <SortableContext
            items={item.children.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            {item.children.map((child) => (
              <SortableChildItem
                key={child.id}
                item={child}
                onDelete={onDelete}
              />
            ))}
          </SortableContext>
        </div>
      )}
    </div>
  );
}

export function MenuSortableList({
  initialItems,
}: {
  initialItems: MenuItemWithChildren[];
}) {
  const [items, setItems] = useState(initialItems);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    // 1. Check if dragging a Top-Level item
    const activeParentIndex = items.findIndex((i) => i.id === active.id);
    if (activeParentIndex !== -1) {
      // We are dragging a parent.
      // Ensure we are dropping over another parent
      const overParentIndex = items.findIndex((i) => i.id === over.id);
      if (overParentIndex !== -1) {
        setItems((items) => {
          const newOrder = arrayMove(items, activeParentIndex, overParentIndex);
          updateMenuOrder(
            newOrder.map((item, idx) => ({ id: item.id, order: idx })),
          );
          return newOrder;
        });
      }
      return;
    }

    // 2. Check if dragging a Child item
    const parentOfActive = items.find((p) =>
      p.children.some((c) => c.id === active.id),
    );
    if (parentOfActive) {
      // Find parent of over item (must be same parent for now to restrict DnD)
      const parentOfOver = items.find((p) =>
        p.children.some((c) => c.id === over.id),
      );

      if (parentOfOver && parentOfActive.id === parentOfOver.id) {
        // Reordering within the same parent
        setItems((prevItems) => {
          const newItems = [...prevItems];
          const parentIndex = newItems.findIndex(
            (p) => p.id === parentOfActive.id,
          );
          const parent = newItems[parentIndex];

          const oldIndex = parent.children.findIndex((c) => c.id === active.id);
          const newIndex = parent.children.findIndex((c) => c.id === over.id);

          // Create a new copy of children array to trigger re-render
          parent.children = arrayMove(parent.children, oldIndex, newIndex);

          // Update DB with new order for these siblings
          updateMenuOrder(
            parent.children.map((item, idx) => ({ id: item.id, order: idx })),
          );

          return newItems;
        });
      }
    }
  }

  async function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this menu item?")) {
      await deleteMenuItem(id);
      window.location.reload();
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        {items.map((item) => (
          <SortableItem key={item.id} item={item} onDelete={handleDelete} />
        ))}
      </SortableContext>
    </DndContext>
  );
}
