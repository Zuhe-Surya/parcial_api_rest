import mongoose from 'mongoose';
import crypto from 'crypto';
import Persona from '../models/Persona.js';

const inMemoryStore = globalThis.__familiaStore ?? (globalThis.__familiaStore = []);

const isMemoryMode = () => mongoose.connection.readyState !== 1;

const serializePersona = (persona) => {
  const item = persona && persona.toObject ? persona.toObject() : { ...persona };
  const id = item._id ? item._id.toString() : item.id;
  return {
    ...item,
    id,
    _id: undefined,
    nombreCompleto: `${item.nombre || ''} ${item.apellido || ''}`.trim(),
    padre: item.padre ? (typeof item.padre === 'string' ? item.padre : item.padre.toString()) : null,
    madre: item.madre ? (typeof item.madre === 'string' ? item.madre : item.madre.toString()) : null,
  };
};

const getMemoryPersonas = () => inMemoryStore.map((persona) => serializePersona(persona));

const getPersonaByIdFromMemory = (id) => getMemoryPersonas().find((persona) => persona.id === id) ?? null;

const getNombreGenero = (persona) => {
  if (!persona) return 'familiar';
  if (persona.genero === 'Masculino') return 'hombre';
  if (persona.genero === 'Femenino') return 'mujer';
  return 'persona';
};

const findPersonasRelacionadas = (personaId, personas) => {
  const persona = personas.find((p) => p.id === personaId);
  if (!persona) return [];

  const padres = [persona.padre, persona.madre].filter(Boolean);
  const hijos = personas.filter((p) => p.id !== personaId && (p.padre === personaId || p.madre === personaId));
  const hermanos = personas.filter((p) => {
    if (p.id === personaId) return false;
    const parentIds = new Set(padres);
    return (p.padre && parentIds.has(p.padre)) || (p.madre && parentIds.has(p.madre));
  });

  const abuelos = personas.filter((p) => {
    if (!p.id || !persona.padre && !persona.madre) return false;
    const padresDePersona = [persona.padre, persona.madre].filter(Boolean);
    return padresDePersona.includes(p.id) || padresDePersona.some((padreId) => {
      const padre = personas.find((item) => item.id === padreId);
      return padre && (padre.padre === p.id || padre.madre === p.id);
    });
  });

  const nietos = personas.filter((p) => {
    const parentIds = new Set([persona.id]);
    return (p.padre && parentIds.has(p.padre)) || (p.madre && parentIds.has(p.madre));
  });

  const tios = personas.filter((p) => {
    const idsPadres = [persona.padre, persona.madre].filter(Boolean);
    const parent = personas.filter((item) => idsPadres.includes(item.id));
    const idsAbuelos = parent.flatMap((item) => [item.padre, item.madre]).filter(Boolean);
    return p.id !== personaId && idsAbuelos.includes(p.id) && !idsPadres.includes(p.id);
  });

  const sobrinos = personas.filter((p) => {
    const idsPadres = [persona.padre, persona.madre].filter(Boolean);
    const hermanos = personas.filter((item) => item.id !== personaId && idsPadres.includes(item.padre) || item.id !== personaId && idsPadres.includes(item.madre));
    return hermanos.some((hermano) => (p.padre === hermano.id || p.madre === hermano.id));
  });

  const primos = personas.filter((p) => {
    const idsPadres = [persona.padre, persona.madre].filter(Boolean);
    const padres = personas.filter((item) => idsPadres.includes(item.id));
    const idsTios = padres.flatMap((item) => [item.padre, item.madre]).filter(Boolean);
    const tios = personas.filter((item) => idsTios.includes(item.id));
    return tios.some((tio) => p.padre === tio.id || p.madre === tio.id);
  });

  return { padres, hijos, hermanos, abuelos, nietos, tios, sobrinos, primos };
};

