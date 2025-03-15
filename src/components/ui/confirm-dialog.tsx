
import React, { useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  title: string;
  description: string;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

export function ConfirmDialog({
  title,
  description,
  isOpen,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "destructive",
}: ConfirmDialogProps) {
  // Ensure dialog is cleaned up if component unmounts while open
  useEffect(() => {
    return () => {
      if (isOpen) {
        console.log('ConfirmDialog: Cleaning up on unmount');
        onCancel();
      }
    };
  }, [isOpen, onCancel]);

  const handleConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Log that we're starting the confirmation
    console.log('ConfirmDialog: Confirm action triggered');
    
    try {
      onConfirm();
    } catch (error) {
      console.error("Error in confirm handler:", error);
    } finally {
      // Ensure dialog is closed even if there's an error
      console.log('ConfirmDialog: Cleanup after confirm action');
      onCancel();
    }
  };

  // Enhanced handler for dialog closure
  const handleCloseDialog = () => {
    console.log('ConfirmDialog: Cancel action triggered');
    onCancel();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCloseDialog}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant={variant} onClick={handleConfirm}>
              {confirmText}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
