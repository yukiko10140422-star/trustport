-- =============================================================
-- YURA QR - Namie Town (浪江町) Memorial Data Seed
-- Factual, verified data for the memorial database
-- Location ID: 00000000-0000-0000-0000-000000000010 (Namie Town)
--
-- Sources:
--   浪江町震災記録誌 (town.namie.fukushima.jp)
--   浪江町ホームページ - 現況ファクトシート
--   World Nuclear Association - Fukushima Daiichi Accident
--   Wikipedia - Namie, Fukushima / Fukushima nuclear accident
--   Dialogue for People - 請戸小学校記事
--   Fukushima Prefecture Portal
--   Japan Times / Washington Post reporting
-- =============================================================

-- =============================================================
-- 1. UPDATE locations: ヒーローデータ
-- =============================================================

UPDATE locations SET
  summary_ja = '浪江町は福島県浜通りに位置する町です。2011年3月11日の東日本大震災では、震度6強の地震と最大15.5メートルの津波、そして福島第一原子力発電所事故という三重の災害に見舞われました。全町民約21,000人が避難を余儀なくされ、一時は居住人口がゼロになりました。現在、水素エネルギーやスマートコミュニティなど先進的な復興の取り組みが進められています。',
  summary_en = 'Namie is a town on the Hamadori coast of Fukushima Prefecture. On March 11, 2011, it was struck by a triple disaster: a magnitude 6+ earthquake, tsunami waves up to 15.5 meters, and the Fukushima Daiichi nuclear accident. All approximately 21,000 residents were forced to evacuate, and the town''s residential population temporarily dropped to zero. Today, Namie is pioneering advanced recovery efforts including hydrogen energy and smart community initiatives.'
WHERE id = '00000000-0000-0000-0000-000000000010';


-- =============================================================
-- 2. disaster_timeline_events: 災害タイムライン（時系列）
-- =============================================================

-- (1) 地震発生
INSERT INTO disaster_timeline_events (
  location_id, event_date, event_time, event_type, sort_order,
  title_ja, title_en,
  description_ja, description_en,
  impact_ja, impact_en,
  source, source_url
) VALUES (
  '00000000-0000-0000-0000-000000000010',
  '2011-03-11', '14:46:00', 'earthquake', 10,
  '東北地方太平洋沖地震 発生',
  'Great East Japan Earthquake Strikes',
  '三陸沖を震源とするマグニチュード9.0の巨大地震が発生。浪江町では震度6強を観測。福島第一原子力発電所の原子炉1〜3号機が自動停止した。',
  'A magnitude 9.0 earthquake struck off the coast of Sanriku. Namie Town recorded a seismic intensity of upper 6 on the Japanese scale. Reactors 1-3 at the Fukushima Daiichi Nuclear Power Plant automatically shut down.',
  '浪江町: 震度6強、建物倒壊多数',
  'Namie Town: Upper 6 intensity, numerous building collapses',
  '気象庁', 'https://www.jma.go.jp/'
);

-- (2) 津波到達
INSERT INTO disaster_timeline_events (
  location_id, event_date, event_time, event_type, sort_order,
  title_ja, title_en,
  description_ja, description_en,
  impact_ja, impact_en,
  source, source_url
) VALUES (
  '00000000-0000-0000-0000-000000000010',
  '2011-03-11', '15:30:00', 'tsunami', 20,
  '津波が請戸地区に到達',
  'Tsunami Reaches Ukedo District',
  '地震発生から約40分後、最大15.5メートルの津波が浪江町沿岸部の請戸地区に到達。海岸から約2キロメートル内陸まで浸水し、請戸地区はほぼ壊滅した。浸水面積は約6平方キロメートルに及んだ。',
  'Approximately 40 minutes after the earthquake, tsunami waves up to 15.5 meters struck the coastal Ukedo district of Namie. The water penetrated up to 2 km inland, virtually destroying the entire Ukedo area. The total inundation area reached approximately 6 square kilometers.',
  '死者182名（うち行方不明31名）、全壊家屋651戸（流失586戸）',
  '182 deaths (31 missing), 651 totally destroyed buildings (586 swept away)',
  '浪江町震災記録誌', 'https://www.town.namie.fukushima.jp/soshiki/1/18101.html'
);

-- (3) 請戸小学校避難成功
INSERT INTO disaster_timeline_events (
  location_id, event_date, event_time, event_type, sort_order,
  title_ja, title_en,
  description_ja, description_en,
  impact_ja, impact_en,
  source, source_url
) VALUES (
  '00000000-0000-0000-0000-000000000010',
  '2011-03-11', '14:54:00', 'evacuation', 15,
  '請戸小学校 全校児童の避難開始',
  'Ukedo Elementary School Begins Full Evacuation',
  '地震発生8分後の14時54分、教職員の迅速な判断により82名の児童全員が約1.5キロメートル離れた大平山への避難を開始。津波到達前に全員が高台へ到達し、児童・教職員の犠牲者はゼロだった。この判断は阪神淡路大震災の教訓に基づくものだった。',
  'At 2:54 PM, just 8 minutes after the earthquake, teachers made the swift decision to evacuate all 82 students to Ohira Mountain, approximately 1.5 km away. All students and staff reached higher ground before the tsunami arrived. Zero casualties among students and staff. This decision was based on lessons learned from the 1995 Great Hanshin Earthquake.',
  '児童82名・教職員全員 犠牲者ゼロ',
  'All 82 students and staff: Zero casualties',
  'Dialogue for People', 'https://d4p.world/25303/'
);

