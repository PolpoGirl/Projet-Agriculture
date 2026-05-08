import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Download, Info } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

interface InstallButtonProps {
  compact?: boolean
}

const isIosDevice = () =>
  /iphone|ipad|ipod/i.test(window.navigator.userAgent) ||
  ((window.navigator.platform === 'MacIntel' || window.navigator.platform === 'MacPPC') &&
    window.navigator.maxTouchPoints > 1)

export default function InstallButton({ compact = false }: InstallButtonProps) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  const ios = useMemo(
    () => (typeof window !== 'undefined' ? isIosDevice() : false),
    []
  )

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true

    if (standalone) {
      setIsInstalled(true)
      return
    }

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as BeforeInstallPromptEvent)
      setShowHelp(false)
    }

    const onInstalled = () => {
      setIsInstalled(true)
      setInstallPrompt(null)
      setShowHelp(false)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) {
      setShowHelp((prev) => !prev)
      return
    }

    await installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice

    if (outcome === 'accepted') {
      setIsInstalled(true)
      setInstallPrompt(null)
      setShowHelp(false)
    }
  }

  if (isInstalled) {
    if (compact) return null

    return (
      <div className="inline-flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700">
        <CheckCircle2 size={16} />
        Application installee
      </div>
    )
  }

  const button = (
    <button
      type="button"
      onClick={() => void handleInstall()}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition-all ${
        installPrompt
          ? 'bg-green-600 text-white hover:bg-green-700 hover:shadow-md'
          : 'border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
      }`}
    >
      {installPrompt ? <Download size={16} /> : <Info size={16} />}
      {installPrompt ? "Loading..." : "Erreur connexion Serveur"}
    </button>
  )

  if (compact) return button

  return (
    <div className="flex flex-col items-start gap-2">
      {button}

      {!installPrompt && (
        <p className="text-xs text-gray-500">
          Si l'installation directe n'apparait pas, ouvre l'aide ci-dessous.
        </p>
      )}

      {!installPrompt && showHelp && (
        <div className="max-w-md rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-800">
          {ios
            ? 'Sur iPhone ou iPad, ouvre le menu Partager de Safari puis choisis Ajouter a l ecran d accueil.'
            : "Si le navigateur ne propose pas encore l'installation, ouvre son menu puis cherche Installer l'application ou Ajouter a l'ecran d'accueil. Sur Android, une page ouverte en HTTP local peut ne jamais afficher l'installation automatique."}
        </div>
      )}
    </div>
  )
}
