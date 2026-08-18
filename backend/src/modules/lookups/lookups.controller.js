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
        const result = await createVehicleType(req.body.name);
        res.status(201).json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}

export async function updateVehicleTypeController(req, res, next) {
    try {
        const result = await updateVehicleType(req.params.id, req.body.name);
        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}

export async function deleteVehicleTypeController(req, res, next) {
    try {
        const result = await deleteVehicleType(req.params.id);
        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}

// ---------- สาเหตุการฝ่าฝืนกฎจราจร ----------

export async function createViolationReasonController(req, res, next) {
    try {
        const result = await createViolationReason(req.body.name);
        res.status(201).json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}

export async function updateViolationReasonController(req, res, next) {
    try {
        const result = await updateViolationReason(req.params.id, req.body.name);
        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}

export async function deleteViolationReasonController(req, res, next) {
    try {
        const result = await deleteViolationReason(req.params.id);
        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}

// ---------- ประเภทบริการซ่อมบำรุง ----------

export async function createServiceTypeController(req, res, next) {
    try {
        const result = await createServiceType(req.body.name);
        res.status(201).json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}

export async function updateServiceTypeController(req, res, next) {
    try {
        const result = await updateServiceType(req.params.id, req.body.name);
        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}

export async function deleteServiceTypeController(req, res, next) {
    try {
        const result = await deleteServiceType(req.params.id);
        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}

// ---------- หมวดหมู่บริการซ่อมบำรุง ----------

export async function createServiceCategoryController(req, res, next) {
    try {
        const result = await createServiceCategory(req.body.name, req.body.service_type_id);
        res.status(201).json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}

export async function updateServiceCategoryController(req, res, next) {
    try {
        const result = await updateServiceCategory(req.params.id, req.body.name, req.body.service_type_id);
        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}

export async function deleteServiceCategoryController(req, res, next) {
    try {
        const result = await deleteServiceCategory(req.params.id);
        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}

// ---------- รายการบริการซ่อมบำรุง ----------

export async function createServiceItemController(req, res, next) {
    try {
        const result = await createServiceItem(req.body.name, req.body.service_category_id);
        res.status(201).json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}

export async function updateServiceItemController(req, res, next) {
    try {
        const result = await updateServiceItem(req.params.id, req.body.name, req.body.service_category_id);
        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}

export async function deleteServiceItemController(req, res, next) {
    try {
        const result = await deleteServiceItem(req.params.id);
        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}