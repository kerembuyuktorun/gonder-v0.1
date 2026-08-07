/**
 * Staging Route Orchestrator golden seed (API-driven).
 *
 * Prerequisites:
 * - IAM reachable (IAM_BASE_URL)
 * - last-mile order/route gRPC (:5017) UP — otherwise createLastMileOrder fails
 *
 * Usage:
 *   IAM_BASE_URL=https://... node scripts/orch-golden-seed.mjs
 *
 * Env (optional):
 *   SEED_EMAIL / SEED_PASSWORD / SEED_OTP
 *   OPERATION_DATE=YYYY-MM-DD (default: today UTC+3 calendar date)
 */

const BASE = (process.env.IAM_BASE_URL || 'https://sultry-yard-cresting.ngrok-free.dev').replace(
  /\/$/,
  ''
)
const EMAIL = process.env.SEED_EMAIL || 'lm.dispatcher@tenant-a.local'
const PASSWORD = process.env.SEED_PASSWORD
const OTP = process.env.SEED_OTP || '000000'

if (!PASSWORD) {
  console.error('Set SEED_PASSWORD (and optionally SEED_EMAIL / SEED_OTP) before running.')
  process.exit(1)
}

const ISTANBUL_POINTS = [
  { title: 'Kadıköy Moda', lat: 40.9901, lng: 29.0292, address: 'Caferağa Mah. Moda Cad. Kadıköy/İstanbul' },
  { title: 'Beşiktaş Levent', lat: 41.081, lng: 29.011, address: 'Levent Mah. Büyükdere Cad. Beşiktaş/İstanbul' },
  { title: 'Şişli Fulya', lat: 41.0555, lng: 28.992, address: 'Fulya Mah. Büyükdere Cad. Şişli/İstanbul' },
  { title: 'Üsküdar', lat: 41.025, lng: 29.015, address: 'Mimar Sinan Mah. Üsküdar/İstanbul' },
  { title: 'Maltepe', lat: 40.935, lng: 29.13, address: 'Altayçeşme Mah. Maltepe/İstanbul' },
  { title: 'Fatih', lat: 41.018, lng: 28.955, address: 'Sultanahmet Mah. Fatih/İstanbul' },
  { title: 'Bakırköy', lat: 40.98, lng: 28.872, address: 'Ataköy Mah. Bakırköy/İstanbul' },
  { title: 'Ataşehir', lat: 40.992, lng: 29.127, address: 'Barbaros Mah. Ataşehir/İstanbul' },
  { title: 'Kartal', lat: 40.905, lng: 29.185, address: 'Soğanlık Mah. Kartal/İstanbul' },
  { title: 'Sarıyer', lat: 41.12, lng: 29.04, address: 'Maslak Mah. Sarıyer/İstanbul' },
]

function todayIstanbul() {
  if (process.env.OPERATION_DATE) return process.env.OPERATION_DATE
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  return fmt.format(new Date())
}

async function api(method, path, { token, body } = {}) {
  const res = await fetch(`${BASE}/${path.replace(/^\//, '')}`, {
    method,
    headers: {
      Accept: 'application/json',
      'ngrok-skip-browser-warning': '1',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let data
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }
  return { ok: res.ok, status: res.status, data }
}

async function gql(token, query, variables) {
  const res = await fetch(`${BASE}/graphql`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'ngrok-skip-browser-warning': '1',
    },
    body: JSON.stringify({ query, variables }),
  })
  const data = await res.json()
  return data
}

async function login() {
  const loginRes = await api('POST', 'api/v1/auth/login', {
    body: { email: EMAIL, password: PASSWORD },
  })
  if (!loginRes.ok) throw new Error(`login failed: ${loginRes.status} ${JSON.stringify(loginRes.data)}`)
  const loginSessionId = loginRes.data.loginSessionId
  if (!loginSessionId) throw new Error('loginSessionId missing')

  const otpRes = await api('POST', 'api/v1/auth/login/verify-otp', {
    body: { code: OTP, loginSessionId },
  })
  if (!otpRes.ok) throw new Error(`otp failed: ${otpRes.status} ${JSON.stringify(otpRes.data)}`)
  const token = otpRes.data.accessToken
  if (!token) throw new Error('accessToken missing')
  return token
}

function localIso(date, hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  const [y, mo, d] = date.split('-').map(Number)
  // Construct as Europe/Istanbul local → ISO via Date with fixed +03 for staging day
  const dt = new Date(Date.UTC(y, mo - 1, d, h - 3, m, 0))
  return dt.toISOString()
}

