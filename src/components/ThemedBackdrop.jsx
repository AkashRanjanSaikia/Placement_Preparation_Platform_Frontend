import { useTheme } from '../context/ThemeProvider.jsx'

/** Shared focal point — one asset, same crop in every theme. */
const BG_OBJECT_POSITION = 'center 42%'

const VARIANTS = {
  landing: {
    light: 'bg-cream/20',
    dark: 'bg-linear-to-r from-black/88 via-black/55 to-black/22',
    lightFilter: 'brightness(1) contrast(1) saturate(1)',
  },
  dashboard: {
    light: 'bg-zinc-100/92',
    dark: 'bg-black/88',
    lightFilter: 'brightness(1.04) contrast(1) saturate(0.62)',
  },
  /** Inside a practice session — heavy wash so the photo stays subtle. */
  focus: {
    light: 'bg-zinc-100/94',
    dark: 'bg-black/92',
    lightFilter: 'brightness(1.06) contrast(1) saturate(0.55)',
  },
}

/**
 * Single photo for light and dark — dark mode uses filter + overlay only
 * so theme toggle does not jump to a differently cropped image.
 */
export default function ThemedBackdrop({ variant = 'dashboard' }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const layers = VARIANTS[variant] ?? VARIANTS.dashboard

  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      <img
        src="/light_bg.jpeg"
        alt=""
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover transition-[filter] duration-500 ease-in-out will-change-[filter]"
        style={{
          objectPosition: BG_OBJECT_POSITION,
          filter: isDark
            ? 'brightness(0.32) contrast(1.06) saturate(0.82)'
            : layers.lightFilter,
        }}
      />
      <div
        className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${layers.light}`}
        style={{ opacity: isDark ? 0 : 1 }}
      />
      <div
        className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${layers.dark}`}
        style={{ opacity: isDark ? 1 : 0 }}
      />
    </div>
  )
}