const relacionDesdeLista = (personaId, targetId, personas) => {
  const persona = personas.find((p) => p.id === personaId);
  if (!persona) return { grado: null, parentesco: 'No se pudo determinar' };

  const target = personas.find((p) => p.id === targetId);
  if (!target) return { grado: null, parentesco: 'No existe en el árbol genealógico' };

  const directParents = [persona.padre, persona.madre].filter(Boolean);
  if (directParents.includes(targetId)) {
    const tipo = targetId === persona.padre ? 'padre' : 'madre';
    return { grado: 1, parentesco: tipo };
  }

  const directChildren = personas.filter((p) => (p.padre === personaId || p.madre === personaId)).map((p) => p.id);
  if (directChildren.includes(targetId)) {
    const tipo = target.genero === 'Masculino' ? 'hijo' : target.genero === 'Femenino' ? 'hija' : 'hijo/a';
    return { grado: 1, parentesco: tipo };
  }

  const siblings = personas.filter((p) => {
    if (p.id === personaId) return false;
    const parents = new Set([persona.padre, persona.madre].filter(Boolean));
    return (p.padre && parents.has(p.padre)) || (p.madre && parents.has(p.madre));
  }).map((p) => p.id);
  if (siblings.includes(targetId)) {
    const tipo = target.genero === 'Masculino' ? 'hermano' : target.genero === 'Femenino' ? 'hermana' : 'hermano/a';
    return { grado: 1, parentesco: tipo };
  }

  const grandparents = personas.filter((p) => {
    const parentIds = new Set([persona.padre, persona.madre].filter(Boolean));
    return Array.from(parentIds).some((parentId) => {
      const parent = personas.find((item) => item.id === parentId);
      return parent && (parent.padre === p.id || parent.madre === p.id);
    });
  }).map((p) => p.id);
  if (grandparents.includes(targetId)) {
    const tipo = target.genero === 'Masculino' ? 'abuelo' : target.genero === 'Femenino' ? 'abuela' : 'abuelo/a';
    return { grado: 2, parentesco: tipo };
  }

  const grandchildren = personas.filter((p) => {
    const childIds = personas.filter((item) => item.padre === personaId || item.madre === personaId).map((item) => item.id);
    return childIds.some((childId) => (p.padre === childId || p.madre === childId));
  }).map((p) => p.id);
  if (grandchildren.includes(targetId)) {
    const tipo = target.genero === 'Masculino' ? 'nieto' : target.genero === 'Femenino' ? 'nieta' : 'nieto/a';
    return { grado: 2, parentesco: tipo };
  }

  const unclesAunts = personas.filter((p) => {
    const parentIds = [persona.padre, persona.madre].filter(Boolean);
    if (!parentIds.length) return false;
    return parentIds.some((parentId) => {
      const parent = personas.find((item) => item.id === parentId);
      if (!parent) return false;
      const parentParents = [parent.padre, parent.madre].filter(Boolean);
      return parentParents.includes(p.id) && p.id !== parentId;
    });
  }).map((p) => p.id);
  if (unclesAunts.includes(targetId)) {
    const tipo = target.genero === 'Masculino' ? 'tío' : target.genero === 'Femenino' ? 'tía' : 'tío/a';
    return { grado: 2, parentesco: tipo };
  }

  const nephewsNieces = personas.filter((p) => {
    const hermanos = personas.filter((item) => {
      if (item.id === personaId) return false;
      const parentIds = new Set([persona.padre, persona.madre].filter(Boolean));
      return (item.padre && parentIds.has(item.padre)) || (item.madre && parentIds.has(item.madre));
    });
    return hermanos.some((hermano) => (p.padre === hermano.id || p.madre === hermano.id));
  }).map((p) => p.id);
  if (nephewsNieces.includes(targetId)) {
    const tipo = target.genero === 'Masculino' ? 'sobrino' : target.genero === 'Femenino' ? 'sobrina' : 'sobrino/a';
    return { grado: 2, parentesco: tipo };
  }

  const cousins = personas.filter((p) => {
    const parentIds = [persona.padre, persona.madre].filter(Boolean);
    if (!parentIds.length) return false;
    const parents = personas.filter((item) => parentIds.includes(item.id));
    const uncleOrAuntIds = parents.flatMap((parent) => [parent.padre, parent.madre]).filter(Boolean);
    const cousinsParents = personas.filter((item) => uncleOrAuntIds.includes(item.id));
    return cousinsParents.some((cousinParent) => (p.padre === cousinParent.id || p.madre === cousinParent.id));
  }).map((p) => p.id);
  if (cousins.includes(targetId)) {
    const tipo = target.genero === 'Masculino' ? 'primo' : target.genero === 'Femenino' ? 'prima' : 'primo/a';
    return { grado: 2, parentesco: tipo };
  }

  return { grado: 0, parentesco: 'Sin parentesco directo' };
};

