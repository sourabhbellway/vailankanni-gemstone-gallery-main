import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface QuantityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (quantity: number, size?: string | number) => void;
  productName: string;
  maxStock: number;
  loading?: boolean;
  sizes?: { size: string | number; quantity: number }[];
  purity?: string;
  weight?: number | string;
  makingCharges?: number | string;
}

const QuantityDialog: React.FC<QuantityDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  productName,
  maxStock,
  loading = false,
  sizes = [],
  purity,
  weight,
  makingCharges,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | number | undefined>(
    sizes.length > 0 ? sizes[0].size : undefined
  );
  const selectedSizeQty = (() => {
    if (!sizes || sizes.length === 0 || selectedSize === undefined) return maxStock;
    const found = sizes.find((s) => String(s.size) === String(selectedSize));
    return found?.quantity ?? maxStock;
  })();

  const handleConfirm = () => {
    if (quantity > 0 && quantity <= maxStock) {
      onConfirm(quantity, selectedSize);
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
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <Label>Product</Label>
              <p className="mt-1">{productName}</p>
            </div>
            {purity && (
              <div>
                <Label>Purity</Label>
                <p className="mt-1">{purity}</p>
              </div>
            )}
            {weight && (
              <div>
                <Label>Weight</Label>
                <p className="mt-1">{String(weight)}g</p>
              </div>
            )}
            {makingCharges && (
              <div>
                <Label>Making Charges</Label>
                <p className="mt-1">₹{String(makingCharges)}</p>
              </div>
            )}
          </div>

          {sizes && sizes.length > 0 && (
            <div>
              <Label htmlFor="size">Size</Label>
              <select
                id="size"
                className="mt-1 w-full border rounded px-3 py-2"
                value={selectedSize as any}
                onChange={(e) => setSelectedSize(e.target.value)}
              >
                {sizes.map((s, idx) => (
                  <option key={`${s.size}-${idx}`} value={String(s.size)}>
                    {String(s.size)} {s.quantity !== undefined ? `(qty: ${s.quantity})` : ""}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Available for selected size: {selectedSizeQty}
              </p>
            </div>
          )}
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
            {!sizes || sizes.length === 0 ? (
              <p className="text-xs text-gray-500 mt-1">Available stock: {maxStock}</p>
            ) : null}
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
