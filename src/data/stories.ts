/** Short original summaries of the linked official sources; checked 2026-09-17. */
export type PlacePhoto = {
  src: string;
  alt: string;
  author: string;
  license: string;
  licenseUrl: string;
  source: string;
  date: string;
};
export type PlaceStory = {
  subtitle: string;
  lead: string;
  era: string;
  identity: string;
  history: string[];
  timeline: { year: string; text: string }[];
  blessings: string[];
  belief: string;
  highlights: { title: string; text: string }[];
  sources: { title: string; url: string }[];
  photo?: PlacePhoto;
};
export const stories: Record<string, PlaceStory> = {
  "ise-jingu": {
    subtitle: "五十鈴川を渡り、祈りの原風景へ。",
    era: "約2,000年前に鎮座と伝わる",
    identity: "天照大御神 ／ 皇大神宮（内宮）",
    lead: "三重県伊勢市、五十鈴川のほとりに鎮まる皇大神宮。天照大御神をお祀りする、伊勢神宮の中心となるお宮です。",
    history: [
      "伊勢神宮の正式名称は「神宮」。内宮と外宮、別宮など125の宮社の総称です。このページでは、内宮と呼ばれる皇大神宮を紹介します。岡山市の「伊勢神社」とは別の神社です。",
      "公式の由緒では、倭姫命が天照大御神をお祀りする地を求めて各地を巡り、約2,000年前に伊勢へ鎮座したと伝えられます。天照大御神は皇室の御祖神として崇敬され、八咫鏡をご神体としています。",
      "平安時代末期から伊勢への信仰が広まり、江戸時代には多くの人がお伊勢参りに訪れました。20年ごとの式年遷宮では、社殿を新しく造り替え、祭りや技を次代へ伝えています。",
    ],
    timeline: [
      {
        year: "約2,000年前（伝承）",
        text: "倭姫命により、天照大御神が伊勢に鎮座",
      },
      { year: "平安時代末期〜", text: "伊勢信仰が全国へと広がる" },
      { year: "江戸時代", text: "庶民の間でお伊勢参りが盛んになる" },
      { year: "20年ごと", text: "式年遷宮で社殿と祭りの伝統を受け継ぐ" },
    ],
    blessings: ["神恩感謝", "家内安全", "身体健全", "五穀豊穣"],
    belief:
      "神宮では、日々の恵みへの感謝を大切にしています。神楽殿の公式祈祷案内には、国家安泰・五穀豊穣に加え、家内安全・身体健全・学業成就などの願いが記されています。内宮のご祭神は天照大御神で、豊受大御神は外宮にお祀りされています。",
    highlights: [
      {
        title: "宇治橋と五十鈴川",
        text: "内宮への入口となる木の橋。川の流れと森を感じながら、神域へ向かいます。掲載写真はこの宇治橋の鳥居です。",
      },
      {
        title: "皇大神宮の正宮",
        text: "天照大御神をお祀りする中心のお宮。長い参道の先にあり、宇治橋とは異なる場所です。",
      },
    ],
    sources: [
      {
        title: "伊勢神宮｜神宮について・125の宮社",
        url: "https://www.isejingu.or.jp/about/",
      },
      {
        title: "伊勢神宮｜皇大神宮（内宮）・正宮",
        url: "https://www.isejingu.or.jp/about/naiku/shogu.html",
      },
      {
        title: "伊勢神宮｜神宮の歴史",
        url: "https://www.isejingu.or.jp/about/history/",
      },
      {
        title: "伊勢神宮｜宇治橋・五十鈴川",
        url: "https://www.isejingu.or.jp/about/naiku/ujibashi.html",
      },
      {
        title: "伊勢神宮｜ご祈祷のご案内",
        url: "https://www.isejingu.or.jp/visit/prayer/",
      },
      {
        title: "伊勢神宮｜交通アクセス",
        url: "https://www.isejingu.or.jp/access/",
      },
    ],
    photo: {
      src: "/places/ise-jingu.jpg",
      alt: "伊勢神宮・内宮の宇治橋と鳥居（三重県伊勢市・2023年撮影）",
      author: "Zairon",
      license: "CC BY 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
      source:
        "https://commons.wikimedia.org/wiki/File:Ise_Ise-jingu_Ujibashi_Bridge_1.jpg",
      date: "2023-10-15",
    },
  },
  "ise-geku": {
    subtitle: "日々の食と暮らしに、感謝を重ねる。",
    era: "478年に鎮座と伝わる",
    identity: "豊受大御神 ／ 豊受大神宮（外宮）",
    lead: "伊勢のまちに鎮まる、豊受大神宮。衣食住と産業を守る豊受大御神をお祀りし、日々の恵みに感謝するお宮です。",
    history: [
      "外宮の正式名称は「豊受大神宮」。内宮とともに伊勢神宮を構成するお宮で、天照大御神のお食事をつかさどる豊受大御神をお祀りしています。内宮とは所在地もご祭神も異なります。",
      "公式の由緒では、雄略天皇22年（478年）に、丹波国から豊受大御神を迎えたと伝えられます。以来、朝夕に神々のお食事を供える日別朝夕大御饌祭が続いています。",
    ],
    timeline: [
      { year: "478年（伝承）", text: "豊受大御神を丹波国から伊勢に迎える" },
      { year: "約1,500年の営み", text: "朝夕に神饌を供えるお祭りを受け継ぐ" },
      {
        year: "外宮から内宮へ",
        text: "祭典の順序にならい、参拝も外宮を先にするならわし",
      },
    ],
    blessings: ["衣食住の守護", "産業の守護", "神恩感謝", "商売繁盛"],
    belief:
      "豊受大御神は、公式案内で衣食住や産業を守る神様と紹介されています。神楽殿では神恩感謝や商売繁盛などの祈祷を受け付けています。ご利益は信仰としての紹介で、願いの実現を保証するものではありません。",
    highlights: [
      {
        title: "豊受大神宮の正宮",
        text: "豊受大御神をお祀りするお宮。高倉山の麓に広がる神域を歩き、日々の暮らしへの感謝を伝えます。",
      },
      {
        title: "せんぐう館",
        text: "まがたま池のほとりにある博物館。式年遷宮の技と営みを紹介しています。開館情報は公式案内をご確認ください。",
      },
    ],
    sources: [
      {
        title: "伊勢神宮｜豊受大神宮（外宮）・正宮",
        url: "https://www.isejingu.or.jp/about/geku/shogu.html",
      },
      {
        title: "伊勢神宮｜豊受大神宮（外宮）",
        url: "https://www.isejingu.or.jp/about/geku/",
      },
      {
        title: "伊勢神宮｜ご祭神と信仰",
        url: "https://www.isejingu.or.jp/first/beginner.html",
      },
      {
        title: "伊勢神宮｜ご祈祷のご案内",
        url: "https://www.isejingu.or.jp/visit/prayer/",
      },
      {
        title: "伊勢神宮｜交通アクセス",
        url: "https://www.isejingu.or.jp/access/",
      },
    ],
    photo: {
      src: "/places/ise-geku.jpg",
      alt: "伊勢神宮・外宮の正宮を外から望む（三重県伊勢市・2015年撮影）",
      author: "Sakaori",
      license: "CC BY 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by/3.0/",
      source:
        "https://commons.wikimedia.org/wiki/File:Ise-jingu_Grand_Shrine_Geku_Maine_sanctuary._May,_2015.jpg",
      date: "2015-05-24",
    },
  },
  ise: {
    subtitle: "岡山・番町に鎮まる、まちのお社。",
    era: "元伊勢の伝承",
    identity: "天照皇大神・豊受大神",
    lead: "岡山市北区番町の伊勢神社です。三重県伊勢市の「伊勢神宮」とは別の神社で、天照皇大神と豊受大神をお祀りしています。",
    history: [
      "社伝では、崇神天皇の時代に豊鋤入姫命が創建したとされる「元伊勢」の一社です。岡山県神社庁は、古くから備前岡山の氏神として人々の崇敬を集めたと紹介しています。",
      "宇喜多氏・池田氏の時代にも厚く敬われ、伊勢宮の神職は備前藩の祭事を担いました。氏子の町々から伝わる備前太鼓唄と獅子舞にも、城下町との結びつきが息づいています。",
    ],
    timeline: [
      { year: "創建の伝承", text: "豊鋤入姫命による創建と伝えられる" },
      { year: "安土桃山〜江戸", text: "宇喜多氏・池田氏の崇敬を受ける" },
      { year: "受け継ぐ祭り", text: "氏子から発祥した備前太鼓唄・獅子舞" },
    ],
    blessings: ["岡山の氏神信仰"],
    belief:
      "岡山県神社庁は、古くから備前岡山の氏神として崇敬を集めてきたと紹介しています。参照資料の「御神徳」欄には具体的な記載がないため、この神社固有のご利益は掲載していません。",
    highlights: [
      {
        title: "二柱のご祭神",
        text: "天照皇大神と豊受大神。太陽の神様と、お食事をつかさどる神様のつながりを知る。",
      },
      {
        title: "まちに伝わる獅子舞",
        text: "岡山県神社庁は、一角の獅子による奉納と、氏子から発祥した備前太鼓唄を紹介しています。",
      },
    ],
    sources: [
      {
        title: "岡山県神社庁｜伊勢神社",
        url: "https://www.okayama-jinjacho.or.jp/search/16412/",
      },
    ],
  },
  okayama: {
    subtitle: "城とまちを見守る、千年の社。",
    era: "貞観年間・860年頃",
    identity: "倭迹迹日百襲姫命ほか七柱",
    lead: "旭川のほとり、岡山城の歴史と歩んできたお社。鳥居の先には、時代を越えて残った随神門が迎えます。",
    history: [
      "公式の由緒によると、860年頃の創建。当初は現在の岡山城本丸の地にあり、1573年に宇喜多直家が現在地へ移しました。以後、城の守り神として歴代城主の崇敬を受けます。",
      "1945年の岡山大空襲で多くの建物が焼失しましたが、1745年建立の随神門は残りました。本殿は1958年に再建。随神門は市の重要文化財となり、2024年に全解体保存修理を終えています。",
    ],
    timeline: [
      { year: "860年頃", text: "現在の岡山城本丸の地に創建" },
      { year: "1573年", text: "宇喜多直家により現在地へ遷座" },
      { year: "1745年", text: "池田継政が随神門を造立" },
      { year: "2024年", text: "随神門の全解体保存修理が完成" },
    ],
    blessings: ["厄除け", "交通安全", "商売繁盛", "縁結び"],
    belief:
      "公式の祈祷案内では、家内安全・厄除け・交通安全・縁結びなどの祈願を受け付けています。日本武尊は勝負事や社運隆昌、境内の稲荷神社は商売繁盛の信仰と結びつけて紹介されています。",
    highlights: [
      {
        title: "随神門",
        text: "江戸時代の城下町を伝える市指定重要文化財。空襲をくぐり抜け、保存修理を経て受け継がれています。",
      },
      {
        title: "主祭神の物語",
        text: "主祭神の倭迹迹日百襲姫命は、公式の紹介では吉備津彦命の姉。知恵と予見にまつわる伝承が語られます。",
      },
    ],
    sources: [
      {
        title: "岡山神社｜神社について",
        url: "https://www.okayama-jinjya.or.jp/about.html",
      },
      {
        title: "岡山神社｜ご祈祷",
        url: "https://www.okayama-jinjya.or.jp/kitou.html",
      },
    ],
    photo: {
      src: "/places/okayama.jpg",
      alt: "岡山神社の石鳥居と随神門（2008年撮影）",
      author: "Reggaeman",
      license: "Public domain",
      licenseUrl:
        "https://commons.wikimedia.org/wiki/File:Okayama_Jinja_01.jpg#Licensing",
      source: "https://commons.wikimedia.org/wiki/File:Okayama_Jinja_01.jpg",
      date: "2008-02-11",
    },
  },
  ryozenji: {
    subtitle: "祈りの旅は、この一歩から。",
    era: "天平年間・729〜749年（伝承）",
    identity: "釈迦如来 ／ 高野山真言宗",
    lead: "四国八十八ヶ所、第一番札所。池を渡る橋や緑の境内で心を整え、お遍路の旅をはじめる「発願の寺」です。",
    history: [
      "霊場会の縁起では、聖武天皇の勅願で行基が開創したと伝えられます。815年に弘法大師が修法し、釈迦の説法の場を思わせる光景にちなみ「竺和山・霊山寺」と名づけたとされます。",
      "兵火や火災を経て、伽藍は復興を重ねてきました。第一番札所は、遍路へ出発する心を整える場所でもあります。境内の多宝塔は応永年間の建立と紹介されています。",
    ],
    timeline: [
      { year: "天平年間", text: "行基による開創と伝わる" },
      { year: "815年の伝承", text: "弘法大師が修法し、第一番札所に定める" },
      { year: "応永年間", text: "多宝塔が建立されたとされる" },
    ],
    blessings: ["縁結び", "仕事とのご縁", "幸せとのご縁"],
    belief:
      "霊場会は、境内の縁結び観音を、男女だけでなく健康・仕事・幸せとの縁を願う場所として紹介しています。ご本尊は釈迦如来で、縁結び観音とは区別しています。",
    highlights: [
      {
        title: "発願の寺",
        text: "札所を番号順にめぐる旅の出発点。参拝の心構えを整えて、最初の一歩を。",
      },
      {
        title: "多宝塔と縁結び観音",
        text: "長い歴史を持つ多宝塔と、さまざまなご縁を願う観音さまが境内にあります。",
      },
    ],
    sources: [
      {
        title: "四国八十八ヶ所霊場会｜霊山寺",
        url: "https://88shikokuhenro.jp/01ryozenji/",
      },
    ],
    photo: {
      src: "/places/ryozenji.jpg",
      alt: "霊山寺の池と橋、緑に囲まれた境内（2014年撮影）",
      author: "663highland",
      license: "CC BY 2.5",
      licenseUrl: "https://creativecommons.org/licenses/by/2.5/",
      source:
        "https://commons.wikimedia.org/wiki/File:140712_Ryozenji_Naruto_Tokushima_pref_Japan04s3.jpg",
      date: "2014-07-12",
    },
  },
  gokurakuji: {
    subtitle: "木々の間に、穏やかな祈りを。",
    era: "奈良時代（伝承）",
    identity: "阿弥陀如来 ／ 高野山真言宗",
    lead: "四国八十八ヶ所、第二番札所。木立の中の石段を上り、阿弥陀如来を祀る本堂へ。長命杉にも出会えるお寺です。",
    history: [
      "行基の開基と伝えられ、縁起には815年に弘法大師が修法して阿弥陀如来の姿を刻んだとあります。「日照山」の名には、ご本尊の光が沖まで届いたという物語が伝わります。",
      "天正年間の兵火による焼失後、1659年に蜂須賀光隆の援助で本堂を再建。境内には安産大師や、弘法大師が植えたとされる長命杉があり、巡礼の人々の祈りを集めています。",
    ],
    timeline: [
      { year: "奈良時代", text: "行基による開基と伝わる" },
      { year: "815年の伝承", text: "弘法大師の修法とご本尊の物語" },
      { year: "1659年", text: "蜂須賀光隆の援助で本堂を再建" },
    ],
    blessings: ["安産祈願", "家内安全", "長寿"],
    belief:
      "大師堂の安産大師は安産祈願、長命杉は家内安全や長寿などの信仰で紹介されています。いずれも寺院に伝わる信仰・伝承としての紹介です。",
    highlights: [
      {
        title: "本堂へ続く石段",
        text: "境内から石段を上ると本堂へ。ご本尊は秘仏の阿弥陀如来です。",
      },
      {
        title: "長命杉",
        text: "弘法大師お手植えと伝わり、鳴門市の天然記念物に指定された大杉です。",
      },
    ],
    sources: [
      {
        title: "四国八十八ヶ所霊場会｜極楽寺",
        url: "https://88shikokuhenro.jp/02gokurakuji/",
      },
    ],
    photo: {
      src: "/places/gokurakuji.jpg",
      alt: "極楽寺の木々と本堂へ続く石段（2009年撮影）",
      author: "Reggaeman",
      license: "CC BY-SA 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
      source:
        "https://commons.wikimedia.org/wiki/File:Nisshozan_Gokurakuji_03.JPG",
      date: "2009-04-18",
    },
  },
};
