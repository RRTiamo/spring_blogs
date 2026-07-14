import type { TrackDetail } from "@/interface/music";

// 内存海报缓存，避免对同一首歌曲重复绘制 Canvas 造成性能损耗
const posterCache = new Map<string, string>();

/**
 * 异步获取或生成歌曲的海报 Base64 字符串
 */
export async function getTrackPoster(track: TrackDetail): Promise<string> {
  const cacheKey = `${track.source}-${track.id}`;
  if (posterCache.has(cacheKey)) {
    return posterCache.get(cacheKey) || "";
  }

  const poster = await generateTrackPoster(track);
  if (poster) {
    posterCache.set(cacheKey, poster);
  }
  return poster;
}

/**
 * 使用离屏 Canvas 异步绘制精致歌曲海报
 * 优化：图片超时处理、跨域兜底、导出低分辨率/高压缩 jpeg 减小 LocalStorage 占用，规避卡顿
 */
function generateTrackPoster(track: TrackDetail): Promise<string> {
  return new Promise((resolve) => {
    // 延迟 200ms 执行，错开切歌/播放时的密集状态变化，确保主线程极度流畅
    setTimeout(() => {
      if (typeof window === "undefined" || typeof document === "undefined") {
        resolve("");
        return;
      }

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve("");
        return;
      }

      const width = 260;
      const height = 260;
      canvas.width = width;
      canvas.height = height;

      // 1. 绘制极具质感的深色微光渐变背景
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, "#1f202e"); // 优雅紫灰
      grad.addColorStop(0.5, "#151622"); // 暗夜深
      grad.addColorStop(1, "#0d0e15"); // 极致深
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // 2. 绘制几圈高雅的同心波纹线，增加海报空气感/立体感
      ctx.strokeStyle = "rgba(255, 255, 255, 0.025)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2 - 10, 70, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(width / 2, height / 2 - 10, 95, 0, Math.PI * 2);
      ctx.stroke();

      const img = new Image();
      // 允许 CORS 跨域请求
      img.crossOrigin = "anonymous";

      const drawTextAndResolve = () => {
        // 3. 绘制文字信息
        // 歌名
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
        ctx.textAlign = "center";
        let title = track.title || "未知曲目";
        if (title.length > 16) title = title.substring(0, 14) + "...";
        ctx.fillText(title, width / 2, height - 52);

        // 歌手
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.font = "10px system-ui, -apple-system, sans-serif";
        let artist = track.artist || "未知歌手";
        if (artist.length > 20) artist = artist.substring(0, 18) + "...";
        ctx.fillText(artist, width / 2, height - 36);

        // 品牌底款
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.font = "normal 8px system-ui, -apple-system, sans-serif";
        ctx.fillText("LIVE ARCHIVE • MUSIC", width / 2, height - 16);

        // 4. 导出压缩 JPEG，进一步压缩 LocalStorage 占用 (单张大小降至 ~8KB)
        try {
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          resolve(dataUrl);
        } catch {
          resolve("");
        }
      };

      // 1.5s 极限超时保护，防图片请求卡死
      const timeoutId = setTimeout(() => {
        drawPlaceholderVinyl(ctx, width);
        drawTextAndResolve();
      }, 1500);

      img.onload = () => {
        clearTimeout(timeoutId);
        try {
          const imgSize = 110;
          const imgX = (width - imgSize) / 2;
          const imgY = 32;
          const radius = 10;

          // 绘制圆角剪裁区域
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(imgX + radius, imgY);
          ctx.lineTo(imgX + imgSize - radius, imgY);
          ctx.quadraticCurveTo(imgX + imgSize, imgY, imgX + imgSize, imgY + radius);
          ctx.lineTo(imgX + imgSize, imgY + imgSize - radius);
          ctx.quadraticCurveTo(imgX + imgSize, imgY + imgSize, imgX + imgSize - radius, imgY + imgSize);
          ctx.lineTo(imgX + radius, imgY + imgSize);
          ctx.quadraticCurveTo(imgX, imgY + imgSize, imgX, imgY + imgSize - radius);
          ctx.lineTo(imgX, imgY + radius);
          ctx.quadraticCurveTo(imgX, imgY, imgX + radius, imgY);
          ctx.closePath();
          ctx.clip();

          // 渲染封面
          ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
          ctx.restore();

          // 加一圈微弱亮边框以凸显层次
          ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
          ctx.lineWidth = 1;
          ctx.strokeRect(imgX, imgY, imgSize, imgSize);

          drawTextAndResolve();
        } catch {
          // toDataURL 受污染报错降级
          drawPlaceholderVinyl(ctx, width);
          drawTextAndResolve();
        }
      };

      img.onerror = () => {
        clearTimeout(timeoutId);
        drawPlaceholderVinyl(ctx, width);
        drawTextAndResolve();
      };

      if (track.cover) {
        img.src = track.cover;
      } else {
        clearTimeout(timeoutId);
        drawPlaceholderVinyl(ctx, width);
        drawTextAndResolve();
      }
    }, 200);
  });
}

/**
 * 绘制高质感的胶片唱片占位，当封面加载失败时兜底
 */
function drawPlaceholderVinyl(ctx: CanvasRenderingContext2D, width: number) {
  const size = 110;
  const cx = width / 2;
  const cy = 32 + size / 2;

  // 1. 唱片黑盘
  ctx.fillStyle = "#16161a";
  ctx.beginPath();
  ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
  ctx.fill();

  // 2. 黑胶轨道纹路
  ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
  ctx.lineWidth = 1.5;
  for (let r = 12; r < size / 2; r += 10) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // 3. 经典胶碟红心
  ctx.fillStyle = "#f43f5e"; // 暖红心
  ctx.beginPath();
  ctx.arc(cx, cy, 14, 0, Math.PI * 2);
  ctx.fill();

  // 4. 黑洞中心孔
  ctx.fillStyle = "#0c0d12";
  ctx.beginPath();
  ctx.arc(cx, cy, 3, 0, Math.PI * 2);
  ctx.fill();
}
