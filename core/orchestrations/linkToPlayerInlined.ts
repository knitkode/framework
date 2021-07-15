import { $, on } from "@knitkode/core-dom";
import onScroll from "@knitkode/core-scroll/onScroll";
import scrollTo from "@knitkode/core-scroll/scrollTo";

/**
 * Link to inline video
 *
 * Video link, import video player when it comes into the viewport or when the
 * trigger link is clicked, on this latter event wait for scroll end and then
 * play the video.
 *
 * @param {string} triggerSelector
 * @param {string} targetSelector
 */
export default function linkToInlineVideo(
  triggerSelector: string,
  targetSelector: string
) {
  const $trigger = $(triggerSelector);
  if (!$trigger) return;

  const $target = $(targetSelector);
  const getPlayer = () => import("@knitkode/core-player");
  const handleVideoReached = () => {
    getPlayer().then(({ Player }) => {
      Player($(".video-js", $target) as HTMLElement).play();
    });
  };

  on($trigger, "click", (event) => {
    event.preventDefault();

    scrollTo($target, {
      onstop: handleVideoReached,
    });
  });

  onScroll($target, {
    onin: getPlayer,
  });
}
