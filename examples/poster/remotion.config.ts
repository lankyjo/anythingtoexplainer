// Remotion CLI config.
// bin/setup writes REMOTION_BROWSER_EXECUTABLE into template/.env when it finds a system
// Chrome/Chromium, so Remotion does not have to download its own browser (that download stalls on
// some networks).
import {Config} from '@remotion/cli/config';

const exe = process.env.REMOTION_BROWSER_EXECUTABLE;
if (exe) Config.setBrowserExecutable(exe);
