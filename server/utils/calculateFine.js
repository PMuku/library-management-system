// utils/calculateFine.js

const calculateAndUpdateFine = async (issueRequest) => {
  const now = new Date();
  const dueDate = new Date(issueRequest.issueDate);
  dueDate.setDate(dueDate.getDate() + issueRequest.duration);

  if (now > dueDate) {
    const daysLate = Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24));
    const fine = daysLate * issueRequest.finePerDay;
    issueRequest.fineAmount = fine;
    issueRequest.finePaid = false;
    await issueRequest.save();
  }

  return issueRequest;
};

export default calculateAndUpdateFine;
