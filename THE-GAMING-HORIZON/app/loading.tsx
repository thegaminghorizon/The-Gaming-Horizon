export default function Loading() {
  return (
    <main className="min-h-screen px-4 pb-24 pt-[calc(var(--banner-h,0px)+var(--nav-h,64px)+3rem)] sm:px-6" aria-label="Loading page">
      <div className="mx-auto max-w-6xl animate-pulse">
        <div className="mx-auto h-7 w-48 rounded-full bg-muted/70" />
        <div className="mx-auto mt-7 h-14 max-w-3xl rounded-2xl bg-muted/70 sm:h-20" />
        <div className="mx-auto mt-5 h-5 max-w-2xl rounded-full bg-muted/55" />
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-48 rounded-3xl border border-border/60 bg-card/60" />
          ))}
        </div>
      </div>
    </main>
  )
}
