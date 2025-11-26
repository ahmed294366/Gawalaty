"use client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useRouter } from "next/navigation"
export function Filter({ categories, category, sort ,page }) {
  const router = useRouter();
  let typeLink='';
  if(sort){
    typeLink=`page=1&sort=${sort}`
  }else{
    typeLink=`page=1`
  }
  let sortLink="";
  if(category){
    sortLink=`page=1&category=${category}`
  }else{
    sortLink=`page=1`
  }

  return (
    <div className="w-full justify-evenly flex flex-col sm:flex-row gap-4 mb-8">
      <div className="w-full sm:w-[50%]">
        <Select 
        onValueChange={(e)=>{
          router.push(`/?${typeLink}&category=${e}`)
        }}
        className='mx-auto'>
          <SelectTrigger className={"bg-gray-100 text-xl w-200 max-w-full"}>
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              className={"text-xl text-gray-600"} value="all">All Categories</SelectItem>
            {categories?.map(c => {
              return (
                <SelectItem
                  key={c.id} className={"text-xl text-gray-600"} 
                  value={c.id}>{c.name}</SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>
      <div className="w-full sm:w-[50%]">
        <Select onValueChange={(e)=>{
          router.push(`/?${sortLink}&sort=${e}`)
        }} >
          <SelectTrigger className={"bg-gray-100 text-xl  w-200 max-w-full"}>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent >
            <SelectItem
              className={"text-xl text-gray-600"} value="most-popular">Most Popular</SelectItem>

            <SelectItem
              className={"text-xl text-gray-600"} value="highest-rated">Highest Rated</SelectItem>
            <SelectItem
              className={"text-xl text-gray-600"} 
              value="price-low-high">Price: Low to High
            </SelectItem>
            <SelectItem
              className={"text-xl text-gray-600"} value="price-high-low">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