-- (4) 福島第一原発 全電源喪失
INSERT INTO disaster_timeline_events (
  location_id, event_date, event_time, event_type, sort_order,
  title_ja, title_en,
  description_ja, description_en,
  impact_ja, impact_en,
  source, source_url
) VALUES (
  '00000000-0000-0000-0000-000000000010',
  '2011-03-11', '15:41:00', 'nuclear', 25,
  '福島第一原発 全電源喪失（ステーション・ブラックアウト）',
  'Fukushima Daiichi: Total Station Blackout',
  '津波により非常用ディーゼル発電機が水没し、福島第一原子力発電所の全電源が喪失。原子炉の冷却機能が失われ、炉心溶融（メルトダウン）への過程が始まった。',
  'The tsunami flooded emergency diesel generators, causing a complete station blackout at the Fukushima Daiichi Nuclear Power Plant. Reactor cooling capability was lost, beginning the process toward core meltdown.',
  '原子炉冷却不能、メルトダウンへの過程開始',
  'Loss of reactor cooling, meltdown process begins',
  'World Nuclear Association', 'https://world-nuclear.org/information-library/safety-and-security/safety-of-plants/fukushima-daiichi-accident'
);

-- (5) 半径3km避難指示
INSERT INTO disaster_timeline_events (
  location_id, event_date, event_time, event_type, sort_order,
  title_ja, title_en,
  description_ja, description_en,
  impact_ja, impact_en,
  source, source_url
) VALUES (
  '00000000-0000-0000-0000-000000000010',
  '2011-03-11', '21:23:00', 'evacuation', 30,
  '原発から半径3km圏内に避難指示',
  'Evacuation Order: 3km Radius from Nuclear Plant',
  '政府は福島第一原発から半径3キロメートル圏内の住民に対し避難指示を発令。同時に3〜10キロメートル圏内の住民に屋内退避を指示した。',
  'The government issued an evacuation order for residents within a 3 km radius of Fukushima Daiichi. Simultaneously, residents within 3-10 km were instructed to shelter indoors.',
  NULL, NULL,
  '首相官邸', NULL
);

-- (6) 半径10km避難指示拡大
INSERT INTO disaster_timeline_events (
  location_id, event_date, event_time, event_type, sort_order,
  title_ja, title_en,
  description_ja, description_en,
  impact_ja, impact_en,
  source, source_url
) VALUES (
  '00000000-0000-0000-0000-000000000010',
  '2011-03-12', '05:44:00', 'evacuation', 40,
  '避難指示が半径10kmに拡大',
  'Evacuation Order Expanded to 10km Radius',
  '3月12日早朝、避難指示の範囲が原発から半径10キロメートルに拡大。浪江町の沿岸部住民にも避難指示が出された。',
  'Early morning on March 12, the evacuation zone was expanded to a 10 km radius from the plant. Coastal residents of Namie Town were ordered to evacuate.',
  NULL, NULL,
  '首相官邸', NULL
);

-- (7) 1号機水素爆発
INSERT INTO disaster_timeline_events (
  location_id, event_date, event_time, event_type, sort_order,
  title_ja, title_en,
  description_ja, description_en,
  impact_ja, impact_en,
  source, source_url
) VALUES (
  '00000000-0000-0000-0000-000000000010',
  '2011-03-12', '15:36:00', 'nuclear', 50,
  '1号機 水素爆発',
  'Reactor 1: Hydrogen Explosion',
  '福島第一原発1号機の原子炉建屋で水素爆発が発生。建屋上部が吹き飛び、作業員4名が負傷した。東京電力は海水とホウ酸の注入を開始した。',
  'A hydrogen explosion occurred in the reactor building of Unit 1 at Fukushima Daiichi. The explosion blew off the upper portion of the building, injuring 4 workers. TEPCO began injecting seawater and boric acid.',
  '建屋上部崩壊、作業員4名負傷',
  'Building upper structure destroyed, 4 workers injured',
  'World Nuclear Association', 'https://world-nuclear.org/information-library/safety-and-security/safety-of-plants/fukushima-daiichi-accident'
);

-- (8) 半径20km避難指示拡大
INSERT INTO disaster_timeline_events (
  location_id, event_date, event_time, event_type, sort_order,
  title_ja, title_en,
  description_ja, description_en,
  impact_ja, impact_en,
  source, source_url
) VALUES (
  '00000000-0000-0000-0000-000000000010',
  '2011-03-12', '18:25:00', 'evacuation', 55,
  '避難指示が半径20kmに拡大 — 浪江町全域が避難対象',
  'Evacuation Expanded to 20km — Entire Namie Town Affected',
  '1号機の水素爆発を受け、避難指示が半径20キロメートルに拡大。浪江町中心部を含む町のほぼ全域が避難対象となった。町民約8,000人が人口約1,400人の津島地区に避難した。',
  'Following the Unit 1 hydrogen explosion, the evacuation zone was expanded to 20 km. Nearly the entire town of Namie, including the town center, fell within the evacuation zone. Approximately 8,000 town residents evacuated to the Tsushima district, which had a population of about 1,400.',
  '全町民21,000人以上が避難対象',
  'Entire population of over 21,000 subject to evacuation',
  '浪江町震災記録誌', 'https://www.town.namie.fukushima.jp/soshiki/1/18101.html'
);

-- (9) 3号機水素爆発
INSERT INTO disaster_timeline_events (
  location_id, event_date, event_time, event_type, sort_order,
  title_ja, title_en,
  description_ja, description_en,
  impact_ja, impact_en,
  source, source_url
) VALUES (
  '00000000-0000-0000-0000-000000000010',
  '2011-03-14', '11:01:00', 'nuclear', 60,
  '3号機 水素爆発',
  'Reactor 3: Hydrogen Explosion',
  '3号機の原子炉建屋で水素爆発が発生。1号機の爆発よりも大規模で、建屋上部が大きく損壊した。',
  'A hydrogen explosion occurred in the reactor building of Unit 3. The explosion was larger than the Unit 1 blast, causing severe damage to the upper portion of the building.',
  NULL, NULL,
  'World Nuclear Association', 'https://world-nuclear.org/information-library/safety-and-security/safety-of-plants/fukushima-daiichi-accident'
);

