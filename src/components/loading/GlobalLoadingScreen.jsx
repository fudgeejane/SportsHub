import navLogo from '../../assets/SportsHub.png'

export default function GlobalLoadingScreen({ label = 'Loading SportsHub...' }) {
  return (
    <div
      className="fixed inset-0 z-[200] grid min-h-screen place-items-center bg-white px-6 text-center"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="flex w-full max-w-xs flex-col items-center">
        <div className="relative grid h-24 w-24 place-items-center">
          <span className="absolute inset-0 rounded-full border-4 border-cyan-100" />
          <span className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-500 border-r-blue-500 motion-safe:animate-spin" />
          <img src={navLogo} alt="SportsHub" className="h-14 w-14 object-contain" />
        </div>
       
      </div>
    </div>
  )
}
