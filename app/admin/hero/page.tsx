import { HeroSlideEditor } from "@/components/admin/hero-slide-editor"
import { Separator } from "@/components/ui/separator"

export default function AdminHeroPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Hero Carousel</h3>
        <p className="text-sm text-muted-foreground">
          Manage the slides that appear on the home page main carousel.
        </p>
      </div>
      <Separator />
      <HeroSlideEditor />
    </div>
  )
}
