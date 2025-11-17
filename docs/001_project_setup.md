# 001: Project Setup - Next.js 15 + TypeScript + Tailwind CSS v4

## 概要
Bitcoin Navi プロジェクトの初期セットアップを行う。Next.js 15、TypeScript、Tailwind CSS v4 を使用した開発環境を構築する。

## 技術スタック
- **Framework**: Next.js 15.4.3 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **Font**: Geist Sans & Geist Mono
- **Package Manager**: npm

## TODO
- [x] Next.js 15 プロジェクト作成
- [x] TypeScript strict モード設定
- [x] Tailwind CSS v4 インストール・設定
- [x] Geist フォント設定
- [x] ESLint 設定
- [x] Path Aliases 設定 (`@/*`)
- [x] Project Structure 構築
- [x] `.env.local.example` ファイル作成
- [x] README.md 作成

## 実装詳細

### 1. プロジェクト作成
```bash
npx create-next-app@latest bitcoin_navi --typescript --tailwind --app --use-npm
cd bitcoin_navi
```

### 2. tsconfig.json 設定
```json
{
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 3. Tailwind CSS v4 設定
```bash
npm install tailwindcss@next @tailwindcss/postcss@next
```

### 4. Geist フォント設定
`src/app/layout.tsx`:
```typescript
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
```

### 5. ディレクトリ構造
```
bitcoin_navi/
├── src/
│   ├── app/              # Next.js 15 App Router
│   ├── components/       # 共有コンポーネント
│   │   ├── ui/          # 基本UIコンポーネント
│   │   └── features/    # 機能別コンポーネント
│   ├── lib/             # ユーティリティ関数
│   ├── hooks/           # カスタムReact Hooks
│   └── types/           # TypeScript型定義
├── public/              # Static assets
├── docs/                # チケット管理
├── .env.local.example   # 環境変数テンプレート
└── README.md
```

### 6. 環境変数テンプレート
`.env.local.example` を作成し、必要な環境変数を記載。

## 完了条件
- [x] `npm run dev` でローカルサーバーが起動できる
- [x] TypeScript のエラーがない
- [x] Tailwind CSS が正しく動作する
- [x] ESLint が正しく動作する
- [x] Path Aliases が正しく動作する

## 🎉 実装完了（2025-11-09）
全ての初期設定が完了しました！
- Next.js 15.4.3 + TypeScript + Tailwind CSS v4
- 依存関係: recharts, lucide-react, framer-motion, clsx, tailwind-merge
- Geist フォント統合完了
- プロジェクト構造構築完了

## 関連チケット
- 次: #002 ダークモード UI 基盤構築
