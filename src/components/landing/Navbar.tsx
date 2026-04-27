import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#tool", label: "Try it" },
  { href: "#faq", label: "FAQ" },
];

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/70 backdrop-blur-xl">
      <nav className="container flex h-16 items-center justify-between">
        <a href="#" className="flex items-center gap-2 font-bold text-lg">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-primary text-primary-foreground shadow-md">
            L
          </span>
          <span>LetMeApply</span>
        </a>
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {l.label}
            </a>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" size="sm">Sign In</Button>
          <Button variant="hero" size="sm" asChild>
            <a href="#tool">Get Started</a>
          </Button>
        </div>
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
      </nav>
      <div className={cn("md:hidden overflow-hidden transition-all border-t border-border/50", open ? "max-h-96" : "max-h-0")}>
        <div className="container flex flex-col gap-4 py-4">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-sm font-medium">{l.label}</a>
          ))}
          <Button variant="hero" size="sm" asChild><a href="#tool">Get Started Free</a></Button>
        </div>
      </div>
    </header>
  );
};
