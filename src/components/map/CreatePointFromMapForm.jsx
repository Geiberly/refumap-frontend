import React, { useState } from "react";
import {
  reportDangerZone,
  reportHelpPoint,
  reportHospital,
  reportRefuge,
  reportRoadIssue,
  submitReport,
} from "../../api/mapPoints";
import { isInsideVenezuela, normalizeLatLng } from "../../utils/geoValidation";

export default function CreatePointFromMapForm({ type, location, onClose }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    contact_phone: "",
  });
  const [metadata, setMetadata] = useState({
    capacity_total: "",
    capacity_available: "",
    accepts_children: false,
    accepts_elderly: false,
    accepts_pets: false,
    has_water: false,
    has_food: false,
    has_medicine: false,
    has_power_charging: false,
    emergency_available: false,
    needs_supplies: false,
    severity: "medium",
    reason: "",
    risk_type: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMetaChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    setMetadata({
      ...metadata,
      [name]: inputType === "checkbox" ? checked : value,
    });
  };

  const getBackendReportType = (id) => {
    const map = {
      refuge: "new_help_point",
      hospital: "new_help_point",
      supply: "new_help_point",
      food: "new_help_point",
      water: "new_help_point",
      medicine: "new_help_point",
      power: "new_help_point",
      road_blocked: "road_blocked",
      danger: "danger_zone",
      collapsed: "collapsed_building",
      other: "other",
    };

    return map[id] || "other";
  };

  const getUrgencyLevel = (severity) => {
    if (severity === "critical") return 4;
    if (severity === "high") return 3;
    if (severity === "medium") return 2;
    return 1;
  };

  const getFirstErrorMessage = (err) => {
    const apiErrors = err.response?.data?.errors;
    if (apiErrors && typeof apiErrors === "object") {
      const firstField = Object.values(apiErrors)[0];
      if (Array.isArray(firstField) && firstField.length > 0) {
        return firstField[0];
      }
    }

    return err.response?.data?.message || "Error al enviar reporte.";
  };

  const getSafeLocation = () => normalizeLatLng(location?.lat, location?.lng);

  const buildBasePayload = () => {
    const safeLocation = getSafeLocation();

    return {
      name: formData.title.trim(),
      description: formData.description.trim(),
      contact_phone: formData.contact_phone.trim(),
      latitude: safeLocation.lat,
      longitude: safeLocation.lng,
    };
  };

  const buildGenericReportPayload = () => {
    const payload = new FormData();
    payload.append("report_type", getBackendReportType(type.id));
    payload.append("title", formData.title.trim());

    if (formData.description.trim())
      payload.append("description", formData.description.trim());
    if (formData.contact_phone.trim())
      payload.append("contact_phone", formData.contact_phone.trim());

    const safeLocation = getSafeLocation();
    payload.append("latitude", String(safeLocation.lat));
    payload.append("longitude", String(safeLocation.lng));
    payload.append(
      "metadata",
      JSON.stringify({
        ...metadata,
        ui_type: type.id,
      }),
    );

    return payload;
  };

  const submitByType = () => {
    const basePayload = buildBasePayload();

    if (type.id === "refuge") {
      return reportRefuge({
        ...basePayload,
        capacity_total: metadata.capacity_total || null,
        accepts_children: metadata.accepts_children,
        accepts_elderly: metadata.accepts_elderly,
        accepts_pets: metadata.accepts_pets,
        has_water: metadata.has_water,
        has_food: metadata.has_food,
      });
    }

    if (type.id === "hospital") {
      return reportHospital({
        ...basePayload,
        hospital_type: "Hospital o clinica",
        operative_status: metadata.emergency_available
          ? "Operativo"
          : "Desconocido",
        services: metadata.emergency_available ? ["Emergencia"] : [],
        needs: metadata.needs_supplies ? ["Insumos medicos"] : [],
      });
    }

    if (type.id === "road_blocked") {
      return reportRoadIssue({
        ...basePayload,
        issue_type: metadata.reason || "Via bloqueada",
        urgency_level: getUrgencyLevel(metadata.severity),
      });
    }

    if (type.id === "danger") {
      return reportDangerZone({
        ...basePayload,
        danger_type: metadata.risk_type || "Zona peligrosa",
        urgency_level: 3,
      });
    }

    if (["supply", "food", "water", "medicine", "power"].includes(type.id)) {
      const helpTypeMap = {
        supply: "centro-acopio",
        food: "comida",
        water: "agua",
        medicine: "medicinas",
        power: "carga-electrica",
      };

      return reportHelpPoint({
        ...basePayload,
        help_type: helpTypeMap[type.id],
      });
    }

    return submitReport(buildGenericReportPayload());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!location || !isInsideVenezuela(location.lat, location.lng)) {
      setError("La ubicación del reporte debe estar dentro de Venezuela.");
      setLoading(false);
      return;
    }

    try {
      await submitByType();
      setSuccess(true);
      setTimeout(() => onClose(), 2500);
    } catch (err) {
      setError(getFirstErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
          ✓
        </div>
        <h4 className="font-bold text-lg text-slate-800 mb-2">
          Reporte enviado
        </h4>
        <p className="text-sm text-slate-500">
          La información será verificada por operadores antes de publicarse.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 pb-4">
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-100">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">
          Nombre del lugar / Título <span className="text-red-500">*</span>
        </label>
        <input
          required
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Ej: Refugio Escuela San Jose"
          className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
        />
      </div>

      <div>
        <div className="flex justify-between items-baseline mb-1">
          <label className="text-sm font-semibold text-slate-700">Descripción / Detalles</label>
          <span className="text-xs text-slate-500 font-normal">(opcional)</span>
        </div>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="2"
          placeholder="Añade información útil..."
          className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
        />
      </div>

      <div>
        <div className="flex justify-between items-baseline mb-1">
          <label className="text-sm font-semibold text-slate-700">Teléfono de contacto</label>
          <span className="text-xs text-slate-500 font-normal">(opcional)</span>
        </div>
        <input
          type="text"
          name="contact_phone"
          value={formData.contact_phone}
          onChange={handleChange}
          placeholder="+58 412..."
          className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
        />
      </div>

      {type.id === "refuge" && (
        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <p className="text-sm font-bold text-slate-700 mb-2">
            Servicios del refugio
          </p>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                name="accepts_children"
                checked={metadata.accepts_children}
                onChange={handleMetaChange}
                className="rounded text-primary"
              />
              Acepta niños
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                name="accepts_pets"
                checked={metadata.accepts_pets}
                onChange={handleMetaChange}
                className="rounded text-primary"
              />
              Acepta mascotas
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                name="has_water"
                checked={metadata.has_water}
                onChange={handleMetaChange}
                className="rounded text-primary"
              />
              Tiene agua
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                name="has_food"
                checked={metadata.has_food}
                onChange={handleMetaChange}
                className="rounded text-primary"
              />
              Tiene comida
            </label>
          </div>
        </div>
      )}

      {type.id === "hospital" && (
        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <p className="text-sm font-bold text-slate-700 mb-2">
            Estado del hospital
          </p>
          <div className="grid grid-cols-1 gap-2">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                name="emergency_available"
                checked={metadata.emergency_available}
                onChange={handleMetaChange}
                className="rounded text-primary"
              />
              Atiende emergencias ahora
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                name="needs_supplies"
                checked={metadata.needs_supplies}
                onChange={handleMetaChange}
                className="rounded text-primary"
              />
              Necesita insumos médicos
            </label>
          </div>
        </div>
      )}

      {type.id === "road_blocked" && (
        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <p className="text-sm font-bold text-slate-700 mb-2">
            Detalles del bloqueo
          </p>
          <div className="flex flex-col gap-3">
            <select
              name="severity"
              value={metadata.severity}
              onChange={handleMetaChange}
              className="w-full border border-slate-200 rounded-lg p-2 text-sm"
            >
              <option value="low">Leve (Paso con dificultad)</option>
              <option value="medium">Medio (Solo motos/peatones)</option>
              <option value="high">Alto (Totalmente bloqueado)</option>
              <option value="critical">Crítico (Peligro inminente)</option>
            </select>
            <input
              type="text"
              name="reason"
              value={metadata.reason}
              onChange={handleMetaChange}
              placeholder="Motivo: Ej. Derrumbe, Arbol caido"
              className="w-full border border-slate-200 rounded-lg p-2 text-sm"
            />
          </div>
        </div>
      )}

      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-3 px-4 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-[2] py-3 px-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {loading ? "Enviando..." : "Confirmar ubicación y Enviar"}
        </button>
      </div>
    </form>
  );
}