function orderPayload({ ref, type, from, to, skills, desi, kg, withCoords = true }) {
  const date = todayIstanbul()
  const payload = {
    method: 'STANDARD',
    type,
    sourceType: 'MANUAL',
    isSmsSendReceiver: false,
    isEmailSendReceiver: false,
    requireProofOnComplete: false,
    secureDeliveryOtp: false,
    items: [{ quantity: 1, sizeClass: desi >= 100 ? 'XL' : 'M', desi, kg }],
    referenceNo: ref,
    priority: 50,
    serviceTimeSec: 300,
    note: 'orch golden seed',
    scheduledPickupFrom: localIso(date, '09:00'),
    scheduledPickupTo: localIso(date, '12:00'),
    scheduledDeliveryFrom: localIso(date, '12:00'),
    scheduledDeliveryTo: localIso(date, '18:00'),
    senderContactInput: {
      contactType: 'SENDER',
      companyType: 'INDIVIDUAL',
      firstName: 'Seed',
      lastName: 'Sender',
      phone: '+905551110001',
      tckn: '11111111110',
    },
    fromContactAddressInput: {
      title: from.title,
      fullAddress: from.address,
      phone: '+905551110001',
      no: '1',
      ...(withCoords ? { latitude: from.lat, longitude: from.lng } : {}),
    },
    receiverContactInput: {
      contactType: 'RECEIVER',
      companyType: 'INDIVIDUAL',
      firstName: 'Seed',
      lastName: 'Receiver',
      phone: '+905551110002',
      tckn: '22222222220',
    },
    toContactAddressInput: {
      title: to.title,
      fullAddress: to.address,
      phone: '+905551110002',
      no: '2',
      ...(withCoords ? { latitude: to.lat, longitude: to.lng } : {}),
    },
  }
  if (skills?.length) payload.requiredSkills = skills
  return payload
}

async function createOrder(token, payload) {
  // Prefer REST (same path FE BFF uses); GraphQL fallback
  const rest = await api('POST', 'api/v1/last-mile-orders', { token, body: payload })
  if (rest.ok) {
    const entity = rest.data?.data && typeof rest.data.data === 'object' ? rest.data.data : rest.data
    return { via: 'rest', order: entity }
  }

  const g = await gql(
    token,
    `mutation($input: CreateLastMileOrderInput!) {
      createLastMileOrder(input: $input) { id code referenceNo trackingCode type method }
    }`,
    { input: payload }
  )
  if (g.errors?.length) {
    throw new Error(`create order failed rest=${rest.status} gql=${g.errors[0].message}`)
  }
  return { via: 'graphql', order: g.data.createLastMileOrder }
}

async function optimizeAndApprove(token, orderIds, vehicleIds) {
  const createJob = await api('POST', 'api/v1/last-mile-routes/optimize-jobs', {
    token,
    body: {
      orderIds,
      vehicleIds,
      operationDate: todayIstanbul(),
      settings: {
        objective: 'balanced',
        returnToDepot: true,
        respectSkills: true,
        respectCapacity: true,
        respectTimeWindows: true,
      },
    },
  })
  if (!createJob.ok) throw new Error(`optimize-jobs: ${createJob.status} ${JSON.stringify(createJob.data)}`)
  const jobId = createJob.data?.jobId || createJob.data?.id || createJob.data?.data?.jobId
  if (!jobId) throw new Error(`jobId missing: ${JSON.stringify(createJob.data)}`)

  let job
  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 1500))
    const poll = await api('GET', `api/v1/last-mile-routes/optimize-jobs/${jobId}`, { token })
    job = poll.data?.data && typeof poll.data.data === 'object' ? poll.data.data : poll.data
    const status = job?.status
    console.log(`  poll ${i + 1}: ${status}`)
    if (status === 'COMPLETED' || status === 'FAILED' || status === 'CANCELED') break
  }
  if (job?.status !== 'COMPLETED') throw new Error(`job not completed: ${JSON.stringify(job)?.slice(0, 500)}`)

  const routeIds = (job.routes || job.pendingRoutes || [])
    .map((r) => r.id || r.routeId)
    .filter(Boolean)

  const apply = await api('POST', 'api/v1/last-mile-routes/apply-solution', {
    token,
    body: { jobId, ...(routeIds.length ? { routeIds } : {}) },
  })
  if (!apply.ok) throw new Error(`apply-solution: ${apply.status} ${JSON.stringify(apply.data)}`)
  return { jobId, apply: apply.data }
}

