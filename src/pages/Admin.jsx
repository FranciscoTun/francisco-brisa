import { useEffect, useState } from 'react'
import { API_URL } from '../config.js'
import './Admin.css'

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
      const res = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (!res.ok) throw new Error('auth')
      onOk((await res.json()).token)
    } catch {
      setErr('Usuario o contraseña incorrectos')
    } finally {
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

function Dashboard({ token, onLogout }) {
  const [resumen, setResumen] = useState(null)
  const [invs, setInvs] = useState([])
  const [songList, setSongList] = useState([])
  const [err, setErr] = useState('')

  useEffect(() => {
    const h = { 'X-Admin-Key': token }
    const get = (p) =>
      fetch(`${API_URL}${p}`, { headers: h }).then((r) => {
        if (!r.ok) throw new Error('api')
        return r.json()
      })
    Promise.all([get('/admin/resumen'), get('/invitations'), get('/songs')])
      .then(([r, i, s]) => {
        setResumen(r)
        setInvs(i)
        setSongList(s)
      })
      .catch(() =>
        setErr('No se pudo cargar. Revisa que el API esté corriendo.'),
      )
  }, [token])

  return (
    <div className="dash">
      <header className="dash-head">
        <h1 className="admin-title">Panel</h1>
        <button type="button" className="logout" onClick={onLogout}>
          Salir
        </button>
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

      {invs.length > 0 && (
        <section className="dash-section">
          <h2>Invitaciones</h2>
          <ul className="dash-list">
            {invs.map((i) => (
              <li key={i.token}>
                <span className="li-name">{i.name}</span>
                <span className="li-meta">{i.max_guests} pases</span>
                <span
                  className={`li-status ${
                    i.confirmed
                      ? i.attendees > 0
                        ? 'ok'
                        : 'no'
                      : 'wait'
                  }`}
                >
                  {i.confirmed
                    ? i.attendees > 0
                      ? `Asisten ${i.attendees}`
                      : 'No asistirán'
                    : 'Pendiente'}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {songList.length > 0 && (
        <section className="dash-section">
          <h2>Canciones sugeridas</h2>
          <ul className="dash-list">
            {songList.map((s) => (
              <li key={s.id}>
                <span className="li-name">{s.song}</span>
                <span className="li-meta">— {s.name}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
