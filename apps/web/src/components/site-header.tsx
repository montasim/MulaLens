import { MenuIcon } from 'lucide-react'

import { BrandMark } from '#/components/brand-mark'
import { ThemeToggle } from '#/components/theme-toggle'
import { Button } from '#/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '#/components/ui/sheet'

export const releaseUrl =
  'https://github.com/montasim/MulaLens/releases/latest'

const links = [
  { href: '#inside', label: 'What you get' },
  { href: '#how', label: 'How it works' },
  { href: '#faq', label: 'FAQ' },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-18 max-w-[1400px] items-center px-5 lg:px-10">
        <a href="#top" className="flex items-center gap-3" aria-label="MulaLens home">
          <BrandMark />
          <span className="text-[15px] font-bold tracking-[-0.03em] sm:text-base">
            Mula<span className="text-brand-soft">Lens</span>
          </span>
        </a>

        <nav className="mx-auto hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="nav-link">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <ThemeToggle />
          <Button asChild variant="brand" className="hidden shadow-brand md:inline-flex">
            <a href={releaseUrl} target="_blank" rel="noreferrer">
              Get extension
            </a>
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden" aria-label="Open navigation">
                <MenuIcon />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader className="border-b border-border pr-14">
                <SheetTitle className="flex items-center gap-3">
                  <BrandMark className="size-8" /> MulaLens
                </SheetTitle>
                <SheetDescription>Research before you join.</SheetDescription>
              </SheetHeader>
              <nav className="flex flex-col p-3" aria-label="Mobile navigation">
                {links.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <a href={link.href} className="px-3 py-3.5 font-semibold hover:bg-muted">
                      {link.label}
                    </a>
                  </SheetClose>
                ))}
              </nav>
              <div className="mt-auto p-4">
                <Button asChild variant="brand" className="w-full">
                  <a href={releaseUrl} target="_blank" rel="noreferrer">
                    Get extension
                  </a>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
