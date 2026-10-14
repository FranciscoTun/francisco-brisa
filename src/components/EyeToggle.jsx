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

        {/* ojo cerrado: arco + pestañas hacia abajo */}
        <g className="eye-closed">
          <path className="arc" d="M6 14 C14 26, 34 26, 42 14" />
          <path
            className="ticks"
            d="M9.2 17.6 L7.4 20.3 M14.1 21.7 L12.8 24.7 M19 23.9 L18 26.9 M24 24.6 L24 28.1 M29 23.9 L30 26.9 M33.9 21.7 L35.2 24.7 M38.8 17.6 L40.6 20.3"
          />
        </g>

        {/* ojo abierto: almendra + iris + pestañas arriba */}
        <g className="eye-open">
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
          <path
            className="lashes-up"
            d="M11.8 10.2 L10.3 7.3 M16.4 8.7 L15.6 5.6 M20.4 7.9 L20.1 4.6 M24 7.7 L24 4.4 M27.6 7.9 L27.9 4.6 M31.6 8.7 L32.4 5.6 M36.2 10.2 L37.7 7.3"
          />
        </g>
      </svg>
    </button>
  )
}
