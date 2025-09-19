import { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";

export default function SouthernCrownLanding() {
  const [open, setOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previewTimer = useRef<number | null>(null);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      if (previewTimer.current) window.clearTimeout(previewTimer.current);
    } else {
      audio.currentTime = 0;
      audio.play();
      setIsPlaying(true);
      if (previewTimer.current) window.clearTimeout(previewTimer.current);
      previewTimer.current = window.setTimeout(() => {
        audio.pause();
        setIsPlaying(false);
      }, 12000);
    }
  };

  useEffect(() => () => {
    if (previewTimer.current) window.clearTimeout(previewTimer.current);
  }, []);

  // disable body scroll when popup is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="min-h-screen w-full bg-black text-white relative flex items-center justify-center">
      {/* background halo */}
      <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center">
        <div className="h-[1400px] w-[1400px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.18)_0%,rgba(0,0,0,0)_70%)] blur-3xl" />
      </div>

      {/* central black card */}
      <main className="relative z-10 mx-auto flex max-w-[820px] flex-col items-center px-4 pb-16 pt-10 sm:pt-14 md:pt-20 bg-black rounded-2xl shadow-lg mt-[6vh] mb-[15vh]">
        <div className="p-6 md:p-10">
          {/* LOGO — замените путь "/assets/logo.png" на свой логотип */}
          <img
            src="/assets/logo.png"
            alt="southern crown logo"
            className="h-60 w-60 md:h-80 md:w-80 object-contain"
          />
        </div>

        <h1 className="mt-6 text-3xl font-bold tracking-wide md:mt-8 md:text-4xl">
          southern crown
        </h1>

        {/* СОЦИАЛЬНЫЕ ИКОНКИ — замените пути "/assets/icons/..." на свои */}
        <nav className="mt-4 flex items-center gap-5 md:gap-6">
          <a href="#" aria-label="Spotify" className="transition-opacity hover:opacity-80">
            <img src="/assets/icons/spotify.png" className="h-6 w-6" alt="Spotify" />
          </a>
          <a href="#" aria-label="Apple Music" className="transition-opacity hover:opacity-80">
            <img src="/assets/icons/apple.png" className="h-6 w-6" alt="Apple Music" />
          </a>
          <a href="#" aria-label="Instagram" className="transition-opacity hover:opacity-80">
            <img src="/assets/icons/instagram.png" className="h-6 w-6" alt="Instagram" />
          </a>
          <a href="#" aria-label="YouTube" className="transition-opacity hover:opacity-80">
            <img src="/assets/icons/youtube.png" className="h-6 w-6" alt="YouTube" />
          </a>
          <a href="#" aria-label="Facebook" className="transition-opacity hover:opacity-80">
            <img src="/assets/icons/facebook.png" className="h-6 w-6" alt="Facebook" />
          </a>
        </nav>

        {/* TRACK SECTION */}
        <section className="mt-10 w-full">
          <div className="rounded-xl bg-neutral-900/80 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
            <h2 className="mb-4 text-xl font-semibold md:text-2xl">Follow You – Listen Now.</h2>

            <div className="flex items-center gap-4 md:gap-6">
              <div className="relative h-28 w-28 overflow-hidden rounded-lg md:h-40 md:w-40">
                {/* ОБЛОЖКА ПЕСНИ — замените путь "/assets/cover.jpg" на свой файл */}
                <img src="/assets/cover.jpg" alt="Follow You cover" className="h-full w-full object-cover" />
                <button
                  onClick={togglePlay}
                  className="absolute inset-0 grid place-items-center bg-black/20 backdrop-blur-[0.5px]"
                  aria-label={isPlaying ? "Pause preview" : "Play preview"}
                >
                  {isPlaying ? (
                    <Pause className="h-12 w-12 drop-shadow opacity-100" />
                  ) : (
                    <Play className="h-12 w-12 drop-shadow opacity-100" />
                  )}
                </button>
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-medium md:text-xl">Follow You</p>
                <p className="text-sm text-neutral-400">southern crown</p>
              </div>

              <div className="hidden items-center gap-2 md:flex">
                {/* ССЫЛКИ НА СТРЕМИНГИ — замените href="#" на свои ссылки */}
                <a
                  href="#"
                  className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-black"
                >
                  Spotify
                </a>
                <a
                  href="#"
                  className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-black"
                >
                  Music
                </a>
                <button
                  onClick={() => setOpen(true)}
                  className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-black"
                >
                  More
                </button>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 md:hidden">
              <a href="#" className="flex-1 rounded-full bg-white px-4 py-2 text-center text-xs font-semibold text-black">
                Spotify
              </a>
              <a href="#" className="flex-1 rounded-full bg-white px-4 py-2 text-center text-xs font-semibold text-black">
                Music
              </a>
              <button onClick={() => setOpen(true)} className="flex-1 rounded-full bg-white px-4 py-2 text-center text-xs font-semibold text-black">
                More
              </button>
            </div>
          </div>
        </section>

        <footer className="mt-12 w-full text-center text-[11px] text-neutral-500 md:mt-16">
          <p>Powered by southern crown</p>
        </footer>
      </main>

      {/* АУДИО-ПРЕВЬЮ — замените путь "/assets/preview.mp3" на свой аудиофайл */}
      <audio ref={audioRef} src="/assets/preview.mp3" preload="auto" />

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-[520px] rounded-2xl bg-white text-black shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rounded-t-2xl bg-neutral-800 p-8 text-white">
              <div className="flex items-center gap-6">
                {/* ОБЛОЖКА В ПОП-АПЕ */}
                <img src="/assets/cover.jpg" alt="Follow You cover" className="h-28 w-28 rounded-lg object-cover" />
                <div>
                  <p className="text-xl font-semibold">Follow You</p>
                  <p className="text-sm text-neutral-300">southern crown</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <ul className="space-y-6">
                {/* СПИСОК СТРЕМИНГОВ В ПОП-АПЕ — замените иконки и href на свои */}
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
