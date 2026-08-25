export const DOCUMENT_TYPE_META = {
    act_tax: { label: 'พ.ร.บ. และภาษีรถยนต์', hasProvider: true },
    insurance: { label: 'ประกันภาคสมัครใจ', hasProvider: true },
};

// สีตามความเร่งด่วน: หมดแล้ว = แดง, ใกล้หมด (<=30วัน) = เหลือง, ปกติ = เขียว
export function documentStatusStyle(daysRemaining) {
    if (daysRemaining < 0) {
        return { label: `หมดอายุแล้ว ${Math.abs(daysRemaining)} วัน`, bg: 'var(--status-danger-soft)', color: 'var(--status-danger)' };
    }
    if (daysRemaining <= 30) {
        return { label: `เหลือ ${daysRemaining} วัน`, bg: 'var(--status-warning-soft)', color: 'var(--status-warning)' };
    }
    return { label: `เหลือ ${daysRemaining} วัน`, bg: 'var(--status-success-soft)', color: 'var(--status-success)' };
}
