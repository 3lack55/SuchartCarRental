// คำนวณระยะเวลาที่ผ่านมาเป็น "X ปี Y เดือน" จากวันที่เริ่มต้น ใช้แสดงระยะเวลาทำงานของคนขับ/อายุรถ

export function monthsBetween(fromDate, toDate = new Date()) {
    let months = (toDate.getFullYear() - fromDate.getFullYear()) * 12 + (toDate.getMonth() - fromDate.getMonth());
    if (toDate.getDate() < fromDate.getDate()) months -= 1;
    return Math.max(0, months);
}

export function formatDuration(totalMonths) {
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;

    if (years === 0 && months === 0) return 'น้อยกว่า 1 เดือน';
    if (years === 0) return `${months} เดือน`;
    if (months === 0) return `${years} ปี`;
    return `${years} ปี ${months} เดือน`;
}

export function durationSince(dateLike) {
    if (!dateLike) return null;
    const from = new Date(dateLike);
    if (Number.isNaN(from.getTime())) return null;
    return formatDuration(monthsBetween(from));
}

export function durationSinceYearMonth(year, month) {
    if (!year) return null;
    const from = new Date(year, (month || 1) - 1, 1);
    if (Number.isNaN(from.getTime())) return null;
    return formatDuration(monthsBetween(from));
}
