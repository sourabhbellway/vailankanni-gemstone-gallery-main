import React, { useState, useEffect } from "react";
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
  const [selectedSize, setSelectedSize] = useState<string | number | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);

  // When size changes, reset quantity to 1 and clamp to available qty
  useEffect(() => {
    setQuantity(1);
  }, [selectedSize]);

  const selectedSizeQty = (() => {
    if (!sizes || sizes.length === 0 || selectedSize === undefined) return maxStock;
    const found = sizes.find((s) => String(s.size) === String(selectedSize));
    return found?.quantity ?? maxStock;
  })();

  const handleConfirm = () => {
    if (quantity > 0 && quantity <= selectedSizeQty) {
      onConfirm(quantity, selectedSize);
    }
  };

  const handleQuantityChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0 && numValue <= selectedSizeQty) {
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
          {/* Product Info */}
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

          {/* Sizes as Pills */}
          {sizes && sizes.length > 0 && (
            <div>
              <Label>Size</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {sizes.map((s, idx) => {
                  const isSelected = String(s.size) === String(selectedSize);
                  const isDisabled = s.quantity < 1;

                  return (
                    <button
                      key={`${s.size}-${idx}`}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => !isDisabled && setSelectedSize(s.size)}
                      className={`px-3 py-1.5 text-sm rounded-full border transition
                        ${isDisabled 
                          ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" 
                          : isSelected 
                            ? "bg-black text-white border-black" 
                            : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50"}`}
                    >
                      {String(s.size)}
                    </button>
                  );
                })}
              </div>
              {selectedSize && (
                <p className="text-xs text-gray-500 mt-1">
                  Available stock for selected size: {selectedSizeQty}
                </p>
              )}
            </div>
          )}

          {/* Quantity Input */}
          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={selectedSizeQty}
              value={quantity}
              onChange={(e) => handleQuantityChange(e.target.value)}
              className="mt-1"
              disabled={sizes.length > 0 && !selectedSize}
            />
            {(!sizes || sizes.length === 0) && (
              <p className="text-xs text-gray-500 mt-1">Available stock: {maxStock}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={
                loading ||
                quantity <= 0 ||
                quantity > selectedSizeQty ||
                (sizes.length > 0 && !selectedSize)
              }
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