const buildListadoFamilia = (personaId, personas) => {
  const related = findPersonasRelacionadas(personaId, personas);
  const relaciones = [];

  for (const grupo of Object.values(related)) {
    for (const persona of Array.isArray(grupo) ? grupo : []) {
      const value = relacionDesdeLista(personaId, persona.id, personas);
      relaciones.push({
        id: persona.id,
        nombre: persona.nombreCompleto || `${persona.nombre} ${persona.apellido}`.trim(),
        relacion: value.parentesco,
        grado: value.grado,
      });
    }
  }

  return relaciones.filter((entry, index, all) => all.findIndex((item) => item.id === entry.id) === index);
};

const validarRelacionesPersona = (padre, madre, personaId) => {
  if (padre && padre === personaId) return 'Una persona no puede ser su propio padre';
  if (madre && madre === personaId) return 'Una persona no puede ser su propia madre';
  if (padre && madre && padre === madre) return 'La persona padre y madre no pueden ser la misma';
  return null;
};

const validarDatosNuevaPersona = (body) => {
  const errores = [];
  const camposPermitidos = new Set([
    'nombre',
    'apellido',
    'genero',
    'fechaNacimiento',
    'padre',
    'madre',
    'observaciones',
  ]);

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return ['El cuerpo de la solicitud debe ser un objeto JSON'];
  }

  for (const campo of Object.keys(body)) {
    if (!camposPermitidos.has(campo)) {
      errores.push(`El campo '${campo}' no está permitido`);
    }
  }

  for (const campo of ['nombre', 'apellido']) {
    if (typeof body[campo] !== 'string' || !body[campo].trim()) {
      errores.push(`El campo '${campo}' es obligatorio y debe ser texto no vacío`);
    } else if (body[campo].trim().length > 100) {
      errores.push(`El campo '${campo}' no puede superar los 100 caracteres`);
    }
  }

  if (body.genero !== undefined && !['Masculino', 'Femenino', 'Otro'].includes(body.genero)) {
    errores.push("El campo 'genero' debe ser Masculino, Femenino u Otro");
  }

  if (body.fechaNacimiento !== undefined && body.fechaNacimiento !== null) {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    const date = new Date(`${body.fechaNacimiento}T00:00:00.000Z`);
    if (typeof body.fechaNacimiento !== 'string'
      || !datePattern.test(body.fechaNacimiento)
      || Number.isNaN(date.getTime())
      || date.toISOString().slice(0, 10) !== body.fechaNacimiento) {
      errores.push("El campo 'fechaNacimiento' debe ser una fecha válida con formato YYYY-MM-DD o null");
    }
  }

  for (const campo of ['padre', 'madre']) {
    if (body[campo] !== undefined && body[campo] !== null
      && (typeof body[campo] !== 'string' || !body[campo].trim())) {
      errores.push(`El campo '${campo}' debe ser un ID de persona o null`);
    }
  }

  if (body.observaciones !== undefined && typeof body.observaciones !== 'string') {
    errores.push("El campo 'observaciones' debe ser texto");
  } else if (typeof body.observaciones === 'string' && body.observaciones.length > 1000) {
    errores.push("El campo 'observaciones' no puede superar los 1000 caracteres");
  }

  const errorRelacion = validarRelacionesPersona(body.padre, body.madre);
  if (errorRelacion) errores.push(errorRelacion);

  return errores;
};

