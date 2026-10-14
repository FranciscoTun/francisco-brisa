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

        {/* pestañas superiores en el borde */}
        <path
          className="lashes-up"
          d="M15 8.5 L12 5.5 M24 6 L24 2.8 M33 8.5 L36 5.5"
        />
        {/* pestañas inferiores bajo el borde */}
        <path
          className="lashes-down"
          d="M13.5 22.5 L11.8 25.3 M24 26.4 L24 29.5 M34.5 22.5 L36.2 25.3"
        />

        {/* párpado — se repliega hacia arriba al abrir */}
        <path
          className="lid"
          d="M4 16 C12 6, 36 6, 44 16 C36 26, 12 26, 4 16 Z"
        />
      </svg>
    </button>
  )
}
