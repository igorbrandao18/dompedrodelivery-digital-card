"use client";

import type { MenuProduct, Restaurant } from "@/lib/types";
import { useProductDetail } from "@/hooks/use-product-detail";
import { useCartStore } from "@/stores/cart";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { useEscapeKey } from "@/hooks/use-escape-key";
import { ProductHero } from "./product-hero";
import { ProductInfo } from "./product-info";
import { OptionGroup } from "./option-group";
import { CustomerNotes } from "./customer-notes";
import { ProductFooter } from "./product-footer";

interface ProductDetailModalProps {
  product: MenuProduct;
  restaurant: Restaurant;
  onClose: () => void;
}

export function ProductDetailModal({
  product,
  restaurant,
  onClose,
}: ProductDetailModalProps) {
  const {
    quantity,
    incrementQty,
    decrementQty,
    toggleOption,
    isSelected,
    canAdd,
    allSelectedOptions,
    lineTotal,
    customerNote,
    setCustomerNote,
    groupSubtitle,
  } = useProductDetail(product);

  const addItem = useCartStore((s) => s.addItem);
  const isClosed = !restaurant.isAcceptingOrders;

  useBodyScrollLock();
  useEscapeKey(onClose);

  const handleAdd = () => {
    if (!canAdd) return;
    addItem({
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      productId: product.id,
      name: product.name,
      description: product.description ?? undefined,
      imageUrl: product.imageUrl,
      unitPrice: product.price,
      quantity,
      selectedOptions: allSelectedOptions,
      optionsSummary: allSelectedOptions.map((o) => o.name).join(", "),
      customerNote,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto pb-[80px]">
        <ProductHero
          imageUrl={product.imageUrl}
          name={product.name}
          onClose={onClose}
        />

        <ProductInfo
          name={product.name}
          description={product.description}
          servingCount={product.servingCount}
          price={product.price}
          listPrice={product.listPrice}
        />

        {product.optionGroups.map((group) => (
          <OptionGroup
            key={group.id}
            group={group}
            groupSubtitle={groupSubtitle}
            isSelected={isSelected}
            toggleOption={toggleOption}
          />
        ))}

        <CustomerNotes value={customerNote} onChange={setCustomerNote} />
      </div>

      <ProductFooter
        quantity={quantity}
        lineTotal={lineTotal}
        canAdd={canAdd}
        isClosed={isClosed}
        onIncrement={incrementQty}
        onDecrement={decrementQty}
        onAdd={handleAdd}
      />
    </div>
  );
}
