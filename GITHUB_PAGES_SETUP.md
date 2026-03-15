# GitHub Pages 公開手順

## 概要

このアプリは **GitHub Pages + GitHub Actions** で自動デプロイできます。  
`main` ブランチにプッシュするたびに自動でビルド・公開されます。

---

## STEP 1: GitHubリポジトリを作成してコードをプッシュ

```bash
# GitHubでリポジトリを作成後（例: english-learning-7steps）

# プロジェクトディレクトリで初期化
cd english-learning-7steps
git init
git add .
git commit -m "Initial commit"

# GitHubリポジトリに接続してプッシュ
git remote add origin https://github.com/あなたのユーザー名/english-learning-7steps.git
git branch -M main
git push -u origin main
```

---

## STEP 2: GitHub Pages を有効化

1. GitHubのリポジトリページを開く
2. **Settings** → **Pages** を開く
3. **Source** を `GitHub Actions` に変更する
4. 保存する

これだけで、次回の `main` プッシュ時に自動デプロイが始まります。

---

## STEP 3: Firebase を設定（クラウド同期を使う場合）

### 3-1. Firebase プロジェクト作成

1. [Firebase Console](https://console.firebase.google.com) を開く
2. 「プロジェクトを追加」→ プロジェクト名を入力（例: `english-learning`）
3. Google アナリティクスは任意（オフでOK）

### 3-2. Authentication を設定

1. 左メニュー「Authentication」→「始める」
2. 「ログイン方法」タブ → 「Google」をクリック
3. 「有効にする」をON → プロジェクトのサポートメールを選択 → 保存

### 3-3. Realtime Database を作成

1. 左メニュー「Realtime Database」→「データベースを作成」
2. ロケーション: `asia-southeast1`（シンガポール）を推奨
3. セキュリティルール: **テストモードで開始**（後で変更）

### 3-4. セキュリティルールを設定

Firebase Console → Realtime Database → 「ルール」タブで以下を設定:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

「公開」をクリックして保存。

### 3-5. ウェブアプリの設定値を取得

1. プロジェクト設定（歯車アイコン）→「全般」タブ
2. 「マイアプリ」セクション → ウェブアプリを追加（`</>`アイコン）
3. アプリ名を入力 → 「アプリを登録」
4. 「SDK の設定と構成」→ 「構成」を選択
5. 表示された設定値をコピー

### 3-6. Firebase の承認済みドメインを追加

1. Firebase Console → Authentication → 「Settings」タブ
2. 「承認済みドメイン」→「ドメインを追加」
3. `あなたのユーザー名.github.io` を追加

### 3-7. アプリでFirebase設定を入力

1. 公開したアプリを開く
2. 右上の「設定」ページを開く
3. 「Firebase クラウド同期」セクションに設定値を入力
4. 「Firebase設定を保存」をクリック
5. ページを再読み込み
6. 「Googleでログイン」をクリック

---

## 公開URL

```
https://あなたのユーザー名.github.io/english-learning-7steps/
```

---

## 注意事項

- **APIキー（Gemini・ChatGPT）はクラウドに同期されません**  
  セキュリティ上、各端末のブラウザに個別に入力してください。

- **Firebase設定値もクラウドに同期されません**  
  各端末で設定ページから入力してください。

- **データはGoogleアカウントに紐付けて保存されます**  
  同じGoogleアカウントでログインすれば、PC・スマホで同じデータが使えます。
