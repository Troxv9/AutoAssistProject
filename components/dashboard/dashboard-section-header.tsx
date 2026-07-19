type DashboardSectionHeaderProps = {
  title: string
  description: string
}

export function DashboardSectionHeader({ title, description }: DashboardSectionHeaderProps) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-semibold tracking-tight sm:text-lg">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