-- (10) 2号機圧力抑制室損傷・4号機爆発
INSERT INTO disaster_timeline_events (
  location_id, event_date, event_time, event_type, sort_order,
  title_ja, title_en,
  description_ja, description_en,
  impact_ja, impact_en,
  source, source_url
) VALUES (
  '00000000-0000-0000-0000-000000000010',
  '2011-03-15', '06:15:00', 'nuclear', 70,
  '2号機圧力抑制室損傷・4号機建屋爆発',
  'Unit 2 Suppression Chamber Damage / Unit 4 Building Explosion',
  '3月15日早朝、2号機の圧力抑制室で異常音が確認され圧力が急降下。同時刻頃、使用済み燃料を保管していた4号機建屋でも水素爆発が発生した。放射性物質の大量放出が始まった。',
  'Early morning on March 15, an anomalous sound was detected in Unit 2''s suppression chamber with a rapid pressure drop. Around the same time, a hydrogen explosion occurred in the Unit 4 building, which stored spent fuel. Large-scale release of radioactive materials began.',
  '放射性物質の大量放出開始',
  'Large-scale release of radioactive materials begins',
  'World Nuclear Association', 'https://world-nuclear.org/information-library/safety-and-security/safety-of-plants/fukushima-daiichi-accident'
);

-- (11) SPEEDI情報の未伝達
INSERT INTO disaster_timeline_events (
  location_id, event_date, event_time, event_type, sort_order,
  title_ja, title_en,
  description_ja, description_en,
  impact_ja, impact_en,
  source, source_url
) VALUES (
  '00000000-0000-0000-0000-000000000010',
  '2011-03-15', NULL, 'nuclear', 75,
  '放射性プルームが津島地区を直撃 — SPEEDI情報は浪江町に届かず',
  'Radioactive Plume Hits Tsushima District — SPEEDI Data Not Shared with Namie',
  '風向きの変化により福島第一原発から放出された放射性プルームが、約8,000人の町民が避難していた津島地区を直撃した。放射線拡散予測システム「SPEEDI」のデータは浪江町に伝達されておらず、住民は知らずに高線量地域に留まることとなった。',
  'A change in wind direction blew the radioactive plume from Fukushima Daiichi directly toward the Tsushima district, where approximately 8,000 Namie residents had taken refuge. Data from the SPEEDI radiation dispersal prediction system was not communicated to Namie Town, and residents unknowingly remained in a high-dose area.',
  '約8,000人の避難住民が被曝リスクに晒された',
  'Approximately 8,000 evacuees exposed to radiation risk',
  'Wikipedia - Namie, Fukushima', 'https://en.wikipedia.org/wiki/Namie,_Fukushima'
);

-- (12) 計画的避難区域指定
INSERT INTO disaster_timeline_events (
  location_id, event_date, event_time, event_type, sort_order,
  title_ja, title_en,
  description_ja, description_en,
  impact_ja, impact_en,
  source, source_url
) VALUES (
  '00000000-0000-0000-0000-000000000010',
  '2011-04-22', NULL, 'evacuation', 80,
  '計画的避難区域に指定',
  'Designated as Planned Evacuation Zone',
  '浪江町の20キロメートル圏外の地域（津島地区を含む）が「計画的避難区域」に指定された。全町民の避難が確定した。',
  'Areas of Namie Town beyond the 20 km radius (including the Tsushima district) were designated as a "Planned Evacuation Zone." The evacuation of all town residents was confirmed.',
  '浪江町全域が避難対象に確定',
  'Entire Namie Town confirmed as evacuation zone',
  '浪江町ホームページ', 'https://www.town.namie.fukushima.jp/'
);

-- (13) 避難区域再編
INSERT INTO disaster_timeline_events (
  location_id, event_date, event_time, event_type, sort_order,
  title_ja, title_en,
  description_ja, description_en,
  impact_ja, impact_en,
  source, source_url
) VALUES (
  '00000000-0000-0000-0000-000000000010',
  '2013-04-01', NULL, 'recovery', 90,
  '避難指示区域の再編（3区域に分割）',
  'Evacuation Zones Reorganized into 3 Areas',
  '浪江町の避難指示区域が「避難指示解除準備区域」「居住制限区域」「帰還困難区域」の3つに再編された。町の約80%が帰還困難区域に指定された。',
  'Namie Town''s evacuation zones were reorganized into three categories: "Areas Preparing for Lifting of Evacuation Orders," "Restricted Residence Areas," and "Difficult-to-Return Zones." Approximately 80% of the town was designated as a Difficult-to-Return Zone.',
  '町面積の約80%が帰還困難区域',
  'Approximately 80% of town area designated Difficult-to-Return',
  '福島県復興ポータル', 'https://www.pref.fukushima.lg.jp/site/portal-english/en03-08.html'
);

-- (14) 避難指示一部解除
INSERT INTO disaster_timeline_events (
  location_id, event_date, event_time, event_type, sort_order,
  title_ja, title_en,
  description_ja, description_en,
  impact_ja, impact_en,
  source, source_url
) VALUES (
  '00000000-0000-0000-0000-000000000010',
  '2017-03-31', NULL, 'recovery', 100,
  '避難指示一部解除 — 6年ぶりに居住可能に',
  'Partial Lifting of Evacuation Orders — Habitation Possible After 6 Years',
  '浪江町中心部を含む「避難指示解除準備区域」および「居住制限区域」の避難指示が解除された。震災から6年を経て、初めて住民の帰還が可能となった。ただし町面積の約80%は依然として帰還困難区域のままだった。',
  'Evacuation orders were lifted for the "Areas Preparing for Lifting" and "Restricted Residence Areas," including the town center. For the first time in 6 years since the disaster, residents could return. However, approximately 80% of the town''s area remained a Difficult-to-Return Zone.',
  '解除対象: 町面積の約20%',
  'Lifted area: Approximately 20% of town',
  '浪江町ホームページ', 'https://www.town.namie.fukushima.jp/'
);

