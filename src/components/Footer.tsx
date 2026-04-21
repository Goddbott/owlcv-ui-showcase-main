import { Link } from "@tanstack/react-router";
import { Twitter, Linkedin, Github, MessageCircle } from "lucide-react";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface-2/60">
      <div className="mx-auto max-w-7xl px-5 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-4 text-sm text-muted-foreground">hello@owlcv.app</p>
            <p className="mt-2 text-xs text-muted-foreground">© 2026 OwlCV. All rights reserved.</p>
          </div>

          <FooterCol title="Product" items={["Features", "Templates", "AI Optimizer", "Pricing"]} />
          <FooterCol title="Company" items={["About", "Blog", "Privacy Policy", "Terms of Service"]} />

          <div>
            <h4 className="mb-4 text-sm font-bold text-foreground">Community</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2 hover:text-primary cursor-pointer"><Twitter className="h-4 w-4" /> Twitter / X</li>
              <li className="flex items-center gap-2 hover:text-primary cursor-pointer"><Linkedin className="h-4 w-4" /> LinkedIn</li>
              <li className="flex items-center gap-2 hover:text-primary cursor-pointer"><MessageCircle className="h-4 w-4" /> Discord</li>
              <li className="flex items-center gap-2 hover:text-primary cursor-pointer"><Github className="h-4 w-4" /> GitHub</li>
            </ul>
            <Link to="/" className="btn-primary mt-6">
              <MessageCircle className="h-4 w-4" /> Join Our Discord
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="mb-4 text-sm font-bold text-foreground">{title}</h4>
      <ul className="space-y-3 text-sm text-muted-foreground">
        {items.map((i) => (<li key={i} className="hover:text-primary cursor-pointer">{i}</li>))}
      </ul>
    </div>
  );
}
