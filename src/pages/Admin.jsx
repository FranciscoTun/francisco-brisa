import { useCallback, useEffect, useRef, useState } from 'react'
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
  getCapacity,
  getShareConfig,
  listInvitations,
  listSongs,
  reorderInvitations,
  setCapacity,
  setShareConfig,
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

const RefreshBtn = ({ onClick, spinning }) => (
  <button
    type="button"
    className={`refresh-btn${spinning ? ' spin' : ''}`}
    onClick={onClick}
    disabled={spinning}
    title="Actualizar"
    aria-label="Actualizar"
  >
    <svg
      viewBox="0 0 24 24"
      width="15"
      height="15"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </svg>
  </button>
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

function InvFormModal({ inv, token, available = Infinity, maxPerInv = 20, onClose, onSaved }) {
  const floor =
    inv?.confirmed && inv.attendees > 0 ? inv.attendees : 1
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
            min={floor}
            max={maxPerInv}
            placeholder="Número de pases"
            value={passes}
            onChange={(e) => setPasses(e.target.value)}
            required
          />
          {inv && Number(passes) < floor ? (
            <p className="login-err">
              Ya confirmaron {inv.attendees} asistentes — no puedes bajar de
              ese número
            </p>
          ) : Number(passes) > maxPerInv ? (
            <p className="login-err">
              El máximo por invitación es {maxPerInv} pases
            </p>
          ) : (
            available !== Infinity &&
            Number(passes) > available && (
              <p className="login-err">
                Solo tienes {available} pases disponibles sin asignar
              </p>
            )
          )}
          {err && <p className="login-err">{err}</p>}
          <button
            type="submit"
            className="modal-submit"
            disabled={
              busy ||
              (inv && Number(passes) < floor) ||
              Number(passes) > maxPerInv ||
              (available !== Infinity && Number(passes) > available)
            }
          >
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
  const [refreshing, setRefreshing] = useState(false)
  const [cap, setCap] = useState(null)
  const [shareCfg, setShareCfg] = useState(null)
  const [shareNum, setShareNum] = useState('')
  const [shareUse, setShareUse] = useState(false)
  const [shareMsg, setShareMsg] = useState('')
  const [shareBusy, setShareBusy] = useState(false)
  const [grabToken, setGrabToken] = useState(null)
  const [dragIdx, setDragIdx] = useState(null)
  const [overIdx, setOverIdx] = useState(null)
  const [filterName, setFilterName] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const searchRef = useRef(null)

  useEffect(() => {
    if (filterOpen) searchRef.current?.focus()
  }, [filterOpen])

  const songsOf = (invToken) => songs.filter((s) => s.token === invToken)

  const norm = (s) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
  const statusOf = (i) =>
    !i.confirmed ? 'pendiente' : i.attendees === 0 ? 'declinada' : 'aceptada'
  const filtersOn = filterName !== '' || filterStatus !== 'all'
  const filtered = invs.filter(
    (i) =>
      (!filterName || norm(i.name).includes(norm(filterName))) &&
      (filterStatus === 'all' || statusOf(i) === filterStatus),
  )

  const load = useCallback(async () => {
    try {
      const [i, s, w, wc, c, sh] = await Promise.all([
        listInvitations(token),
        listSongs(token),
        adminWishlist(token),
        adminWishlistSettings(token),
        getCapacity(token),
        getShareConfig(token),
      ])
      setInvs(i)
      setSongs(s)
      setWish(w)
      setWishCfg(wc)
      setCap(c)
      setShareCfg(sh)
      setShareNum(sh.number ?? '')
      setShareUse(!!sh.use_number)
      setShareMsg(sh.message ?? '')
    } catch (e) {
      if (e.status === 401 || e.status === 403) onLogout()
      else setErr('No se pudo cargar. Revisa que el API esté corriendo.')
    }
  }, [token, onLogout])

  useEffect(() => {
    load()
  }, [load])

  const refresh = async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  const copy = async (inv) => {
    try {
      await navigator.clipboard.writeText(inviteLink(inv.token))
    } catch {
      /* portapapeles no disponible */
    }
    setCopied(inv.token)
    setTimeout(() => setCopied(null), 2000)
  }

  const dropRow = (e, dropIdx) => {
    e.preventDefault()
    if (dragIdx === null || dragIdx === dropIdx) {
      setDragIdx(null)
      setOverIdx(null)
      return
    }
    const arr = [...invs]
    const [moved] = arr.splice(dragIdx, 1)
    arr.splice(dropIdx, 0, moved)
    setInvs(arr)
    setDragIdx(null)
    setOverIdx(null)
    reorderInvitations(token, arr.map((x) => x.token)).catch(() => {})
  }

  const share = (inv) => {
    const msg = (shareMsg || shareCfg?.message || '')
      .replaceAll('{nombre}', inv.name)
      .replaceAll('{pases}', String(inv.max_guests))
      .replaceAll('{link}', inviteLink(inv.token))
    const num = shareCfg?.use_number && shareCfg?.number
      ? `${shareCfg.number}/`
      : ''
    window.open(
      `https://wa.me/${num}?text=${encodeURIComponent(msg)}`,
      '_blank',
      'noopener',
    )
  }

  const saveShare = async () => {
    setShareBusy(true)
    try {
      const saved = await setShareConfig(token, {
        number: shareNum,
        use_number: shareUse,
        message: shareMsg.trim(),
      })
      setShareCfg(saved)
      setShareNum(saved.number)
      setShareUse(saved.use_number)
      setShareMsg(saved.message)
    } catch {
      setErr('No se pudo guardar la configuración de compartir')
    } finally {
      setShareBusy(false)
    }
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
          className={`tab ${tab === 'stats' ? 'active' : ''}`}
          onClick={() => setTab('stats')}
        >
          Estadísticas
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
        <button
          type="button"
          className={`tab ${tab === 'share' ? 'active' : ''}`}
          onClick={() => setTab('share')}
        >
          Compartir
        </button>
      </nav>

      {tab === 'invs' && (
        <section className="dash-section">
          <div className="table-bar">
            <RefreshBtn onClick={refresh} spinning={refreshing} />
          </div>
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
                    <th className="th-grip" aria-label="Reordenar" />
                    <th>
                      <div className="th-filter">
                        Referencia
                        <button
                          type="button"
                          className={`th-ico${filterName ? ' on' : ''}`}
                          onClick={() => {
                            if (filterOpen) setFilterName('')
                            setFilterOpen((o) => !o)
                          }}
                          title="Buscar referencia"
                          aria-label="Buscar referencia"
                        >
                          <IconSearch />
                        </button>
                      </div>
                      <div
                        className={`th-search-wrap${filterOpen ? ' open' : ''}`}
                      >
                        <div className="th-search-inner">
                          <input
                            ref={searchRef}
                            className="th-search"
                            placeholder="Buscar..."
                            value={filterName}
                            onChange={(e) => setFilterName(e.target.value)}
                          />
                        </div>
                      </div>
                    </th>
                    <th>Pases</th>
                    <th>Vistas</th>
                    <th>
                      <div className="th-filter">
                        Estado
                        <select
                          className={`th-select${filterStatus !== 'all' ? ' on' : ''}`}
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          aria-label="Filtrar por estado"
                        >
                          <option value="all">Todas</option>
                          <option value="aceptada">Aceptada</option>
                          <option value="declinada">Declinada</option>
                          <option value="pendiente">Pendiente</option>
                        </select>
                      </div>
                    </th>
                    <th>Link</th>
                    <th>Canciones</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="empty">
                        Sin coincidencias con los filtros.
                      </td>
                    </tr>
                  ) : null}
                  {filtered.map((i, idx) => (
                    <tr
                      key={i.token}
                      draggable={!filtersOn && grabToken === i.token}
                      className={`${dragIdx === idx ? 'dragging' : ''}${overIdx === idx && dragIdx !== null && dragIdx !== idx ? ' drop-target' : ''}`}
                      onDragStart={(e) => {
                        setDragIdx(idx)
                        e.dataTransfer.effectAllowed = 'move'
                      }}
                      onDragOver={(e) => {
                        e.preventDefault()
                        e.dataTransfer.dropEffect = 'move'
                        if (idx !== overIdx) setOverIdx(idx)
                      }}
                      onDrop={(e) => dropRow(e, idx)}
                      onDragEnd={() => {
                        setDragIdx(null)
                        setOverIdx(null)
                        setGrabToken(null)
                      }}
                    >
                      <td
                        className="cell-grip"
                        onMouseDown={() => setGrabToken(i.token)}
                        onMouseUp={() => setGrabToken(null)}
                        title="Arrastra para reordenar"
                      >
                        <IconGrip />
                      </td>
                      <td className="cell-name">{i.name}</td>
                      <td>{i.max_guests}</td>
                      <td
                        className="cell-opens"
                        title={
                          i.opened_at
                            ? `Última vez: ${new Date(i.opened_at).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })}`
                            : undefined
                        }
                      >
                        {i.opens ?? 0}
                      </td>
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
                          className="act wa"
                          onClick={() => share(i)}
                          title="Compartir por WhatsApp"
                          aria-label="Compartir por WhatsApp"
                        >
                          <IconWhatsApp />
                        </button>
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
          {invs.length > 0 && (
            <div className="inv-totals">
              <span className="tot">Total: {invs.length}</span>
              <span className="tot ok">
                Aceptadas: {invs.filter((i) => statusOf(i) === 'aceptada').length}
              </span>
              <span className="tot no">
                Declinadas:{' '}
                {invs.filter((i) => statusOf(i) === 'declinada').length}
              </span>
              <span className="tot wait">
                Pendientes:{' '}
                {invs.filter((i) => statusOf(i) === 'pendiente').length}
              </span>
            </div>
          )}
        </section>
      )}

      {tab === 'stats' && (
        <StatsSection
          invs={invs}
          cap={cap}
          songs={songs}
          token={token}
          onCapSaved={(c) => setCap(c)}
          onErr={setErr}
          onRefresh={refresh}
          refreshing={refreshing}
        />
      )}

      {tab === 'songs' && (
        <section className="dash-section">
          <div className="table-bar">
            <RefreshBtn onClick={refresh} spinning={refreshing} />
          </div>
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

      {tab === 'share' && shareCfg && (
        <section className="dash-section share-section">
          <h3 className="wish-h">Compartir por WhatsApp</h3>
          <div className="share-grid">
            <div className="share-col">
              <Toggle
                label="Enviar siempre al mismo número"
                checked={shareUse}
                onChange={setShareUse}
              />
              <label className="share-num">
                Número de WhatsApp (con lada, solo dígitos)
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="529991234567"
                  value={shareNum}
                  disabled={!shareUse}
                  onChange={(e) =>
                    setShareNum(e.target.value.replace(/\D/g, ''))
                  }
                />
              </label>
              <p className="share-hint">
                {shareUse && shareNum
                  ? `El botón de compartir abrirá el chat con ${shareNum}`
                  : 'Sin número: se abrirá WhatsApp para elegir a quién enviar'}
              </p>
            </div>
            <div className="share-col">
              <label className="share-msg">
                Mensaje
                <textarea
                  rows={8}
                  value={shareMsg}
                  onChange={(e) => setShareMsg(e.target.value)}
                />
              </label>
              <div className="share-vars">
                <span>Variables:</span>
                {['{nombre}', '{pases}', '{link}'].map((v) => (
                  <button
                    key={v}
                    type="button"
                    className="share-var"
                    onClick={() =>
                      setShareMsg((m) => (m ? `${m} ${v}` : v))
                    }
                  >
                    {v}
                  </button>
                ))}
              </div>
              {invs.length > 0 && (
                <pre className="share-preview">
                  {shareMsg
                    .replaceAll('{nombre}', invs[0].name)
                    .replaceAll('{pases}', String(invs[0].max_guests))
                    .replaceAll('{link}', inviteLink(invs[0].token))}
                </pre>
              )}
              <button
                type="button"
                className="act copy share-save"
                disabled={shareBusy || !shareMsg.trim()}
                onClick={saveShare}
              >
                {shareBusy ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        </section>
      )}

      {tab === 'wishlist' && (
        <WishlistSection
          token={token}
          items={wish}
          cfg={wishCfg}
          onRefresh={refresh}
          refreshing={refreshing}
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
          available={
            cap?.total == null
              ? Infinity
              : (cap.free ?? 0) + (editing?.max_guests ?? 0)
          }
          maxPerInv={cap?.max_per_invitation ?? 20}
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
          onDeleted={load}
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

function WishlistSection({ token, items, cfg, onChanged, onRefresh, refreshing, onEdit, onDelete, onCfg, onErr }) {
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
          <div className="table-bar">
            <h3 className="wish-h">Mi lista</h3>
            <RefreshBtn onClick={onRefresh} spinning={refreshing} />
          </div>

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

const IconGrip = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <circle cx="9" cy="6" r="1.7" />
    <circle cx="15" cy="6" r="1.7" />
    <circle cx="9" cy="12" r="1.7" />
    <circle cx="15" cy="12" r="1.7" />
    <circle cx="9" cy="18" r="1.7" />
    <circle cx="15" cy="18" r="1.7" />
  </svg>
)

const IconSearch = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
)

const IconWhatsApp = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M17.5 14.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.9 1.22 3.1.15.2 2.11 3.22 5.1 4.51.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.58-.09 1.76-.72 2-1.42.25-.7.25-1.3.18-1.42-.08-.12-.28-.2-.58-.34M12.05 21.8h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.9-9.88a9.83 9.83 0 0 1 6.99 2.9 9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.89 9.88m8.42-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.9c0 2.1.55 4.14 1.59 5.95L.05 24l6.3-1.65a11.9 11.9 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.9 0-3.18-1.24-6.16-3.48-8.4" />
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
        source: p.source || null,
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

/* ── Estadísticas ── */
const C_OK = '#7a8b6f'
const C_NO = '#b05a5a'
const C_WAIT = '#c9a961'
const C_UNUSE = '#a9b89e'
const C_FREE = '#ddd2ba'

function StatsDonut({ parts, total, centerLabel }) {
  let off = 0
  return (
    <div className="donut-wrap">
      <svg viewBox="0 0 42 42" className="donut" aria-hidden="true">
        <circle cx="21" cy="21" r="15.9" fill="none" stroke="#efe7d4" strokeWidth="6" />
        {total > 0 &&
          parts
            .filter((p) => p.value > 0)
            .map((p) => {
              const pct = (p.value / total) * 100
              const el = (
                <circle
                  key={p.label}
                  cx="21"
                  cy="21"
                  r="15.9"
                  fill="none"
                  stroke={p.color}
                  strokeWidth="6"
                  strokeDasharray={`${pct} ${100 - pct}`}
                  strokeDashoffset={25 - off}
                />
              )
              off += pct
              return el
            })}
        <text x="21" y="20" textAnchor="middle" className="donut-n">
          {total}
        </text>
        <text x="21" y="26.5" textAnchor="middle" className="donut-l">
          {centerLabel}
        </text>
      </svg>
      <ul className="legend">
        {parts.map((p) => (
          <li key={p.label}>
            <i style={{ background: p.color }} />
            {p.label}
            <b>{p.value}</b>
          </li>
        ))}
      </ul>
    </div>
  )
}

function StatsSection({ invs, cap, songs, token, onCapSaved, onErr, onRefresh, refreshing }) {
  const [capTotal, setCapTotal] = useState('')
  const [capMax, setCapMax] = useState('')
  const [capBusy, setCapBusy] = useState(false)

  useEffect(() => {
    setCapTotal(cap?.total ?? '')
    setCapMax(cap?.max_per_invitation ?? 20)
  }, [cap])

  const saveCap = async () => {
    setCapBusy(true)
    try {
      onCapSaved(await setCapacity(token, Number(capTotal), Number(capMax)))
    } catch (e) {
      onErr(e.message)
      setCapTotal(cap?.total ?? '')
      setCapMax(cap?.max_per_invitation ?? 20)
    } finally {
      setCapBusy(false)
    }
  }

  const inv = { aceptada: 0, pendiente: 0, declinada: 0 }
  const pases = { aceptados: 0, sinUsar: 0, pendientes: 0, declinados: 0 }
  let asignados = 0
  for (const i of invs) {
    asignados += i.max_guests
    if (!i.confirmed) {
      inv.pendiente++
      pases.pendientes += i.max_guests
    } else if (i.attendees === 0) {
      inv.declinada++
      pases.declinados += i.max_guests
    } else {
      inv.aceptada++
      pases.aceptados += i.attendees
      pases.sinUsar += i.max_guests - i.attendees
    }
  }
  const capacidad = cap?.total ?? asignados
  const sinAsignar = Math.max(0, capacidad - asignados)
  const maxPosible = pases.aceptados + pases.pendientes
  const ocupacion =
    capacidad > 0 ? Math.round((pases.aceptados / capacidad) * 100) : 0

  const invParts = [
    { label: 'Aceptadas', value: inv.aceptada, color: C_OK },
    { label: 'Pendientes', value: inv.pendiente, color: C_WAIT },
    { label: 'Declinadas', value: inv.declinada, color: C_NO },
  ]
  const passParts = [
    { label: 'Aceptados', value: pases.aceptados, color: C_OK },
    { label: 'Sin usar', value: pases.sinUsar, color: C_UNUSE },
    { label: 'Pendientes', value: pases.pendientes, color: C_WAIT },
    { label: 'Declinados', value: pases.declinados, color: C_NO },
    { label: 'Sin asignar', value: sinAsignar, color: C_FREE },
  ]
  const passTotal = asignados + sinAsignar

  const pendTop = invs
    .filter((i) => !i.confirmed)
    .sort((a, b) => b.max_guests - a.max_guests)
    .slice(0, 6)

  const seenTop = invs
    .filter((i) => (i.opens ?? 0) > 0)
    .sort((a, b) => (b.opens ?? 0) - (a.opens ?? 0))
    .slice(0, 6)

  return (
    <section className="dash-section stats-sec">
      <div className="table-bar">
        <h3 className="wish-h">Resumen general</h3>
        <RefreshBtn onClick={onRefresh} spinning={refreshing} />
      </div>

      <p className="stats-lead">
        De momento vienen <b>{pases.aceptados}</b>{' '}
        {pases.aceptados === 1 ? 'persona' : 'personas'}.
        {pases.pendientes > 0 && (
          <>
            {' '}
            Si confirman todos los pendientes serían hasta{' '}
            <b>{maxPosible}</b>.
          </>
        )}
      </p>

      <div className="stats">
        <div className="stat">
          <span className="stat-n">{pases.aceptados}</span>
          <span className="stat-l">Vienen seguro</span>
        </div>
        <div className="stat">
          <span className="stat-n">{asignados}</span>
          <span className="stat-l">Pases asignados</span>
        </div>
        <div className="stat">
          <span className="stat-n">{pases.pendientes}</span>
          <span className="stat-l">Por confirmar</span>
        </div>
        <div className="stat">
          <span className="stat-n">{pases.declinados + pases.sinUsar}</span>
          <span className="stat-l">No vendrán</span>
        </div>
        <div className="stat">
          <span className="stat-n">{sinAsignar}</span>
          <span className="stat-l">Sin asignar</span>
        </div>
        <div className="stat">
          <span className="stat-n">{ocupacion}%</span>
          <span className="stat-l">Ocupación</span>
        </div>
        <div className="stat">
          <span className="stat-n">{songs.length}</span>
          <span className="stat-l">Canciones</span>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stats-card">
          <h4 className="stats-h">Invitaciones</h4>
          <StatsDonut
            parts={invParts}
            total={invs.length}
            centerLabel="total"
          />
        </div>
        <div className="stats-card">
          <h4 className="stats-h">Pases</h4>
          <div className="stack-bar" role="img" aria-label="Distribución de pases">
            {passParts
              .filter((p) => p.value > 0)
              .map((p) => (
                <div
                  key={p.label}
                  className="stack-seg"
                  style={{
                    width: `${(p.value / passTotal) * 100}%`,
                    background: p.color,
                  }}
                  title={`${p.label}: ${p.value}`}
                />
              ))}
          </div>
          <ul className="legend">
            {passParts.map((p) => (
              <li key={p.label}>
                <i style={{ background: p.color }} />
                {p.label}
                <b>
                  {p.value}
                  {passTotal > 0 &&
                    ` (${Math.round((p.value / passTotal) * 100)}%)`}
                </b>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {cap && (
        <div className="stats-card">
          <h4 className="stats-h">Capacidad de pases</h4>
          <div className="cap-bar">
            <label className="cap-total">
              Pases totales
              <input
                type="number"
                min="1"
                value={capTotal}
                placeholder="Sin límite"
                onChange={(e) => setCapTotal(e.target.value)}
              />
            </label>
            <label className="cap-total">
              Máx. por invitación
              <input
                type="number"
                min="1"
                value={capMax}
                onChange={(e) => setCapMax(e.target.value)}
              />
            </label>
            <button
              type="button"
              className="act copy cap-save"
              disabled={
                capBusy ||
                !capTotal ||
                !capMax ||
                (Number(capTotal) === cap.total &&
                  Number(capMax) === cap.max_per_invitation)
              }
              onClick={saveCap}
            >
              Guardar
            </button>
          </div>
        </div>
      )}

      <div className="stats-grid">
        {pendTop.length > 0 && (
          <div className="stats-card">
            <h4 className="stats-h">
              Por confirmar — invitaciones con más pases
            </h4>
            <ul className="pend-list">
              {pendTop.map((i) => (
                <li key={i.token}>
                  <span className="pend-name">{i.name}</span>
                  <span className="pend-pases">{i.max_guests} pases</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {seenTop.length > 0 && (
          <div className="stats-card">
            <h4 className="stats-h">Más vistas</h4>
            <ul className="pend-list">
              {seenTop.map((i) => (
                <li key={i.token}>
                  <span className="pend-name">{i.name}</span>
                  <span className="pend-pases">
                    {i.opens} {i.opens === 1 ? 'vista' : 'vistas'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
