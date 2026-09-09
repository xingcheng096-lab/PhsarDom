import BrandLogo from '../common/BrandLogo'

export default function Footer({ publicView = false }) {
  if (publicView) {
    return (
      <footer className="border-t border-slate-200 bg-slate-50 px-5 py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left">
          <BrandLogo variant="full" className="w-28 sm:w-32" />
          <div className="text-xs text-slate-500 sm:text-right">
            <strong className="block text-sm text-slate-800">B2B Wholesale Marketplace &amp; Management Platform</strong>
            <span className="mt-2 block">© 2026 PhsarDom. All rights reserved.</span>
          </div>
        </div>
      </footer>
    )
  }

  return <footer className="app-footer flex flex-col justify-between gap-1 border-t border-slate-200 bg-white px-5 py-3 text-xs text-slate-500 sm:flex-row"><span>© 2026 PhsarDom. All rights reserved.</span><span>B2B Wholesale Marketplace &amp; Management Platform</span></footer>
}
