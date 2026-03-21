import {AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, Img, staticFile, interpolate, Easing, spring} from 'remotion';
import React from 'react';

// --- Shared animation helpers ---

const fadeIn = (frame: number, start: number, duration: number = 15) =>
  interpolate(frame, [start, start + duration], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

const fadeOut = (frame: number, end: number, duration: number = 15) =>
  interpolate(frame, [end - duration, end], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

const slideUp = (frame: number, start: number, duration: number = 20) =>
  interpolate(frame, [start, start + duration], [60, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

const scaleIn = (frame: number, start: number, duration: number = 30) =>
  interpolate(frame, [start, start + duration], [1.08, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

// --- Scene Components ---

const DarkOverlay: React.FC<{opacity?: number}> = ({opacity = 0.3}) => (
  <AbsoluteFill style={{backgroundColor: `rgba(7, 7, 16, ${opacity})`}} />
);

const BrandBar: React.FC = () => (
  <div style={{
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 4,
    background: 'linear-gradient(90deg, #2a9d8f, #c27c5e, #d4a574)',
    boxShadow: '0 0 20px rgba(42,157,143,0.3)',
    zIndex: 100,
  }} />
);

const NoiseOverlay: React.FC = () => (
  <AbsoluteFill style={{
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'repeat', backgroundSize: '256px 256px',
    opacity: 0.03, mixBlendMode: 'overlay', pointerEvents: 'none', zIndex: 50,
  }} />
);

// Scene 1: Opening - Brand Reveal
const OpeningScene: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const lineWidth = interpolate(frame, [0, 40], [0, 300], {
    extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic),
  });
  const brandOpacity = fadeIn(frame, 15, 25);
  const taglineOpacity = fadeIn(frame, 40, 20);
  const taglineY = slideUp(frame, 40, 25);
  const glowIntensity = interpolate(frame, [30, 70], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{
      backgroundColor: '#070710',
      backgroundImage:
        'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(42, 157, 143, 0.12) 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 20% 80%, rgba(194, 124, 94, 0.08) 0%, transparent 65%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    }}>
      <NoiseOverlay />

      {/* Decorative ring */}
      <div style={{
        position: 'absolute', width: 500, height: 500, borderRadius: '50%',
        border: '1px solid rgba(42,157,143,0.06)', top: '50%', left: '50%',
        transform: `translate(-50%, -50%) scale(${interpolate(frame, [0, 90], [0.8, 1.1], {extrapolateRight: 'clamp'})})`,
        opacity: interpolate(frame, [0, 30], [0, 0.5], {extrapolateRight: 'clamp'}),
      }} />

      {/* Top line */}
      <div style={{
        width: lineWidth, height: 1,
        background: 'linear-gradient(90deg, transparent, #2a9d8f, transparent)',
        marginBottom: 40, opacity: 0.6,
      }} />

      {/* Brand name */}
      <div style={{
        fontFamily: 'Inter, sans-serif', fontSize: 120, fontWeight: 900,
        color: '#fff', letterSpacing: 24, opacity: brandOpacity,
        textShadow: `0 0 ${40 * glowIntensity}px rgba(42,157,143,${0.3 * glowIntensity})`,
        zIndex: 10,
      }}>
        YURA
      </div>

      {/* Tagline */}
      <div style={{
        fontFamily: 'Noto Sans JP, sans-serif', fontSize: 28, fontWeight: 400,
        color: 'rgba(212,165,116,0.9)', letterSpacing: 6,
        opacity: taglineOpacity, transform: `translateY(${taglineY}px)`,
        marginTop: 20, zIndex: 10,
      }}>
        記憶の揺らぎを、力に変える。
      </div>

      {/* Bottom line */}
      <div style={{
        width: lineWidth * 0.6, height: 1,
        background: 'linear-gradient(90deg, transparent, #d4a574, transparent)',
        marginTop: 40, opacity: 0.4,
      }} />

      <BrandBar />
    </AbsoluteFill>
  );
};

// Scene 2: Slide with Ken Burns + animated text overlay
const SlideScene: React.FC<{
  slideFile: string;
  title: string;
  subtitle?: string;
  accentColor?: string;
  kenBurnsDirection?: 'in' | 'out';
}> = ({slideFile, title, subtitle, accentColor = '#2a9d8f', kenBurnsDirection = 'in'}) => {
  const frame = useCurrentFrame();
  const duration = 90; // each scene is 90 frames = 3s

  // Ken Burns effect
  const scale = kenBurnsDirection === 'in'
    ? interpolate(frame, [0, duration], [1, 1.06], {extrapolateRight: 'clamp'})
    : interpolate(frame, [0, duration], [1.06, 1], {extrapolateRight: 'clamp'});

  // Fade in/out
  const opacity = Math.min(
    fadeIn(frame, 0, 12),
    fadeOut(frame, duration, 12),
  );

  // Text animations
  const titleOpacity = fadeIn(frame, 8, 18);
  const titleY = slideUp(frame, 8, 22);
  const subtitleOpacity = fadeIn(frame, 20, 18);
  const subtitleY = slideUp(frame, 20, 22);

  return (
    <AbsoluteFill style={{opacity}}>
      {/* Background slide image with Ken Burns */}
      <AbsoluteFill style={{transform: `scale(${scale})`}}>
        <Img src={staticFile(slideFile)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </AbsoluteFill>

      {/* Gradient overlay for text readability */}
      <AbsoluteFill style={{
        background: 'linear-gradient(180deg, rgba(7,7,16,0.7) 0%, rgba(7,7,16,0.2) 30%, rgba(7,7,16,0.1) 60%, rgba(7,7,16,0.6) 100%)',
      }} />

      {/* Title overlay */}
      <div style={{
        position: 'absolute', bottom: 120, left: 100, zIndex: 10,
      }}>
        <div style={{
          fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 600,
          color: accentColor, letterSpacing: 6, textTransform: 'uppercase',
          opacity: subtitleOpacity, transform: `translateY(${subtitleY}px)`,
          marginBottom: 12,
        }}>
          {subtitle}
        </div>
        <div style={{
          fontFamily: 'Noto Sans JP, sans-serif', fontSize: 48, fontWeight: 700,
          color: '#fff', opacity: titleOpacity, transform: `translateY(${titleY}px)`,
          textShadow: '0 2px 20px rgba(0,0,0,0.5)',
        }}>
          {title}
        </div>
      </div>

      {/* Accent line */}
      <div style={{
        position: 'absolute', bottom: 100, left: 100,
        width: interpolate(frame, [5, 35], [0, 200], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)}),
        height: 2, background: accentColor, opacity: 0.6,
      }} />

      <BrandBar />
    </AbsoluteFill>
  );
};

// Scene: Concept deep-dive with animated text
const ConceptScene: React.FC = () => {
  const frame = useCurrentFrame();

  const pillars = [
    {label: '被災地の記憶をファッションへ', color: '#2a9d8f', delay: 15},
    {label: '社会貢献 x デザイン', color: '#d4a574', delay: 30},
    {label: 'デジタルアーカイブ連動', color: '#8b7ec8', delay: 45},
  ];

  return (
    <AbsoluteFill style={{
      backgroundColor: '#070710',
      backgroundImage:
        'radial-gradient(ellipse 80% 60% at 30% 30%, rgba(42,157,143,0.08) 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 70% 70%, rgba(139,126,200,0.06) 0%, transparent 65%)',
    }}>
      <NoiseOverlay />

      {/* Section label */}
      <div style={{
        position: 'absolute', top: 100, left: 100,
        fontFamily: 'Inter', fontSize: 22, fontWeight: 600,
        color: '#2a9d8f', letterSpacing: 6, textTransform: 'uppercase',
        opacity: fadeIn(frame, 0, 15),
      }}>
        Brand Concept
      </div>

      {/* Main concept text */}
      <div style={{
        position: 'absolute', top: 180, left: 100,
        fontFamily: 'Noto Sans JP', fontSize: 52, fontWeight: 700,
        color: '#fff', lineHeight: 1.4,
        opacity: fadeIn(frame, 5, 20),
        transform: `translateY(${slideUp(frame, 5, 25)}px)`,
      }}>
        風化防止を哲学とした<br />
        <span style={{color: '#2a9d8f'}}>唯一の</span>ファッションブランド
      </div>

      {/* Three pillars */}
      <div style={{
        position: 'absolute', top: 450, left: 100, right: 100,
        display: 'flex', gap: 40,
      }}>
        {pillars.map((pillar, i) => {
          const itemOpacity = fadeIn(frame, pillar.delay, 15);
          const itemY = slideUp(frame, pillar.delay, 20);
          return (
            <div key={i} style={{
              flex: 1,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
              border: `1px solid ${pillar.color}33`,
              borderRadius: 16, padding: '32px 28px',
              opacity: itemOpacity, transform: `translateY(${itemY}px)`,
            }}>
              <div style={{
                width: 4, height: 40, background: pillar.color, borderRadius: 2,
                marginBottom: 20, boxShadow: `0 0 12px ${pillar.color}44`,
              }} />
              <div style={{
                fontFamily: 'Noto Sans JP', fontSize: 24, fontWeight: 600,
                color: '#fff', lineHeight: 1.6,
              }}>
                {pillar.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Decorative ring */}
      <div style={{
        position: 'absolute', right: -100, top: -100, width: 600, height: 600,
        borderRadius: '50%', border: '1px solid rgba(42,157,143,0.04)',
        transform: `rotate(${frame * 0.3}deg)`,
      }} />

      <BrandBar />
    </AbsoluteFill>
  );
};

// Scene: Reversible Design Feature
const ReversibleScene: React.FC = () => {
  const frame = useCurrentFrame();

  const flipProgress = interpolate(frame, [30, 70], [0, 180], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.cubic),
  });

  const showFront = flipProgress < 90;

  return (
    <AbsoluteFill style={{
      backgroundColor: '#070710',
      backgroundImage:
        'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(194,124,94,0.1) 0%, transparent 70%)',
    }}>
      <NoiseOverlay />

      <div style={{
        position: 'absolute', top: 80, left: 100,
        fontFamily: 'Inter', fontSize: 22, fontWeight: 600,
        color: '#d4a574', letterSpacing: 6, textTransform: 'uppercase',
        opacity: fadeIn(frame, 0, 15),
      }}>
        Reversible Design
      </div>

      <div style={{
        position: 'absolute', top: 160, left: 100, right: 100,
        fontFamily: 'Noto Sans JP', fontSize: 44, fontWeight: 700,
        color: '#fff', opacity: fadeIn(frame, 5, 20),
        transform: `translateY(${slideUp(frame, 5)}px)`,
      }}>
        1枚に2つの時間軸を内包する
      </div>

      {/* Flip card visualization */}
      <div style={{
        position: 'absolute', top: 300, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: 80, alignItems: 'center',
      }}>
        {/* Front side */}
        <div style={{
          width: 400, height: 500,
          background: showFront
            ? 'linear-gradient(135deg, rgba(42,157,143,0.15) 0%, rgba(42,157,143,0.03) 100%)'
            : 'linear-gradient(135deg, rgba(233,69,96,0.15) 0%, rgba(233,69,96,0.03) 100%)',
          border: `1px solid ${showFront ? 'rgba(42,157,143,0.3)' : 'rgba(233,69,96,0.3)'}`,
          borderRadius: 20, padding: 40,
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
          transform: `perspective(800px) rotateY(${flipProgress}deg)`,
          backfaceVisibility: 'hidden',
          opacity: fadeIn(frame, 10, 20),
        }}>
          <div style={{
            fontFamily: 'Inter', fontSize: 18, fontWeight: 600,
            color: showFront ? '#2a9d8f' : '#e94560',
            letterSpacing: 4, marginBottom: 20,
          }}>
            {showFront ? 'FRONT' : 'BACK'}
          </div>
          <div style={{
            fontFamily: 'Noto Sans JP', fontSize: 32, fontWeight: 700,
            color: '#fff', textAlign: 'center', marginBottom: 16,
          }}>
            {showFront ? '美しい現在' : '残酷な過去'}
          </div>
          <div style={{
            fontFamily: 'Noto Sans JP', fontSize: 20, color: 'rgba(255,255,255,0.5)',
            textAlign: 'center', lineHeight: 1.7,
          }}>
            {showFront ? '復興した風景\n希望の象徴' : '被災直後の記憶\n喪失と再生'}
          </div>
        </div>

        {/* Arrow */}
        <div style={{
          fontFamily: 'Inter', fontSize: 40, color: 'rgba(255,255,255,0.15)',
          opacity: fadeIn(frame, 20, 15),
        }}>
          {'<->'}
        </div>

        {/* Image placeholder */}
        <div style={{
          width: 400, height: 500, borderRadius: 20, overflow: 'hidden',
          opacity: fadeIn(frame, 15, 20),
          transform: `scale(${scaleIn(frame, 15, 25)})`,
        }}>
          <Img
            src={staticFile('images/reversible-design-concept.png')}
            style={{width: '100%', height: '100%', objectFit: 'cover'}}
          />
        </div>
      </div>

      <BrandBar />
    </AbsoluteFill>
  );
};

// Scene: KPI / Market Numbers
const MarketNumbersScene: React.FC = () => {
  const frame = useCurrentFrame();

  const kpis = [
    {value: '8.5', unit: '兆円', label: '日本アパレル市場', color: '#2a9d8f', delay: 10},
    {value: '3.0', unit: '兆円+', label: 'D2C EC市場', color: '#d4a574', delay: 20},
    {value: '23.4', unit: '%', label: 'EC化率', color: '#8b7ec8', delay: 30},
    {value: '12', unit: '%', label: 'エシカル成長率', color: '#e94560', delay: 40},
  ];

  return (
    <AbsoluteFill style={{
      backgroundColor: '#070710',
      backgroundImage:
        'radial-gradient(ellipse 80% 60% at 20% 30%, rgba(42,157,143,0.08) 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 80% 70%, rgba(212,165,116,0.06) 0%, transparent 65%)',
    }}>
      <NoiseOverlay />

      <div style={{
        position: 'absolute', top: 100, left: 100,
        fontFamily: 'Inter', fontSize: 22, fontWeight: 600,
        color: '#2a9d8f', letterSpacing: 6, textTransform: 'uppercase',
        opacity: fadeIn(frame, 0, 15),
      }}>
        Market Opportunity
      </div>

      <div style={{
        position: 'absolute', top: 170, left: 100,
        fontFamily: 'Noto Sans JP', fontSize: 48, fontWeight: 700,
        color: '#fff', opacity: fadeIn(frame, 3, 18),
        transform: `translateY(${slideUp(frame, 3)}px)`,
      }}>
        成長する市場に、空白のポジション
      </div>

      {/* KPI cards */}
      <div style={{
        position: 'absolute', top: 340, left: 80, right: 80,
        display: 'flex', gap: 32,
      }}>
        {kpis.map((kpi, i) => {
          const itemOpacity = fadeIn(frame, kpi.delay, 15);
          const itemY = slideUp(frame, kpi.delay, 20);
          const counterValue = interpolate(frame, [kpi.delay, kpi.delay + 30], [0, parseFloat(kpi.value)], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
            easing: Easing.out(Easing.cubic),
          });

          return (
            <div key={i} style={{
              flex: 1,
              background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 20, padding: '48px 32px',
              textAlign: 'center',
              opacity: itemOpacity, transform: `translateY(${itemY}px)`,
            }}>
              <div style={{
                fontFamily: 'Inter', fontSize: 64, fontWeight: 900,
                color: kpi.color, lineHeight: 1,
                textShadow: `0 0 20px ${kpi.color}44`,
              }}>
                {counterValue.toFixed(counterValue >= 10 ? 0 : 1)}
                <span style={{fontSize: 28, fontWeight: 600, marginLeft: 4}}>{kpi.unit}</span>
              </div>
              <div style={{
                fontFamily: 'Noto Sans JP', fontSize: 20, color: 'rgba(255,255,255,0.5)',
                marginTop: 16,
              }}>
                {kpi.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Blue ocean callout */}
      <div style={{
        position: 'absolute', bottom: 100, left: 100, right: 100,
        background: 'linear-gradient(135deg, rgba(42,157,143,0.08) 0%, rgba(42,157,143,0.02) 100%)',
        border: '1px solid rgba(42,157,143,0.2)',
        borderRadius: 16, padding: '24px 40px',
        display: 'flex', alignItems: 'center', gap: 20,
        opacity: fadeIn(frame, 55, 20),
        transform: `translateY(${slideUp(frame, 55)}px)`,
      }}>
        <div style={{
          fontFamily: 'Inter', fontSize: 36, fontWeight: 900,
          color: '#2a9d8f', textShadow: '0 0 15px rgba(42,157,143,0.3)',
        }}>
          Blue Ocean
        </div>
        <div style={{
          fontFamily: 'Noto Sans JP', fontSize: 22, color: 'rgba(255,255,255,0.6)',
        }}>
          「風化防止 x ファッション」カテゴリに直接競合なし
        </div>
      </div>

      <BrandBar />
    </AbsoluteFill>
  );
};

// Scene: Closing CTA
const ClosingScene: React.FC = () => {
  const frame = useCurrentFrame();

  const glowPulse = Math.sin(frame * 0.08) * 0.3 + 0.7;

  return (
    <AbsoluteFill style={{
      backgroundColor: '#070710',
      backgroundImage:
        'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(42,157,143,0.1) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 30% 70%, rgba(212,165,116,0.06) 0%, transparent 60%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    }}>
      <NoiseOverlay />

      {/* Decorative rings */}
      {[300, 400, 500].map((size, i) => (
        <div key={i} style={{
          position: 'absolute', width: size, height: size, borderRadius: '50%',
          border: `1px solid rgba(42,157,143,${0.04 - i * 0.01})`,
          top: '50%', left: '50%',
          transform: `translate(-50%, -50%) rotate(${frame * (0.2 + i * 0.1)}deg)`,
        }} />
      ))}

      <div style={{
        fontFamily: 'Inter', fontSize: 100, fontWeight: 900,
        color: '#fff', letterSpacing: 20,
        opacity: fadeIn(frame, 0, 25),
        textShadow: `0 0 ${50 * glowPulse}px rgba(42,157,143,${0.4 * glowPulse})`,
        zIndex: 10,
      }}>
        YURA
      </div>

      <div style={{
        fontFamily: 'Noto Sans JP', fontSize: 24, color: 'rgba(212,165,116,0.8)',
        letterSpacing: 8, marginTop: 20, opacity: fadeIn(frame, 15, 20),
        transform: `translateY(${slideUp(frame, 15)}px)`,
        zIndex: 10,
      }}>
        記憶の揺らぎを、力に変える。
      </div>

      <div style={{
        fontFamily: 'Noto Sans JP', fontSize: 20, color: 'rgba(255,255,255,0.4)',
        marginTop: 60, opacity: fadeIn(frame, 35, 20),
        zIndex: 10,
      }}>
        Makuake クラウドファンディング 2026 Summer
      </div>

      <BrandBar />
    </AbsoluteFill>
  );
};

// --- Main Composition ---

export const YuraPromoVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: '#070710'}}>
      {/* Scene 1: Opening Brand Reveal (0-90, 3s) */}
      <Sequence from={0} durationInFrames={100}>
        <OpeningScene />
      </Sequence>

      {/* Scene 2: Concept (100-220, 4s) */}
      <Sequence from={100} durationInFrames={120}>
        <ConceptScene />
      </Sequence>

      {/* Scene 3: Market slide (220-310, 3s) */}
      <Sequence from={220} durationInFrames={100}>
        <MarketNumbersScene />
      </Sequence>

      {/* Scene 4: Target slide (310-400, 3s) */}
      <Sequence from={310} durationInFrames={100}>
        <SlideScene
          slideFile="slides/apparel-04-target.png"
          title="ターゲットセグメント"
          subtitle="Target Analysis"
          accentColor="#2a9d8f"
        />
      </Sequence>

      {/* Scene 5: Competitive slide (400-490, 3s) */}
      <Sequence from={400} durationInFrames={100}>
        <SlideScene
          slideFile="slides/apparel-05-competitive.png"
          title="競合分析 / ブルーオーシャン"
          subtitle="Competitive Landscape"
          accentColor="#d4a574"
          kenBurnsDirection="out"
        />
      </Sequence>

      {/* Scene 6: Reversible design (490-610, 4s) */}
      <Sequence from={490} durationInFrames={120}>
        <ReversibleScene />
      </Sequence>

      {/* Scene 7: Business Model slide (610-700, 3s) */}
      <Sequence from={610} durationInFrames={100}>
        <SlideScene
          slideFile="slides/apparel-07-business.png"
          title="ビジネスモデル & 収益構造"
          subtitle="Business Model"
          accentColor="#8b7ec8"
        />
      </Sequence>

      {/* Scene 8: Roadmap slide (700-790, 3s) */}
      <Sequence from={700} durationInFrames={100}>
        <SlideScene
          slideFile="slides/apparel-09-roadmap.png"
          title="ロードマップ"
          subtitle="Roadmap"
          accentColor="#2a9d8f"
          kenBurnsDirection="out"
        />
      </Sequence>

      {/* Scene 9: Closing (790-900, ~3.5s) */}
      <Sequence from={790} durationInFrames={110}>
        <ClosingScene />
      </Sequence>
    </AbsoluteFill>
  );
};
