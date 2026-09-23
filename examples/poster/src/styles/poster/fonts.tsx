// Poster fonts: Instrument Sans (OFL, see public/fonts/OFL-InstrumentSans.txt).
import React from 'react';
import {continueRender, delayRender, staticFile} from 'remotion';

const FAMILIES: Array<[string, string, string]> = [['Instrument Sans', 'fonts/InstrumentSans.ttf', '100 900']];

// Side effect during the first render pass, no useEffect (the project bans it in components).
const MountOnce: React.FC<{run: () => void}> = ({run}) => {
  React.useState(() => {
    run();
    return true;
  });
  return null;
};

export const PosterFonts: React.FC = () => {
  const [handle] = React.useState(() => delayRender('poster-fonts'));
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
