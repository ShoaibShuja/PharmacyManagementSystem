import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const themeScript = `try { const stored = localStorage.getItem("darman-theme"); const dark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches; document.documentElement.classList.toggle("dark", dark); document.documentElement.style.colorScheme = dark ? "dark" : "light"; } catch {}`;

// A device can retain an old page after a deployment while its referenced
// Next.js chunks no longer exist. Recover once with a fresh document request
// instead of leaving the user on a chunk-load or module-load error screen.
const assetRecoveryScript = `(function(){var key="darman-asset-recovery";var patterns=["chunkloaderror","loading chunk","failed to fetch dynamically imported module","importing a module script failed","error loading dynamically imported module","failed to load module script"];
function message(value){try{return String(value&&value.message?value.message:value).toLowerCase();}catch(error){return "";}}
function recover(){var now=Date.now();var previous=0;try{previous=Number(sessionStorage.getItem(key)||0);}catch(error){}if(now-previous<30000)return;try{sessionStorage.setItem(key,String(now));}catch(error){}location.reload();}
function isModuleFailure(value){var text=message(value);for(var index=0;index<patterns.length;index++){if(text.indexOf(patterns[index])!==-1)return true;}return false;}
addEventListener("error",function(event){var target=event.target;if(target&&target!==window){var tag=target.tagName;if((tag==="SCRIPT"||tag==="LINK")&&String(target.src||target.href||"").indexOf("/_next/static/")!==-1){recover();return;}}if(isModuleFailure(event.error||event.message))recover();},true);
addEventListener("unhandledrejection",function(event){if(isModuleFailure(event.reason))recover();});})();`;

export const metadata: Metadata = {
  applicationName: "Darman",
  title: {
    default: "Darman",
    template: "%s | Darman",
  },
  description: "Simple pharmacy inventory, sales, purchasing, and reporting.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: assetRecoveryScript }} />
      </head>
      <body className="min-h-full bg-background text-foreground">
        <ThemeProvider>
          <QueryProvider>{children}</QueryProvider>
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
