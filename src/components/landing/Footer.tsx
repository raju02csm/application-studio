export const Footer = () => (
  <footer className="border-t border-border bg-background">
    <div className="container py-12 grid md:grid-cols-4 gap-8">
      <div className="md:col-span-2 space-y-3">
        <div className="flex items-center gap-2 font-bold text-lg">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-primary text-primary-foreground">L</span>
          LetMeApply
        </div>
        <p className="text-sm text-muted-foreground max-w-sm">
          AI-powered job application assistant. Tailor your resume, beat the ATS, land more interviews.
        </p>
      </div>
      <div>
        <div className="font-semibold mb-3 text-sm">Product</div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li><a href="#features" className="hover:text-foreground">Features</a></li>
          <li><a href="#tool" className="hover:text-foreground">Try it free</a></li>
          <li><a href="#faq" className="hover:text-foreground">FAQ</a></li>
        </ul>
      </div>
      <div>
        <div className="font-semibold mb-3 text-sm">Company</div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li><a href="#" className="hover:text-foreground">Privacy</a></li>
          <li><a href="#" className="hover:text-foreground">Terms</a></li>
          <li><a href="#" className="hover:text-foreground">Contact</a></li>
        </ul>
      </div>
    </div>
    <div className="border-t border-border">
      <div className="container py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} LetMeApply. Built for job seekers who refuse to settle.
      </div>
    </div>
  </footer>
);