-- (15) 請戸小学校 震災遺構として公開
INSERT INTO disaster_timeline_events (
  location_id, event_date, event_time, event_type, sort_order,
  title_ja, title_en,
  description_ja, description_en,
  impact_ja, impact_en,
  source, source_url
) VALUES (
  '00000000-0000-0000-0000-000000000010',
  '2021-10-24', NULL, 'recovery', 110,
  '請戸小学校が福島県初の震災遺構として公開',
  'Ukedo Elementary School Opens as Fukushima''s First Disaster Heritage Site',
  '津波で甚大な被害を受けた浪江町立請戸小学校が、福島県で初めての震災遺構として一般公開された。教室や廊下は津波被害を受けたままの姿で保存され、災害の記憶と教訓を伝えている。',
  'Namie Town''s Ukedo Elementary School, severely damaged by the tsunami, opened to the public as Fukushima Prefecture''s first disaster heritage site. Classrooms and corridors are preserved in their tsunami-damaged state, conveying the memory and lessons of the disaster.',
  '福島県初の震災遺構',
  'First disaster heritage site in Fukushima Prefecture',
  '震災遺構浪江町立請戸小学校', 'https://namie-ukedo.com/'
);

-- (16) 特定復興再生拠点区域の避難指示解除
INSERT INTO disaster_timeline_events (
  location_id, event_date, event_time, event_type, sort_order,
  title_ja, title_en,
  description_ja, description_en,
  impact_ja, impact_en,
  source, source_url
) VALUES (
  '00000000-0000-0000-0000-000000000010',
  '2023-03-31', NULL, 'recovery', 120,
  '帰還困難区域の一部（特定復興再生拠点）で避難指示解除',
  'Evacuation Lifted in Parts of Difficult-to-Return Zone (Reconstruction Base Areas)',
  '室原・末森・津島地区の一部を含む「特定復興再生拠点区域」の避難指示が解除された。帰還困難区域内で初めて居住が認められた画期的な措置。',
  'Evacuation orders were lifted for the "Specified Reconstruction and Revitalization Base Areas," including parts of the Murohara, Suenomori, and Tsushima districts. This was a landmark measure, marking the first time habitation was permitted within the Difficult-to-Return Zone.',
  '帰還困難区域内で初の避難指示解除',
  'First lifting of evacuation orders within Difficult-to-Return Zone',
  'Japan Times', 'https://www.japantimes.co.jp/news/2023/03/22/national/fukushima-evacuation-orders-lifted/'
);


-- =============================================================
-- 3. statistics: 統計データ
-- =============================================================

-- (1) 震災時人口
INSERT INTO statistics (
  location_id, label_ja, label_en, value_text, unit_ja, unit_en,
  context_ja, context_en, category, reference_date, sort_order,
  source, source_url
) VALUES (
  '00000000-0000-0000-0000-000000000010',
  '震災時人口', 'Pre-Disaster Population',
  '21,434', '人', 'people',
  '2011年3月11日時点の住民登録人口（世帯数: 7,671世帯、ほか外国人108人）',
  'Registered population as of March 11, 2011 (7,671 households, plus 108 foreign residents)',
  'displacement', '2011-03-11', 10,
  '浪江町震災記録誌', 'https://www.town.namie.fukushima.jp/soshiki/1/18101.html'
);

-- (2) 直接死者数
INSERT INTO statistics (
  location_id, label_ja, label_en, value_text, unit_ja, unit_en,
  context_ja, context_en, category, reference_date, sort_order,
  source, source_url
) VALUES (
  '00000000-0000-0000-0000-000000000010',
  '直接死者数', 'Direct Deaths',
  '182', '人', 'people',
  '地震・津波による直接的な死者。うち31名が行方不明。地震による家屋倒壊の圧死は1名で、大半が津波による溺死。',
  'Direct deaths from earthquake and tsunami. 31 remain missing. Only 1 death from building collapse; the vast majority drowned in the tsunami.',
  'casualties', '2011-03-11', 20,
  '浪江町震災記録誌', 'https://www.town.namie.fukushima.jp/soshiki/1/18101.html'
);

-- (3) 震災関連死
INSERT INTO statistics (
  location_id, label_ja, label_en, value_text, unit_ja, unit_en,
  context_ja, context_en, category, reference_date, sort_order,
  source, source_url
) VALUES (
  '00000000-0000-0000-0000-000000000010',
  '震災関連死', 'Disaster-Related Deaths',
  '441', '人', 'people',
  '避難生活の長期化によるストレス、持病の悪化、医療アクセスの困難等に起因する間接的な死亡。直接死の2倍以上に上る。',
  'Indirect deaths caused by prolonged evacuation stress, deterioration of chronic conditions, and difficulty accessing medical care. More than double the number of direct deaths.',
  'casualties', '2020-12-31', 30,
  '浪江町ホームページ', 'https://www.town.namie.fukushima.jp/'
);

-- (4) 全壊家屋数
INSERT INTO statistics (
  location_id, label_ja, label_en, value_text, unit_ja, unit_en,
  context_ja, context_en, category, reference_date, sort_order,
  source, source_url
) VALUES (
  '00000000-0000-0000-0000-000000000010',
  '全壊家屋数', 'Totally Destroyed Buildings',
  '651', '戸', 'buildings',
  '全壊651戸のうち586戸が津波による流失、65戸が地震による倒壊。約1,000の事業所も被災した。',
  'Of 651 totally destroyed buildings, 586 were swept away by the tsunami and 65 collapsed from the earthquake. Approximately 1,000 businesses were also damaged.',
  'economic', '2011-03-11', 40,
  '浪江町震災記録誌', 'https://www.town.namie.fukushima.jp/soshiki/1/18101.html'
);

-- (5) 現在の居住人口
INSERT INTO statistics (
  location_id, label_ja, label_en, value_text, unit_ja, unit_en,
  context_ja, context_en, category, reference_date, sort_order,
  source, source_url
) VALUES (
  '00000000-0000-0000-0000-000000000010',
  '現在の居住人口', 'Current Resident Population',
  '約2,200', '人', 'people',
  '震災前の人口約21,000人の約10分の1。住民登録人口は約14,400人だが、実際に町内に居住しているのは約2,200人。',
  'Approximately one-tenth of the pre-disaster population of about 21,000. While the registered population is about 14,400, only approximately 2,200 actually reside in the town.',
  'recovery', '2025-01-01', 50,
  '浪江町ホームページ', 'https://www.town.namie.fukushima.jp/site/understand-namie/namie-factsheet.html'
);

