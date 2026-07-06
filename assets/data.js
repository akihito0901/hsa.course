/* ══ HSA 教材データ（受講生ページ・管理ページで共有） ══ */
/* url がある教材は「公開済み」。無いものは「準備中」。 */
const CATEGORIES = [
  {
    id:'basic', cls:'c1', icon:'💻', title:'基礎',
    desc:'パソコンの準備から在宅ワークの環境づくりまで、すべての土台になるコースです。',
    lessons:[
      {t:'パソコンの準備と最初の設定', d:'何を用意する？初期設定と画面の見方から始めます。', min:8, url:'lessons/basic-1.html'},
      {t:'デスクトップ・ファイル・フォルダの整理術', d:'探す時間をなくす、整理の基本ルールを作ります。', min:10, url:'lessons/basic-2.html'},
      {t:'まず覚える基本のショートカット', d:'絶対に使う基本の8つから、手に覚えさせます。', min:9, url:'lessons/basic-3.html'},
      {t:'もっと便利なショートカット・画面操作', d:'画面切り替えやスクリーンショットなど便利ワザ。', min:9, url:'lessons/basic-4.html'},
      {t:'文字入力と日本語変換のコツ', d:'入力を速くする、変換と辞書登録のコツです。', min:8, url:'lessons/basic-5.html'},
      {t:'Googleアカウントを作ろう', d:'メール・保存・カレンダーの土台になる無料アカウント。', min:8, url:'lessons/basic-6.html'},
      {t:'Googleドライブでファイルを管理する', d:'クラウドで安全に保存・共有する方法を学びます。', min:9, url:'lessons/basic-7.html'},
      {t:'Googleドキュメント・カレンダーをスマホと連動', d:'パソコンとスマホで同じ情報を使える状態に。', min:9, url:'lessons/basic-8.html'},
      {t:'AIを相棒にする準備（まず1つ触ってみる）', d:'ChatGPTに登録し、何でも聞く習慣をつけます。', min:9, url:'lessons/basic-9.html'},
      {t:'在宅ワークの環境づくり（スペース・早起き・集中）', d:'続けやすくなる、作業環境とリズムの整え方。', min:11, url:'lessons/basic-10.html'},
      {t:'仕事の受け方・契約・セキュリティの基本', d:'案件の探し方から契約・パスワード管理まで。', min:12, url:'lessons/basic-11.html'},
    ]
  },
  {
    id:'image', cls:'c2', icon:'🎨', title:'画像編集',
    desc:'Canvaを使って、バナーやSNS画像を作れるようになります。AIでの画像生成も学びます。',
    lessons:[
      {t:'画像編集とCanvaの全体像', d:'何が作れる？Canvaが初心者に最適な理由。', min:9, url:'lessons/image-1.html'},
      {t:'Canvaに登録・インストールしよう（PC・スマホ）', d:'無料登録から、PC・スマホで使える状態に。', min:8, url:'lessons/image-2.html'},
      {t:'Canvaの画面の見方と基本操作', d:'よく使う場所と、こわがらず触るコツ。', min:10, url:'lessons/image-3.html'},
      {t:'テンプレートから作ってみよう', d:'プロの型を土台に、かんたんに形にします。', min:10, url:'lessons/image-4.html'},
      {t:'文字（テキスト）を編集しよう', d:'打ち替え・大きさ・色・強弱のつけ方。', min:9, url:'lessons/image-5.html'},
      {t:'写真・画像を入れ替えよう', d:'手持ち写真の追加と、無料写真の使い方。', min:9, url:'lessons/image-6.html'},
      {t:'素材・イラスト・アイコンを使おう', d:'パーツを足して、分かりやすく仕上げます。', min:8, url:'lessons/image-7.html'},
      {t:'配色とフォントの選び方', d:'3色ルールとフォント選びで、プロっぽく。', min:11, url:'lessons/image-8.html'},
      {t:'AIで画像・素材を生成する（Canva AI・画像生成）', d:'言葉で伝えて、オリジナル画像を作ります。', min:11, url:'lessons/image-9.html'},
      {t:'バナーを作る（実践）＋書き出し・共有', d:'学んだことを総動員して1枚を完成させます。', min:12, url:'lessons/image-10.html'},
    ]
  },
  {
    id:'web', cls:'c7', icon:'🌐', title:'HP・LP制作',
    desc:'ノーコードとAIを使って、成果の出るLP（ランディングページ）を作れるようになります。',
    lessons:[
      {t:'HP・LPって何？違いと全体像', d:'ホームページとLPの違いと、学ぶ範囲を整理。', min:9, url:'lessons/web-1.html'},
      {t:'成果の出るLPの構成（共感→解決→証拠→行動）', d:'思わず申し込みたくなる「型」を学びます。', min:12, url:'lessons/web-2.html'},
      {t:'ノーコードツールを選ぼう（ペライチ・STUDIO等）', d:'コードなしで作れるツールを選びます。', min:10, url:'lessons/web-3.html'},
      {t:'AIで構成・文章のたたき台を作る', d:'AIに相談して、構成と文章を一気に用意。', min:11, url:'lessons/web-4.html'},
      {t:'ページの骨組みを作る', d:'まず全体の流れを、上から組み立てます。', min:10, url:'lessons/web-5.html'},
      {t:'文章と画像を入れていく', d:'AIの文章とCanvaの画像をはめ込みます。', min:10, url:'lessons/web-6.html'},
      {t:'デザインを整える（配色・余白）', d:'色と余白を意識して、プロっぽく仕上げ。', min:9, url:'lessons/web-7.html'},
      {t:'スマホ表示を確認・調整する', d:'見る人の大半はスマホ。崩れを直します。', min:9, url:'lessons/web-8.html'},
      {t:'公開して独自ドメインをつなぐ', d:'ボタン1つで公開、独自ドメインの基本も。', min:10, url:'lessons/web-9.html'},
      {t:'公開後の改善（アクセス解析の基本）', d:'数字を見て、LPを育てていく方法。', min:10, url:'lessons/web-10.html'},
    ]
  },
  {
    id:'sns', cls:'c3', icon:'📱', title:'SNS',
    desc:'Instagram・TikTokの運用と、集客につながる設計を学びます。AI活用でネタ切れも解消します。',
    lessons:[
      {t:'SNS運用の全体像（なぜ伸ばすのか）', d:'集客・販売・案件の入り口になる理由。', min:10, url:'lessons/sns-1.html'},
      {t:'Instagram・TikTokアカウントを作ろう', d:'仕事用アカウントを作り、プロ設定に。', min:8, url:'lessons/sns-2.html'},
      {t:'アカウントの方向性（誰に・何を）を決める', d:'投稿がブレなくなる、背骨を決めます。', min:10, url:'lessons/sns-3.html'},
      {t:'プロフィールの作り込み', d:'フォローされるかを分ける「3秒の自己紹介」。', min:9, url:'lessons/sns-4.html'},
      {t:'メタ（おすすめ表示）の仕組みを理解する', d:'伸びる投稿の条件を、仕組みから理解。', min:10, url:'lessons/sns-5.html'},
      {t:'AIで投稿ネタ・構成を量産する', d:'ネタ切れ解消。AIでネタと骨組みを大量に。', min:11, url:'lessons/sns-6.html'},
      {t:'画像投稿（フィード）の作り方', d:'1枚目が命。保存される投稿の作り方。', min:10, url:'lessons/sns-7.html'},
      {t:'リール・ショート動画の作り方（AIで台本作成）', d:'伸びやすい縦動画を、AI台本で効率よく。', min:12, url:'lessons/sns-8.html'},
      {t:'分析と改善（インサイトの見方）', d:'数字で振り返り、勝ちパターンを増やす。', min:10, url:'lessons/sns-9.html'},
      {t:'運用代行として仕事にする', d:'自分のアカウントを名刺に、案件を取る。', min:11, url:'lessons/sns-10.html'},
    ]
  },
  {
    id:'writing', cls:'c5', icon:'✍️', title:'ライティング',
    desc:'Webで読まれる文章の書き方から、AIを使った記事作成まで。文章で稼ぐ力を身につけます。',
    lessons:[
      {t:'Webライティングとは（普通の文章との違い）', d:'作文とは違う、Web文章のルールを知る。', min:9, url:'lessons/writing-1.html'},
      {t:'読まれる文章の基本ルール', d:'才能不要。守るだけで読みやすくなる型。', min:9, url:'lessons/writing-2.html'},
      {t:'記事構成の作り方', d:'書く前の設計図で、質とスピードが決まる。', min:10, url:'lessons/writing-3.html'},
      {t:'見出しのつけ方', d:'読み進めてもらえる、効く見出しのコツ。', min:8, url:'lessons/writing-4.html'},
      {t:'わかりやすい文章の書き方', d:'スッと伝わる文章を作る、いくつかのコツ。', min:9, url:'lessons/writing-5.html'},
      {t:'SEOって何？検索から読まれる仕組み', d:'検索から人が来る流れの作り方の基本。', min:10, url:'lessons/writing-6.html'},
      {t:'キーワードの選び方', d:'読者が検索する言葉から、記事を設計。', min:9, url:'lessons/writing-7.html'},
      {t:'AIを使った記事作成の実践（下書き→リライト）', d:'AIで下書き、自分で仕上げる最速の流れ。', min:12, url:'lessons/writing-8.html'},
      {t:'セールスライティングの型', d:'読み手を行動につなげる、単価の高い文章術。', min:11, url:'lessons/writing-9.html'},
      {t:'取材・インタビューのコツ／リライト術', d:'話を引き出す力と、文章を磨き直す力。', min:10, url:'lessons/writing-10.html'},
    ]
  },
  {
    id:'ai', cls:'c6', icon:'🤖', title:'AI',
    desc:'ChatGPT・Gemini・Claudeを使いこなす土台コース。すべてのスキルをAIで加速させます。',
    lessons:[
      {t:'AIでできることの全体像', d:'AIという相棒で、仕事がどう変わるか。', min:10, url:'lessons/ai-1.html'},
      {t:'ChatGPTに登録しよう', d:'もっとも有名なAIを、使える状態に。', min:8, url:'lessons/ai-2.html'},
      {t:'Gemini・Claudeも触ってみよう', d:'3つのAIの特徴と、まず1つ使い倒す。', min:9, url:'lessons/ai-3.html'},
      {t:'有料版に課金する価値', d:'賢さが段違い。課金が投資になる理由。', min:10, url:'lessons/ai-4.html'},
      {t:'基本的な使い方（質問のしかた）', d:'良い答えを引き出す、話しかけ方の基本。', min:9, url:'lessons/ai-5.html'},
      {t:'プロンプト（指示）のコツ', d:'答えの質を上げる、指示の4つの要素。', min:11, url:'lessons/ai-6.html'},
      {t:'AIで文章を作る', d:'メール・投稿・記事のたたき台を一瞬で。', min:10, url:'lessons/ai-7.html'},
      {t:'AIで画像・素材を作る', d:'言葉で伝えて、オリジナル画像を生成。', min:11, url:'lessons/ai-8.html'},
      {t:'AIで日々の作業を効率化する', d:'調べ物・要約・アイデア出しを時短。', min:10, url:'lessons/ai-9.html'},
      {t:'AIとの付き合い方・注意点', d:'頼りきらず、自分の価値も守るために。', min:9, url:'lessons/ai-10.html'},
    ]
  },
  {
    id:'sales', cls:'c4', icon:'💰', title:'コンテンツ販売',
    desc:'note・Brainでの販売からSNS集客まで。少し上級者向けのため、近日公開の会員限定コンテンツとして準備中です。',
    lessons:[
      {t:'コンテンツ販売とは（稼ぎの全体像）', d:'自分の知識を商品にして売る、全体像。', min:12},
      {t:'何を売る？売れるテーマの見つけ方（AIで発掘）', d:'AIも使って、売れるテーマを探します。', min:12},
      {t:'noteで販売してみよう', d:'手軽なnoteで、販売の第一歩を踏み出す。', min:13},
      {t:'Brainで販売してみよう', d:'紹介機能のあるBrainで販売を広げる。', min:12},
      {t:'価格の決め方', d:'安売りにならない、納得感のある価格設定。', min:10},
      {t:'AIを使った販売ページ（記事）の書き方', d:'AIを活用して、売れる販売文を作る。', min:14},
      {t:'SNSで見込み客を集める動線設計', d:'各SNSから販売ページへ人を呼び込む。', min:14},
      {t:'Xでバズらせて記事に呼び込む', d:'拡散を狙い、コンテンツに人を集める。', min:13},
      {t:'自分の商品・サービスを作る', d:'売れる感覚をつかんだら、オリジナルへ。', min:16},
      {t:'販売の仕組みを自動化する', d:'繰り返し売れる導線を、仕組み化します。', min:12},
    ]
  },
];
