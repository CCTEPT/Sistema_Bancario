export const generateCheckNumber = () => {
    const random = Math.floor(100000 + Math.random() * 900000);
    const timestamp = Date.now();
    return `CHK-${timestamp}-${random}`;
};