import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-12 px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* About */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Japanese Story</h3>
            <p className="text-sm text-muted-foreground">
              Learn Japanese through engaging stories. Practice reading, improve your vocabulary, and enhance your language skills.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/before-reading" className="text-muted-foreground hover:text-foreground transition-colors">
                  Before Reading
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Levels */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Japanese Levels</h3>
            <ul className="space-y-2 text-sm">
              <li className="text-muted-foreground">N6 - Hiragana Katakana</li>
              <li className="text-muted-foreground">N5 - Basic</li>
              <li className="text-muted-foreground">N4 - Elementary</li>
              <li className="text-muted-foreground">N3 - Intermediate</li>
              <li className="text-muted-foreground">N2 - Pre-Advanced</li>
              <li className="text-muted-foreground">N1 - Advanced</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Stories for all levels</li>
              <li>Furigana support</li>
              <li>Interactive learning</li>
              <li>Free & Premium content</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Japanese Story. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
