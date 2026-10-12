import type { VideoHTMLAttributes } from 'react';

// The attributes every decorative, looping video on the site shares (hero reel, project cards, project pages),
// so they read as part of the design rather than as a video player, like the reels on itsjay.us.
// Spread them onto the <video>, and also give it the class `pointer-events-none select-none` (see below).
//
// Why the class: with pointer-events off, clicks and right-clicks go to the frame around the video instead of the
// video itself, so right-click shows the normal page menu, not "Save video as / Show controls / Picture in
// picture". itsjay.us gets the same effect from a layer sitting on top of its videos. The hovers that matter are
// on the parents (the project card, the mouse tracking on window), so nothing is lost.
// None of this touches the files: same WebM/MP4, same quality.
export const videoProps = {
  muted: true,
  loop: true,
  playsInline: true,
  // No picture-in-picture: removes the pop-out button Chrome and Edge draw over videos, and stops Edge from
  // popping the reel out into a small floating player when you scroll away or switch tabs
  disablePictureInPicture: true,
  // No "Cast to device"
  disableRemotePlayback: true,
  // Hides the download / cast / speed entries if the browser's video menu is ever opened anyway (keyboard)
  controlsList: 'nodownload noremoteplayback noplaybackrate',
  // A click doesn't focus the video (and draw an outline around it)
  tabIndex: -1,
  // No ghost copy of the video when you drag across it
  draggable: false,
} satisfies VideoHTMLAttributes<HTMLVideoElement>;
