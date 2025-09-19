import { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";

export default function SouthernCrownLanding() {
  const [open, setOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // robust body scroll lock when popup is open
  const scrollLockY = useRef(0);

  /** Wait until the browser can play: readyState >= 3 or 'canplay' event. */
  const waitForCanPlay = (audio: HTMLAudioElement) =>
    new Promise<void>((resolve, reject) => {
      if (audio.readyState >= 3) return resolve();

      const onCanPlay = () => {
        cleanup();
        resolve();
      };
      const onError = () => {
        cleanup();
        reject(new Error("audio error"));
      };
      const onTimeout = window.setTimeout(() => {
        cleanup();
        reject(new Error("audio timeout"));
      }, 5000);

      const cleanup = () => {
        audio.removeEventListener("canplay", onCanPlay);
        audio.removeEventListener("error", onError);
        window.clearTimeout(onTimeout);
      };

      audio.addEventListener("canplay", onCanPlay);
      audio.addEventListener("error", onError);
      try {
        audio.load();
      } catch {}
    });

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      setAudioError(null);

      // Pause if already playing
      if (!audio.paused && !audio.ended) {
        audio.pause();
        setIsPlaying(false);
        return;
      }

      // Ensure audio is ready
      if (!audioReady) {
        setAudioLoading(true);
        await waitForCanPlay(audio);
        setAudioReady(true);
        setAudioLoading(false);
      }

      // Restart from beginning if ended
      if (audio.ended || (audio.duration && audio.currentTime >= audio.duration - 0.05)) {
        audio.currentTime = 0;
      }

      const p = audio.play();
      if (p && typeof (p as Promise<void>).then === "function") {
        await p;
      }
      setIsPlaying(true);
    } catch (err) {
      console.error("Audio play failed:", err);
      setAudioLoading(false);
      setIsPlaying(false);
      setAudioError("Can't play preview. Check /assets/preview.mp3 path and CORS/404.");
    }
  };

  // Keep UI in sync with the real audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onEnded = () => {
      setIsPlaying(false);
      try {
        if (audioRef.current) audioRef.current.currentTime = 0; // reset to start after finishing
      } catch {}
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onCanPlay = () => setAudioReady(true);
    const onError = () => setAudioError("Audio file failed to load.");

    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("error", onError);
    };
  }, []);

  // disable background scroll when popup is open (robust, incl. iOS)
  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;
    if (open) {
      scrollLockY.current = window.scrollY || window.pageYOffset;
      body.style.overflow = "hidden";
      body.style.position = "fixed";
      body.style.top = `-${scrollLockY.current}px`;
      body.style.width = "100%";
      // Prevent scroll chaining on mobile
      html.style.overscrollBehavior = "contain";
    } else {
      body.style.overflow = "";
      body.style.position = "";
      const y = -parseInt(body.style.top || "0", 10) || scrollLockY.current || 0;
      body.style.top = "";
      body.style.width = "";
      html.style.overscrollBehavior = "";
      if (y) window.scrollTo(0, y);
    }
    return () => {
      body.style.overflow = "";
      body.style.position = "";
      body.style.top = "";
      body.style.width = "";
      html.style.overscrollBehavior = "";
    };
  }, [open]);

  // FAVICON SETUP — explicit sizes to avoid stretching
  useEffect(() => {
    const upsert = (id: string, attrs: Record<string, string>) => {
      let el = document.getElementById(id) as HTMLLinkElement | null;
      if (!el) {
        el = document.createElement("link");
        el.id = id;
        document.head.appendChild(el);
      }
      Object.entries(attrs).forEach(([k, v]) => el!.setAttribute(k, v));
    };
    // ICO fallbacks
    upsert("favicon-ico", { rel: "icon", type: "image/x-icon", href: "/favicon.ico" });
    upsert("favicon-ico-shortcut", { rel: "shortcut icon", type: "image/x-icon", href: "/favicon.ico" });
    // PNG sizes (no stretching)
    upsert("favicon-32", { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" });
    upsert("favicon-16", { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" });
    // iOS
    upsert("apple-touch-icon", { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" });

    let meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", "#000000");
  }, []);

  // --- SMOKE TESTS (DEV ONLY) ---
  const runSmokeTests = () => {
    try {
      const results: string[] = [];
      const fav = document.getElementById("favicon-ico") as HTMLLinkElement | null;
      results.push(fav && fav.getAttribute("href") === "/favicon.ico" ? "favicon: ok" : "favicon: missing");

      const audio = audioRef.current;
      results.push(audio ? "audio element: ok" : "audio element: missing");

      const halo = document.querySelector(".pointer-events-none.fixed.inset-0.z-0");
      results.push(halo ? "halo wrapper: ok" : "halo wrapper: missing");

      // PNG icon check
      const topIcons = Array.from(document.querySelectorAll("nav img")) as HTMLImageElement[];
      const pngOk = topIcons.length > 0 && topIcons.every((i) => i.src.includes(".png"));
      results.push(pngOk ? "top icons png: ok" : "top icons png: missing");

      // Spotify button contains an <img> (no stray markers)
      const spLink = document.querySelector('[data-testid="spotify-link"]') as HTMLAnchorElement | null;
      const hasImg = !!spLink?.querySelector('img[alt="Spotify"]');
      results.push(hasImg ? "spotify img: ok" : "spotify img: missing");

      // Mobile hero presence
      const mobileHero = document.querySelector('[data-testid="mobile-hero"]');
      results.push(mobileHero ? "mobile hero: ok" : "mobile hero: missing");

      // eslint-disable-next-line no-console
      console.log("[SMOKE TESTS]", results.join(" | "));
    } catch {}
  };

  useEffect(() => {
    if (typeof window !== "undefined" && import.meta && (import.meta as any).env?.DEV) {
      runSmokeTests();
    }
  }, []);

  return (
    <div className="min-h-screen w-full bg-black text-white relative flex items-center justify-center">
      {/* background halo */}
      <div className="pointer-events-none fixed inset-0 z-0 hidden sm:flex items-center justify-center">
        <div className="h-[1400px] w-[1400px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.18)_0%,rgba(0,0,0,0)_70%)] blur-3xl" />
      </div>

      {/* central black card */}
      <main className="relative z-10 mx-auto w-full sm:w-[94vw] sm:max-w-[820px] flex flex-col items-center px-5 sm:px-10 pb-14 pt-0 sm:pt-14 md:pt-20 bg-black rounded-none sm:rounded-2xl shadow-none sm:shadow-lg mt-0 sm:mt-[6vh] mb-0 sm:mb-[15vh]">
        {/* HERO: mobile full-bleed with gradient & title overlay */}
        <div className="w-full sm:hidden mx-[calc(50%-50vw)]" data-testid="mobile-hero">
          <div className="relative h-[40vh] min-h-[280px] w-full overflow-hidden rounded-t-2xl">
            <img src="/assets/logo.png" alt="southern crown logo" className="absolute inset-0 h-full w-full object-cover" />
            {/* bottom gradient for readability */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            {/* title overlay on the image */}
            <div className="absolute bottom-4 left-0 right-0 px-5">
              <p className="text-5xl font-bold leading-none text-center">southern crown</p>
            </div>
          </div>
        </div>

        {/* HERO: tablet/desktop centered card */}
        <div className="hidden sm:flex w-full p-6 md:p-10 justify-center" data-testid="desktop-hero">
          <img
            src="/assets/logo.png"
            alt="southern crown logo"
            className="h-[24.375rem] w-[24.375rem] md:h-[32.5rem] md:w-[32.5rem] rounded-2xl object-cover"
          />
        </div>

        <h1 className="hidden sm:block mt-6 text-6xl md:text-7xl font-bold tracking-wide leading-tight md:mt-8">
          southern crown
        </h1>

        {/* SOCIAL ICONS — PNGs inverted to white */}
        <nav className="mt-4 flex items-center gap-5 md:gap-6">
          <a href="#" aria-label="Spotify" className="transition-opacity hover:opacity-80">
            <img src="/assets/icons/spotify.png" className="h-6 w-6 invert" alt="Spotify" />
          </a>
          <a href="#" aria-label="Apple Music" className="transition-opacity hover:opacity-80">
            <img src="/assets/icons/apple.png" className="h-6 w-6 invert" alt="Apple Music" />
          </a>
          <a href="#" aria-label="Instagram" className="transition-opacity hover:opacity-80">
            <img src="/assets/icons/instagram.png" className="h-6 w-6 invert" alt="Instagram" />
          </a>
          <a href="#" aria-label="YouTube" className="transition-opacity hover:opacity-80">
            <img src="/assets/icons/youtube.png" className="h-6 w-6 invert" alt="YouTube" />
          </a>
          <a href="#" aria-label="Facebook" className="transition-opacity hover:opacity-80">
            <img src="/assets/icons/facebook.png" className="h-6 w-6 invert" alt="Facebook" />
          </a>
        </nav>

        {/* TRACK SECTION */}
        <section className="mt-10 w-full" data-testid="track-section">
          <div className="rounded-xl bg-neutral-900/80 p-4 sm:p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
            <h2 className="mb-4 text-xl font-semibold md:text-2xl">Follow You – Listen Now.</h2>

            <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
              <div className="relative h-24 w-24 overflow-hidden rounded-lg sm:h-28 sm:w-28 md:h-40 md:w-40">
                {/* COVER — replace with your file */}
                <img src="/assets/cover.jpg" alt="Follow You cover" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-pressed={isPlaying}
                  className="absolute inset-0 grid place-items-center bg-black/20 backdrop-blur-[0.5px]"
                  aria-label={isPlaying ? "Pause preview" : "Play preview"}
                  disabled={audioLoading}
                >
                  {isPlaying ? (
                    <Pause className="h-12 w-12 drop-shadow opacity-100" />
                  ) : (
                    <Play className="h-12 w-12 drop-shadow opacity-100" />
                  )}
                </button>
              </div>

              <div className="min-w-0 flex-1">
                {/* Bigger title & artist */}
                <p className="truncate text-2xl md:text-3xl font-semibold">Follow You</p>
                <p className="mt-0.5 text-lg md:text-xl text-neutral-400">southern crown</p>
              </div>
            </div>

            {/* Audio error (English) */}
            {audioError && (
              <p className="mt-3 text-xs text-red-400" aria-live="polite">{audioError}</p>
            )}

            {/* Streaming actions capsule */}
            <div className="mt-5" data-testid="actions-capsule">
              <div className="relative w-full rounded-full bg-neutral-950/90 py-3 sm:py-5">
                <div className="pointer-events-none absolute inset-y-1 sm:inset-y-2 left-[33.333%] w-px bg-white/20" />
                <div className="pointer-events-none absolute inset-y-1 sm:inset-y-2 left-[66.666%] w-px bg-white/20" />

                <div className="grid grid-cols-3 items-center text-center text-white/90">
                  <a href="#" data-testid="spotify-link" className="group flex items-center justify-center gap-2 text-sm sm:text-base md:text-lg font-semibold hover:text-white">
                    <img src="/assets/icons/spotify.png" alt="Spotify" className="h-4 w-4 sm:h-5 sm:w-5 invert opacity-90 group-hover:opacity-100" />
                    <span>Spotify</span>
                  </a>
                  <a href="#" className="text-sm sm:text-base md:text-lg font-semibold hover:text-white">Music</a>
                  <button data-testid="more-button" onClick={() => setOpen(true)} className="text-sm sm:text-base md:text-lg font-semibold hover:text-white">More</button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-12 w-full text-center text-[11px] text-neutral-500 md:mt-16">
          <p>Powered by southern crown</p>
        </footer>
      </main>

      {/* AUDIO PREVIEW */}
      <audio ref={audioRef} src="/assets/preview.mp3" preload="auto" playsInline />

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 sm:p-6 overflow-y-auto overscroll-contain"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-[520px] rounded-2xl bg-white text-black shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rounded-t-2xl bg-neutral-800 p-8 text-white">
              <div className="flex items-center gap-6">
                {/* COVER IN POPUP */}
                <img src="/assets/cover.jpg" alt="Follow You cover" className="h-28 w-28 rounded-lg object-cover" />
                <div>
                  <p className="text-xl font-semibold">Follow You</p>
                  <p className="text-sm text-neutral-300">southern crown</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <ul className="space-y-6">
                {[
                  { name: "Spotify", icon: "/assets/icons/spotify.png", href: "#" },
                  { name: "Apple Music", icon: "/assets/icons/apple.png", href: "#" },
                  { name: "YouTube Music", icon: "/assets/icons/ytmusic.png", href: "#" },
                  { name: "Deezer", icon: "/assets/icons/deezer.png", href: "#" },
                ].map((p) => (
                  <li key={p.name} className="flex items-center justify-between border-b border-neutral-200 pb-4 last:border-b-0">
                    <span className="flex items-center gap-3">
                      <img src={p.icon} alt="" className="h-6 w-6" />
                      <span className="text-[16px] font-medium">{p.name}</span>
                    </span>
                    <a
                      href={p.href}
                      className="rounded-full border border-black px-5 py-2 text-sm font-semibold hover:bg-black hover:text-white"
                    >
                      Play
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