-- (6) 帰還困難区域の割合
INSERT INTO statistics (
  location_id, label_ja, label_en, value_text, unit_ja, unit_en,
  context_ja, context_en, category, reference_date, sort_order,
  source, source_url
) VALUES (
  '00000000-0000-0000-0000-000000000010',
  '帰還困難区域の割合', 'Difficult-to-Return Zone Coverage',
  '約80', '%', '%',
  '浪江町の面積の約80%が帰還困難区域に指定されていた（2013年再編時）。2023年に一部拠点区域が解除されたが、大部分は依然として居住制限が残る。',
  'Approximately 80% of Namie Town''s area was designated as a Difficult-to-Return Zone (as of the 2013 reorganization). Some base areas were lifted in 2023, but restrictions remain for most of this zone.',
  'displacement', '2013-04-01', 60,
  '福島県復興ポータル', 'https://www.pref.fukushima.lg.jp/site/portal-english/en03-08.html'
);

-- (7) 帰還率
INSERT INTO statistics (
  location_id, label_ja, label_en, value_text, unit_ja, unit_en,
  context_ja, context_en, category, reference_date, sort_order,
  source, source_url
) VALUES (
  '00000000-0000-0000-0000-000000000010',
  '帰還率', 'Return Rate',
  '約10', '%', '%',
  '住民登録人口に対する実際の居住者の割合。帰還意向調査では「戻りたい」と回答した割合は20%未満にとどまる。',
  'Ratio of actual residents to registered population. In surveys, fewer than 20% of registered residents expressed intention to return.',
  'recovery', '2025-01-01', 70,
  '浪江町ホームページ / 復興庁調査', 'https://www.town.namie.fukushima.jp/'
);

-- (8) 浸水面積
INSERT INTO statistics (
  location_id, label_ja, label_en, value_text, unit_ja, unit_en,
  context_ja, context_en, category, reference_date, sort_order,
  source, source_url
) VALUES (
  '00000000-0000-0000-0000-000000000010',
  '津波浸水面積', 'Tsunami Inundation Area',
  '約6', 'km²', 'km²',
  '浪江町沿岸部の津波浸水面積。最大波高15.5メートルの津波が海岸から約2キロメートル内陸まで到達した。',
  'Tsunami inundation area along Namie''s coast. Tsunami waves up to 15.5 meters reached approximately 2 km inland from the coast.',
  'casualties', '2011-03-11', 35,
  '浪江町震災記録誌', 'https://www.town.namie.fukushima.jp/soshiki/1/18101.html'
);


-- =============================================================
-- 4. lessons: 教訓
-- =============================================================

-- (1) 津波防災 — 請戸小学校の教訓
INSERT INTO lessons (
  location_id, title_ja, title_en,
  body_ja, body_en,
  category, icon_name, sort_order
) VALUES (
  '00000000-0000-0000-0000-000000000010',
  '迅速な判断が命を救う — 請戸小学校の奇跡',
  'Swift Decision-Making Saves Lives — The Miracle of Ukedo Elementary School',
  '2011年3月11日、海岸からわずか300メートルの場所にあった浪江町立請戸小学校では、地震発生からわずか8分後に全校避難を開始しました。教職員は津波警報を待たず、自らの判断で約1.5キロメートル離れた大平山への避難を決断。82名の児童全員が津波到達前に高台へ到着し、犠牲者はゼロでした。

この迅速な判断の背景には、1995年の阪神淡路大震災の教訓から構築された防災教育と、日頃からの避難訓練がありました。「想定にとらわれない」「率先避難者になる」という津波防災の原則が、まさに実践された瞬間でした。

請戸小学校は2021年10月に福島県初の震災遺構として公開され、津波の脅威と避難の重要性を後世に伝えています。',
  'On March 11, 2011, at Ukedo Elementary School — located just 300 meters from the coast — a full school evacuation began just 8 minutes after the earthquake. Teachers did not wait for tsunami warnings but made their own decision to evacuate to Ohira Mountain, approximately 1.5 km away. All 82 students reached higher ground before the tsunami arrived. Zero casualties.

Behind this swift decision was disaster preparedness education built on lessons from the 1995 Great Hanshin Earthquake, along with regular evacuation drills. The tsunami preparedness principles of "don''t be bound by assumptions" and "be the first to evacuate" were put into practice at that critical moment.

Ukedo Elementary School opened as Fukushima Prefecture''s first disaster heritage site in October 2021, conveying the threat of tsunamis and the importance of evacuation to future generations.',
  'preparedness', 'shield-check', 10
);

-- (2) 情報伝達の失敗 — SPEEDI問題
INSERT INTO lessons (
  location_id, title_ja, title_en,
  body_ja, body_en,
  category, icon_name, sort_order
) VALUES (
  '00000000-0000-0000-0000-000000000010',
  '情報は届かなければ意味がない — SPEEDI情報の未伝達',
  'Information Is Useless If It Doesn''t Reach Those Who Need It — The SPEEDI Failure',
  '原発事故発生時、政府は放射線拡散予測システム「SPEEDI（緊急時迅速放射能影響予測ネットワークシステム）」で放射性プルームの拡散方向を予測していました。しかし、その情報は浪江町に伝達されませんでした。

結果として、約8,000人の浪江町民が避難先の津島地区で放射性プルームに直撃されました。住民は季節風の影響で放射性物質は別方向に流れると信じていましたが、風向きの変化により直接被曝するリスクに晒されました。

この教訓は明確です。どれほど優れた予測システムがあっても、情報が必要な人に届かなければ、その技術は無意味です。災害時の情報伝達には、多層的かつ冗長なチャネルが不可欠であり、自治体への直接的な情報共有の仕組みが必要です。',
  'During the nuclear accident, the government predicted the direction of radioactive plume dispersal using SPEEDI (System for Prediction of Environmental Emergency Dose Information). However, this information was never communicated to Namie Town.

As a result, approximately 8,000 Namie residents were directly hit by the radioactive plume in their evacuation site of Tsushima district. Residents believed seasonal winds would carry radioactive materials in a different direction, but a change in wind direction exposed them to radiation risk.

The lesson is clear: no matter how sophisticated a prediction system may be, if the information doesn''t reach the people who need it, the technology is meaningless. Multi-layered, redundant communication channels and direct information-sharing mechanisms with local governments are essential during disasters.',
  'policy', 'megaphone', 20
);

