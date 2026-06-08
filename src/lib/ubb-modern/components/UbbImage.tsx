import React, { useState } from "react";
import { Eye, EyeOff, RotateCw, ExternalLink } from "lucide-react";

interface UbbImageProps {
  src?: string;
  children?: React.ReactNode;
  alt?: string;
  initialHidden?: boolean;
  allowToolbox?: boolean;
}

export const UbbImage: React.FC<UbbImageProps> = ({
  src,
  children,
  alt = "image",
  initialHidden = false,
  allowToolbox = true,
}) => {
  const finalSrc = src || React.Children.toArray(children).join("").trim();

  const [isHidden, setIsHidden] = useState(initialHidden);
  const [rotation, setRotation] = useState(0);
  const [showToolbox, setShowToolbox] = useState(false);

  if (!finalSrc) return null;

  if (isHidden) {
    return (
      <button
        onClick={() => setIsHidden(false)}
        className="inline-flex items-center px-3 py-1.5 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
      >
        <Eye className="w-4 h-4 mr-2" />
        点击查看图片
      </button>
    );
  }

  return (
    <div
      className="relative inline-block max-w-full group"
      onMouseEnter={() => setShowToolbox(true)}
      onMouseLeave={() => setShowToolbox(false)}
    >
      {allowToolbox && showToolbox && (
        <div className="absolute top-2 right-2 flex gap-1 bg-black/70 p-1 rounded z-10 backdrop-blur-sm">
          <button
            onClick={() => setRotation((r) => r + 90)}
            className="p-1 text-white hover:text-blue-300 transition-colors"
            title="旋转"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => window.open(finalSrc, "_blank")}
            className="p-1 text-white hover:text-blue-300 transition-colors"
            title="在新窗口打开"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsHidden(true)}
            className="p-1 text-white hover:text-blue-300 transition-colors"
            title="隐藏图片"
          >
            <EyeOff className="w-4 h-4" />
          </button>
        </div>
      )}

      <img
        src={finalSrc}
        alt={alt}
        className="max-w-full h-auto rounded"
        style={{ transform: `rotate(${rotation}deg)`, transition: "transform 0.3s ease" }}
        loading="lazy"
      />
    </div>
  );
};
