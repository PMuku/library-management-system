// utils/calculateFine.js

const calculateAndUpdateFine = async (request) => {
    if (!request.issueDate || typeof request.duration !== 'number') return;

    const now = new Date();
    const dueDate = new Date(request.issueDate);
    dueDate.setDate(dueDate.getDate() + request.duration);

    if (now > dueDate) {
        const daysLate = Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24));
        const fine = daysLate * request.finePerDay;
        if (request.fineAmount !== fine || request.finePaid !== false) {
            request.fineAmount = fine;
            request.finePaid = false;
            await request.save();
        }
    }  
};

export default calculateAndUpdateFine;