export const getPersonas = async (req, res) => {
  try {
    if (isMemoryMode()) {
      return res.json({ state: true, source: 'memory', data: getMemoryPersonas() });
    }

    const personas = await Persona.find().populate(['padre', 'madre']).lean();
    return res.json({ state: true, source: 'mongodb', data: personas.map(serializePersona) });
  } catch (error) {
    return res.status(500).json({ state: false, message: error.message });
  }
};

export const getPersona = async (req, res) => {
  try {
    const { id } = req.params;
    if (isMemoryMode()) {
      const persona = getPersonaByIdFromMemory(id);
      return persona
        ? res.json({ state: true, data: persona })
        : res.status(404).json({ state: false, message: 'Persona no encontrada' });
    }

    const persona = await Persona.findById(id).populate(['padre', 'madre']);
    if (!persona) {
      return res.status(404).json({ state: false, message: 'Persona no encontrada' });
    }

    return res.json({ state: true, data: serializePersona(persona) });
  } catch (error) {
    return res.status(500).json({ state: false, message: error.message });
  }
};

export const createPersona = async (req, res) => {
  try {
    const errores = validarDatosNuevaPersona(req.body);
    if (errores.length) {
      return res.status(400).json({ state: false, message: 'Datos de persona inválidos', errors: errores });
    }

    const { nombre, apellido, genero, fechaNacimiento, padre, madre, observaciones } = req.body;

    if (isMemoryMode()) {
      for (const [campo, familiarId] of [['padre', padre], ['madre', madre]]) {
        if (familiarId && !inMemoryStore.some((persona) => persona.id === familiarId)) {
          return res.status(400).json({
            state: false,
            message: 'Datos de persona inválidos',
            errors: [`La persona indicada en '${campo}' no existe`],
          });
        }
      }

      const nuevaPersona = {
        id: crypto.randomUUID(),
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        genero: genero || 'Otro',
        fechaNacimiento: fechaNacimiento || null,
        padre: padre || null,
        madre: madre || null,
        observaciones: observaciones || '',
      };
      inMemoryStore.push(nuevaPersona);
      return res.status(201).json({ state: true, data: serializePersona(nuevaPersona) });
    }

    for (const [campo, familiarId] of [['padre', padre], ['madre', madre]]) {
      if (!familiarId) continue;
      if (!/^[a-f\d]{24}$/i.test(familiarId)) {
        return res.status(400).json({
          state: false,
          message: 'Datos de persona inválidos',
          errors: [`El campo '${campo}' debe ser un ID de MongoDB válido`],
        });
      }
      if (!await Persona.exists({ _id: familiarId })) {
        return res.status(400).json({
          state: false,
          message: 'Datos de persona inválidos',
          errors: [`La persona indicada en '${campo}' no existe`],
        });
      }
    }

    const nuevaPersona = new Persona({ nombre, apellido, genero, fechaNacimiento, padre, madre, observaciones });
    await nuevaPersona.save();
    return res.status(201).json({ state: true, data: serializePersona(nuevaPersona) });
  } catch (error) {
    return res.status(400).json({ state: false, message: error.message });
  }
};

