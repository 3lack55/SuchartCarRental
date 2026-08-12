import { getDocuments } from "./documents.service.js";

export async function getDocumentsController(req, res, next) {
    try {
        const documents = await getDocuments();
        res.json({ success: true, data: documents });
    } catch (err) {
        next(err);
    }
}