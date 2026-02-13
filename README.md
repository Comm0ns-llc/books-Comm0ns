# 本のコモンズ (books-comm0ns2)

本のコモンズは、Comm0ns構想の初期実装プロジェクトの一つです。  
本という「知の資産」を媒介に、リソースの共有とコミュニティの交流を促進する分散型図書館システムを目指します。

- コンセプト詳細: `/Users/tsukuru/Dev/myprojects/comm0ns/books-comm0ns2/docs/CONCEPT.md`
- 構成整理: `/Users/tsukuru/Dev/myprojects/comm0ns/books-comm0ns2/docs/APP_STRUCTURE.md`

## プロダクト概要

- 参加メンバーそれぞれが「マイクロ図書館」として蔵書を管理・公開
- 個人の本棚をネットワーク接続し、分散型の図書館体験を実現
- 貸出リクエスト、承認、返却、感想共有を一連のフローとして提供

## 現在の実装範囲

### フロントエンド

- Next.js App Router ベースのUI
- モバイルUI（既存体験）
- Web UI（デスクトップ最適化）
- 表示モード切替: `?ui=mobile | web | auto`

### API (Route Handlers)

- 認証: `/api/auth/signup`, `/api/auth/login`
- ユーザー: `/api/users/me`, `/api/users/:id`, `/api/invitations`
- 書籍/本棚: `/api/books/*`, `/api/user-books/*`, `/api/users/:id/books`
- 貸出: `/api/loans/*`
- 感想: `/api/books/:id/reviews`, `/api/reviews/*`
- メッセージ/通知: `/api/messages/:userId`, `/api/notifications*`

### データベース

- `db/migrations/0001_init.sql` 初期スキーマ
- `db/migrations/0002_rls.sql` RLSポリシー
- `db/migrations/0003_functions.sql` 補助関数・トリガー

## 技術スタック

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Supabase (Auth / PostgreSQL / RLS)
- Zod (バリデーション)

## セットアップ

1. 依存関係をインストール

```bash
npm install
```

2. 環境変数を設定

```bash
cp .env.example .env.local
```

`.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase Project Settings > API > Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase Project Settings > API > Project API keys > `anon` `public`
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase Project Settings > API > Project API keys > `service_role` `secret`

3. SupabaseにSQLを適用

- `db/migrations/0001_init.sql`
- `db/migrations/0002_rls.sql`
- `db/migrations/0003_functions.sql`
- `db/migrations/0004_relationships_places.sql`

4. 開発サーバー起動

```bash
npm run dev
```

5. 型チェック

```bash
npm run typecheck
```

## UIモード（デバッグ）

- `?ui=mobile`: モバイルUI固定
- `?ui=web`: Web UI固定
- `?ui=auto` または未指定: 画面幅に応じて自動切替

例:

- `http://localhost:3000/?ui=mobile`
- `http://localhost:3000/?ui=web`

## ディレクトリ構成（主要）

```txt
app/                 Next.js App Router
components/          UIコンポーネント
db/migrations/       Supabase向けSQL
lib/                 Supabase/認証/バリデーションユーティリティ
docs/                設計・コンセプト資料
```

## 今後の優先実装

1. Supabase型生成の導入（DBスキーマとの型同期）
2. 貸出ステート遷移のトランザクション化
3. UIの実データ連携（モック依存の縮小）
4. 通知・DMのRealtime対応
5. E2E / RLS統合テスト整備

## メモ

- 招待コード機能は将来実装予定です。現在の新規登録では招待コード未入力でも登録可能です（入力時のみ検証）。