export const updatePersona = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, genero, fechaNacimiento, padre, madre, observaciones } = req.body;

    const errorRelacion = validarRelacionesPersona(padre ?? null, madre ?? null, id);
    if (errorRelacion) {
      return res.status(400).json({ state: false, message: errorRelacion });
    }

    if (isMemoryMode()) {
      const index = inMemoryStore.findIndex((persona) => persona.id === id);
      if (index === -1) {
        return res.status(404).json({ state: false, message: 'Persona no encontrada' });
      }

      inMemoryStore[index] = {
        ...inMemoryStore[index],
        nombre: nombre ?? inMemoryStore[index].nombre,
        apellido: apellido ?? inMemoryStore[index].apellido,
        genero: genero ?? inMemoryStore[index].genero,
        fechaNacimiento: fechaNacimiento ?? inMemoryStore[index].fechaNacimiento,
        padre: padre ?? inMemoryStore[index].padre,
        madre: madre ?? inMemoryStore[index].madre,
        observaciones: observaciones ?? inMemoryStore[index].observaciones,
      };
      return res.json({ state: true, data: serializePersona(inMemoryStore[index]) });
    }

    const persona = await Persona.findById(id);
    if (!persona) {
      return res.status(404).json({ state: false, message: 'Persona no encontrada' });
    }

    Object.assign(persona, { nombre, apellido, genero, fechaNacimiento, padre, madre, observaciones });
    await persona.save();
    return res.json({ state: true, data: serializePersona(persona) });
  } catch (error) {
    return res.status(400).json({ state: false, message: error.message });
  }
};

export const deletePersona = async (req, res) => {
  try {
    const { id } = req.params;

    if (isMemoryMode()) {
      const index = inMemoryStore.findIndex((persona) => persona.id === id);
      if (index === -1) {
        return res.status(404).json({ state: false, message: 'Persona no encontrada' });
      }
      const [deleted] = inMemoryStore.splice(index, 1);
      return res.json({ state: true, data: serializePersona(deleted), message: 'Persona eliminada correctamente' });
    }

    const persona = await Persona.findByIdAndDelete(id);
    if (!persona) {
      return res.status(404).json({ state: false, message: 'Persona no encontrada' });
    }

    return res.json({ state: true, message: 'Persona eliminada correctamente' });
  } catch (error) {
    return res.status(400).json({ state: false, message: error.message });
  }
};

export const getFamiliares = async (req, res) => {
  try {
    const { id } = req.params;
    const { maxGrado = 2 } = req.query;

    const personas = isMemoryMode() ? getMemoryPersonas() : (await Persona.find().populate(['padre', 'madre']).lean()).map(serializePersona);
    const personaActual = personas.find((persona) => persona.id === id);

    if (!personaActual) {
      return res.status(404).json({ state: false, message: 'Persona no encontrada' });
    }

    const familiares = buildListadoFamilia(id, personas).filter((item) => Number(item.grado) <= Number(maxGrado));

    return res.json({
      state: true,
      data: {
        persona: personaActual,
        familiares: familiares.sort((a, b) => a.grado - b.grado || a.nombre.localeCompare(b.nombre)),
      },
    });
  } catch (error) {
    return res.status(500).json({ state: false, message: error.message });
  }
};

export const getParentesco = async (req, res) => {
  try {
    const { id, targetId } = req.params;
    const personas = isMemoryMode() ? getMemoryPersonas() : (await Persona.find().populate(['padre', 'madre']).lean()).map(serializePersona);
    const relacion = relacionDesdeLista(id, targetId, personas);

    if (!personas.some((persona) => persona.id === id) || !personas.some((persona) => persona.id === targetId)) {
      return res.status(404).json({ state: false, message: 'Una de las personas no existe' });
    }

    return res.json({ state: true, data: { origen: id, destino: targetId, ...relacion } });
  } catch (error) {
    return res.status(500).json({ state: false, message: error.message });
  }
};

export const getEstadisticasFamilia = async (req, res) => {
  try {
    const personas = isMemoryMode() ? getMemoryPersonas() : (await Persona.find().lean()).map(serializePersona);
    const total = personas.length;
    const conPadres = personas.filter((persona) => persona.padre || persona.madre).length;
    const raiz = personas.filter((persona) => !personas.some((item) => item.padre === persona.id || item.madre === persona.id)).length;

    return res.json({
      state: true,
      data: {
        totalIntegrantes: total,
        conRelacionDirecta: conPadres,
        raices: raiz,
        maxGradoSoportado: 2,
      },
    });
  } catch (error) {
    return res.status(500).json({ state: false, message: error.message });
  }
};
