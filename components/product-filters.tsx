"use client"

import { useState, useTransition } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface ProductFiltersProps {
  selectedCategory?: string
  minPrice?: number
  maxPrice?: number
  sort?: string
}

const categories = ["All", "Electronics", "Clothing", "Home & Kitchen", "Beauty"]

const sortOptions = [
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
]

export default function ProductFilters({ selectedCategory, minPrice = 0, maxPrice = 1000, sort }: ProductFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const [priceRange, setPriceRange] = useState<[number, number]>([minPrice || 0, maxPrice || 1000])

  const createQueryString = (params: Record<string, string | number | null>) => {
    const searchParams = new URLSearchParams(window.location.search)

    Object.entries(params).forEach(([key, value]) => {
      if (value === null) {
        searchParams.delete(key)
      } else {
        searchParams.set(key, value.toString())
      }
    })

    return searchParams.toString()
  }

  const handleCategoryChange = (category: string) => {
    startTransition(() => {
      const query = createQueryString({
        category: category === "All" ? null : category,
      })
      router.push(`${pathname}?${query}`)
    })
  }

  const handleSortChange = (value: string) => {
    startTransition(() => {
      const query = createQueryString({ sort: value })
      router.push(`${pathname}?${query}`)
    })
  }

  const handlePriceChange = () => {
    startTransition(() => {
      const query = createQueryString({
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
      })
      router.push(`${pathname}?${query}`)
    })
  }

  const handleReset = () => {
    startTransition(() => {
      router.push(pathname)
      setPriceRange([0, 1000])
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Filters</h3>
        <Button variant="outline" size="sm" onClick={handleReset} className="mb-4">
          Reset Filters
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={["categories", "price", "sort"]}>
        <AccordionItem value="categories">
          <AccordionTrigger>Categories</AccordionTrigger>
          <AccordionContent>
            <RadioGroup value={selectedCategory || "All"} onValueChange={handleCategoryChange} className="space-y-2">
              {categories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <RadioGroupItem value={category} id={category} />
                  <Label htmlFor={category}>{category}</Label>
                </div>
              ))}
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price">
          <AccordionTrigger>Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Slider
                value={priceRange}
                min={0}
                max={1000}
                step={10}
                onValueChange={(value) => setPriceRange(value as [number, number])}
                className="my-6"
              />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="minPrice">Min</Label>
                  <Input
                    id="minPrice"
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    className="w-24"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="maxPrice">Max</Label>
                  <Input
                    id="maxPrice"
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-24"
                  />
                </div>
              </div>

              <Button size="sm" onClick={handlePriceChange} disabled={isPending}>
                Apply
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="sort">
          <AccordionTrigger>Sort By</AccordionTrigger>
          <AccordionContent>
            <RadioGroup value={sort || ""} onValueChange={handleSortChange} className="space-y-2">
              {sortOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value}>{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

