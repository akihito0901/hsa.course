/* ══ HSA 教材データ（受講生ページ・管理ページで共有） ══ */
/* url がある教材は「公開済み」。無いものは「準備中」。 */
const CATEGORIES = [
  {
    id:'basic', cls:'c1', icon:'💻', title:'基礎',
    desc:'PC操作から在宅ワークの始め方まで、すべての土台になる章です。',
    lessons:[
      {t:'PCの基本操作とショートカット', d:'ファイル管理・ショートカットキーなど、これから使い続ける基本操作を整理します。', min:10, url:'lessons/basic-1.html'},
      {t:'効率化ツールの使い方', d:'クラウドストレージ・拡張機能など、作業を早くする定番ツールを紹介します。', min:12, url:'lessons/basic-2.html'},
      {t:'在宅ワークの始め方と環境づくり', d:'作業環境の整え方、生活リズムとの両立の考え方をまとめます。', min:8, url:'lessons/basic-3.html'},
      {t:'仕事の受け方・契約の基本', d:'案件の探し方から契約・請求までの流れを、はじめての人向けに解説します。', min:14, url:'lessons/basic-4.html'},
      {t:'セキュリティとトラブル対策', d:'パスワード管理や情報漏えい対策など、最低限おさえておきたい知識です。', min:9, url:'lessons/basic-5.html'},
    ]
  },
  {
    id:'design', cls:'c2', icon:'🎨', title:'デザイン',
    desc:'バナーからLPまで、「伝わる」を形にするスキルを学びます。',
    lessons:[
      {t:'Canvaの基本操作', d:'テンプレートの使い方から書き出しまで、Canvaの基本を一通り学びます。', min:13, url:'lessons/design-1.html'},
      {t:'バナーデザインの基礎', d:'配色・余白・文字の優先順位など、見やすいバナーの作り方の原則です。', min:12, url:'lessons/design-2.html'},
      {t:'LPデザインの考え方', d:'ユーザーの視線誘導を意識した、成果の出るLP構成の考え方を解説します。', min:16, url:'lessons/design-3.html'},
      {t:'ノーコードでのサイト制作', d:'コードを書かずにサイトを組み立てる、ノーコードツールの使い方です。', min:16, url:'lessons/design-4.html'},
      {t:'配色・フォントの選び方', d:'印象を左右する配色とフォント選びの基本ルールをまとめます。', min:11, url:'lessons/design-5.html'},
    ]
  },
  {
    id:'sns', cls:'c3', icon:'📱', title:'SNS',
    desc:'Instagram・TikTokの運用と、集客につながる設計を学びます。',
    lessons:[
      {t:'Instagram・TikTokの基本設計', d:'2つのSNSの使い分けと、メタの考え方・運用の全体像を整理します。', min:14, url:'lessons/sns-1.html'},
      {t:'投稿ネタの作り方', d:'ネタ切れしないための企画の考え方・ストックの作り方です。', min:11, url:'lessons/sns-2.html'},
      {t:'リール・ショート動画の作り方', d:'伸びやすい構成の型と、簡単な編集の流れを解説します。', min:16, url:'lessons/sns-3.html'},
      {t:'集客につながるプロフィール設計', d:'プロフィール欄で興味を引き、フォローにつなげる書き方です。', min:10, url:'lessons/sns-4.html'},
      {t:'運用代行としての動き方', d:'代行案件を受ける際の進め方・クライアントとのやり取りの基本です。', min:12, url:'lessons/sns-5.html'},
    ]
  },
  {
    id:'sales', cls:'c4', icon:'💰', title:'コンテンツ販売',
    desc:'note・Brainでの販売からSNS集客まで。少し上級者向けの内容のため、近日公開の会員限定コンテンツとして準備中です。',
    lessons:[
      {t:'note・Brainで始めるコンテンツ販売', d:'まずは手軽なnote・Brainで、自分の知識を商品として売る第一歩。', min:14},
      {t:'SNSで見込み客を集める動線設計', d:'Instagram・YouTube・Xから、販売ページへ人を呼び込む流れを作ります。', min:15},
      {t:'Xでバズらせて記事に呼び込む', d:'発信を広げ、コンテンツを見つけてもらうための拡散のコツです。', min:13},
      {t:'自分の商品・サービスを作る', d:'売れる感覚をつかんだら、オリジナル商品づくりへ。少し難易度は高めです。', min:16},
      {t:'販売の仕組みを自動化する', d:'集客から販売までの導線を整え、繰り返し売れる形にしていきます。', min:12},
    ]
  },
  {
    id:'writing', cls:'c5', icon:'✍️', title:'ライティング',
    desc:'記事作成からセールス文章まで、文章で稼ぐ力を身につけます。',
    lessons:[
      {t:'記事構成の基本', d:'読まれる記事の型、見出しの作り方の基礎を学びます。', min:12, url:'lessons/writing-1.html'},
      {t:'SEOライティングの基礎', d:'検索から読まれるための、キーワード選定と書き方の基本です。', min:14, url:'lessons/writing-2.html'},
      {t:'セールスライティングの型', d:'読み手の心を動かし、行動につなげる文章の型を解説します。', min:15, url:'lessons/writing-3.html'},
      {t:'取材・インタビューのコツ', d:'相手の魅力を引き出す質問の仕方、まとめ方のコツです。', min:9, url:'lessons/writing-4.html'},
      {t:'読まれる文章のリライト術', d:'書いた文章を「もっと伝わる」形に磨き直す方法です。', min:10, url:'lessons/writing-5.html'},
    ]
  },
  {
    id:'ai', cls:'c6', icon:'🤖', title:'AI',
    desc:'ChatGPT・Gemini・Claudeを使いこなし、日々の仕事に活かす方法を学びます。',
    lessons:[
      {t:'主要AI（ChatGPT・Gemini・Claude）の使い分け', d:'3つの主要AIの特徴と、有料版に課金する価値を解説します。', min:12, url:'lessons/ai-1.html'},
      {t:'プロンプト設計のコツ', d:'欲しい回答を引き出すための、質問・指示の組み立て方です。', min:13, url:'lessons/ai-2.html'},
      {t:'AIで画像・素材を作る', d:'画像生成AIを使って、バナーや素材のたたき台を作る方法です。', min:14, url:'lessons/ai-3.html'},
      {t:'AIによる業務効率化', d:'調べもの・要約・整理など、日々の作業を時短する使い方です。', min:11, url:'lessons/ai-4.html'},
      {t:'AIライティングとの付き合い方', d:'AIに書かせた文章を、自分の言葉として整えるための考え方です。', min:9, url:'lessons/ai-5.html'},
    ]
  },
];
