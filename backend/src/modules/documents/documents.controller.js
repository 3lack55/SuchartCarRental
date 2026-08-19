import * as documentsService from './documents.service.js';
import { logActivity } from '../../utils/activityLog.js';

const DOCUMENT_TYPE_LABELS = { tax: 'ภาษี', act: 'พรบ', insurance: 'ประกันภัย' };

export async function listDocumentsController(req, res, next) {
    try {
        const { search, document_type, status } = req.query;
        const documents = await documentsService.listCurrentDocuments({
            search,
            documentType: document_type,
            status,
        });
        res.json({ success: true, data: documents });
    } catch (err) {
        next(err);
    }
}

export async function getDocumentController(req, res, next) {
    try {
        const document = await documentsService.getDocumentById(req.params.type, req.params.id);
        res.json({ success: true, data: document });
    } catch (err) {
        next(err);
    }
}

export async function getDocumentHistoryController(req, res, next) {
    try {
        const history = await documentsService.listDocumentHistory(req.params.type, req.params.vehicleId);
        res.json({ success: true, data: history });
    } catch (err) {
        next(err);
    }
}

export async function createDocumentController(req, res, next) {
    try {
        const document = await documentsService.createDocument(req.body);
        await logActivity(req, {
            action: 'document.create',
            entity_type: 'document',
            entity_id: document.document_id,
            description: `เพิ่มเอกสาร${DOCUMENT_TYPE_LABELS[document.document_type] || document.document_type} ทะเบียน "${document.plate_number}"`,
        });
        res.status(201).json({ success: true, data: document });
    } catch (err) {
        next(err);
    }
}

export async function updateDocumentController(req, res, next) {
    try {
        const document = await documentsService.updateDocument(req.params.type, req.params.id, req.body);
        await logActivity(req, {
            action: 'document.update',
            entity_type: 'document',
            entity_id: document.document_id,
            description: `แก้ไขเอกสาร${DOCUMENT_TYPE_LABELS[document.document_type] || document.document_type} ทะเบียน "${document.plate_number}"`,
        });
        res.json({ success: true, data: document });
    } catch (err) {
        next(err);
    }
}

export async function deleteDocumentController(req, res, next) {
    try {
        const result = await documentsService.deleteDocument(req.params.type, req.params.id);
        await logActivity(req, {
            action: 'document.delete',
            entity_type: 'document',
            entity_id: Number(req.params.id),
            description: `ลบเอกสาร${DOCUMENT_TYPE_LABELS[req.params.type] || req.params.type} document_id=${req.params.id}`,
        });
        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}
