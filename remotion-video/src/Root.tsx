import {Composition} from 'remotion';
import {YuraPromoVideo} from './YuraPromoVideo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="YuraPromo"
        component={YuraPromoVideo}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
