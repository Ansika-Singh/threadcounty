import React, { useEffect, useRef, useState } from "react";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // milliseconds
  duration?: number; // milliseconds
  distance?: string; // offset distance
  direction?: "up" | "down" | "left" | "right" | "none";
}

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  duration = 600,
  distance = "20px",
  direction = "up",
}: ScrollRevealProps) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.05,
        rootMargin: "0px 0px -40px 0px", // triggers slightly before entering viewport
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  const getTransform = () => {
    if (!isIntersecting) {
      switch (direction) {
        case "up":
          return `translateY(${distance})`;
        case "down":
          return `translateY(-${distance})`;
        case "left":
          return `translateX(${distance})`;
        case "right":
          return `translateX(-${distance})`;
        default:
          return "none";
      }
    }
    return "translate(0, 0)";
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isIntersecting ? 1 : 0,
        transform: getTransform(),
        transitionProperty: "opacity, transform",
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {children}
    </div>
  );
}
