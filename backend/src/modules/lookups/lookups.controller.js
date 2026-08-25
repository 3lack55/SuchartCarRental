import {
    getProvinceLookup,
    getVehicleTypeLookup,
    getServiceCatalog,
    getViolationReasonsLookup,
    createVehicleType,
    updateVehicleType,
    deleteVehicleType,
    createViolationReason,
    updateViolationReason,
    deleteViolationReason,
    createServiceType,
    updateServiceType,
    deleteServiceType,
    createServiceCategory,
    updateServiceCategory,
    deleteServiceCategory,
    createServiceItem,
    updateServiceItem,
    deleteServiceItem,
} from "./lookups.service.js";
import { logActivity } from '../../utils/activityLog.js';

export async function getProvinceLookupController(req, res, next) {
    try {
        const provinces = await getProvinceLookup();
        res.json({ success: true, data: provinces });
    } catch (err) {
        next(err);
    }
}

export async function getVehicleTypeController(req, res, next) {
    try {
        const vType = await getVehicleTypeLookup();
        res.json({ success: true, data: vType });
    } catch (err) {
        next(err);
    }
}

export async function getServiceCatalogController(req, res, next) {
    try {
        const catalog = await getServiceCatalog();
        res.json({ success: true, data: catalog});
    } catch (err) {
        next(err);
    }

}

export async function getViolationReasonsController(req, res, next) {
    try {
        const reasons = await getViolationReasonsLookup();
        res.json({ success: true, data: reasons });
    } catch (err) {
        next(err);
    }
}

// ---------- ประเภทรถ ----------

export async function createVehicleTypeController(req, res, next) {
    try {
        const result = await createVehicleType(req.body.name, req.body.color);
        await logActivity(req, { action: 'lookup.vehicle_type.create', entity_type: 'vehicle_type', entity_id: result.type_id, description: `เพิ่มประเภทรถ "${result.type_name}"` });
        res.status(201).json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}

export async function updateVehicleTypeController(req, res, next) {
    try {
        const result = await updateVehicleType(req.params.id, req.body.name, req.body.color);
        await logActivity(req, { action: 'lookup.vehicle_type.update', entity_type: 'vehicle_type', entity_id: result.type_id, description: `แก้ไขประเภทรถเป็น "${result.type_name}"` });
        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}

export async function deleteVehicleTypeController(req, res, next) {
    try {
        const result = await deleteVehicleType(req.params.id);
        await logActivity(req, { action: 'lookup.vehicle_type.delete', entity_type: 'vehicle_type', entity_id: result.type_id, description: `ลบประเภทรถ type_id=${result.type_id}` });
        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}

// ---------- สาเหตุการฝ่าฝืนกฎจราจร ----------

export async function createViolationReasonController(req, res, next) {
    try {
        const result = await createViolationReason(req.body.name);
        await logActivity(req, { action: 'lookup.violation_reason.create', entity_type: 'violation_reason', entity_id: result.reason_id, description: `เพิ่มสาเหตุการฝ่าฝืนกฎจราจร "${result.reason_name}"` });
        res.status(201).json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}

export async function updateViolationReasonController(req, res, next) {
    try {
        const result = await updateViolationReason(req.params.id, req.body.name);
        await logActivity(req, { action: 'lookup.violation_reason.update', entity_type: 'violation_reason', entity_id: result.reason_id, description: `แก้ไขสาเหตุการฝ่าฝืนกฎจราจรเป็น "${result.reason_name}"` });
        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}

export async function deleteViolationReasonController(req, res, next) {
    try {
        const result = await deleteViolationReason(req.params.id);
        await logActivity(req, { action: 'lookup.violation_reason.delete', entity_type: 'violation_reason', entity_id: result.reason_id, description: `ลบสาเหตุการฝ่าฝืนกฎจราจร reason_id=${result.reason_id}` });
        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}

// ---------- ประเภทบริการซ่อมบำรุง ----------

export async function createServiceTypeController(req, res, next) {
    try {
        const result = await createServiceType(req.body.name);
        await logActivity(req, { action: 'lookup.service_type.create', entity_type: 'service_type', entity_id: result.service_type_id, description: `เพิ่มประเภทบริการซ่อมบำรุง "${result.service_type_name}"` });
        res.status(201).json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}

export async function updateServiceTypeController(req, res, next) {
    try {
        const result = await updateServiceType(req.params.id, req.body.name);
        await logActivity(req, { action: 'lookup.service_type.update', entity_type: 'service_type', entity_id: result.service_type_id, description: `แก้ไขประเภทบริการซ่อมบำรุงเป็น "${result.service_type_name}"` });
        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}

export async function deleteServiceTypeController(req, res, next) {
    try {
        const result = await deleteServiceType(req.params.id);
        await logActivity(req, { action: 'lookup.service_type.delete', entity_type: 'service_type', entity_id: result.service_type_id, description: `ลบประเภทบริการซ่อมบำรุง service_type_id=${result.service_type_id}` });
        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}

// ---------- หมวดหมู่บริการซ่อมบำรุง ----------

export async function createServiceCategoryController(req, res, next) {
    try {
        const result = await createServiceCategory(req.body.name, req.body.service_type_id);
        await logActivity(req, { action: 'lookup.service_category.create', entity_type: 'service_category', entity_id: result.service_category_id, description: `เพิ่มหมวดหมู่บริการซ่อมบำรุง "${result.service_category_name}"` });
        res.status(201).json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}

export async function updateServiceCategoryController(req, res, next) {
    try {
        const result = await updateServiceCategory(req.params.id, req.body.name, req.body.service_type_id);
        await logActivity(req, { action: 'lookup.service_category.update', entity_type: 'service_category', entity_id: result.service_category_id, description: `แก้ไขหมวดหมู่บริการซ่อมบำรุงเป็น "${result.service_category_name}"` });
        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}

export async function deleteServiceCategoryController(req, res, next) {
    try {
        const result = await deleteServiceCategory(req.params.id);
        await logActivity(req, { action: 'lookup.service_category.delete', entity_type: 'service_category', entity_id: result.service_category_id, description: `ลบหมวดหมู่บริการซ่อมบำรุง service_category_id=${result.service_category_id}` });
        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}

// ---------- รายการบริการซ่อมบำรุง ----------

export async function createServiceItemController(req, res, next) {
    try {
        const result = await createServiceItem(req.body.name, req.body.service_category_id);
        await logActivity(req, { action: 'lookup.service_item.create', entity_type: 'service_item', entity_id: result.service_item_id, description: `เพิ่มรายการบริการซ่อมบำรุง "${result.service_item_name}"` });
        res.status(201).json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}

export async function updateServiceItemController(req, res, next) {
    try {
        const result = await updateServiceItem(req.params.id, req.body.name, req.body.service_category_id);
        await logActivity(req, { action: 'lookup.service_item.update', entity_type: 'service_item', entity_id: result.service_item_id, description: `แก้ไขรายการบริการซ่อมบำรุงเป็น "${result.service_item_name}"` });
        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}

export async function deleteServiceItemController(req, res, next) {
    try {
        const result = await deleteServiceItem(req.params.id);
        await logActivity(req, { action: 'lookup.service_item.delete', entity_type: 'service_item', entity_id: result.service_item_id, description: `ลบรายการบริการซ่อมบำรุง service_item_id=${result.service_item_id}` });
        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}