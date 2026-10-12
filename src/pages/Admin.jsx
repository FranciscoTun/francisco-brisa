import { useCallback, useEffect, useState } from 'react'
import {
  adminLogin,
  createInvitation,
  deleteInvitation,
  getResumen,
  listInvitations,
  listSongs,
  updateInvitation,
} from '../api.js'
import { useModalClose } from '../hooks/useModalClose.js'
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
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
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

  const load = useCallback(async () => {
    try {
      const [r, i, s] = await Promise.all([
        getResumen(token),
        listInvitations(token),
        listSongs(token),
      ])
      setResumen(r)
      setInvs(i)
      setSongs(s)
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

      <section className="dash-section">
        <h2>Invitaciones</h2>
        {invs.length === 0 ? (
          <p className="empty">Aún no hay invitaciones. Crea la primera.</p>
        ) : (
          <div className="inv-table-wrap">
            <table className="inv-table">
              <thead>
                <tr>
                  <th>Referencia</th>
                  <th>Pases</th>
                  <th>Estado</th>
                  <th>Link</th>
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

      <section className="dash-section">
        <h2>Canciones sugeridas</h2>
        {songs.length === 0 ? (
          <p className="empty">Aún no hay canciones sugeridas.</p>
        ) : (
          <ul className="dash-list">
            {songs.map((s) => (
              <li key={s.id}>
                <span className="li-name">{s.song}</span>
                <span className="li-meta">— {s.name}</span>
                {s.link && (
                  <a
                    className="li-meta"
                    href={s.link}
                    target="_blank"
                    rel="noreferrer"
                  >
                    link
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

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
    </div>
  )
}
