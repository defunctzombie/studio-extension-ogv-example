import { PanelExtensionContext, RenderState } from "@foxglove/studio";
// @ts-ignore - no types available
import { OGVLoader, OGVPlayer } from "ogv";

// Each wasm file is imported and the webpack config is setup to inline the wasm content as base64

// @ts-ignore - no types available
import loadDemuxerOgg from "ogv/dist/ogv-demuxer-ogg-wasm";
// @ts-ignore - no types available
import demuxerOggWasm from "ogv/dist/ogv-demuxer-ogg-wasm.wasm";

// @ts-ignore - no types available
import loadDecoderVideoTheora from "ogv/dist/ogv-decoder-video-theora-wasm";
// @ts-ignore - no types available
import decoderVideoTheoraWasm from "ogv/dist/ogv-decoder-video-theora-wasm.wasm";

// @ts-ignore - no types available
import loadDecoderAudioVorbis from "ogv/dist/ogv-decoder-audio-vorbis-wasm";
// @ts-ignore - no types available
import decoderAudioVorbisWasm from "ogv/dist/ogv-decoder-audio-vorbis-wasm.wasm";

const convertDataURIToBinary = (dataURI: string) =>
  Uint8Array.from(window.atob(dataURI.replace(/^data[^,]+,/, "")), (v) => v.charCodeAt(0));

// monkey patch the OGVLoader `loadClass` method. This method is a factory that loads specific
// wasm modules for a `name`
//
// The contract of loadClass is to invoke `cb` and pass a function that returns a promise.
// The promise result should be the instantiated wasm class
OGVLoader.loadClass = (name: string, cb: (arg: () => Promise<unknown>) => void) => {
  switch (name) {
    case "OGVDemuxerOggW":
      cb(() =>
        loadDemuxerOgg({
          wasmBinary: convertDataURIToBinary(demuxerOggWasm),
        }),
      );
      break;
    case "OGVDecoderAudioVorbisW":
      cb(() =>
        loadDecoderAudioVorbis({
          wasmBinary: convertDataURIToBinary(decoderAudioVorbisWasm),
        }),
      );
      break;
    case "OGVDecoderVideoTheoraW":
      cb(() =>
        loadDecoderVideoTheora({
          wasmBinary: convertDataURIToBinary(decoderVideoTheoraWasm),
        }),
      );
      break;
    default:
      throw new Error(`unknown name: ${name}`);
  }
};

export function initExamplePanel(context: PanelExtensionContext) {
  context.onRender = (_renderState: RenderState, done) => {
    done();
  };

  const player = new OGVPlayer({ forceWebGL: true });

  player.src =
    "https://github.com/brion/ogv.js/blob/e0adc6189741ebf99ef19300bb52fa5f567eff77/demo/media/curiosity.ogv?raw=true";
  player.play();

  context.panelElement.appendChild(player);
}
