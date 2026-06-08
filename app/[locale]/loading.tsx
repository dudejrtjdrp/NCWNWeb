export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-nwcn-green/20 border-t-nwcn-green rounded-full animate-spin" />
        <p className="font-body text-xs text-nwcn-text-sub tracking-widest">LOADING</p>
      </div>
    </div>
  )
}