-- (3) コミュニティの力 — 分散避難と絆の維持
INSERT INTO lessons (
  location_id, title_ja, title_en,
  body_ja, body_en,
  category, icon_name, sort_order
) VALUES (
  '00000000-0000-0000-0000-000000000010',
  '散り散りになっても絆は消えない — 全国避難とコミュニティの維持',
  'Bonds Endure Even When Scattered — Nationwide Evacuation and Preserving Community',
  '浪江町民は全国44都道府県、約600市区町村に分散して避難しました。これは日本の自治体史上、類を見ない規模の広域避難です。

長期にわたる避難生活は、住民のつながりを物理的に断ち切りました。特に高齢者にとって、慣れ親しんだコミュニティからの切り離しは、孤立感や健康の悪化をもたらしました。浪江町の震災関連死441人という数字は、直接死182人を大きく上回り、長期避難がもたらす見えない被害の深刻さを示しています。

しかし同時に、避難先でのコミュニティ形成、SNSを通じた連絡網の維持、定期的な町民交流イベントの開催など、絆を維持する取り組みも生まれました。浪江町は物理的な「町」がなくなっても、人のつながりの中に「町」が存在し続けることを証明しました。',
  'Namie residents were dispersed across 44 of Japan''s 47 prefectures and approximately 600 municipalities. This was an unprecedented scale of widespread evacuation in the history of Japanese local governance.

The prolonged evacuation physically severed residents'' connections. For elderly residents in particular, separation from familiar communities led to isolation and deteriorating health. Namie''s 441 disaster-related deaths — far exceeding the 182 direct deaths — demonstrate the severe hidden toll of long-term displacement.

Yet efforts to maintain bonds also emerged: forming communities in evacuation destinations, maintaining contact networks through social media, and holding regular community exchange events. Namie proved that even when the physical "town" disappears, the "town" continues to exist within the connections between its people.',
  'community', 'users', 30
);

-- (4) 記憶の保存 — 震災遺構と記録の重要性
INSERT INTO lessons (
  location_id, title_ja, title_en,
  body_ja, body_en,
  category, icon_name, sort_order
) VALUES (
  '00000000-0000-0000-0000-000000000010',
  '忘れないために記録する — 震災遺構と記憶の継承',
  'Recording So We Don''t Forget — Disaster Heritage and the Transmission of Memory',
  '浪江町は震災の記憶を後世に伝えるため、複数の取り組みを進めています。

請戸小学校は福島県初の震災遺構として保存・公開され、津波被害を受けたままの教室が「あの日」の衝撃を物語ります。浪江町震災記録誌「あの日からの記憶」は町民の証言と記録を集大成した貴重な資料です。

時間の経過とともに、震災を直接経験していない世代が増えていきます。「天災は忘れた頃にやってくる」という警句の通り、記憶の風化は最大の脅威です。物理的な遺構、デジタルアーカイブ、証言の記録、そして教育プログラムという多層的なアプローチによって、災害の教訓を次世代に確実に伝えることが求められています。',
  'Namie Town has undertaken multiple initiatives to transmit disaster memories to future generations.

Ukedo Elementary School has been preserved and opened as Fukushima Prefecture''s first disaster heritage site, where classrooms left in their tsunami-damaged state tell the story of that day''s impact. The Namie Town Disaster Record "Memories from That Day" is an invaluable compilation of residents'' testimonies and records.

As time passes, generations with no direct experience of the disaster will grow. As the Japanese proverb warns, "Natural disasters come when you''ve forgotten them." The fading of memory is the greatest threat. A multi-layered approach — physical heritage sites, digital archives, recorded testimonies, and educational programs — is needed to reliably transmit the lessons of disaster to the next generation.',
  'memory', 'book-open', 40
);

-- (5) 長期避難の影響 — 震災関連死
INSERT INTO lessons (
  location_id, title_ja, title_en,
  body_ja, body_en,
  category, icon_name, sort_order
) VALUES (
  '00000000-0000-0000-0000-000000000010',
  '見えない災害 — 震災関連死という静かな危機',
  'The Invisible Disaster — The Silent Crisis of Disaster-Related Deaths',
  '浪江町では、地震・津波による直接死182名に対し、震災関連死は441名と2倍以上に上ります。

震災関連死とは、災害そのものではなく、避難生活の長期化に伴うストレス、持病の悪化、医療・介護サービスへのアクセス困難、孤独死、自殺などによる間接的な死亡を指します。特に原発事故による避難は終わりが見えず、住民に深刻な精神的負担を強いました。

この事実は、災害対応において「命を救う」ことは発災直後だけではないことを教えています。避難所の環境改善、メンタルヘルスケアの提供、医療アクセスの確保、そして早期の生活再建支援が、発災後も長期にわたって必要です。',
  'In Namie Town, disaster-related deaths reached 441 — more than double the 182 direct deaths from the earthquake and tsunami.

Disaster-related deaths refer to indirect deaths caused not by the disaster itself but by prolonged evacuation stress, deterioration of chronic conditions, difficulty accessing medical and nursing care, solitary deaths, and suicide. The nuclear evacuation, with no foreseeable end, placed severe psychological burdens on residents.

This fact teaches us that "saving lives" in disaster response is not limited to the immediate aftermath. Improving shelter conditions, providing mental health care, ensuring medical access, and supporting early life reconstruction are needed on an ongoing, long-term basis after a disaster.',
  'community', 'heart', 50
);

