
import { useEffect, useRef } from "react";

interface WaveformVisualizerProps {
  analyser?: AnalyserNode | null;
  isActive: boolean;
}

export function WaveformVisualizer({
  analyser,
  isActive,
}: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!analyser || !isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let animationId = 0;
    const data = new Uint8Array(analyser.frequencyBinCount);

    const draw = () => {
      analyser.getByteTimeDomainData(data);

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.beginPath();
      context.strokeStyle = "#10b981";
      context.lineWidth = 2;

      const sliceWidth = canvas.width / data.length;

      for (let i = 0; i < data.length; i++) {
        const x = i * sliceWidth;
        const y = (data[i] / 255) * canvas.height;

        if (i === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }

      context.stroke();
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationId);
  }, [analyser, isActive]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={100}
      className="w-full rounded-lg bg-gray-900"
      aria-label="Visualización de audio"
    />
  );
}
