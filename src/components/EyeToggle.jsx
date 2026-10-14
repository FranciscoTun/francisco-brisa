export default function EyeToggle({ open, onToggle }) {
  return (
    <button
      type="button"
      className="eye-btn"
      onClick={onToggle}
      aria-label={open ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      aria-pressed={open}
    >
      <svg
        viewBox="0 0 48 32"
        className={`eye-svg${open ? ' open' : ''}`}
        aria-hidden="true"
      >
        <defs>
          <clipPath id="eyeClip">
            <path d="M4 16 C12 6, 36 6, 44 16 C36 26, 12 26, 4 16 Z" />
          </clipPath>
        </defs>

        {/* globo ocular */}
        <path
          className="eyeball"
          d="M4 16 C12 6, 36 6, 44 16 C36 26, 12 26, 4 16 Z"
        />
        <g clipPath="url(#eyeClip)">
          <g className="pupil-g">
            <circle className="iris" cx="24" cy="16" r="6.8" />
            <circle className="pupil" cx="24" cy="16" r="3.1" />
            <circle className="glint" cx="22.3" cy="14" r="1.1" />
          </g>
        </g>

        {/* pestañas superiores (siempre en el borde) */}
        <path
          className="lashes-up"
          d="M15 8.5 L12 5.5 M24 6 L24 2.8 M33 8.5 L36 5.5"
        />

        {/* párpado — se repliega hacia arriba al abrir */}
        <path
          className="lid"
          d="M4 16 C12 6, 36 6, 44 16 C36 26, 12 26, 4 16 Z"
        />

        {/* línea de ojo cerrado + pestañas inferiores */}
        <g className="lashline">
          <path className="seam" d="M8 15.5 C16 21, 32 21, 40 15.5" />
          <path
            className="lashes-down"
            d="M15 18.5 L13 21.5 M24 19.8 L24 23 M33 18.5 L35 21.5"
          />
        </g>
      </svg>
    </button>
  )
}
