import { useEffect, useRef } from "react";

interface AudioProps {
  src: string;
  title?: string;
}

interface APlayerInstance {
  destroy: () => void;
}

interface APlayerConstructor {
  new (options: {
    container: HTMLDivElement;
    autoplay: boolean;
    preload: string;
    theme: string;
    loop: string;
    audio: {
      url: string;
      title: string;
      author: string;
    };
  }): APlayerInstance;
}

declare global {
  interface Window {
    APlayer?: APlayerConstructor;
  }
}

export function Audio({ src, title }: AudioProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let APlayer: APlayerConstructor | undefined;
    let player: APlayerInstance | undefined;

    const initPlayer = async () => {
      try {
        APlayer = window.APlayer;

        if (!APlayer || !containerRef.current) return;

        player = new APlayer({
          container: containerRef.current,
          autoplay: false,
          preload: "metadata",
          theme: "#FADFA3",
          loop: "all",
          audio: {
            url: encodeURI(src),
            title: title || src,
            author: "",
          },
        });
      } catch (e) {
        console.error("Failed to initialize APlayer:", e);
      }
    };

    if (window.APlayer) {
      initPlayer();
    } else {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.js";
      script.onload = initPlayer;
      document.head.appendChild(script);
    }

    return () => {
      player?.destroy();
    };
  }, [src, title]);

  return (
    <div ref={containerRef} className="my-4" style={{ minWidth: "300px", maxWidth: "500px" }} />
  );
}

interface VideoProps {
  src: string;
  poster?: string;
}

export function Video({ src, poster }: VideoProps) {
  return (
    <div className="my-4">
      <video
        src={src}
        poster={poster}
        controls
        className="max-w-full"
        style={{ maxHeight: "500px" }}
      >
        您的浏览器不支持视频播放
      </video>
    </div>
  );
}
