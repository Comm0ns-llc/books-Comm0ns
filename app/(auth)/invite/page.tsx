export default function InvitePage() {
  return (
    <main className="mx-auto max-w-md space-y-4 px-4 py-10">
      <h1 className="text-2xl font-bold">招待で参加</h1>
      <p className="text-sm text-slate-600">招待コードで信頼ベースのコミュニティに参加します。</p>
      <form className="space-y-3 rounded-xl border bg-white p-4">
        <input
          className="w-full rounded-md border px-3 py-2"
          name="inviteCode"
          placeholder="招待コード"
        />
        <input className="w-full rounded-md border px-3 py-2" name="name" placeholder="表示名" />
        <button className="w-full rounded-md bg-teal-700 px-3 py-2 text-white" type="submit">
          アカウント作成
        </button>
      </form>
    </main>
  );
}