async function main() {
  const operationDate = todayIstanbul()
  console.log('BASE', BASE)
  console.log('operationDate', operationDate)
  console.log('login…')
  const token = await login()

  // Probe order service
  const probe = await api('GET', 'api/v1/last-mile-orders?page=1&pageSize=1', { token })
  if (!probe.ok) {
    console.error('\nBLOCKER: last-mile order/route service down.')
    console.error(`GET last-mile-orders → ${probe.status}`, probe.data)
    console.error('GraphQL typically: ECONNREFUSED 127.0.0.1:5017')
    console.error('Fix BE (start order microservice), then re-run this script.\n')
    process.exit(2)
  }

  const vehiclesRes = await api('GET', 'api/v1/vehicles?page=1&pageSize=50', { token })
  const vehicles = vehiclesRes.data?.vehicles || vehiclesRes.data?.items || []
  const selectable = vehicles.filter(
    (v) =>
      v.assignedDriverId &&
      v.parkLocation?.latitude != null &&
      String(v.plateNo || '').includes('ORCH')
  )
  console.log(
    'selectable orch vehicles',
    selectable.map((v) => `${v.plateNo} ${v.id}`)
  )
  if (selectable.length < 3) throw new Error('Need ≥3 selectable ORCH vehicles')

  const created = []
  const stamp = Date.now().toString(36)

  // 15 geo deliveries
  for (let i = 0; i < 15; i++) {
    const from = ISTANBUL_POINTS[i % ISTANBUL_POINTS.length]
    const to = ISTANBUL_POINTS[(i + 3) % ISTANBUL_POINTS.length]
    const type = i % 5 === 0 ? 'PICKUP' : i % 7 === 0 ? 'TRANSFER' : 'DELIVERY'
    const { order } = await createOrder(
      token,
      orderPayload({
        ref: `ORCH-GEO-${stamp}-${i + 1}`,
        type,
        from,
        to,
        desi: 12 + (i % 5),
        kg: 4 + (i % 4),
      })
    )
    created.push({ kind: 'geo', id: order.id, code: order.code, ref: order.referenceNo })
    console.log('created geo', order.code || order.id)
  }

  // cold chain skill 102
  for (let i = 0; i < 2; i++) {
    const { order } = await createOrder(
      token,
      orderPayload({
        ref: `ORCH-COLD-${stamp}-${i + 1}`,
        type: 'DELIVERY',
        from: ISTANBUL_POINTS[0],
        to: ISTANBUL_POINTS[1 + i],
        skills: [102],
        desi: 15,
        kg: 8,
      })
    )
    created.push({ kind: 'cold', id: order.id, code: order.code, ref: order.referenceNo })
    console.log('created cold', order.code || order.id)
  }

  // heavy
  for (let i = 0; i < 2; i++) {
    const { order } = await createOrder(
      token,
      orderPayload({
        ref: `ORCH-HEAVY-${stamp}-${i + 1}`,
        type: 'DELIVERY',
        from: ISTANBUL_POINTS[2],
        to: ISTANBUL_POINTS[5],
        desi: 400,
        kg: 900,
      })
    )
    created.push({ kind: 'heavy', id: order.id, code: order.code, ref: order.referenceNo })
    console.log('created heavy', order.code || order.id)
  }

  // missing coordinates
  for (let i = 0; i < 2; i++) {
    const { order } = await createOrder(
      token,
      orderPayload({
        ref: `ORCH-NOGEO-${stamp}-${i + 1}`,
        type: 'DELIVERY',
        from: ISTANBUL_POINTS[0],
        to: ISTANBUL_POINTS[1],
        desi: 10,
        kg: 3,
        withCoords: false,
      })
    )
    created.push({ kind: 'nogeo', id: order.id, code: order.code, ref: order.referenceNo })
    console.log('created nogeo', order.code || order.id)
  }

  const geoIds = created.filter((c) => c.kind === 'geo').map((c) => c.id)
  const vehicleIds = selectable.slice(0, 3).map((v) => v.id)
  console.log('optimize+approve with', geoIds.length, 'orders /', vehicleIds.length, 'vehicles')
  const result = await optimizeAndApprove(token, geoIds.slice(0, 12), vehicleIds)

  const sheet = {
    operationDate,
    login: EMAIL,
    vehicles: selectable.map((v) => ({
      id: v.id,
      plateNo: v.plateNo,
      assignedDriverId: v.assignedDriverId,
      park: v.parkLocation,
      skills: v.skills,
    })),
    orders: created,
    optimizeApply: result,
  }
  console.log('\n=== SEED SHEET ===')
  console.log(JSON.stringify(sheet, null, 2))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
