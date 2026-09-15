// Worker de malek.com.ar
// Sirve el sitio estático (dist/) y agrega UNA ruta dinámica:
//   /api/seguimiento/<slug>  → lee las Tareas de la propiedad en Notion
// Solo devuelve estado y fecha de cada etapa (nunca nombres ni datos personales).
//
// Requiere el secreto NOTION_TOKEN en Cloudflare (Settings → Variables and Secrets).

import laplata100 from '../src/data/seguimiento/laplata100.json';

const SEGUIMIENTOS = { laplata100 };

const TAREAS_DATA_SOURCE = '16fbabd6-e026-817b-aca7-000b4713a63b';
const TAREAS_DATABASE = '16fbabd6e026810185a7e76b632af310';
const PROP_RELACION = '🏡 Propiedades';

const normalizar = (s) =>
  (s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
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
  const data = await res.json();

  return (data.results || []).map((p) => {
    const props = p.properties || {};
    const tituloProp = Object.values(props).find((v) => v && v.type === 'title');
    return {
      nombre: normalizar((tituloProp?.title || []).map((t) => t.plain_text).join('')),
      estado: props.Estado?.status?.name || props.Estado?.select?.name || '',
      fecha: props.Fecha?.date?.start || null,
    };
  });
}

export function armarEtapas(config, tareas) {
  const etapas = {};
  for (const etapa of config.etapas) {
    const clave = normalizar(etapa.match);
    const encontradas = tareas.filter((t) => t.nombre.startsWith(clave));
    if (!encontradas.length) continue;
    // Si hay varias, prioriza la marcada como Listo
    const t = encontradas.find((x) => x.estado === 'Listo') || encontradas[0];
    etapas[etapa.id] = { listo: t.estado === 'Listo', fecha: t.fecha };
  }
  return etapas;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const m = url.pathname.match(/^\/api\/seguimiento\/([a-z0-9-]+)\/?$/);

    if (m) {
      const config = SEGUIMIENTOS[m[1]];
      if (!config) return json({ ok: false, error: 'no-encontrado' }, 404);
      if (!env.NOTION_TOKEN) return json({ ok: false, error: 'falta-token' }, 503);
      try {
        const tareas = await consultarNotion(env.NOTION_TOKEN, config.notionPropiedadId);
        return json({ ok: true, etapas: armarEtapas(config, tareas), actualizado: new Date().toISOString() });
      } catch (e) {
        console.error(e);
        return json({ ok: false, error: 'notion' }, 502);
      }
    }

    return env.ASSETS.fetch(request);
  },
};