-- (6) 複合災害への備え
INSERT INTO lessons (
  location_id, title_ja, title_en,
  body_ja, body_en,
  category, icon_name, sort_order
) VALUES (
  '00000000-0000-0000-0000-000000000010',
  '想定外を想定する — 地震・津波・原発の複合災害',
  'Preparing for the Unimaginable — Compound Disasters of Earthquake, Tsunami, and Nuclear Accident',
  '浪江町が経験したのは、巨大地震、大津波、原発事故という三重の複合災害でした。それぞれ単体でも甚大な被害をもたらしますが、同時に発生することで被害は幾何級数的に拡大しました。

津波被害の救助活動は原発事故による避難指示で中断され、請戸地区では多くの人が救助を待ちながら命を落としました。避難先が放射性プルームに汚染されるという想定外の事態も起きました。

「想定外」という言葉は免罪符にはなりません。複合災害のシナリオを事前に検討し、避難計画に組み込むこと。単一のリスクだけでなく、リスクの連鎖を考慮した防災計画が不可欠です。',
  'What Namie experienced was a triple compound disaster: massive earthquake, great tsunami, and nuclear accident. Each alone would cause enormous damage, but their simultaneous occurrence expanded the devastation exponentially.

Tsunami rescue operations were interrupted by nuclear evacuation orders, and many people in the Ukedo district lost their lives while waiting for rescue. The unimaginable scenario of an evacuation site being contaminated by a radioactive plume also occurred.

The phrase "beyond expectations" cannot serve as an excuse. Compound disaster scenarios must be considered in advance and incorporated into evacuation plans. Disaster preparedness planning must account not just for individual risks but for cascading chains of risk.',
  'preparedness', 'alert-triangle', 60
);


-- =============================================================
-- 5. recovery_initiatives: 復興の取り組み
-- =============================================================

-- (1) 震災遺構 請戸小学校
INSERT INTO recovery_initiatives (
  location_id, title_ja, title_en,
  description_ja, description_en,
  category, status, start_date, website_url, sort_order
) VALUES (
  '00000000-0000-0000-0000-000000000010',
  '震災遺構 浪江町立請戸小学校',
  'Disaster Heritage Site: Ukedo Elementary School',
  '2011年の津波で甚大な被害を受けた請戸小学校を、福島県初の震災遺構として保存・公開。校舎は津波被害を受けたままの状態で保存され、2階の床上まで達した津波の痕跡が残っています。82名の児童全員が無事避難した「奇跡の学校」として、防災教育と記憶の継承の場となっています。',
  'Ukedo Elementary School, severely damaged by the 2011 tsunami, has been preserved and opened as Fukushima Prefecture''s first disaster heritage site. The building is maintained in its tsunami-damaged state, with traces of water that reached above the second-floor level. Known as the "Miracle School" where all 82 students evacuated safely, it serves as a venue for disaster preparedness education and memory preservation.',
  'education', 'ongoing', '2021-10-24',
  'https://namie-ukedo.com/', 10
);

-- (2) 福島水素エネルギー研究フィールド (FH2R)
INSERT INTO recovery_initiatives (
  location_id, title_ja, title_en,
  description_ja, description_en,
  category, status, start_date, website_url, sort_order
) VALUES (
  '00000000-0000-0000-0000-000000000010',
  '福島水素エネルギー研究フィールド（FH2R）',
  'Fukushima Hydrogen Energy Research Field (FH2R)',
  '浪江町に設置された世界最大級の再生可能エネルギー由来水素製造施設。太陽光発電（20MW）を利用して水を電気分解し、最大毎時1,200Nm³の水素を製造可能。2020年に本格稼働を開始し、浪江町を「水素の町」として再生させる中核施設となっています。製造された水素は、2021年東京オリンピック・パラリンピックの聖火リレーにも使用されました。',
  'One of the world''s largest renewable energy-powered hydrogen production facilities, located in Namie Town. Using solar power (20MW) to electrolyze water, it can produce up to 1,200 Nm³ of hydrogen per hour. Full operations began in 2020, and it serves as the core facility for rebranding Namie as a "Hydrogen Town." The hydrogen produced was also used for the torch relay of the 2021 Tokyo Olympic and Paralympic Games.',
  'infrastructure', 'ongoing', '2020-03-07',
  'https://www.nedo.go.jp/', 20
);

-- (3) なみえスマートコミュニティ
INSERT INTO recovery_initiatives (
  location_id, title_ja, title_en,
  description_ja, description_en,
  category, status, start_date, website_url, sort_order
) VALUES (
  '00000000-0000-0000-0000-000000000010',
  'なみえスマートコミュニティ',
  'Namie Smart Community Project',
  '浪江町は復興を機に、最先端技術を活用したスマートコミュニティの構築を推進。日産自動車と連携したAI配車サービス「なみえスマートモビリティ」、イオン東北と連携した水素燃料電池移動スーパーの運行など、少子高齢化社会の課題解決モデルとなる取り組みを展開。米国カリフォルニア州ランカスター市とスマートシスターシティ協定を締結し、国際的な水素連携も進めています。',
  'Using its reconstruction as an opportunity, Namie is building a cutting-edge smart community. Initiatives include the "Namie Smart Mobility" AI ride-hailing service in partnership with Nissan, and a hydrogen fuel cell mobile supermarket operated with Aeon Tohoku. These serve as models for solving challenges of an aging, declining-population society. Namie has also signed a Smart Sister City agreement with Lancaster, California, advancing international hydrogen cooperation.',
  'infrastructure', 'ongoing', '2021-01-01',
  'https://www.nissan-global.com/EN/INNOVATION/TECHNOLOGY/ARCHIVE/NAMIE/', 30
);

