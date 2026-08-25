export const DOCUMENT_TYPE_META = {
    act_tax: {
        label: 'พ.ร.บ. และภาษีรถยนต์',
        hasProvider: true,
        amounts: [
            { key: 'premium_amount', label: 'เบี้ยประกัน พ.ร.บ. (บาท)' },
            { key: 'fee_amount', label: 'ค่าธรรมเนียมภาษี (บาท)' },
        ],
    },
    insurance: { label: 'ประกันภาคสมัครใจ', hasProvider: true, amounts: [] },
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
