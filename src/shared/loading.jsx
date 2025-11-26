export function Loading() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 w-full h-40">

      <span className='rounded-full  border-4 border-zinc-600 border-t-white animate-spin w-10 h-10'></span>
      <span className="animate-pulse font-semibold text-zinc-600 text-xl">Loading</span>

    </div>
  )
}