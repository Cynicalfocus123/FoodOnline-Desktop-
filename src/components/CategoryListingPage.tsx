import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  type DeliveryTypeOption,
  type MadeInOption,
  type ProductItem,
  type ProductTypeOption,
  getAvailableDeliveryTypes,
  getAvailableFilterBrands,
  getAvailableMadeInOptions,
  getAvailableProductTypes,
  getCategoryBySlug,
  getCategoryListingProducts,
} from "../data/home";
import { useHomeStore } from "../store/homeStore";
import { ProductCard } from "./ProductCard";

type SortOption = "featured" | "best-selling" | "price-low" | "price-high";
type PriceBand = "all" | "under-5" | "5-10" | "10-15" | "15-25" | "25-plus";
type FilterSectionKey = "delivery" | "productType" | "madeIn" | "price" | "priceRange" | "brand";

const sortOptions: Array<{ value: SortOption; label: string }> = [
  { value: "featured", label: "Featured (default)" },
  { value: "best-selling", label: "Best Selling" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
];

const priceBands: Array<{ value: PriceBand; label: string }> = [
  { value: "all", label: "All" },
  { value: "under-5", label: "Under $5" },
  { value: "5-10", label: "$5 - $10" },
  { value: "10-15", label: "$10 - $15" },
  { value: "15-25", label: "$15 - $25" },
  { value: "25-plus", label: "$25+" },
];

const initialSectionState: Record<FilterSectionKey, boolean> = {
  delivery: true,
  productType: true,
  madeIn: true,
  price: true,
  priceRange: true,
  brand: true,
};

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={`h-5 w-5 shrink-0 text-neutral-700 transition ${open ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M4 7h16" />
      <path d="M7 12h10" />
      <path d="M10 17h4" />
      <circle cx="9" cy="7" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="17" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24">
      <path d="m5 12 4 4 10-10" />
    </svg>
  );
}

function SectionShell({ children }: { children: ReactNode }) {
  return <div className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.05)]">{children}</div>;
}

function ToggleRow({
  checked,
  label,
  onChange,
  accent,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
  accent?: "global" | "snap";
}) {
  return (
    <button className="flex items-center gap-3 text-left" onClick={onChange} type="button">
      <span className={`flex h-6 w-6 items-center justify-center rounded-md border ${checked ? "border-leaf-500 bg-emerald-50 text-leaf-600" : "border-slate-300 bg-white text-transparent"}`}>
        <CheckIcon />
      </span>
      {accent ? (
        <span className={`rounded-full px-2.5 py-1 text-sm font-bold ${accent === "global" ? "bg-orange-100 text-orange-600" : "bg-emerald-100 text-emerald-600"}`}>
          {label}
        </span>
      ) : (
        <span className="text-sm font-medium text-neutral-800">{label}</span>
      )}
    </button>
  );
}

function RadioRow({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <button className="flex items-center gap-3 text-left" onClick={onChange} type="button">
      <span className={`flex h-6 w-6 items-center justify-center rounded-full border ${checked ? "border-leaf-500" : "border-slate-300"}`}>
        <span className={`h-3 w-3 rounded-full ${checked ? "bg-leaf-500" : "bg-transparent"}`} />
      </span>
      <span className="text-sm font-medium text-neutral-800">{label}</span>
    </button>
  );
}

function FilterPanel({
  collapsedSections,
  onToggleSection,
  onReset,
  selectedDeliveryTypes,
  toggleDeliveryType,
  selectedProductTypes,
  toggleProductType,
  selectedMadeIn,
  toggleMadeIn,
  selectedBrands,
  toggleBrand,
  selectedPriceBand,
  setSelectedPriceBand,
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,
}: {
  collapsedSections: Record<FilterSectionKey, boolean>;
  onToggleSection: (section: FilterSectionKey) => void;
  onReset: () => void;
  selectedDeliveryTypes: DeliveryTypeOption[];
  toggleDeliveryType: (value: DeliveryTypeOption) => void;
  selectedProductTypes: ProductTypeOption[];
  toggleProductType: (value: ProductTypeOption) => void;
  selectedMadeIn: MadeInOption[];
  toggleMadeIn: (value: MadeInOption) => void;
  selectedBrands: string[];
  toggleBrand: (value: string) => void;
  selectedPriceBand: PriceBand;
  setSelectedPriceBand: (value: PriceBand) => void;
  minPrice: number;
  maxPrice: number;
  setMinPrice: (value: number) => void;
  setMaxPrice: (value: number) => void;
}) {
  const deliveryOptions = getAvailableDeliveryTypes();
  const productTypeOptions = getAvailableProductTypes();
  const madeInOptions = getAvailableMadeInOptions();
  const brandOptions = getAvailableFilterBrands();
  const minPercent = (minPrice / 500) * 100;
  const maxPercent = (maxPrice / 500) * 100;

  return (
    <SectionShell>
      <div className="flex items-center justify-between gap-3 border-b border-neutral-200 pb-4">
        <h2 className="text-[2rem] font-black tracking-[-0.03em] text-neutral-950">Filters</h2>
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-neutral-200 px-4 text-sm font-bold text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50"
          onClick={onReset}
          type="button"
        >
          Reset
        </button>
      </div>

      <div className="mt-6 grid gap-6">
        <div className="grid gap-4 border-b border-neutral-100 pb-6">
          <button className="flex items-center justify-between gap-3 text-left" onClick={() => onToggleSection("delivery")} type="button">
            <span className="text-2xl font-bold text-neutral-950">Delivery type</span>
            <Chevron open={collapsedSections.delivery} />
          </button>
          {collapsedSections.delivery ? (
            <div className="grid gap-4">
              {deliveryOptions.map((option) => (
                <ToggleRow
                  accent={option === "GLOBAL+" ? "global" : undefined}
                  checked={selectedDeliveryTypes.includes(option)}
                  key={option}
                  label={option}
                  onChange={() => toggleDeliveryType(option)}
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className="grid gap-4 border-b border-neutral-100 pb-6">
          <button className="flex items-center justify-between gap-3 text-left" onClick={() => onToggleSection("productType")} type="button">
            <span className="text-2xl font-bold text-neutral-950">Product type</span>
            <Chevron open={collapsedSections.productType} />
          </button>
          {collapsedSections.productType ? (
            <div className="grid gap-4">
              {productTypeOptions.map((option) => (
                <ToggleRow
                  accent={option === "SNAP" ? "snap" : undefined}
                  checked={selectedProductTypes.includes(option)}
                  key={option}
                  label={option}
                  onChange={() => toggleProductType(option)}
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className="grid gap-4 border-b border-neutral-100 pb-6">
          <button className="flex items-center justify-between gap-3 text-left" onClick={() => onToggleSection("madeIn")} type="button">
            <span className="text-2xl font-bold text-neutral-950">Made in</span>
            <Chevron open={collapsedSections.madeIn} />
          </button>
          {collapsedSections.madeIn ? (
            <div className="grid gap-4">
              {madeInOptions.map((option) => (
                <ToggleRow
                  checked={selectedMadeIn.includes(option)}
                  key={option}
                  label={option}
                  onChange={() => toggleMadeIn(option)}
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className="grid gap-4 border-b border-neutral-100 pb-6">
          <button className="flex items-center justify-between gap-3 text-left" onClick={() => onToggleSection("price")} type="button">
            <span className="text-2xl font-bold text-neutral-950">Price</span>
            <Chevron open={collapsedSections.price} />
          </button>
          {collapsedSections.price ? (
            <div className="grid gap-4">
              {priceBands.map((option) => (
                <RadioRow
                  checked={selectedPriceBand === option.value}
                  key={option.value}
                  label={option.label}
                  onChange={() => setSelectedPriceBand(option.value)}
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className="grid gap-4 border-b border-neutral-100 pb-6">
          <button className="flex items-center justify-between gap-3 text-left" onClick={() => onToggleSection("priceRange")} type="button">
            <span className="text-2xl font-bold text-neutral-950">Price Range</span>
            <Chevron open={collapsedSections.priceRange} />
          </button>
          {collapsedSections.priceRange ? (
            <div className="grid gap-4">
              <div className="relative h-6">
                <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-slate-200" />
                <div
                  className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-sky-300"
                  style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
                />
                <input
                  className="dual-range"
                  max={500}
                  min={0}
                  onChange={(event) => setMinPrice(Math.min(Number(event.target.value), maxPrice - 1))}
                  type="range"
                  value={minPrice}
                />
                <input
                  className="dual-range"
                  max={500}
                  min={0}
                  onChange={(event) => setMaxPrice(Math.max(Number(event.target.value), minPrice + 1))}
                  type="range"
                  value={maxPrice}
                />
              </div>
              <div className="flex items-center justify-between text-2xl font-medium text-neutral-600">
                <span>{minPrice}</span>
                <span>{maxPrice}</span>
              </div>
            </div>
          ) : null}
        </div>

        <div className="grid gap-4">
          <button className="flex items-center justify-between gap-3 text-left" onClick={() => onToggleSection("brand")} type="button">
            <span className="text-2xl font-bold text-neutral-950">Brand</span>
            <Chevron open={collapsedSections.brand} />
          </button>
          {collapsedSections.brand ? (
            <div className="grid gap-4">
              {brandOptions.map((option) => (
                <ToggleRow
                  checked={selectedBrands.includes(option)}
                  key={option}
                  label={option}
                  onChange={() => toggleBrand(option)}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </SectionShell>
  );
}

export function CategoryListingPage() {
  const selectedCategorySlug = useHomeStore((state) => state.selectedCategorySlug);
  const category = getCategoryBySlug(selectedCategorySlug);
  const products = getCategoryListingProducts(category.categorySlug);
  const [selectedSort, setSelectedSort] = useState<SortOption>("featured");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState(initialSectionState);
  const [selectedDeliveryTypes, setSelectedDeliveryTypes] = useState<DeliveryTypeOption[]>([]);
  const [selectedProductTypes, setSelectedProductTypes] = useState<ProductTypeOption[]>([]);
  const [selectedMadeIn, setSelectedMadeIn] = useState<MadeInOption[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedPriceBand, setSelectedPriceBand] = useState<PriceBand>("all");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(500);
  const sortReference = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setSelectedSort("featured");
    setSelectedDeliveryTypes([]);
    setSelectedProductTypes([]);
    setSelectedMadeIn([]);
    setSelectedBrands([]);
    setSelectedPriceBand("all");
    setMinPrice(0);
    setMaxPrice(500);
    setCollapsedSections(initialSectionState);
    setIsFilterDrawerOpen(false);
    setIsSortOpen(false);
  }, [category.categorySlug]);

  useEffect(() => {
    if (!isSortOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (sortReference.current?.contains(event.target as Node)) {
        return;
      }

      setIsSortOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isSortOpen]);

  useEffect(() => {
    if (!isFilterDrawerOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isFilterDrawerOpen]);

  function toggleListValue<T extends string>(value: T, currentValues: T[], setValues: (next: T[]) => void) {
    setValues(currentValues.includes(value) ? currentValues.filter((item) => item !== value) : [...currentValues, value]);
  }

  function resetFilters() {
    setSelectedSort("featured");
    setSelectedDeliveryTypes([]);
    setSelectedProductTypes([]);
    setSelectedMadeIn([]);
    setSelectedBrands([]);
    setSelectedPriceBand("all");
    setMinPrice(0);
    setMaxPrice(500);
  }

  function matchesPriceBand(product: ProductItem) {
    switch (selectedPriceBand) {
      case "under-5":
        return product.price < 5;
      case "5-10":
        return product.price >= 5 && product.price <= 10;
      case "10-15":
        return product.price >= 10 && product.price <= 15;
      case "15-25":
        return product.price >= 15 && product.price <= 25;
      case "25-plus":
        return product.price >= 25;
      default:
        return true;
    }
  }

  const filteredProducts = useMemo(() => {
    const nextProducts = products.filter((product) => {
      if (selectedDeliveryTypes.length && !selectedDeliveryTypes.includes(product.deliveryType)) {
        return false;
      }

      if (selectedProductTypes.length && !selectedProductTypes.includes(product.productType)) {
        return false;
      }

      if (selectedMadeIn.length && !selectedMadeIn.includes(product.madeIn)) {
        return false;
      }

      if (selectedBrands.length && !selectedBrands.includes(product.brand)) {
        return false;
      }

      if (!matchesPriceBand(product)) {
        return false;
      }

      if (product.price < minPrice || product.price > maxPrice) {
        return false;
      }

      return true;
    });

    switch (selectedSort) {
      case "best-selling":
        return [...nextProducts].sort((left, right) => right.soldCount - left.soldCount);
      case "price-low":
        return [...nextProducts].sort((left, right) => left.price - right.price);
      case "price-high":
        return [...nextProducts].sort((left, right) => right.price - left.price);
      default:
        return nextProducts;
    }
  }, [maxPrice, minPrice, products, selectedBrands, selectedDeliveryTypes, selectedMadeIn, selectedPriceBand, selectedProductTypes, selectedSort]);

  return (
    <div className="bg-[#fcfcfd] pb-16 pt-[132px] sm:pt-[146px] lg:pt-[154px]">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[290px_minmax(0,1fr)] lg:items-start">
          <div className="hidden lg:block">
            <FilterPanel
              collapsedSections={collapsedSections}
              maxPrice={maxPrice}
              minPrice={minPrice}
              onReset={resetFilters}
              onToggleSection={(section) => setCollapsedSections((current) => ({ ...current, [section]: !current[section] }))}
              selectedBrands={selectedBrands}
              selectedDeliveryTypes={selectedDeliveryTypes}
              selectedMadeIn={selectedMadeIn}
              selectedPriceBand={selectedPriceBand}
              selectedProductTypes={selectedProductTypes}
              setMaxPrice={setMaxPrice}
              setMinPrice={setMinPrice}
              setSelectedPriceBand={setSelectedPriceBand}
              toggleBrand={(value) => toggleListValue(value, selectedBrands, setSelectedBrands)}
              toggleDeliveryType={(value) => toggleListValue(value, selectedDeliveryTypes, setSelectedDeliveryTypes)}
              toggleMadeIn={(value) => toggleListValue(value, selectedMadeIn, setSelectedMadeIn)}
              toggleProductType={(value) => toggleListValue(value, selectedProductTypes, setSelectedProductTypes)}
            />
          </div>

          <div className="grid gap-5">
            <SectionShell>
              <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div className="grid gap-2">
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-citrus-500">Category Listing</p>
                  <h1 className="text-3xl font-black tracking-[-0.03em] text-neutral-950 sm:text-4xl">{category.name}</h1>
                  <p className="text-sm font-medium text-neutral-500">{filteredProducts.length} products shown</p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <button
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-neutral-200 px-4 text-sm font-bold text-neutral-800 transition hover:border-neutral-300 hover:bg-neutral-50 lg:hidden"
                    onClick={() => setIsFilterDrawerOpen(true)}
                    type="button"
                  >
                    <FilterIcon />
                    <span>Filters</span>
                  </button>

                  <div className="relative" ref={sortReference}>
                    <button
                      className="inline-flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl border-2 border-neutral-900 bg-white px-4 text-sm font-bold text-neutral-900 transition hover:border-neutral-700 sm:min-w-[290px]"
                      onClick={() => setIsSortOpen((current) => !current)}
                      type="button"
                    >
                      <span className="inline-flex items-center gap-3">
                        <FilterIcon />
                        <span>{sortOptions.find((option) => option.value === selectedSort)?.label}</span>
                      </span>
                      <Chevron open={isSortOpen} />
                    </button>

                    {isSortOpen ? (
                      <div className="absolute right-0 top-[calc(100%+10px)] z-[1200] min-w-full overflow-hidden rounded-[24px] border border-neutral-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.14)]">
                        {sortOptions.map((option) => (
                          <button
                            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-lg font-semibold text-neutral-900 transition hover:bg-neutral-50"
                            key={option.value}
                            onClick={() => {
                              setSelectedSort(option.value);
                              setIsSortOpen(false);
                            }}
                            type="button"
                          >
                            <span>{option.label}</span>
                            <span className={selectedSort === option.value ? "text-sky-500" : "text-transparent"}>
                              <CheckIcon />
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </SectionShell>

            {filteredProducts.length ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} layout="grid" product={product} />
                ))}
              </div>
            ) : (
              <SectionShell>
                <div className="grid gap-2">
                  <h2 className="text-2xl font-black text-neutral-950">No matching products</h2>
                  <p className="text-sm leading-7 text-neutral-600">Try resetting filters or widening the price range to see more items.</p>
                </div>
              </SectionShell>
            )}
          </div>
        </div>
      </div>

      {isFilterDrawerOpen ? (
        <div className="fixed inset-0 z-[1300] flex justify-end bg-neutral-950/40 lg:hidden" onClick={() => setIsFilterDrawerOpen(false)}>
          <div className="h-full w-full max-w-[360px] overflow-y-auto bg-[#f8fbff] p-4 shadow-[0_24px_60px_rgba(15,23,42,0.24)]" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-2xl font-black text-neutral-950">Filters</h2>
              <button
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-neutral-200 bg-white px-4 text-sm font-bold text-neutral-700"
                onClick={() => setIsFilterDrawerOpen(false)}
                type="button"
              >
                Done
              </button>
            </div>
            <FilterPanel
              collapsedSections={collapsedSections}
              maxPrice={maxPrice}
              minPrice={minPrice}
              onReset={resetFilters}
              onToggleSection={(section) => setCollapsedSections((current) => ({ ...current, [section]: !current[section] }))}
              selectedBrands={selectedBrands}
              selectedDeliveryTypes={selectedDeliveryTypes}
              selectedMadeIn={selectedMadeIn}
              selectedPriceBand={selectedPriceBand}
              selectedProductTypes={selectedProductTypes}
              setMaxPrice={setMaxPrice}
              setMinPrice={setMinPrice}
              setSelectedPriceBand={setSelectedPriceBand}
              toggleBrand={(value) => toggleListValue(value, selectedBrands, setSelectedBrands)}
              toggleDeliveryType={(value) => toggleListValue(value, selectedDeliveryTypes, setSelectedDeliveryTypes)}
              toggleMadeIn={(value) => toggleListValue(value, selectedMadeIn, setSelectedMadeIn)}
              toggleProductType={(value) => toggleListValue(value, selectedProductTypes, setSelectedProductTypes)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
