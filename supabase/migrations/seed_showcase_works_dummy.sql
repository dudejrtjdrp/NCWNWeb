-- ================================================================
-- showcase_works 더미 데이터 시드 (핀터레스트 마소너리 레이아웃 확인용)
--
-- 목적: WORK > SHOWCASE 페이지의 1:1 / 2:1 랜덤 마소너리 동작 확인
--   - 타일 가로/세로 비율은 각 행의 id(UUID) 해시로 결정되므로,
--     아래처럼 행 수가 충분하면 자연스럽게 섞여 보입니다.
--   - thumbnail_url 은 picsum.photos 플레이스홀더(시드 고정)입니다.
--     실데이터 이전 후에는 next.config.mjs 의 picsum 허용 항목과 함께 제거 권장.
--
-- 실행: Supabase Dashboard → SQL Editor 에 붙여넣고 실행
--   (제목+작가 기준 NOT EXISTS 가드로 중복 실행해도 안전)
-- ================================================================

INSERT INTO showcase_works (title, author, year, description, type, tech_stack, thumbnail_url, view_count)
SELECT v.title, v.author, v.year, v.description, v.type, v.tech_stack::text[], v.thumbnail_url, v.view_count
FROM (
  VALUES
    ('빛의 도시',          '김민준', 2025, '도시의 빛과 그림자를 테마로 한 단편 영상. 드론 촬영과 타임랩스를 결합해 도시의 낮과 밤을 역동적으로 담았습니다.', 'video',  '{Video,Motion}',  'https://picsum.photos/seed/nwcn01/640/640',  342),
    ('Digital Fragments',  '이서연', 2025, '디지털과 물리 세계의 경계를 탐구하는 그래픽 시리즈. 픽셀과 기하학적 형태로 분절된 정체성을 표현했습니다.',       'design', '{Graphic,AI}',    'https://picsum.photos/seed/nwcn02/640/960',  287),
    ('도시의 소리',        '박태양', 2025, '도시 공간의 사운드스케이프를 시각화한 인터랙티브 웹 프로젝트.',                                              'design', '{Web,Graphic}',   'https://picsum.photos/seed/nwcn03/640/640',  213),
    ('Metamorphosis',      '최지우', 2025, '변태(metamorphosis)를 주제로 한 3D 애니메이션. 블렌더로 생명체의 변화 과정을 추상적으로 표현했습니다.',       '3d',     '{Motion,Graphic}','https://picsum.photos/seed/nwcn04/640/960',  198),
    ('연결의 언어',        '정하늘', 2025, '사람 사이의 연결을 시각 언어로 표현한 타이포그래피 포스터 시리즈.',                                          'design', '{Graphic}',       'https://picsum.photos/seed/nwcn05/640/640',  176),
    ('Neon Dreams',        '신예림', 2025, '네온 조명과 도시 야경을 주제로 한 영상. AI 색보정으로 몽환적인 분위기를 연출했습니다.',                       'video',  '{Video,AI}',      'https://picsum.photos/seed/nwcn06/640/640',  165),
    ('Still Life 2025',    '윤채원', 2025, '일상의 사물을 새로운 시각으로 포착한 정물 사진 시리즈.',                                                      'design', '{Photo}',         'https://picsum.photos/seed/nwcn07/640/960',  152),
    ('Frame by Frame',     '한지수', 2025, '프레임 단위 스톱모션 애니메이션. 수작업의 따뜻함과 디지털의 정교함이 만납니다.',                              'video',  '{Motion,Video}',  'https://picsum.photos/seed/nwcn08/640/640',  141),
    ('흐르는 풍경',        '오세준', 2024, '계절의 흐름을 담은 모션그래픽. 자연의 색을 추상적인 그래디언트로 재해석했습니다.',                            'video',  '{Motion,Video}',  'https://picsum.photos/seed/nwcn09/640/960',  133),
    ('Type & Space',       '강민서', 2024, '타이포그래피와 여백의 관계를 실험한 편집 디자인 시리즈.',                                                     'design', '{Graphic,Web}',   'https://picsum.photos/seed/nwcn10/640/640',  128),
    ('Echoes',             '임도윤', 2024, '소리의 잔향을 빛 입자로 시각화한 제너러티브 아트.',                                                           'design', '{AI,Graphic}',    'https://picsum.photos/seed/nwcn11/640/960',  119),
    ('도시 산책',          '배수아', 2024, '거리의 순간들을 기록한 스트리트 포토 에세이.',                                                                'design', '{Photo}',         'https://picsum.photos/seed/nwcn12/640/640',  108),
    ('Liquid Motion',      '노지훈', 2024, '유체 시뮬레이션을 활용한 3D 추상 영상.',                                                                      '3d',     '{Motion,Graphic}','https://picsum.photos/seed/nwcn13/640/960',   97),
    ('기억의 단면',        '황예진', 2024, '기억의 파편을 콜라주한 그래픽 포스터 연작.',                                                                  'design', '{Graphic,AI}',    'https://picsum.photos/seed/nwcn14/640/640',   89),
    ('Pulse',              '서지호', 2024, '심장 박동을 모티프로 한 인터랙티브 사운드 비주얼.',                                                           'design', '{Web,Motion}',    'https://picsum.photos/seed/nwcn15/640/640',   84),
    ('새벽 다섯시',        '문가람', 2023, '도시의 새벽을 담은 단편 다큐 영상.',                                                                          'video',  '{Video}',         'https://picsum.photos/seed/nwcn16/640/960',   78),
    ('Grid System',        '천우진', 2023, '그리드 시스템의 변주를 탐구한 모션 타이틀 시퀀스.',                                                           'video',  '{Motion,Graphic}','https://picsum.photos/seed/nwcn17/640/640',   72),
    ('Bloom',              '구민채', 2023, '꽃의 개화를 3D로 재현한 비주얼 아트.',                                                                        '3d',     '{Graphic,Motion}','https://picsum.photos/seed/nwcn18/640/960',   66),
    ('침묵의 색',          '하준영', 2023, '감정의 온도를 색으로 번역한 추상 그래픽.',                                                                    'design', '{Graphic}',       'https://picsum.photos/seed/nwcn19/640/640',   59),
    ('Loop',               '양서윤', 2023, '반복과 변주를 주제로 한 제너러티브 모션.',                                                                    'video',  '{AI,Motion}',     'https://picsum.photos/seed/nwcn20/640/640',   53),
    ('Paper Cut',          '조하린', 2023, '종이 오리기 기법을 디지털로 재해석한 일러스트 시리즈.',                                                    'design', '{Graphic}',       'https://picsum.photos/seed/nwcn21/640/960',   47),
    ('도시의 밤',          '권시우', 2022, '도시 야경의 빛을 장노출로 담은 사진 시리즈.',                                                                 'design', '{Photo}',         'https://picsum.photos/seed/nwcn22/640/640',   41),
    ('Synthesis',          '남도현', 2022, '아날로그와 디지털의 합성을 실험한 미디어아트.',                                                               'design', '{AI,Web}',        'https://picsum.photos/seed/nwcn23/640/960',   36),
    ('Origin',             '백채은', 2022, '디지털의 근원을 픽셀아트로 탐구한 포스터.',                                                                   'design', '{Graphic,Web}',   'https://picsum.photos/seed/nwcn24/640/640',   28)
) AS v(title, author, year, description, type, tech_stack, thumbnail_url, view_count)
WHERE NOT EXISTS (
  SELECT 1 FROM showcase_works s
  WHERE s.title = v.title AND s.author = v.author
);

-- 확인용: 시드 후 행 수
-- SELECT count(*) FROM showcase_works;
