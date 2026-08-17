export const DOCUMENT_TYPE_META = {
    tax: { label: 'ภาษีรถยนต์', hasProvider: false, hasAmount: true, amountLabel: 'ค่าธรรมเนียม (บาท)' },
    act: { label: 'พ.ร.บ. (ประกันภาคบังคับ)', hasProvider: true, hasAmount: true, amountLabel: 'เบี้ยประกัน (บาท)' },
    insurance: { label: 'ประกันภาคสมัครใจ', hasProvider: true, hasAmount: false, amountLabel: null },
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
