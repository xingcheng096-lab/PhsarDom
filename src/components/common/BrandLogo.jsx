import phsarDomLogo from '../../assets/phsardom-logo.png'

const compactVariants = {
  compact: { frame: 'h-9 w-9', image: 'h-[65px] w-[65px]' },
  public: { frame: 'h-10 w-10', image: 'h-[72px] w-[72px]' },
  sidebar: { frame: 'h-8 w-8', image: 'h-[58px] w-[58px]' },
}

export default function BrandLogo({ variant = 'full', className = '' }) {
  if (compactVariants[variant]) {
    const { frame, image } = compactVariants[variant]
    return (
      <span
        className={`relative inline-flex shrink-0 overflow-hidden rounded-md bg-white ${frame} ${className}`}
      >
        <img
          src={phsarDomLogo}
          alt="PhsarDom"
          width="1254"
          height="1254"
          className={`absolute left-1/2 top-0 max-w-none -translate-x-1/2 -translate-y-px object-contain ${image}`}
        />
      </span>
    )
  }

  const size = /(^|\s)w-/.test(className) ? '' : variant === 'auth' ? 'w-60' : 'w-52'
  return (
    <img
      src={phsarDomLogo}
      alt="PhsarDom Wholesale. Connecting Businesses. Growing Together."
      width="1254"
      height="1254"
      className={`h-auto max-w-full rounded-lg bg-white object-contain ${size} ${className}`}
    />
  )
}
