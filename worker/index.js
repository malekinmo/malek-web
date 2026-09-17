// Worker de malek.com.ar
// Sirve el sitio estático (dist/) y agrega UNA ruta dinámica:
//   /api/seguimiento/<slug>  → arma el panel de seguimiento leyendo la base Tareas de Notion
//
// Todo el contenido del recorrido sale de Notion. En cada tarea:
//   Panel        → Etapa | Tarea | Documento   (si está vacío, no aparece en el panel)
//   Vista        → Vendedor y/o Comprador (si está vacío, se ve en las dos páginas)
//   Fase         → Reserva | Crédito hipotecario | Escritura   (solo en las Etapas)
//   Etapa del panel → a qué Etapa pertenece una Tarea
//   Título panel → cómo se ve el nombre en el panel (si está vacío, usa el nombre de la tarea)
//   Explicación  → la línea de ayuda que lee el propietario
//   Fecha        → ordena las etapas y las tareas, y es la fecha que se muestra
//   Estado       → Listo = tildado
//
// Requiere el secreto NOTION_TOKEN en Cloudflare (Settings → Variables and Secrets).

const PROPIEDADES = {
  laplata100: { notionId: '350babd6-e026-80fc-ae36-e86acc35a862' },
};

const FASES = [
  { id: 'reserva', titulo: 'Reserva' },
  { id: 'credito', titulo: 'Crédito hipotecario' },
  { id: 'escritura', titulo: 'Escritura' },
];

const TAREAS_DATA_SOURCE = '16fbabd6-e026-817b-aca7-000b4713a63b';
const TAREAS_DATABASE = '16fbabd6e026810185a7e76b632af310';
const PROP_RELACION = '🏡 Propiedades';

const normalizar = (s) =>
  (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

const texto = (prop) => (prop?.rich_text || []).map((t) => t.plain_text).join('').trim();

// "Reserva Av La Plata 100" → "Reserva"; "Documento: Expensas — Av La Plata 100" → "Expensas"
const limpiar = (nombre) =>
  (nombre || '')
    .replace(/^Documento:\s*/i, '')
    .replace(/\s*[—-]\s*Av\.?\s*La Plata.*$/i, '')
    .replace(/\s*Av\.?\s*La Plata\s*\d+.*$/i, '')
    .trim();

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-robots-tag': 'noindex',
    },
  });

async function consultarNotion(token, propiedadId) {
  const body = JSON.stringify({
    filter: { property: PROP_RELACION, relation: { contains: propiedadId } },
    page_size: 100,
  });
  const headers = (version) => ({
    Authorization: `Bearer ${token}`,
    'Notion-Version': version,
    'Content-Type': 'application/json',
  });

  // API nueva (data sources). Si falla, prueba el endpoint clásico.
  let res = await fetch(`https://api.notion.com/v1/data_sources/${TAREAS_DATA_SOURCE}/query`, {
    method: 'POST', headers: headers('2025-09-03'), body,
  });
  if (!res.ok) {
    res = await fetch(`https://api.notion.com/v1/databases/${TAREAS_DATABASE}/query`, {
      method: 'POST', headers: headers('2022-06-28'), body,
    });
  }
  if (!res.ok) throw new Error(`Notion ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return (await res.json()).results || [];
}

export function armarPanel(paginas, vista = 'Vendedor') {
  const filas = paginas.map((p) => {
    const props = p.properties || {};
    const tituloProp = Object.values(props).find((v) => v && v.type === 'title');
    const nombre = (tituloProp?.title || []).map((t) => t.plain_text).join('');
    return {
      id: (p.id || '').replace(/-/g, ''),
      panel: props.Panel?.select?.name || '',
      fase: props.Fase?.select?.name || '',
      titulo: texto(props['Título panel']) || limpiar(nombre),
      ayuda: texto(props['Explicación']),
      fecha: props.Fecha?.date?.start || null,
      listo: (props.Estado?.status?.name || props.Estado?.select?.name) === 'Listo',
      vistas: (props.Vista?.multi_select || []).map((v) => v.name),
      etapaId: (props['Etapa del panel']?.relation || []).map((r) => (r.id || '').replace(/-/g, ''))[0] || null,
    };
  });

  // "Vista" vacía = se ve en las dos páginas; si tiene valores, solo en las que figuren
  const visibles = filas.filter((f) => !f.vistas.length || f.vistas.includes(vista));

  const porFecha = (a, b) => (a.fecha || '9999').slice(0, 10).localeCompare((b.fecha || '9999').slice(0, 10));
  const faseId = (nombre) => (FASES.find((f) => normalizar(f.titulo) === normalizar(nombre)) || FASES[0]).id;

  const etapas = visibles
    .filter((f) => f.panel === 'Etapa')
    .sort(porFecha)
    .map((e) => ({
      id: e.id,
      fase: faseId(e.fase),
      titulo: e.titulo,
      detalle: e.ayuda,
      fecha: e.fecha,
      listo: e.listo,
      tareas: visibles
        .filter((t) => t.panel === 'Tarea' && t.etapaId === e.id)
        .sort(porFecha)
        .map((t) => ({ id: t.id, titulo: t.titulo, ayuda: t.ayuda, fecha: t.fecha, listo: t.listo })),
    }));

  const documentos = visibles
    .filter((f) => f.panel === 'Documento')
    .map((f) => ({ titulo: f.titulo, ok: f.listo }))
    .sort((a, b) => Number(b.ok) - Number(a.ok) || a.titulo.localeCompare(b.titulo, 'es'));

  const usadas = FASES.filter((f) => etapas.some((e) => e.fase === f.id));
  return { fases: usadas, etapas, documentos };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // /api/seguimiento/<slug> → vista del vendedor · /api/compra/<slug> → vista del comprador
    const m = url.pathname.match(/^\/api\/(seguimiento|compra)\/([a-z0-9-]+)\/?$/);

    if (m) {
      const vista = m[1] === 'compra' ? 'Comprador' : 'Vendedor';
      const cfg = PROPIEDADES[m[2]];
      if (!cfg) return json({ ok: false, error: 'no-encontrado' }, 404);
      if (!env.NOTION_TOKEN) return json({ ok: false, error: 'falta-token' }, 503);
      try {
        const paginas = await consultarNotion(env.NOTION_TOKEN, cfg.notionId);
        return json({ ok: true, vista, ...armarPanel(paginas, vista), actualizado: new Date().toISOString() });
      } catch (e) {
        console.error(e);
        return json({ ok: false, error: 'notion' }, 502);
      }
    }

    return env.ASSETS.fetch(request);
  },
};
