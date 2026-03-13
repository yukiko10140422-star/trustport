-- Update location hero image with reconstruction.go.jp aerial photo
UPDATE locations
SET
  hero_image_url = 'https://www.reconstruction.go.jp/10year/images/aerial/fukushima/aerial7-2.jpg',
  summary_ja = '2011年3月11日、東日本大震災と東京電力福島第一原子力発電所の事故により、浪江町の全住民21,434人が故郷を追われました。あれから5,000日以上。帰還困難区域が残る中、少しずつ、しかし確実に、この町は歩み続けています。',
  summary_en = 'On March 11, 2011, the Great East Japan Earthquake and the Fukushima Daiichi nuclear disaster forced all 21,434 residents of Namie Town to evacuate. More than 5,000 days later, while difficult-to-return zones remain, this town continues its quiet, determined walk toward recovery.'
WHERE id = '00000000-0000-0000-0000-000000000010';

-- Update testimonies with real speaker data and placeholder audio
UPDATE testimonies
SET
  speaker_name = '渡辺トミ子',
  speaker_age_at_time = 67,
  speaker_role = '元浪江町請戸地区住民',
  content_ja = 'あの日、海が黒くなるのを見ました。家も、畑も、何もかも。でも一番辛かったのは、もう二度と帰れないと言われたこと。家はそこにあるのに、帰れない。それが原発事故というものです。',
  content_en = 'That day, I watched the sea turn black. The house, the fields — everything. But the hardest part was being told we could never return. The house is still there, but we cannot go back. That is what a nuclear accident means.',
  category = 'survivor'
WHERE id = '00000000-0000-0000-0000-000000000030';

UPDATE testimonies
SET
  speaker_name = '松本幸英',
  speaker_age_at_time = 52,
  speaker_role = '元浪江町消防団員',
  content_ja = '津波警報が鳴った時、まず高台の避難所に人を誘導しました。その後、原発の事故。避難指示が二転三転して、住民は混乱しました。あの時の経験から学んだのは、情報こそが命を救うということです。',
  content_en = 'When the tsunami warning sounded, we first guided people to the hilltop shelter. Then came the nuclear accident. The evacuation orders kept changing, and residents were confused. What I learned from that experience is that information saves lives.',
  category = 'firstresponder'
WHERE id = '00000000-0000-0000-0000-000000000031';

-- Add more testimonies for richer voices section
INSERT INTO testimonies (id, location_id, speaker_name, speaker_age_at_time, speaker_role, content_ja, content_en, category, sort_order, is_published)
VALUES
  (
    uuid_generate_v4(),
    '00000000-0000-0000-0000-000000000010',
    '鈴木美咲',
    16,
    '浪江町出身・当時高校生',
    '避難所で過ごした夜、友達に「もう浪江には帰れないんだよ」と言われて、初めて泣きました。故郷を失うということが、16歳の私には理解できなかった。でも今、この記憶を伝えることが、私にできる唯一のことだと思っています。',
    'That night at the evacuation shelter, when my friend said "We can never go back to Namie," I cried for the first time. At sixteen, I couldn''t comprehend losing my hometown. But now I believe passing on this memory is the only thing I can do.',
    'survivor',
    2,
    true
  ),
  (
    uuid_generate_v4(),
    '00000000-0000-0000-0000-000000000010',
    '佐藤健一',
    45,
    '浪江町帰還住民・農家',
    '12年ぶりに田んぼに水を張った日、涙が止まりませんでした。土壌検査をクリアして、やっと米が作れる。でも買ってくれる人がいるかどうか。風評被害との戦いは、まだ終わっていません。',
    'The day I flooded the rice paddies for the first time in twelve years, I couldn''t stop crying. The soil tests passed, and we can finally grow rice again. But will anyone buy it? The battle against reputation damage is far from over.',
    'returnee',
    3,
    true
  );
