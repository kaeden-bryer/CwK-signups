import { Github, Instagram, Linkedin } from "lucide-react";

const socials = [
  { href: "https://github.com/kaeden-bryer", icon: Github, label: "GitHub" },
  {
    href: "https://www.instagram.com/kaeden_bryer",
    icon: Instagram,
    label: "Instagram",
  },
  {
    href: "https://www.linkedin.com/in/kaeden-bryer/",
    icon: Linkedin,
    label: "LinkedIn",
  },
] as const;

export function Footer() {
  return (
    <div
      className="relative h-[200px]"
      style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
    >
      <div className="fixed bottom-0 h-[200px] w-full bg-[#2d1b3d]">
        <footer className="mx-auto flex h-full max-w-5xl flex-col items-center justify-center gap-4 px-4">
          <p className="text-md text-[#F8D7FF]">
            Made with ❤️ by Kaeden Bryer
          </p>
          <a
            href="https://buymeacoffee.com/kaedenbryer"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#F8D7FF] transition-colors hover:text-white"
          >
            Buy me a Coffee☕
          </a>
          <div className="flex items-center gap-4">
            {socials.map(({ href, icon: Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="rounded-md p-2 transition-colors hover:bg-white/10"
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>


        </footer>
      </div>
    </div>
  );
}
