// Instrument fonts: IBM Plex Sans (ui) and IBM Plex Mono (labels, numerals), OFL.
// See public/fonts/OFL-IBMPlexSans.txt.
import React from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';

const FAMILIES: Array<[string, string, string]> = [
  ['IBM Plex Sans', 'fonts/IBMPlexSans.ttf', '100 900'],
  ['IBM Plex Mono', 'fonts/IBMPlexMono-Regular.ttf', '400 500'],
];

// Side effect during the first render pass, no useEffect (the project bans it in components).
const MountOnce: React.FC<{run: () => void}> = ({run}) => {
  React.useState(() => {
    run();
    return true;
  });
  return null;
};

export const InstrumentFonts: React.FC = () => {
  const [handle] = React.useState(() => delayRender('instrument-fonts'));
  return (
    <MountOnce
      run={() => {
        Promise.all(
          FAMILIES.map(([name, file, weight]) =>
            new FontFace(name, `url(${staticFile(file)})`, {weight} as FontFaceDescriptors).load(),
          ),
        )
          .then((fs) => {
            fs.forEach((f) => (document.fonts as unknown as {add: (f: FontFace) => void}).add(f));
            continueRender(handle);
          })
          .catch(() => continueRender(handle));
      }}
    />
  );
};
