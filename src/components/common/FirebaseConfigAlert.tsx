export default function FirebaseConfigAlert() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-surface-card rounded-2xl border border-border p-6 text-center">
        <div className="w-16 h-16 bg-primary-light rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-primary text-3xl">settings</span>
        </div>
        <h1 className="text-xl font-bold text-text-primary mb-2">Configuração necessária</h1>
        <p className="text-text-secondary text-sm mb-4">
          O Firebase ainda não foi configurado. Preencha as credenciais no arquivo <code className="bg-gray-100 px-1.5 py-0.5 rounded text-primary text-xs font-mono">.env</code> na raiz do projeto.
        </p>
        <div className="bg-gray-50 rounded-xl p-4 text-left text-xs font-mono text-text-secondary space-y-1">
          <p>VITE_FIREBASE_API_KEY=...</p>
          <p>VITE_FIREBASE_AUTH_DOMAIN=...</p>
          <p>VITE_FIREBASE_PROJECT_ID=...</p>
          <p>VITE_FIREBASE_STORAGE_BUCKET=...</p>
          <p>VITE_FIREBASE_MESSAGING_SENDER_ID=...</p>
          <p>VITE_FIREBASE_APP_ID=...</p>
        </div>
        <p className="text-text-muted text-xs mt-4">
          Após preencher, reinicie o servidor de desenvolvimento.
        </p>
      </div>
    </div>
  )
}