-- (4) 農業の復活 — 米作り・エゴマ
INSERT INTO recovery_initiatives (
  location_id, title_ja, title_en,
  description_ja, description_en,
  category, status, start_date, website_url, sort_order
) VALUES (
  '00000000-0000-0000-0000-000000000010',
  '農業の復活 — 浪江の米作りとエゴマ栽培',
  'Agricultural Revival — Namie Rice Farming and Perilla Cultivation',
  '原発事故後に全面停止した浪江町の農業が、放射線量の低下と除染の進展により段階的に復活しています。水稲、タマネギ、エゴマ、花卉、長ネギ、果樹など多岐にわたる作物の栽培が再開。特にエゴマは「なみえの風」ブランドとして商品化が進んでいます。全品目で放射性物質の検査が行われ、安全性が確認されています。',
  'Namie''s agriculture, which was completely halted after the nuclear accident, is being revived in stages as radiation levels decrease and decontamination progresses. Cultivation has resumed for a wide range of crops including rice, onions, perilla, flowers, leeks, and fruit. Perilla in particular is being commercialized under the "Namie no Kaze" (Wind of Namie) brand. All products undergo radioactivity testing to ensure safety.',
  'agriculture', 'ongoing', '2017-04-01',
  'https://sousou-nougyo.jp/info_namie/', 40
);

-- (5) 酒造りの復活 — 鈴木酒造店
INSERT INTO recovery_initiatives (
  location_id, title_ja, title_en,
  description_ja, description_en,
  category, status, start_date, website_url, sort_order
) VALUES (
  '00000000-0000-0000-0000-000000000010',
  '酒造りの復活 — 鈴木酒造店「磐城壽」',
  'Sake Brewing Revival — Suzuki Sake Brewery "Iwaki Kotobuki"',
  '請戸地区にあった鈴木酒造店は、津波で全建屋が流失するという壊滅的被害を受けました。山形県長井市に一時移転して酒造りを継続した後、2021年春に浪江町内での酒造りを再開。浪江の米と水を使った酒づくりの伝統が復活しました。地域の伝統文化と産業の復興を象徴する存在です。',
  'Suzuki Sake Brewery in the Ukedo district suffered catastrophic damage — all buildings were swept away by the tsunami. After temporarily relocating to Nagai City, Yamagata Prefecture and continuing sake production there, the brewery resumed sake-making in Namie Town in spring 2021. The tradition of brewing with Namie''s rice and water has been revived. The brewery symbolizes the revival of regional traditional culture and industry.',
  'culture', 'ongoing', '2021-04-01',
  NULL, 50
);

-- (6) 道の駅なみえ
INSERT INTO recovery_initiatives (
  location_id, title_ja, title_en,
  description_ja, description_en,
  category, status, start_date, website_url, sort_order
) VALUES (
  '00000000-0000-0000-0000-000000000010',
  '道の駅なみえ — 交流と復興の拠点',
  'Michi-no-Eki Namie — Hub for Exchange and Recovery',
  '2020年8月にオープンした「道の駅なみえ」は、復興のシンボル的な交流拠点です。請戸漁港で水揚げされたヒラメやしらすなどの「請戸もの」の海産物、浪江名物の「なみえ焼そば」など地元の味覚を提供。地元産品の販売やイベント開催を通じて、町の賑わいの復活に貢献しています。',
  'Michi-no-Eki (Roadside Station) Namie, which opened in August 2020, serves as a symbolic hub for recovery and exchange. It offers seafood known as "Ukedo-mono" — flounder, whitebait, and other catches from Ukedo Port — as well as local specialties like "Namie Yakisoba." Through sales of local products and community events, it contributes to the revival of the town''s vitality.',
  'tourism', 'ongoing', '2020-08-01',
  NULL, 60
);

-- (7) 太平洋ハイドロジェンアライアンス (PHA)
INSERT INTO recovery_initiatives (
  location_id, title_ja, title_en,
  description_ja, description_en,
  category, status, start_date, website_url, sort_order
) VALUES (
  '00000000-0000-0000-0000-000000000010',
  '太平洋ハイドロジェンアライアンス（PHA）— 国際水素連携',
  'Pacific Hydrogen Alliance (PHA) — International Hydrogen Partnership',
  '浪江町、米国カリフォルニア州ランカスター市、ハワイ郡の3自治体が2023年に発足させた国際水素連携「太平洋ハイドロジェンアライアンス（PHA）」。被災地からグリーン水素の先進地へと転換した浪江町の経験を国際的に共有し、水素エネルギーの普及を推進する取り組みです。',
  'The Pacific Hydrogen Alliance (PHA) was launched in 2023 by three localities: Namie Town, Lancaster (California, USA), and Hawai''i County. The initiative shares Namie''s experience of transforming from a disaster-affected area into a green hydrogen leader, promoting the adoption of hydrogen energy on an international scale.',
  'infrastructure', 'ongoing', '2023-01-01',
  'https://www.japan.go.jp/kizuna/2024/06/green_hydrogen_energy.html', 70
);

-- (8) ホープツーリズム
INSERT INTO recovery_initiatives (
  location_id, title_ja, title_en,
  description_ja, description_en,
  category, status, start_date, website_url, sort_order
) VALUES (
  '00000000-0000-0000-0000-000000000010',
  'ホープツーリズム — 福島浜通りの学びの旅',
  'Hope Tourism — Learning Journeys Along Fukushima''s Hamadori Coast',
  '福島県が推進する「ホープツーリズム」は、震災・原発事故からの復興の過程そのものを「学び」と「希望」のコンテンツとして提供する新しい形の観光です。浪江町では請戸小学校の見学、水素エネルギー施設の視察、復興まちづくりの現場訪問などのプログラムが用意され、国内外から多くの訪問者が訪れています。',
  'Fukushima Prefecture''s "Hope Tourism" is a new form of tourism that offers the reconstruction process from the earthquake and nuclear disaster as content for "learning" and "hope." In Namie, programs include visits to Ukedo Elementary School, tours of hydrogen energy facilities, and on-site visits to reconstruction community development, attracting many visitors from Japan and abroad.',
  'tourism', 'ongoing', '2018-01-01',
  'https://www.hopetourism.jp/', 80
);
