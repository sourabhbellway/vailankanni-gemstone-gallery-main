import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface QuantityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (quantity: number) => void;
  productName: string;
  maxStock: number;
  loading?: boolean;
}

const QuantityDialog: React.FC<QuantityDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  productName,
  maxStock,
  loading = false,
}) => {
  const [quantity, setQuantity] = useState(1);

  const handleConfirm = () => {
    if (quantity > 0 && quantity <= maxStock) {
      onConfirm(quantity);
    }
  };

  const handleQuantityChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0 && numValue <= maxStock) {
      setQuantity(numValue);
    } else if (value === "") {
      setQuantity(1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Quantity</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="product-name">Product</Label>
            <p className="text-sm text-gray-600 mt-1">{productName}</p>
          </div>
          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={maxStock}
              value={quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Available stock: {maxStock}
            </p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm} 
              disabled={loading || quantity <= 0 || quantity > maxStock}
              className="bg-[#084526] hover:bg-[#0a5a2e]"
            >
              {loading ? "Adding..." : "Add to Cart"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuantityDialog;
