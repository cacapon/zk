<h1>
  <img src="assets/icon-markless.svg" width="64" style="vertical-align: middle;">
  Zk – CLI-oriented Zettelkasten for Obsidian
</h1>

キー操作だけでノートを作り、繋げ、育てるための
**Obsidian向け Zettelkasten プラグイン**。

UI操作に頼らず、思考の流れを止めないことを最優先に設計しています。

---

## コンセプト

- キー操作だけで完結
- **モード**でノートの種類（Core / Temp / Ref など）を切り替える
- 操作は UI ではなく **文脈（モード・選択テキスト）** で決まる

---

## できること

| コマンド | 説明 |
|---|---|
| Zk: モードを作成 | モードを新規作成する（フォルダ・rootノート・テンプレートを自動生成） |
| Zk: モードを切り替え | モード一覧から切り替える |
| Zk: モードを削除 | モード一覧から削除する |
| Zk: Zettelを開く・作る | テキストを選択した状態で実行すると即作成＋リンク化、未選択の場合はノート名を入力して作成 |

---

## インストール

[BRAT](https://github.com/TfTHacker/obsidian42-brat) を使ってインストールできます。

1. BRATプラグインをインストール・有効化
2. BRATの設定から「Add Beta plugin」を選択
3. このリポジトリのURLを入力

---

## 設定

Obsidianの設定 → Zk から以下を変更できます。

| 設定 | 説明 | デフォルト |
|---|---|---|
| デフォルトノートフォルダ | モード作成時のフォルダパスの初期値 | `Zk` |
| デフォルトテンプレートフォルダ | モード作成時のテンプレートパスの初期値 | `Templates` |

---

## ライセンス

MIT License.
