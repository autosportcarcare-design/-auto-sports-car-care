"use client";
import { useState, useEffect, useRef } from "react";
export function MediaImage({ url, alt }: { url: string; alt: string }) {
  const [errorUrl, setErrorUrl] = useState("");
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const image = ref.current;
    if (image?.complete && image.naturalWidth === 0) setErrorUrl(url);
  }, [url]);
  return errorUrl === url ? (
    <p>Product image is unavailable.</p>
  ) : (
    <img
      ref={ref}
      src={url}
      alt={alt}
      loading="lazy"
      onError={() => setErrorUrl(url)}
    />
  );
}
export function ProductVideo({ url, title }: { url: string; title: string }) {
  const [errorUrl, setErrorUrl] = useState("");
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (ref.current?.error) setErrorUrl(url);
  }, [url]);
  return (
    <figure>
      {errorUrl === url ? (
        <p>
          Video is unavailable.{" "}
          <a href={url} target="_blank" rel="noreferrer">
            Open source
          </a>
        </p>
      ) : (
        <video
          ref={ref}
          controls
          preload="none"
          src={url}
          onError={() => setErrorUrl(url)}
          aria-label={title}
        />
      )}
      <figcaption>{title}</figcaption>
    </figure>
  );
}
