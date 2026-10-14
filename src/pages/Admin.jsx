import { useCallback, useEffect, useState } from 'react'
import {
  adminCreateGift,
  adminDeleteGift,
  adminLogin,
  adminPreviewGift,
  adminReleaseGift,
  adminSearchGifts,
  adminSetWishlistSettings,
  adminUpdateGift,
  adminWishlist,
  adminWishlistSettings,
  createInvitation,
  deleteInvitation,
  getResumen,
  listInvitations,
  listSongs,
  updateInvitation,
} from '../api.js'
import { useModalClose } from '../hooks/useModalClose.js'
import EyeToggle from '../components/EyeToggle.jsx'
import '../components/Modal.css'
import './Admin.css'

const inviteLink = (token) =>
  `${location.origin}${import.meta.env.BASE_URL}?i=${token}`

export default function Admin() {
  const [token, setToken] = useState(
    () => sessionStorage.getItem('adm_token') || '',
  )

  if (!token)
    return (
      <Login
        onOk={(t) => {
          sessionStorage.setItem('adm_token', t)
          setToken(t)
        }}
      />
    )

  return (
    <Dashboard
      token={token}
      onLogout={() => {
        sessionStorage.removeItem('adm_token')
        setToken('')
      }}
    />
  )
}

function Login({ onOk }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setErr('')
    try {
      onOk((await adminLogin({ username, password })).token)
    } catch {
      setErr('Usuario o contraseña incorrectos')
      setBusy(false)
    }
  }

  return (
    <div className="admin-screen">
      <form className="login-card" onSubmit={submit}>
        <h1 className="admin-title">Administración</h1>
        <p className="admin-sub">B &amp; F — Nuestra boda</p>
        <input
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
        />
        <div className="pass-wrap">
          <input
            type={showPw ? 'text' : 'password'}
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          <EyeToggle open={showPw} onToggle={() => setShowPw((v) => !v)} />
        </div>
        {err && <p className="login-err">{err}</p>}
        <button type="submit" className="login-btn" disabled={busy}>
          {busy ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}

const Stat = ({ n, l }) => (
  <div className="stat">
    <span className="stat-n">{n}</span>
    <span className="stat-l">{l}</span>
  </div>
)

const Status = ({ inv }) =>
  !inv.confirmed ? (
    <span className="st wait">Pendiente</span>
  ) : inv.attendees === 0 ? (
    <span className="st no">Declinada</span>
  ) : (
    <span className="st ok">
      {inv.attendees}/{inv.max_guests}
    </span>
  )

function InvFormModal({ inv, token, onClose, onSaved }) {
  const [name, setName] = useState(inv?.name || '')
  const [passes, setPasses] = useState(inv?.max_guests || '')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  useModalClose(onClose)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setErr('')
    try {
      const body = { name: name.trim(), max_guests: Number(passes) }
      if (inv) await updateInvitation(inv.token, token, body)
      else await createInvitation(token, body)
      onSaved()
      onClose()
    } catch {
      setErr('No se pudo guardar la invitación')
      setBusy(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="inv-modal-title"
      >
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>
        <h3 id="inv-modal-title" className="modal-title">
          {inv ? 'Editar invitación' : 'Nueva invitación'}
        </h3>
        <form onSubmit={submit}>
          <input
            placeholder="Referencia (ej. Familia López)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="number"
            min="1"
            max="20"
            placeholder="Número de pases"
            value={passes}
            onChange={(e) => setPasses(e.target.value)}
            required
          />
          {err && <p className="login-err">{err}</p>}
          <button type="submit" className="modal-submit" disabled={busy}>
            {busy ? 'Guardando…' : inv ? 'Guardar cambios' : 'Crear invitación'}
          </button>
        </form>
      </div>
    </div>
  )
}

function DeleteModal({ inv, token, onClose, onDeleted }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  useModalClose(onClose)

  const confirm = async () => {
    setBusy(true)
    setErr('')
    try {
      await deleteInvitation(inv.token, token)
      onDeleted(inv.token)
      onClose()
    } catch {
      setErr('No se pudo eliminar la invitación')
      setBusy(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="del-modal-title"
      >
        <h3 id="del-modal-title" className="modal-title">
          Eliminar invitación
        </h3>
        <p className="del-text">
          Se eliminará la invitación para <strong>{inv.name}</strong>. Esta
          acción no se puede deshacer.
        </p>
        {err && <p className="login-err">{err}</p>}
        <div className="del-actions">
          <button type="button" className="del-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="del-confirm"
            onClick={confirm}
            disabled={busy}
          >
            {busy ? 'Eliminando…' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Dashboard({ token, onLogout }) {
  const [resumen, setResumen] = useState(null)
  const [invs, setInvs] = useState([])
  const [songs, setSongs] = useState([])
  const [err, setErr] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [copied, setCopied] = useState(null)
  const [tab, setTab] = useState('invs')
  const [wish, setWish] = useState([])
  const [wishCfg, setWishCfg] = useState(null)
  const [giftForm, setGiftForm] = useState(null) // {} = crear, {item} = editar
  const [deletingGift, setDeletingGift] = useState(null)

  const songsOf = (invToken) => songs.filter((s) => s.token === invToken)

  const load = useCallback(async () => {
    try {
      const [r, i, s, w, wc] = await Promise.all([
        getResumen(token),
        listInvitations(token),
        listSongs(token),
        adminWishlist(token),
        adminWishlistSettings(token),
      ])
      setResumen(r)
      setInvs(i)
      setSongs(s)
      setWish(w)
      setWishCfg(wc)
    } catch (e) {
      if (e.status === 401 || e.status === 403) onLogout()
      else setErr('No se pudo cargar. Revisa que el API esté corriendo.')
    }
  }, [token, onLogout])

  useEffect(() => {
    load()
  }, [load])

  const removeInv = (invToken) =>
    setInvs((list) => list.filter((i) => i.token !== invToken))

  const copy = async (inv) => {
    try {
      await navigator.clipboard.writeText(inviteLink(inv.token))
    } catch {
      /* portapapeles no disponible */
    }
    setCopied(inv.token)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="dash">
      <header className="dash-head">
        <h1 className="admin-title">Panel</h1>
        <div className="dash-actions">
          <button
            type="button"
            className="new-inv"
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
          >
            + Nueva invitación
          </button>
          <button type="button" className="logout" onClick={onLogout}>
            Salir
          </button>
        </div>
      </header>

      {err && <p className="login-err">{err}</p>}

      {resumen && (
        <div className="stats">
          <Stat n={resumen.invitaciones_total} l="Invitaciones" />
          <Stat n={resumen.pases_total} l="Pases totales" />
          <Stat n={resumen.confirmadas} l="Confirmadas" />
          <Stat n={resumen.asistentes_confirmados} l="Asistentes" />
          <Stat n={resumen.declinaron} l="Declinaron" />
          <Stat n={resumen.pendientes} l="Pendientes" />
          <Stat n={resumen.canciones_sugeridas} l="Canciones" />
        </div>
      )}

      <nav className="tabs">
        <button
          type="button"
          className={`tab ${tab === 'invs' ? 'active' : ''}`}
          onClick={() => setTab('invs')}
        >
          Invitaciones
        </button>
        <button
          type="button"
          className={`tab ${tab === 'songs' ? 'active' : ''}`}
          onClick={() => setTab('songs')}
        >
          Canciones sugeridas
        </button>
        <button
          type="button"
          className={`tab ${tab === 'wishlist' ? 'active' : ''}`}
          onClick={() => setTab('wishlist')}
        >
          Lista de deseos
        </button>
      </nav>

      {tab === 'invs' && (
        <section className="dash-section">
          {invs.length === 0 ? (
            <p className="empty">
              Aún no hay invitaciones. Crea la primera con «+ Nueva
              invitación».
            </p>
          ) : (
            <div className="inv-table-wrap">
              <table className="inv-table">
                <thead>
                  <tr>
                    <th>Referencia</th>
                    <th>Pases</th>
                    <th>Estado</th>
                    <th>Link</th>
                    <th>Canciones</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {invs.map((i) => (
                    <tr key={i.token}>
                      <td className="cell-name">{i.name}</td>
                      <td>{i.max_guests}</td>
                      <td>
                        <Status inv={i} />
                      </td>
                      <td className="cell-link" title={inviteLink(i.token)}>
                        {inviteLink(i.token)}
                      </td>
                      <td className="cell-songs">
                        {songsOf(i.token).length === 0
                          ? '—'
                          : songsOf(i.token).map((s) => (
                              <span key={s.id} className="song-chip">
                                {s.song} · {s.artist}
                              </span>
                            ))}
                      </td>
                      <td className="cell-actions">
                        <button
                          type="button"
                          className="act copy"
                          onClick={() => copy(i)}
                        >
                          {copied === i.token ? '✓' : 'Copiar'}
                        </button>
                        <button
                          type="button"
                          className="act edit"
                          onClick={() => {
                            setEditing(i)
                            setFormOpen(true)
                          }}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="act del"
                          onClick={() => setDeleting(i)}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {tab === 'songs' && (
        <section className="dash-section">
          {songs.length === 0 ? (
            <p className="empty">Aún no hay canciones sugeridas.</p>
          ) : (
            <div className="inv-table-wrap">
              <table className="inv-table">
                <thead>
                  <tr>
                    <th>Canción</th>
                    <th>Artista</th>
                    <th>Enlace</th>
                    <th>Sugerida por</th>
                  </tr>
                </thead>
                <tbody>
                  {songs.map((s) => (
                    <tr key={s.id}>
                      <td className="cell-name">{s.song}</td>
                      <td>{s.artist}</td>
                      <td>
                        {s.link ? (
                          <a
                            className="song-link"
                            href={s.link}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Ver
                          </a>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="cell-guest">{s.guest || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {tab === 'wishlist' && (
        <WishlistSection
          token={token}
          items={wish}
          cfg={wishCfg}
          onChanged={load}
          onEdit={(item) => setGiftForm(item || {})}
          onDelete={setDeletingGift}
          onCfg={setWishCfg}
          onErr={setErr}
        />
      )}

      {formOpen && (
        <InvFormModal
          inv={editing}
          token={token}
          onClose={() => {
            setFormOpen(false)
            setEditing(null)
          }}
          onSaved={load}
        />
      )}
      {deleting && (
        <DeleteModal
          inv={deleting}
          token={token}
          onClose={() => setDeleting(null)}
          onDeleted={removeInv}
        />
      )}
      {giftForm && (
        <GiftFormModal
          item={giftForm.id ? giftForm : null}
          token={token}
          onClose={() => setGiftForm(null)}
          onSaved={load}
        />
      )}
      {deletingGift && (
        <GiftDeleteModal
          item={deletingGift}
          token={token}
          onClose={() => setDeletingGift(null)}
          onDeleted={load}
        />
      )}
    </div>
  )
}

/* ── Lista de deseos ── */

function Toggle({ label, checked, onChange, disabled }) {
  return (
    <label className={`toggle ${disabled ? 'off' : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <span className="toggle-track">
        <span className="toggle-thumb" />
      </span>
      <span className="toggle-label">{label}</span>
    </label>
  )
}

function WishlistSection({ token, items, cfg, onChanged, onEdit, onDelete, onCfg, onErr }) {
  const [busy, setBusy] = useState(false)

  const save = async (patch) => {
    const next = { ...cfg, ...patch }
    onCfg(next)
    setBusy(true)
    try {
      await adminSetWishlistSettings(token, next)
    } catch {
      onErr('No se pudo guardar la configuración')
    } finally {
      setBusy(false)
    }
  }

  if (!cfg) return <p className="empty">Cargando…</p>

  return (
    <section className="dash-section">
      <div className="wish-grid">
        <div className="wish-col-cfg">
          <h3 className="wish-h">Configuración</h3>
          <div className="wish-cfg">
            <Toggle
              label="Visible en la invitación"
              checked={cfg.visible}
              onChange={(v) => save({ visible: v })}
              disabled={busy}
            />
            <Toggle
              label="Los invitados pueden elegir"
              checked={cfg.selectable}
              onChange={(v) => save({ selectable: v })}
              disabled={busy || !cfg.visible}
            />
            <label className="wish-max">
              Máx. por invitación:
              <input
                type="number"
                min="1"
                max="10"
                value={cfg.max_per_invitation}
                onChange={(e) =>
                  save({ max_per_invitation: Number(e.target.value) || 1 })
                }
                disabled={busy}
              />
            </label>
          </div>

          <h3 className="wish-h">Buscador</h3>
          <GiftSearch token={token} onAdded={onChanged} onErr={onErr} />
        </div>

        <div className="wish-col-list">
          <h3 className="wish-h">Mi lista</h3>

          {items.length === 0 ? (
            <p className="empty">
              La lista está vacía. Busca regalos y activa «Visible» cuando
              esté lista.
            </p>
          ) : (
            <div className="inv-table-wrap">
              <table className="inv-table wish-table">
                <thead>
                  <tr>
                    <th>Regalo</th>
                    <th>Estado</th>
                    <th className="th-actions">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((g) => (
                    <tr key={g.id}>
                      <td className="cell-name">
                        <span className="gift-cell">
                          {g.image && (
                            <img className="gift-thumb" src={g.image} alt="" />
                          )}
                          {g.name}
                        </span>
                      </td>
                      <td>
                        {g.reserved ? (
                          <span className="st ok">
                            Elegido · {g.reserved_guest}
                          </span>
                        ) : (
                          <span className="st wait">Disponible</span>
                        )}
                      </td>
                      <td className="cell-actions">
                        {g.reserved && (
                          <button
                            type="button"
                            className="icon-btn"
                            title="Liberar regalo"
                            onClick={async () => {
                              await adminReleaseGift(token, g.id)
                              onChanged()
                            }}
                          >
                            <IconRelease />
                          </button>
                        )}
                        <button
                          type="button"
                          className="icon-btn"
                          title="Editar"
                          onClick={() => onEdit(g)}
                        >
                          <IconPencil />
                        </button>
                        <button
                          type="button"
                          className="icon-btn danger"
                          title="Eliminar"
                          onClick={() => onDelete(g)}
                        >
                          <IconTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

const svgProps = {
  width: '16',
  height: '16',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: '2',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

const IconPencil = () => (
  <svg {...svgProps}>
    <path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
  </svg>
)

const IconTrash = () => (
  <svg {...svgProps}>
    <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14ZM10 11v6M14 11v6" />
  </svg>
)

const IconRelease = () => (
  <svg {...svgProps}>
    <path d="M9 14 4 9l5-5" />
    <path d="M4 9h10a6 6 0 0 1 6 6v1" />
  </svg>
)

function GiftFormModal({ item, token, onClose, onSaved }) {
  const [name, setName] = useState(item?.name || '')
  const [link, setLink] = useState(item?.link || '')
  const [image, setImage] = useState(item?.image || '')
  const [busy, setBusy] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [err, setErr] = useState('')

  useModalClose(onClose)

  const autofill = async () => {
    if (!link.trim()) {
      setErr('Pega primero el enlace del producto')
      return
    }
    setFetching(true)
    setErr('')
    try {
      const meta = await adminPreviewGift(token, link.trim())
      if (meta.title && !name) setName(meta.title)
      if (meta.image && !image) setImage(meta.image)
      if (!meta.title && !meta.image)
        setErr('Esa página no expuso datos — llena los campos a mano')
    } catch {
      setErr('No se pudo leer la página — llena los campos a mano')
    } finally {
      setFetching(false)
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setErr('')
    try {
      const body = {
        name: name.trim(),
        link: link.trim() || null,
        image: image.trim() || null,
      }
      if (item) await adminUpdateGift(token, item.id, body)
      else await adminCreateGift(token, body)
      onSaved()
      onClose()
    } catch {
      setErr('No se pudo guardar')
      setBusy(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>
        <h3 className="modal-title">
          {item ? 'Editar regalo' : 'Nuevo regalo'}
        </h3>
        <form onSubmit={submit}>
          <div className="gift-linkrow">
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="Enlace del producto (opcional)"
              inputMode="url"
            />
            <button
              type="button"
              className="act copy"
              onClick={autofill}
              disabled={fetching}
            >
              {fetching ? '…' : 'Auto'}
            </button>
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre del regalo"
            required
          />
          <input
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="URL de imagen (opcional)"
            inputMode="url"
          />
          {image && <img className="gift-preview" src={image} alt="" />}
          {err && <p className="login-err">{err}</p>}
          <button type="submit" className="modal-submit" disabled={busy}>
            {busy ? 'Guardando…' : item ? 'Guardar cambios' : 'Agregar'}
          </button>
        </form>
      </div>
    </div>
  )
}

function GiftDeleteModal({ item, token, onClose, onDeleted }) {
  const [busy, setBusy] = useState(false)

  useModalClose(onClose)

  const confirm = async () => {
    setBusy(true)
    try {
      await adminDeleteGift(token, item.id)
      onDeleted()
      onClose()
    } catch {
      setBusy(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
      >
        <h3 className="modal-title">Eliminar regalo</h3>
        <p className="del-text">
          Se eliminará <strong>{item.name}</strong> de la lista de deseos.
        </p>
        <div className="del-actions">
          <button type="button" className="del-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="del-confirm"
            onClick={confirm}
            disabled={busy}
          >
            {busy ? 'Eliminando…' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}

function GiftSearch({ token, onAdded, onErr }) {
  const [q, setQ] = useState('')
  const [min, setMin] = useState('')
  const [max, setMax] = useState('')
  const [results, setResults] = useState(null)
  const [busy, setBusy] = useState(false)
  const [added, setAdded] = useState(new Set())

  const search = async (e) => {
    e.preventDefault()
    if (q.trim().length < 2) return
    setBusy(true)
    try {
      setResults(await adminSearchGifts(token, q.trim(), min, max))
    } catch {
      onErr('No se pudo buscar ahora')
      setResults([])
    } finally {
      setBusy(false)
    }
  }

  const add = async (p, key) => {
    try {
      await adminCreateGift(token, {
        name: p.name,
        link: p.link,
        image: p.image || null,
      })
      setAdded((s) => new Set(s).add(key))
      onAdded()
    } catch {
      onErr('No se pudo agregar')
    }
  }

  const mxn = (n) =>
    n != null ? `$${Number(n).toLocaleString('es-MX')} MXN` : null

  return (
    <div className="gift-search">
      <form className="gift-search-bar" onSubmit={search}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar producto… (ej. freidora de aire)"
        />
        <input
          className="price-in"
          value={min}
          onChange={(e) => setMin(e.target.value.replace(/\D/g, ''))}
          placeholder="$ mín"
          inputMode="numeric"
        />
        <input
          className="price-in"
          value={max}
          onChange={(e) => setMax(e.target.value.replace(/\D/g, ''))}
          placeholder="$ máx"
          inputMode="numeric"
        />
        <button type="submit" className="act copy" disabled={busy}>
          {busy ? 'Buscando…' : 'Buscar'}
        </button>
      </form>

      {results && (
        <div className="gift-results">
          {results.length === 0 && (
            <p className="empty">Sin resultados — prueba otra búsqueda.</p>
          )}
          {results.map((p, i) => (
            <div className="gift-result" key={p.link || i}>
              {p.image && <img src={p.image} alt="" loading="lazy" />}
              <p className="gift-result-name">{p.name}</p>
              {mxn(p.price) && (
                <p className="gift-result-price">{mxn(p.price)}</p>
              )}
              {p.source && <p className="gift-result-source">{p.source}</p>}
              <button
                type="button"
                className="act copy"
                disabled={added.has(p.link || i)}
                onClick={() => add(p, p.link || i)}
              >
                {added.has(p.link || i) ? 'Agregado ✓' : '+ Agregar'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
